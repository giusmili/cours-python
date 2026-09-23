const PROTOCOL = "playground-python-v1";
const LOAD_TIMEOUT_MS = 50_000;
const EXECUTION_TIMEOUT_MS = 5_000;
const MAX_CODE_LENGTH = 100_000;

type SandboxReadyMessage = {
  protocol: typeof PROTOCOL;
  token: string;
  type: "ready";
};

type SandboxFatalMessage = {
  protocol: typeof PROTOCOL;
  token: string;
  type: "fatal";
  error: string;
};

type SandboxResultMessage = {
  protocol: typeof PROTOCOL;
  token: string;
  type: "result";
  id: string;
  ok: boolean;
  output: string;
  error?: string;
  timedOut?: boolean;
};

type SandboxMessage =
  | SandboxReadyMessage
  | SandboxFatalMessage
  | SandboxResultMessage;

export type PythonExecution = {
  ok: boolean;
  output: string;
  error?: string;
  timedOut?: boolean;
};

type PendingRun = {
  resolve: (value: PythonExecution) => void;
  timer: number;
};

let frame: HTMLIFrameElement | null = null;
let token = "";
let readyPromise: Promise<HTMLIFrameElement> | null = null;
let readyResolve: ((value: HTMLIFrameElement) => void) | null = null;
let readyReject: ((reason: Error) => void) | null = null;
let readyTimer: number | null = null;
let sequence = 0;
const pending = new Map<string, PendingRun>();

function failPending(error: string) {
  for (const [id, run] of pending) {
    window.clearTimeout(run.timer);
    run.resolve({ ok: false, output: "", error });
    pending.delete(id);
  }
}

function removeMessageListener() {
  window.removeEventListener("message", onSandboxMessage);
}

function destroySandbox() {
  failPending("Python sandbox was reset.");

  if (readyTimer !== null) {
    window.clearTimeout(readyTimer);
    readyTimer = null;
  }

  frame?.remove();
  frame = null;
  token = "";
  readyPromise = null;
  readyResolve = null;
  readyReject = null;
  removeMessageListener();
}

function onSandboxMessage(event: MessageEvent<SandboxMessage>) {
  if (!frame || event.source !== frame.contentWindow) return;

  const message = event.data;
  if (
    !message ||
    message.protocol !== PROTOCOL ||
    message.token !== token
  ) {
    return;
  }

  if (message.type === "ready") {
    if (readyTimer !== null) {
      window.clearTimeout(readyTimer);
      readyTimer = null;
    }
    if (readyResolve) {
      readyResolve(frame);
      readyResolve = null;
      readyReject = null;
    }
    return;
  }

  if (message.type === "fatal") {
    const error = new Error(message.error || "Python sandbox failed to load.");
    readyReject?.(error);
    destroySandbox();
    return;
  }

  if (message.type !== "result") return;

  const run = pending.get(message.id);
  if (!run) return;

  pending.delete(message.id);
  window.clearTimeout(run.timer);
  run.resolve({
    ok: message.ok,
    output: message.output || "",
    error: message.error,
    timedOut: message.timedOut,
  });
}

function ensureSandbox(): Promise<HTMLIFrameElement> {
  if (frame && readyPromise) return readyPromise;

  token = window.crypto.randomUUID();
  frame = document.createElement("iframe");
  frame.title = "Python execution sandbox";
  frame.hidden = true;
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.src = `/python-sandbox.html#${encodeURIComponent(token)}`;
  document.body.appendChild(frame);

  window.addEventListener("message", onSandboxMessage);

  readyPromise = new Promise<HTMLIFrameElement>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
    readyTimer = window.setTimeout(() => {
      reject(new Error("Python sandbox loading timed out."));
      destroySandbox();
    }, LOAD_TIMEOUT_MS);
  });

  return readyPromise;
}

export async function runPythonInSandbox(
  code: string,
  timeoutMs = EXECUTION_TIMEOUT_MS,
): Promise<PythonExecution> {
  if (code.length > MAX_CODE_LENGTH) {
    return {
      ok: false,
      output: "",
      error: "Python source is too large for this exercise.",
    };
  }

  const sandbox = await ensureSandbox();
  const id = `run-${Date.now()}-${sequence++}`;

  return new Promise<PythonExecution>((resolve) => {
    const failSafeTimer = window.setTimeout(() => {
      pending.delete(id);
      destroySandbox();
      resolve({
        ok: false,
        output: "",
        error: "Execution timed out.",
        timedOut: true,
      });
    }, timeoutMs + 2_500);

    pending.set(id, {
      resolve,
      timer: failSafeTimer,
    });

    sandbox.contentWindow?.postMessage(
      {
        protocol: PROTOCOL,
        token,
        type: "run",
        id,
        code,
        timeoutMs,
      },
      "*",
    );
  });
}

export function resetPythonRuntime() {
  destroySandbox();
}
