import React, {useEffect, useState} from 'react';
import {resetPythonRuntime, runPythonInSandbox} from './pythonRuntime';

type Locale = 'fr' | 'en';

type Localized = {
    fr: string;
    en: string;
};

type Mission = {
    id: string;
    order: number;
    fileName: string;
    title: Localized;
    scenario: Localized;
    objective: Localized;
    starter: string;
    hints: Localized[];
    debrief: Localized;
    bonus: Localized;
    concepts: Localized[];
    reference: {
        label: Localized;
        href: string;
    };
    validation: {
        kind: 'python';
        expectedOutput: string;
    };
};

type PlaygroundViewProps = {
    activityName: string;
    track: 'python' | 'web' | string;
    missionPack: string;
    courseModuleId: number;
    locale: Locale;
    mission: Mission;
};

const text = (value: Localized, locale: Locale) => value[locale] ?? value.en;

export default function PlaygroundView({
    activityName,
    track,
    missionPack,
    courseModuleId,
    locale,
    mission,
}: PlaygroundViewProps) {
    const [code, setCode] = useState(mission.starter);
    const [hintCount, setHintCount] = useState(0);
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);
    const [lastRunCode, setLastRunCode] = useState<string | null>(null);
    const [passed, setPassed] = useState(false);
    const [runtimeError, setRuntimeError] = useState('');

    useEffect(() => () => resetPythonRuntime(), []);

    const showHint = () => {
        setHintCount((current) => Math.min(current + 1, mission.hints.length));
    };

    const runCode = async () => {
        setRunning(true);
        setRuntimeError('');
        setPassed(false);
        const execution = await runPythonInSandbox(code);
        setRunning(false);
        setLastRunCode(code);
        setOutput(execution.output || execution.error || '');
        if (!execution.ok) {
            setRuntimeError(execution.timedOut
                ? (locale === 'fr' ? 'Exécution interrompue après 5 secondes.' : 'Execution stopped after 5 seconds.')
                : (execution.error || (locale === 'fr' ? 'Erreur Python.' : 'Python error.')));
        }
    };

    const validate = () => {
        const ok = lastRunCode === code && output.trim() === mission.validation.expectedOutput.trim();
        setPassed(ok);
        if (!ok && lastRunCode === code && !runtimeError) {
            setRuntimeError(locale === 'fr' ? 'La sortie ne correspond pas encore à l’objectif.' : 'The output does not match the objective yet.');
        }
    };

    return (
        <main className="mod-lgcplayground-app" data-cmid={courseModuleId}>
            <header className="mod-lgcplayground-hero">
                <span className="mod-lgcplayground-kicker">LGC Playground · {track}</span>
                <h2>{text(mission.title, locale)}</h2>
                <p>{text(mission.scenario, locale)}</p>
            </header>

            <section className="mod-lgcplayground-objective">
                <span>{locale === 'fr' ? 'Objectif' : 'Objective'}</span>
                <strong>{text(mission.objective, locale)}</strong>
            </section>

            <div className="mod-lgcplayground-concepts">
                {mission.concepts.map((concept) => (
                    <span key={concept.en}>{text(concept, locale)}</span>
                ))}
            </div>

            <section className="mod-lgcplayground-workspace">
                <div className="mod-lgcplayground-editor">
                    <div className="mod-lgcplayground-pane-title">
                        <span>{mission.fileName}</span>
                        <span>{missionPack}</span>
                    </div>
                    <textarea
                        spellCheck={false}
                        value={code}
                        onChange={(event) => {
                            setCode(event.target.value);
                            setPassed(false);
                            setRuntimeError('');
                        }}
                        aria-label={mission.fileName}
                    />
                    <div className="mod-lgcplayground-actions">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setCode(mission.starter)}
                        >
                            {locale === 'fr' ? 'Réinitialiser' : 'Reset'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={showHint}
                            disabled={hintCount >= mission.hints.length}
                        >
                            {locale === 'fr' ? 'Indice' : 'Hint'}
                        </button>
                        <button type="button" className="btn btn-primary" onClick={runCode} disabled={running}>
                            {running ? (locale === 'fr' ? 'Exécution…' : 'Running…') : (locale === 'fr' ? 'Exécuter' : 'Run')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={validate}
                            disabled={running || lastRunCode !== code}
                        >
                            {locale === 'fr' ? 'Valider' : 'Validate'}
                        </button>
                    </div>
                </div>

                <aside className="mod-lgcplayground-side">
                    <strong>{activityName}</strong>
                    <p>{locale === 'fr' ? 'Python s’exécute dans un Web Worker isolé du navigateur.' : 'Python runs in an isolated browser Web Worker.'}</p>

                    <div className="mod-lgcplayground-output">
                        <span>{locale === 'fr' ? 'Sortie' : 'Output'}</span>
                        <pre>{output || (locale === 'fr' ? 'La sortie apparaîtra ici.' : 'Output will appear here.')}</pre>
                    </div>

                    {runtimeError && <p className="mod-lgcplayground-error">{runtimeError}</p>}

                    {passed && (
                        <div className="mod-lgcplayground-success">
                            <strong>{locale === 'fr' ? 'Mission validée' : 'Mission complete'}</strong>
                            <p>{text(mission.debrief, locale)}</p>
                            <p><strong>{locale === 'fr' ? 'Bonus' : 'Bonus'}:</strong> {text(mission.bonus, locale)}</p>
                        </div>
                    )}

                    {mission.hints.slice(0, hintCount).map((hint, index) => (
                        <div className="mod-lgcplayground-hint" key={index}>
                            <span>{index + 1}</span>
                            <p>{text(hint, locale)}</p>
                        </div>
                    ))}

                    <a href={mission.reference.href} target="_blank" rel="noreferrer">
                        {text(mission.reference.label, locale)} ↗
                    </a>
                </aside>
            </section>
        </main>
    );
}
