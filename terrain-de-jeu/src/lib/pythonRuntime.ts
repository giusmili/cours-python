const LOAD_TIMEOUT_MS = 45_000;
const EXECUTION_TIMEOUT_MS = 5_000;

type WorkerReadyMessage = {
  type: "ready";
};

type WorkerFatalMessage = {
  type: "fatal";
  error: string;
};

type WorkerResultMessage = {
  type: "result";
  id: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
};

type WorkerMessage =
  | WorkerReadyMessage
  | WorkerFatalMessage
  | WorkerResultMessage;

export type PythonExecution = {
  ok: boolean;
  output: string;
  error?: string;
  timedOut?: boolean;
};

let worker: Worker | null = null;
let readyPromise: Promise<Worker> | null = null;
let sequence = 0;

function destroyWorker() {
  worker?.terminate();
  worker = null;
  readyPromise = null;
}

function makeWorker() {
  const nextWorker = new Worker("/pyodide-worker.mjs", {
    name: "playground-python",
    type: "module",
  });
  worker = nextWorker;
  return nextWorker;
}

function ensureWorker(): Promise<Worker> {
  if (worker && readyPromise) return readyPromise;

  const nextWorker = makeWorker();

  readyPromise = new Promise<Worker>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      destroyWorker();
      reject(new Error("Python runtime loading timed out."));
    }, LOAD_TIMEOUT_MS);

    const cleanup = () => {
      window.clearTimeout(timer);
      nextWorker.removeEventListener("message", onMessage);
      nextWorker.removeEventListener("error", onError);
    };

    const onError = () => {
      cleanup();
      destroyWorker();
      reject(new Error("Python worker failed to load."));
    };

    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      if (event.data?.type === "ready") {
        cleanup();
        resolve(nextWorker);
        return;
      }

      if (event.data?.type === "fatal") {
        cleanup();
        destroyWorker();
        reject(new Error(event.data.error || "Python runtime failed to load."));
      }
    };

    nextWorker.addEventListener("message", onMessage);
    nextWorker.addEventListener("error", onError);
  });

  return readyPromise;
}

export async function runPythonInSandbox(
  code: string,
  timeoutMs = EXECUTION_TIMEOUT_MS,
): Promise<PythonExecution> {
  const activeWorker = await ensureWorker();
  const id = `run-${Date.now()}-${sequence++}`;

  return new Promise<PythonExecution>((resolve) => {
    let settled = false;

    const finish = (value: PythonExecution) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      activeWorker.removeEventListener("message", onMessage);
      activeWorker.removeEventListener("error", onError);
      resolve(value);
    };

    const onError = () => {
      destroyWorker();
      finish({
        ok: false,
        output: "",
        error: "Python worker stopped unexpectedly.",
      });
    };

    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message?.type !== "result" || message.id !== id) return;

      const output = [message.stdout, message.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();

      finish({
        ok: message.ok,
        output,
        error: message.error,
      });
    };

    const timer = window.setTimeout(() => {
      destroyWorker();
      finish({
        ok: false,
        output: "",
        error: "Execution timed out.",
        timedOut: true,
      });
    }, timeoutMs);

    activeWorker.addEventListener("message", onMessage);
    activeWorker.addEventListener("error", onError);
    activeWorker.postMessage({ type: "run", id, code });
  });
}

export function resetPythonRuntime() {
  destroyWorker();
}
