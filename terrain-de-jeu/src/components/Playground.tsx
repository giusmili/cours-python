"use client";

import { useEffect, useMemo, useState } from "react";
import {
  localize,
  missionsForTrack,
  type Locale,
  type Mission,
  type Track,
} from "../lib/missions";
import {
  validatePythonMission,
  validateWebMission,
} from "../lib/validation";
import {
  resetPythonRuntime,
  runPythonInSandbox,
} from "../lib/pythonRuntime";

type Status = "idle" | "running" | "success" | "error";

const PROGRESS_KEY = "playground-progress-v1";
const DRAFTS_KEY = "playground-drafts-v1";
const LOCALE_KEY = "playground-locale";
const TRACK_KEY = "playground-track";

const ui = {
  fr: {
    eyebrow: "Terrain de jeu Dev",
    title: "Apprendre en accomplissant des missions.",
    subtitle:
      "Tu expérimentes d’abord. Le terrain te répond. Puis on met les mots sur ce que tu viens d’apprendre.",
    chooseTrack: "Choisis ton terrain",
    python: "Python",
    pythonDesc: "Terminal, logique, données et automatisation.",
    web: "Web",
    webDesc: "HTML + CSS, puis JavaScript dans une page vivante.",
    progress: "progression",
    mission: "Mission",
    locked: "verrouillée",
    done: "validée",
    current: "en cours",
    objective: "Objectif",
    hint: "Indice",
    nextHint: "Indice suivant",
    reference: "Référence",
    run: "Exécuter",
    validate: "Valider",
    reset: "Réinitialiser",
    running: "Exécution…",
    output: "Sortie",
    preview: "Aperçu",
    emptyOutput: "La sortie du programme apparaîtra ici.",
    success: "Mission validée",
    debrief: "Ce que tu viens d’utiliser",
    bonus: "Défi bonus",
    nextMission: "Mission suivante",
    allDone: "Parcours disponible terminé",
    allDoneText: "Tu as validé toutes les missions actuellement disponibles sur ce terrain.",
    feedback: "À corriger",
    pyodide:
      "Python s’exécute dans un worker isolé du navigateur : aucun code n’est envoyé au serveur, l’accès réseau est coupé et une boucle infinie est interrompue.",
    saved: "Brouillon sauvegardé localement",
    resetConfirm: "Le code de départ de cette mission a été restauré.",
    language: "Langue",
    missionPath: "Parcours de missions",
    pythonRuntime: "Python · navigateur",
    sandboxedHtml: "HTML isolé",
    webPreview: "Aperçu Web",
  },
  en: {
    eyebrow: "Dev Playground",
    title: "Learn by completing missions.",
    subtitle:
      "Experiment first. The playground answers back. Then we name what you just learned.",
    chooseTrack: "Choose your playground",
    python: "Python",
    pythonDesc: "Terminal, logic, data and automation.",
    web: "Web",
    webDesc: "HTML + CSS, then JavaScript inside a living page.",
    progress: "progress",
    mission: "Mission",
    locked: "locked",
    done: "complete",
    current: "in progress",
    objective: "Objective",
    hint: "Hint",
    nextHint: "Next hint",
    reference: "Reference",
    run: "Run",
    validate: "Validate",
    reset: "Reset",
    running: "Running…",
    output: "Output",
    preview: "Preview",
    emptyOutput: "Program output will appear here.",
    success: "Mission complete",
    debrief: "What you just used",
    bonus: "Bonus challenge",
    nextMission: "Next mission",
    allDone: "Available track complete",
    allDoneText: "You completed every mission currently available on this track.",
    feedback: "Needs work",
    pyodide:
      "Python runs in an isolated browser worker: no code is sent to the server, network access is disabled and runaway code is interrupted.",
    saved: "Draft saved locally",
    resetConfirm: "The mission starter code has been restored.",
    language: "Language",
    missionPath: "Mission path",
    pythonRuntime: "Python · browser",
    sandboxedHtml: "Sandboxed HTML",
    webPreview: "Web preview",
  },
} as const;

