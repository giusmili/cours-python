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

type Progress = {
    attempts: number;
    passed: boolean;
    timepassed: number;
};

type ProgressByMission = Record<string, Progress>;

type ProgressResponse = Progress & {
    activitypassed: boolean;
};

type PlaygroundViewProps = {
    activityName: string;
    track: 'python' | 'web' | string;
    missionPack: string;
    courseModuleId: number;
    locale: Locale;
    missions: Mission[];
    progressByMission: ProgressByMission;
    canPersist: boolean;
    ajaxUrl: string;
    sesskey: string;
};

type AjaxEnvelope = {
    error: boolean;
    data?: ProgressResponse;
    exception?: {
        message?: string;
    };
};

const EMPTY_PROGRESS: Progress = {
    attempts: 0,
    passed: false,
    timepassed: 0,
};

const text = (value: Localized, locale: Locale) => value[locale] ?? value.en;

const firstIncompleteMission = (missions: Mission[], progress: ProgressByMission) => {
    const index = missions.findIndex((mission) => !progress[mission.id]?.passed);
    return index >= 0 ? index : 0;
};

const allMissionsPassed = (missions: Mission[], progress: ProgressByMission) => (
    missions.length > 0 && missions.every((mission) => progress[mission.id]?.passed)
);

export default function PlaygroundView({
    activityName,
    track,
    missionPack,
    courseModuleId,
    locale,
    missions,
    progressByMission: initialProgress,
    canPersist,
    ajaxUrl,
    sesskey,
}: PlaygroundViewProps) {
    const [progressByMission, setProgressByMission] = useState<ProgressByMission>(initialProgress);
    const [missionIndex, setMissionIndex] = useState(() => firstIncompleteMission(missions, initialProgress));
    const mission = missions[missionIndex];
    const missionProgress = progressByMission[mission.id] ?? EMPTY_PROGRESS;

    const [code, setCode] = useState(mission.starter);
    const [hintCount, setHintCount] = useState(0);
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);
    const [lastRunCode, setLastRunCode] = useState<string | null>(null);
    const [passed, setPassed] = useState(missionProgress.passed);
    const [attempts, setAttempts] = useState(missionProgress.attempts);
    const [activityPassed, setActivityPassed] = useState(
        () => allMissionsPassed(missions, initialProgress),
    );
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState('');
    const [runtimeError, setRuntimeError] = useState('');

    useEffect(() => () => resetPythonRuntime(), []);

    const selectMission = (nextIndex: number) => {
        if (nextIndex === missionIndex || running || syncing) {
            return;
        }

        const nextMission = missions[nextIndex];
        const nextProgress = progressByMission[nextMission.id] ?? EMPTY_PROGRESS;

        setMissionIndex(nextIndex);
        setCode(nextMission.starter);
        setHintCount(0);
        setOutput('');
        setLastRunCode(null);
        setPassed(nextProgress.passed);
        setAttempts(nextProgress.attempts);
        setRuntimeError('');
        setSyncError('');
    };

    const resetMission = () => {
        setCode(mission.starter);
        setHintCount(0);
        setOutput('');
        setLastRunCode(null);
        setRuntimeError('');
        setSyncError('');
        setPassed(missionProgress.passed);
        setAttempts(missionProgress.attempts);
    };

    const showHint = () => {
        setHintCount((current) => Math.min(current + 1, mission.hints.length));
    };

    const runCode = async () => {
        setRunning(true);
        setRuntimeError('');
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

    const updateLocalProgress = (next: Progress) => {
        setProgressByMission((current) => {
            const updated = {
                ...current,
                [mission.id]: next,
            };
            setActivityPassed(allMissionsPassed(missions, updated));
            return updated;
        });
        setAttempts(next.attempts);
        setPassed(next.passed);
    };

    const validate = async() => {
        const ok = lastRunCode === code && output.trim() === mission.validation.expectedOutput.trim();

        if (!ok && lastRunCode === code && !runtimeError) {
            setRuntimeError(locale === 'fr'
                ? 'La sortie ne correspond pas encore à l’objectif.'
                : 'The output does not match the objective yet.');
        }

        if (!canPersist) {
            updateLocalProgress({
                attempts: attempts + 1,
                passed: passed || ok,
                timepassed: (passed || ok) ? (missionProgress.timepassed || Date.now()) : 0,
            });
            return;
        }

        setPassed((current) => current || ok);
        setSyncing(true);
        setSyncError('');
        try {
            const endpoint = new URL(ajaxUrl, window.location.href);
            endpoint.searchParams.set('sesskey', sesskey);
            endpoint.searchParams.set('info', 'mod_lgcplayground_record_attempt');

            const httpResponse = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify([{
                    index: 0,
                    methodname: 'mod_lgcplayground_record_attempt',
                    args: {
                        cmid: courseModuleId,
                        missionid: mission.id,
                        passed: ok,
                    },
                }]),
            });
            const envelopes = await httpResponse.json() as AjaxEnvelope[];
            const envelope = envelopes[0];
            if (!httpResponse.ok || !envelope || envelope.error || !envelope.data) {
                throw new Error(envelope?.exception?.message || 'Moodle progress request failed.');
            }

            const nextProgress = {
                attempts: envelope.data.attempts,
                passed: envelope.data.passed,
                timepassed: envelope.data.timepassed,
            };
            setProgressByMission((current) => ({
                ...current,
                [mission.id]: nextProgress,
            }));
            setAttempts(nextProgress.attempts);
            setPassed(nextProgress.passed);
            setActivityPassed(envelope.data.activitypassed);
        } catch (error) {
            setSyncError(
                locale === 'fr'
                    ? 'La validation locale a fonctionné, mais Moodle n’a pas pu enregistrer la progression.'
                    : 'Local validation worked, but Moodle could not save progress.',
            );
        } finally {
            setSyncing(false);
        }
    };

    const completedCount = missions.filter((item) => progressByMission[item.id]?.passed).length;

    return (
        <main className="mod-lgcplayground-app" data-cmid={courseModuleId}>
            <nav
                className="mod-lgcplayground-missions"
                aria-label={locale === 'fr' ? 'Missions du parcours' : 'Track missions'}
            >
                <div className="mod-lgcplayground-missions-summary">
                    <strong>{activityName}</strong>
                    <span>
                        {completedCount}/{missions.length} {locale === 'fr' ? 'missions réussies' : 'missions complete'}
                    </span>
                </div>
                <div className="mod-lgcplayground-mission-list">
                    {missions.map((item, index) => {
                        const itemPassed = progressByMission[item.id]?.passed ?? false;
                        const active = index === missionIndex;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={[
                                    'mod-lgcplayground-mission-tab',
                                    active ? 'is-active' : '',
                                    itemPassed ? 'is-passed' : '',
                                ].filter(Boolean).join(' ')}
                                aria-current={active ? 'step' : undefined}
                                onClick={() => selectMission(index)}
                                disabled={running || syncing}
                            >
                                <span>{String(item.order).padStart(2, '0')}</span>
                                <strong>{text(item.title, locale)}</strong>
                                <small>
                                    {itemPassed
                                        ? (locale === 'fr' ? 'Réussie' : 'Complete')
                                        : (locale === 'fr' ? 'À faire' : 'To do')}
                                </small>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {activityPassed && (
                <div className="mod-lgcplayground-track-success" role="status">
                    <strong>{locale === 'fr' ? 'Parcours validé' : 'Track complete'}</strong>
                    <span>
                        {locale === 'fr'
                            ? 'Toutes les missions requises sont réussies dans Moodle.'
                            : 'All required missions are complete in Moodle.'}
                    </span>
                </div>
            )}

            <header className="mod-lgcplayground-hero">
                <span className="mod-lgcplayground-kicker">
                    LGC Playground · {track} · {missionIndex + 1}/{missions.length}
                </span>
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
                            setRuntimeError('');
                            setSyncError('');
                        }}
                        aria-label={mission.fileName}
                    />
                    <div className="mod-lgcplayground-actions">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={resetMission}
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
                            {running
                                ? (locale === 'fr' ? 'Exécution…' : 'Running…')
                                : (locale === 'fr' ? 'Exécuter' : 'Run')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={validate}
                            disabled={running || syncing || lastRunCode !== code}
                        >
                            {syncing
                                ? (locale === 'fr' ? 'Enregistrement…' : 'Saving…')
                                : (locale === 'fr' ? 'Valider' : 'Validate')}
                        </button>
                    </div>
                </div>

                <aside className="mod-lgcplayground-side">
                    <strong>{activityName}</strong>
                    <p>
                        {locale === 'fr'
                            ? 'Python s’exécute dans un Web Worker isolé du navigateur.'
                            : 'Python runs in an isolated browser Web Worker.'}
                    </p>

                    <div className="mod-lgcplayground-output">
                        <span>{locale === 'fr' ? 'Sortie' : 'Output'}</span>
                        <pre>{output || (locale === 'fr' ? 'La sortie apparaîtra ici.' : 'Output will appear here.')}</pre>
                    </div>

                    <p className="mod-lgcplayground-progress">
                        {canPersist
                            ? (locale === 'fr'
                                ? `Progression Moodle · ${attempts} validation(s)`
                                : `Moodle progress · ${attempts} validation attempt(s)`)
                            : (locale === 'fr'
                                ? 'Mode invité · progression conservée pour cette page seulement'
                                : 'Guest mode · progress is kept for this page only')}
                    </p>

                    {runtimeError && <p className="mod-lgcplayground-error">{runtimeError}</p>}
                    {syncError && <p className="mod-lgcplayground-error">{syncError}</p>}

                    {passed && (
                        <div className="mod-lgcplayground-success">
                            <strong>{locale === 'fr' ? 'Mission validée' : 'Mission complete'}</strong>
                            <p>{text(mission.debrief, locale)}</p>
                            <p><strong>{locale === 'fr' ? 'Bonus' : 'Bonus'}:</strong> {text(mission.bonus, locale)}</p>
                            {missionIndex < missions.length - 1 && (
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => selectMission(missionIndex + 1)}
                                    disabled={running || syncing}
                                >
                                    {locale === 'fr' ? 'Mission suivante' : 'Next mission'}
                                </button>
                            )}
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
