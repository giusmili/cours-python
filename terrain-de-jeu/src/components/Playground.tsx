"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Locale = "fr" | "en";
type Track = "python" | "web";
type Status = "idle" | "running" | "success" | "error";

type PyodideLike = {
  runPythonAsync(code: string): Promise<unknown>;
  setStdout(config: { batched: (text: string) => void }): void;
  setStderr(config: { batched: (text: string) => void }): void;
};

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideLike>;
  }
}

const PYODIDE_VERSION = "314.0.7";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const copy = {
  fr: {
    eyebrow: "Terrain de jeu Dev",
    title: "Apprendre en résolvant des missions.",
    subtitle: "Deux portes d’entrée : Python et Web. Tu expérimentes d’abord, on met les mots sur les notions ensuite.",
    language: "Langue",
    chooseTrack: "Choisis ton terrain",
    python: "Python",
    pythonDesc: "Terminal, logique, données et automatisation.",
    web: "Web",
    webDesc: "HTML, CSS, puis JavaScript dans une page vivante.",
    missionZero: "Mission 0",
    run: "Exécuter",
    preview: "Aperçu",
    validate: "Valider",
    running: "Chargement…",
    output: "Sortie",
    objective: "Objectif",
    hint: "Indice",
    reference: "Référence",
    success: "Mission validée",
    retry: "Pas encore. Regarde le feedback et réessaie.",
    pythonHint: "La fonction print() écrit du texte dans la sortie standard.",
    webHint: "Le titre principal d’une page utilise la balise h1.",
    pythonGoal: "Fais afficher exactement SYSTEM ONLINE dans le terminal.",
    webGoal: "Ajoute un titre h1 qui affiche exactement SYSTEM ONLINE.",
    pythonScenario: "Le terminal de secours est muet. Réveille-le avec une seule instruction.",
    webScenario: "Le panneau de contrôle est vide. Fais réapparaître son signal de statut.",
    debriefTitle: "Ce que tu viens d’utiliser",
    pythonDebrief: "print(), une chaîne de caractères et le cycle modifier → exécuter → lire la sortie.",
    webDebrief: "Une balise HTML, un titre h1 et le cycle modifier → observer → valider.",
    bonus: "Défi bonus",
    pythonBonus: "Ajoute une seconde ligne qui affiche READY.",
    webBonus: "Ajoute un paragraphe p avec le texte READY.",
    nextLocked: "Suite du parcours",
    nextText: "Les missions suivantes seront débloquées progressivement.",
    pyodideNote: "Python s’exécute dans ton navigateur via Pyodide ; aucun code n’est envoyé au serveur.",
  },
  en: {
    eyebrow: "Dev Playground",
    title: "Learn by solving missions.",
    subtitle: "Two entry points: Python and Web. Experiment first; name the concepts afterwards.",
    language: "Language",
    chooseTrack: "Choose your playground",
    python: "Python",
    pythonDesc: "Terminal, logic, data and automation.",
    web: "Web",
    webDesc: "HTML, CSS, then JavaScript inside a living page.",
    missionZero: "Mission 0",
    run: "Run",
    preview: "Preview",
    validate: "Validate",
    running: "Loading…",
    output: "Output",
    objective: "Objective",
    hint: "Hint",
    reference: "Reference",
    success: "Mission complete",
    retry: "Not yet. Read the feedback and try again.",
    pythonHint: "The print() function writes text to standard output.",
    webHint: "A page's main title uses the h1 element.",
    pythonGoal: "Print exactly SYSTEM ONLINE in the terminal.",
    webGoal: "Add an h1 heading containing exactly SYSTEM ONLINE.",
    pythonScenario: "The backup terminal is silent. Wake it up with a single instruction.",
    webScenario: "The control panel is empty. Bring its status signal back online.",
    debriefTitle: "What you just used",
    pythonDebrief: "print(), a string, and the edit → run → read-output cycle.",
    webDebrief: "An HTML element, an h1 heading, and the edit → observe → validate cycle.",
    bonus: "Bonus challenge",
    pythonBonus: "Add a second line that prints READY.",
    webBonus: "Add a p paragraph containing READY.",
    nextLocked: "Next missions",
    nextText: "The following missions will unlock progressively.",
    pyodideNote: "Python runs in your browser through Pyodide; your code is not sent to the server.",
  },
} as const;