function firstAvailableMission(
  track: Track,
  completed: Set<string>,
): Mission {
  const trackMissions = missionsForTrack(track);
  const firstIncomplete = trackMissions.find((mission, index) => {
    if (completed.has(mission.id)) return false;
    return index === 0 || completed.has(trackMissions[index - 1].id);
  });

  return firstIncomplete ?? trackMissions[trackMissions.length - 1];
}

export function Playground() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [track, setTrack] = useState<Track>("python");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [currentMissionId, setCurrentMissionId] = useState("python-00-terminal");
  const [output, setOutput] = useState("");
  const [feedback, setFeedback] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [hintIndex, setHintIndex] = useState(-1);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");

  const t = ui[locale];
  const trackMissions = useMemo(() => missionsForTrack(track), [track]);
  const currentMission =
    trackMissions.find((mission) => mission.id === currentMissionId) ??
    trackMissions[0];
  const currentCode = drafts[currentMission.id] ?? currentMission.starter;

  const completedCount = trackMissions.filter((mission) =>
    completed.has(mission.id),
  ).length;
  const progress = Math.round((completedCount / trackMissions.length) * 100);

  const nextMission = trackMissions[currentMission.order + 1] ?? null;

  useEffect(() => {
    return () => resetPythonRuntime();
  }, []);

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(LOCALE_KEY);
      const storedTrack = window.localStorage.getItem(TRACK_KEY);
      const storedProgress = window.localStorage.getItem(PROGRESS_KEY);
      const storedDrafts = window.localStorage.getItem(DRAFTS_KEY);

      const initialLocale: Locale =
        storedLocale === "en" || storedLocale === "fr" ? storedLocale : "fr";
      const initialTrack: Track =
        storedTrack === "web" || storedTrack === "python"
          ? storedTrack
          : "python";
      const initialCompleted = new Set<string>(
        storedProgress ? JSON.parse(storedProgress) : [],
      );
      const initialDrafts: Record<string, string> = storedDrafts
        ? JSON.parse(storedDrafts)
        : {};

      setLocale(initialLocale);
      setTrack(initialTrack);
      setCompleted(initialCompleted);
      setDrafts(initialDrafts);
      setCurrentMissionId(
        firstAvailableMission(initialTrack, initialCompleted).id,
      );
    } catch {
      // Corrupted local state should never block the learning experience.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(TRACK_KEY, track);
  }, [track, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed]));
  }, [completed, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }, [drafts, hydrated]);

  function isUnlocked(mission: Mission) {
    if (mission.order === 0) return true;
    return completed.has(trackMissions[mission.order - 1].id);
  }

  function selectTrack(nextTrack: Track) {
    setTrack(nextTrack);
    const mission = firstAvailableMission(nextTrack, completed);
    setCurrentMissionId(mission.id);
    clearTransientState();
  }

  function selectMission(mission: Mission) {
    if (!isUnlocked(mission)) return;
    setCurrentMissionId(mission.id);
    clearTransientState();
  }

  function clearTransientState() {
    setOutput("");
    setFeedback([]);
    setStatus("idle");
    setHintIndex(-1);
    setNotice("");
  }

  function updateCode(value: string) {
    setDrafts((current) => ({
      ...current,
      [currentMission.id]: value,
    }));
    setStatus("idle");
    setFeedback([]);
    setNotice("");
  }

  function resetMission() {
    setDrafts((current) => ({
      ...current,
      [currentMission.id]: currentMission.starter,
    }));
    setOutput("");
    setFeedback([]);
    setStatus("idle");
    setHintIndex(-1);
    setNotice(t.resetConfirm);
  }

  async function executePython() {
    setStatus("running");
    setFeedback([]);
    setNotice("");

    try {
      const execution = await runPythonInSandbox(currentCode);
      const nextOutput = execution.output || execution.error || "";

      setOutput(nextOutput);

      if (!execution.ok) {
        const message = execution.timedOut
          ? locale === "fr"
            ? "Exécution interrompue après 5 secondes. Vérifie notamment les boucles qui ne se terminent jamais."
            : "Execution stopped after 5 seconds. Check especially for loops that never finish."
          : locale === "fr"
            ? "Le programme doit d’abord s’exécuter sans erreur."
            : "The program must run without errors first.";

        setFeedback([message]);
        setStatus("error");
        return { ok: false, output: nextOutput };
      }

      setStatus("idle");
      return { ok: true, output: nextOutput };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput(message);
      setFeedback([
        locale === "fr"
          ? "Le runtime Python n’a pas pu démarrer. Réessaie dans quelques secondes."
          : "The Python runtime could not start. Try again in a few seconds.",
      ]);
      setStatus("error");
      resetPythonRuntime();
      return { ok: false, output: message };
    }
  }

  async function validateCurrentMission() {
    setNotice("");

    if (currentMission.validation.kind === "python") {
      const execution = await executePython();
      if (!execution.ok) return;

      const result = validatePythonMission(
        currentMission,
        currentCode,
        execution.output,
        locale,
      );
      finishValidation(result.ok, result.messages);
      return;
    }

    const result = validateWebMission(currentMission, currentCode, locale);
    finishValidation(result.ok, result.messages);
  }

  function finishValidation(ok: boolean, messages: string[]) {
    if (!ok) {
      setStatus("error");
      setFeedback(messages);
      return;
    }

    setStatus("success");
    setFeedback([]);
    setCompleted((current) => new Set([...current, currentMission.id]));
  }

  function showNextHint() {
    setHintIndex((current) =>
      Math.min(current + 1, currentMission.hints.length - 1),
    );
  }

  function moveToNextMission() {
    if (!nextMission || !completed.has(currentMission.id)) return;
    setCurrentMissionId(nextMission.id);
    clearTransientState();
  }

  const iframeDoc = useMemo(() => {
    if (currentMission.track !== "web") return "";
    return `<!doctype html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src data:; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
      <style>
        :root{color-scheme:dark}
        body{margin:0;min-height:100vh;padding:2rem;font-family:system-ui,sans-serif;background:#07111f;color:#edf6ff}
      </style>
    </head><body>${currentCode}</body></html>`;
  }, [currentMission.track, currentCode]);

  const allComplete = completedCount === trackMissions.length;

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
            <button
              key={value}
              className={locale === value ? "active" : ""}
              onClick={() => setLocale(value)}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="track-section">
        <div className="section-heading">
          <p className="section-label">{t.chooseTrack}</p>
          <span className="global-progress">
            {completedCount}/{trackMissions.length} · {progress}% {t.progress}
          </span>
        </div>

        <div className="track-grid">
          {(["python", "web"] as Track[]).map((value) => {
            const missions = missionsForTrack(value);
            const done = missions.filter((mission) =>
              completed.has(mission.id),
            ).length;

            return (
              <button
                className={`track-card ${track === value ? "selected" : ""}`}
                key={value}
                onClick={() => selectTrack(value)}
              >
                <span className="track-icon">
                  {value === "python" ? "⌁" : "</>"}
                </span>
                <strong>{value === "python" ? t.python : t.web}</strong>
                <small>
                  {value === "python" ? t.pythonDesc : t.webDesc}
                </small>
                <span className="track-count">
                  {done}/{missions.length}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="learning-layout">
        <aside className="mission-path" aria-label={t.missionPath}>
          <div className="path-header">
            <span>{track === "python" ? t.python : t.web}</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-rail">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="mission-list">
            {trackMissions.map((mission) => {
              const done = completed.has(mission.id);
              const unlocked = isUnlocked(mission);
              const active = mission.id === currentMission.id;

              return (
                <button
                  key={mission.id}
                  className={[
                    "mission-step",
                    done ? "done" : "",
                    active ? "active" : "",
                    !unlocked ? "locked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={!unlocked}
                  onClick={() => selectMission(mission)}
                >
                  <span className="step-number">
                    {done ? "✓" : String(mission.order).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{localize(mission.title, locale)}</strong>
                    <small>
                      {done
                        ? t.done
                        : !unlocked
                          ? t.locked
                          : active
                            ? t.current
                            : t.mission}
                    </small>
                  </span>
                  {!unlocked && <span className="lock">●</span>}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="mission-card">
          <div className="mission-copy">
            <div className="mission-topline">
              <span>
                {t.mission} {String(currentMission.order).padStart(2, "0")}
              </span>
              <div className="concept-row">
                {currentMission.concepts.map((concept) => (
                  <span className="concept-pill" key={concept.en}>
                    {localize(concept, locale)}
                  </span>
                ))}
              </div>
            </div>

            <h2>{localize(currentMission.title, locale)}</h2>
            <p>{localize(currentMission.scenario, locale)}</p>

            <div className="objective">
              <span>{t.objective}</span>
              <strong>{localize(currentMission.objective, locale)}</strong>
            </div>

            <div className="support-row">
              <button className="hint-button" onClick={showNextHint}>
                {hintIndex < 0 ? t.hint : t.nextHint}
              </button>
              <a
                className="reference-link"
                href={currentMission.reference.href[locale]}
                target="_blank"
                rel="noreferrer"
              >
                {localize(currentMission.reference.label, locale)} ↗
              </a>
            </div>

            {hintIndex >= 0 && (
              <div className="hint-stack">
                {currentMission.hints
                  .slice(0, hintIndex + 1)
                  .map((hint, index) => (
                    <p className="hint" key={index}>
                      <span>{index + 1}</span>
                      {localize(hint, locale)}
                    </p>
                  ))}
              </div>
            )}
          </div>

          <div className="workspace">
            <div className="editor-pane">
              <div className="pane-title">
                <span>{currentMission.fileName}</span>
                <span>{t.saved}</span>
              </div>
              <textarea
                spellCheck={false}
                value={currentCode}
                onChange={(event) => updateCode(event.target.value)}
                aria-label={currentMission.fileName}
              />
              <div className="actions">
                <button className="ghost" onClick={resetMission}>
                  {t.reset}
                </button>
                {currentMission.track === "python" && (
                  <button
                    className="secondary"
                    onClick={executePython}
                    disabled={status === "running"}
                  >
                    {status === "running" ? t.running : t.run}
                  </button>
                )}
                <button
                  className="primary"
                  onClick={validateCurrentMission}
                  disabled={status === "running"}
                >
                  {t.validate}
                </button>
              </div>
            </div>

            <div className="result-pane">
              <div className="pane-title">
                <span>
                  {currentMission.track === "python" ? t.output : t.preview}
                </span>
                <span>
                  {currentMission.track === "python"
                    ? t.pythonRuntime
                    : t.sandboxedHtml}
                </span>
              </div>

              {currentMission.track === "python" ? (
                <>
                  <pre
                    className={
                      status === "error" ? "console error" : "console"
                    }
                  >
                    {output || t.emptyOutput}
                  </pre>
                  <small className="runtime-note">{t.pyodide}</small>
                </>
              ) : (
                <iframe
                  title={t.webPreview}
                  sandbox="allow-scripts"
                  srcDoc={iframeDoc}
                />
              )}
            </div>
          </div>

          {notice && <p className="notice">{notice}</p>}

          {status === "error" && feedback.length > 0 && (
            <div className="feedback error">
              <strong>{t.feedback}</strong>
              <ul>
                {feedback.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {completed.has(currentMission.id) && (
            <div className="debrief">
              <span>✓ {t.success}</span>
              <h3>{t.debrief}</h3>
              <p>{localize(currentMission.debrief, locale)}</p>
              <div className="bonus">
                <strong>{t.bonus}</strong>
                <br />
                {localize(currentMission.bonus, locale)}
              </div>

              {nextMission && isUnlocked(nextMission) && (
                <button className="next-button" onClick={moveToNextMission}>
                  {t.nextMission} →
                </button>
              )}
            </div>
          )}
        </section>
      </section>

      {allComplete && (
        <section className="completion-card">
          <span>✓</span>
          <div>
            <strong>{t.allDone}</strong>
            <p>{t.allDoneText}</p>
          </div>
        </section>
      )}
    </main>
  );
}
