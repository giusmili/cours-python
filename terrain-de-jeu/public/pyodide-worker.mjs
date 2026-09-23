const PYODIDE_MODULE_URL = "__PYODIDE_MODULE_URL__";
const PYODIDE_BASE = "__PYODIDE_BASE_URL__";

const { loadPyodide } = await import(PYODIDE_MODULE_URL);
const emit = self.postMessage.bind(self);

let pyodidePromise = null;

function formatError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function denyCapability(name) {
  return function deniedCapability() {
    throw new Error(name + " is disabled in the Python playground sandbox.");
  };
}

function hardenWorkerCapabilities() {
  // Defense in depth. The primary boundary is the opaque-origin sandboxed
  // iframe that owns this worker. These blocks also prevent beginner code from
  // accidentally reaching the network or forging the runtime protocol.
  self.fetch = denyCapability("Network access");
  self.postMessage = denyCapability("Direct worker messaging");
  self.close = denyCapability("Worker shutdown");

  const blockedGlobals = [
    ["WebSocket", "WebSocket access"],
    ["EventSource", "EventSource access"],
    ["XMLHttpRequest", "XMLHttpRequest access"],
    ["WebTransport", "WebTransport access"],
    ["Worker", "Nested worker creation"],
    ["SharedWorker", "Shared worker creation"],
    ["BroadcastChannel", "BroadcastChannel access"],
  ];

  for (const [globalName, label] of blockedGlobals) {
    if (globalName in self) {
      self[globalName] = denyCapability(label);
    }
  }
}

async function getRuntime() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: PYODIDE_BASE }).then((runtime) => {
      hardenWorkerCapabilities();
      return runtime;
    });
  }

  return pyodidePromise;
}

function formatOutput(stdout, stderr) {
  return [stdout.join("\n").trim(), stderr.join("\n").trim()]
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function runCode(id, code) {
  const pyodide = await getRuntime();
  const stdout = [];
  const stderr = [];

  pyodide.setStdout({
    batched(text) {
      stdout.push(text);
    },
  });
  pyodide.setStderr({
    batched(text) {
      stderr.push(text);
    },
  });

  pyodide.globals.set("__PLAYGROUND_CODE__", code);

  try {
    await pyodide.runPythonAsync(`
namespace = {"__name__": "__main__"}
exec(compile(__PLAYGROUND_CODE__, "<mission>", "exec"), namespace, namespace)
`);

    emit({
      type: "result",
      id,
      ok: true,
      output: formatOutput(stdout, stderr),
    });
  } catch (error) {
    emit({
      type: "result",
      id,
      ok: false,
      output: formatOutput(stdout, stderr),
      error: formatError(error),
    });
  } finally {
    pyodide.globals.delete("__PLAYGROUND_CODE__");
  }
}

self.addEventListener("message", (event) => {
  const message = event.data;

  if (
    !message ||
    message.type !== "run" ||
    typeof message.id !== "string" ||
    typeof message.code !== "string"
  ) {
    return;
  }

  runCode(message.id, message.code).catch((error) => {
    emit({
      type: "result",
      id: message.id,
      ok: false,
      output: "",
      error: formatError(error),
    });
  });
});

getRuntime()
  .then(() => emit({ type: "ready" }))
  .catch((error) =>
    emit({
      type: "fatal",
      error: formatError(error),
    }),
  );