const starters = {
  python: '# Mission 0\n# Fais afficher exactement : SYSTEM ONLINE\n\n',
  web: '<main>\n  <!-- Ajoute ici un titre h1 : SYSTEM ONLINE -->\n</main>',
};

function loadPyodideRuntime(): Promise<PyodideLike> {
  if (window.loadPyodide) {
    return window.loadPyodide({ indexURL: PYODIDE_BASE });
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide="true"]');
    if (existing) {
      existing.addEventListener("load", async () => {
        if (!window.loadPyodide) return reject(new Error("Pyodide indisponible."));
        resolve(await window.loadPyodide({ indexURL: PYODIDE_BASE }));
      });
      existing.addEventListener("error", () => reject(new Error("Impossible de charger Pyodide.")));
      return;
    }

    const script = document.createElement("script");
    script.src = `${PYODIDE_BASE}pyodide.js`;
    script.async = true;
    script.dataset.pyodide = "true";
    script.onload = async () => {
      try {
        if (!window.loadPyodide) throw new Error("Pyodide indisponible.");
        resolve(await window.loadPyodide({ indexURL: PYODIDE_BASE }));
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => reject(new Error("Impossible de charger Pyodide."));
    document.head.appendChild(script);
  });
}

export function Playground() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [track, setTrack] = useState<Track>("python");
  const [pythonCode, setPythonCode] = useState(starters.python);
  const [webCode, setWebCode] = useState(starters.web);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [completed, setCompleted] = useState<Record<Track, boolean>>({ python: false, web: false });
  const [showHint, setShowHint] = useState(false);
  const pyodideRef = useRef<Promise<PyodideLike> | null>(null);
  const t = copy[locale];

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("playground-locale");
    if (savedLocale === "fr" || savedLocale === "en") setLocale(savedLocale);
    setCompleted({
      python: window.localStorage.getItem("mission-python-0") === "done",
      web: window.localStorage.getItem("mission-web-0") === "done",
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("playground-locale", locale);
  }, [locale]);

  useEffect(() => {
    setOutput("");
    setStatus(completed[track] ? "success" : "idle");
    setShowHint(false);
  }, [track, completed]);

  const activeCode = track === "python" ? pythonCode : webCode;
  const setActiveCode = (value: string) => (track === "python" ? setPythonCode(value) : setWebCode(value));

  const iframeDoc = useMemo(() => {
    if (track !== "web") return "";
    return `<!doctype html><html><head><style>
      body{font-family:system-ui,sans-serif;background:#0b1020;color:#eaf2ff;padding:2rem}
      main{min-height:180px;border:1px dashed #53627f;border-radius:20px;padding:1.5rem}
      h1{font-size:2rem;margin:0 0 1rem}
    </style></head><body>${webCode}</body></html>`;
  }, [track, webCode]);

  async function runPython() {
    setStatus("running");
    setOutput("");
    try {
      pyodideRef.current ??= loadPyodideRuntime();
      const pyodide = await pyodideRef.current;
      const stdout: string[] = [];
      const stderr: string[] = [];
      pyodide.setStdout({ batched: (text) => stdout.push(text) });
      pyodide.setStderr({ batched: (text) => stderr.push(text) });
      await pyodide.runPythonAsync(pythonCode);
      setOutput([...stdout, ...stderr].join("\n").trim());
      setStatus("idle");
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error));
      setStatus("error");
    }
  }

  function validate() {
    if (track === "python") {
      const ok = output.trim() === "SYSTEM ONLINE" || output.trim().startsWith("SYSTEM ONLINE\n");
      if (ok) complete("python");
      else setStatus("error");
      return;
    }

    const parsed = new DOMParser().parseFromString(webCode, "text/html");
    const ok = parsed.querySelector("h1")?.textContent?.trim() === "SYSTEM ONLINE";
    if (ok) complete("web");
    else {
      setStatus("error");
      setOutput(locale === "fr" ? "Il faut un <h1> contenant exactement SYSTEM ONLINE." : "You need an <h1> containing exactly SYSTEM ONLINE.");
    }
  }

  function complete(which: Track) {
    window.localStorage.setItem(`mission-${which}-0`, "done");
    setCompleted((current) => ({ ...current, [which]: true }));
    setStatus("success");
  }

  const missionDone = completed[track];

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="locale-switch" aria-label={t.language}>
          {(["fr", "en"] as Locale[]).map((value) => (
            <button key={value} className={locale === value ? "active" : ""} onClick={() => setLocale(value)}>
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="track-section">
        <p className="section-label">{t.chooseTrack}</p>
        <div className="track-grid">
          {(["python", "web"] as Track[]).map((value) => (
            <button
              className={`track-card ${track === value ? "selected" : ""}`}
              key={value}
              onClick={() => setTrack(value)}
            >
              <span className="track-icon">{value === "python" ? "⌁" : "</>"}</span>
              <strong>{value === "python" ? t.python : t.web}</strong>
              <small>{value === "python" ? t.pythonDesc : t.webDesc}</small>
              <span className={`status-dot ${completed[value] ? "done" : ""}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="mission-card">
        <div className="mission-copy">
          <div className="mission-topline">
            <span>{t.missionZero}</span>
            <span className={`pill ${missionDone ? "success" : ""}`}>
              {missionDone ? t.success : track === "python" ? "Python" : "HTML"}
            </span>
          </div>
          <h2>{track === "python" ? (locale === "fr" ? "Réveiller le terminal" : "Wake the terminal") : locale === "fr" ? "Rallumer le panneau" : "Bring the panel online"}</h2>
          <p>{track === "python" ? t.pythonScenario : t.webScenario}</p>

          <div className="objective">
            <span>{t.objective}</span>
            <strong>{track === "python" ? t.pythonGoal : t.webGoal}</strong>
          </div>

          <button className="hint-button" onClick={() => setShowHint((value) => !value)}>
            {t.hint}
          </button>
          {showHint && <p className="hint">{track === "python" ? t.pythonHint : t.webHint}</p>}
        </div>

        <div className="workspace">
          <div className="editor-pane">
            <div className="pane-title">{track === "python" ? "main.py" : "index.html"}</div>
            <textarea
              spellCheck={false}
              value={activeCode}
              onChange={(event) => setActiveCode(event.target.value)}
              aria-label={track === "python" ? "Python editor" : "HTML editor"}
            />
            <div className="actions">
              <button className="secondary" onClick={track === "python" ? runPython : () => setOutput("")} disabled={status === "running"}>
                {status === "running" ? t.running : track === "python" ? t.run : t.preview}
              </button>
              <button className="primary" onClick={validate} disabled={status === "running"}>
                {t.validate}
              </button>
            </div>
          </div>

          <div className="result-pane">
            <div className="pane-title">{track === "python" ? t.output : t.preview}</div>
            {track === "python" ? (
              <pre className={status === "error" ? "console error" : "console"}>
                {output || (locale === "fr" ? "La sortie apparaîtra ici." : "Program output will appear here.")}
              </pre>
            ) : (
              <iframe title="Web preview" sandbox="" srcDoc={iframeDoc} />
            )}
            {track === "python" && <small className="runtime-note">{t.pyodideNote}</small>}
          </div>
        </div>

        {status === "error" && <p className="feedback error">{t.retry}{output && track === "web" ? ` — ${output}` : ""}</p>}
        {missionDone && (
          <div className="debrief">
            <span>✓ {t.success}</span>
            <h3>{t.debriefTitle}</h3>
            <p>{track === "python" ? t.pythonDebrief : t.webDebrief}</p>
            <div className="bonus"><strong>{t.bonus}</strong><br />{track === "python" ? t.pythonBonus : t.webBonus}</div>
          </div>
        )}
      </section>

      <section className="next-card">
        <span>01</span>
        <div>
          <strong>{t.nextLocked}</strong>
          <p>{t.nextText}</p>
        </div>
        <span aria-hidden="true">🔒</span>
      </section>
    </main>
  );
}
