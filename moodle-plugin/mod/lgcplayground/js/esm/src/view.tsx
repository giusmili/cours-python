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

type WorkflowState = 'edit' | 'run' | 'validate' | 'complete';

const EMPTY_PROGRESS: Progress = {
    attempts: 0,
    passed: false,
    timepassed: 0,
};

const text = (value: Localized, locale: Locale) => value[locale] ?? value.en;

const firstIncompleteMission = (missions: Mission[], progress: ProgressByMission) => {
    const index = missions.findIndex((mission) => !progress[mission.id]?.passed);
    return index >= 0 ? index : Math.max(0, missions.length - 1);
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

    const isMissionUnlocked = (index: number) => (
        index === 0 || missions
            .slice(0, index)
            .every((item) => progressByMission[item.id]?.passed)
    );

    const selectMission = (nextIndex: number) => {
        if (
            nextIndex === missionIndex
            || running
            || syncing
            || !isMissionUnlocked(nextIndex)
        ) {
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

    const runCode = async() => {
        setRunning(true);
        setRuntimeError('');
        const execution = await runPythonInSandbox(code);
        setRunning(false);
        setLastRunCode(code);
        setOutput(execution.output || execution.error || '');
        if (!execution.ok) {
            setRuntimeError(execution.timedOut
                ? (locale === 'fr'
                    ? 'Exécution interrompue après 5 secondes. Vérifie les boucles qui ne se terminent jamais.'
                    : 'Execution stopped after 5 seconds. Check for loops that never finish.')
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
                ? 'Pas encore. Compare la sortie avec l’objectif, corrige ton code puis réessaie.'
                : 'Not yet. Compare the output with the objective, fix your code, then try again.');
        }

        if (!canPersist) {
            updateLocalProgress({
                attempts: attempts + 1,
                passed: passed || ok,
                timepassed: (passed || ok)
                    ? (missionProgress.timepassed || Math.floor(Date.now() / 1000))
                    : 0,
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
                    ? 'La mission est validée localement, mais Moodle n’a pas pu synchroniser la progression.'
                    : 'The mission passed locally, but Moodle could not sync progress.',
            );
        } finally {
            setSyncing(false);
        }
    };

    const completedCount = missions.filter((item) => progressByMission[item.id]?.passed).length;
    const completionPercent = missions.length > 0
        ? Math.round((completedCount / missions.length) * 100)
        : 0;

    const workflowState: WorkflowState = passed
        ? 'complete'
        : running
            ? 'run'
            : lastRunCode === code
                ? 'validate'
                : 'edit';

    const workflowClass = (step: 'edit' | 'run' | 'validate') => {
        const order = {edit: 0, run: 1, validate: 2};
        const current = workflowState === 'complete' ? 3 : order[workflowState];
        const stepIndex = order[step];

        if (workflowState === 'complete' || stepIndex < current) {
            return 'is-done';
        }
        return stepIndex === current ? 'is-current' : '';
    };

    return (
        <main className="mod-lgcplayground-app" data-cmid={courseModuleId}>
            <header className="mod-lgcplayground-topbar">
                <div className="mod-lgcplayground-brand">
                    <span>{locale === 'fr' ? 'Laboratoire interactif' : 'Interactive lab'}</span>
                    <strong>{activityName}</strong>
                </div>
                <div className="mod-lgcplayground-runtime-status" aria-label={locale === 'fr' ? 'État du laboratoire' : 'Lab status'}>
                    <span className="is-ready">
                        <span aria-hidden="true">●</span>
                        {locale === 'fr' ? 'Python navigateur' : 'Browser Python'}
                    </span>
                    <span className={canPersist ? 'is-ready' : 'is-demo'}>
                        <span aria-hidden="true">{canPersist ? '●' : '○'}</span>
                        {canPersist
                            ? (locale === 'fr' ? 'Progression Moodle' : 'Moodle progress')
                            : (locale === 'fr' ? 'Mode démo' : 'Demo mode')}
                    </span>
                </div>
            </header>

            <nav
                className="mod-lgcplayground-missions"
                aria-label={locale === 'fr' ? 'Missions du parcours' : 'Track missions'}
            >
                <div className="mod-lgcplayground-missions-summary">
                    <div>
                        <strong>
                            {locale === 'fr' ? 'Parcours Python' : 'Python track'}
                        </strong>
                        <span>
                            {completedCount}/{missions.length} {locale === 'fr' ? 'missions réussies' : 'missions complete'}
                        </span>
                    </div>
                    <span>{completionPercent}%</span>
                </div>
                <div
                    className="mod-lgcplayground-progressbar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={missions.length}
                    aria-valuenow={completedCount}
                    aria-label={locale === 'fr' ? 'Progression du parcours' : 'Track progress'}
                >
                    <span style={{width: `${completionPercent}%`}} />
                </div>
                <div className="mod-lgcplayground-mission-list">
                    {missions.map((item, index) => {
                        const itemPassed = progressByMission[item.id]?.passed ?? false;
                        const active = index === missionIndex;
                        const unlocked = isMissionUnlocked(index);

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={[
                                    'mod-lgcplayground-mission-tab',
                                    active ? 'is-active' : '',
                                    itemPassed ? 'is-passed' : '',
                                    !unlocked ? 'is-locked' : '',
                                ].filter(Boolean).join(' ')}
                                aria-current={active ? 'step' : undefined}
                                onClick={() => selectMission(index)}
                                disabled={running || syncing || !unlocked}
                            >
                                <span>{String(item.order).padStart(2, '0')}</span>
                                <strong>{text(item.title, locale)}</strong>
                                <small>
                                    {itemPassed
                                        ? (locale === 'fr' ? '✓ Réussie' : '✓ Complete')
                                        : unlocked
                                            ? (locale === 'fr' ? 'À faire' : 'To do')
                                            : (locale === 'fr' ? 'Verrouillée' : 'Locked')}
                                </small>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {activityPassed && (
                <div className="mod-lgcplayground-track-success" role="status" aria-live="polite">
                    <div>
                        <span className="mod-lgcplayground-success-icon" aria-hidden="true">✓</span>
                        <div>
                            <strong>{locale === 'fr' ? 'Parcours validé' : 'Track complete'}</strong>
                            <span>
                                {locale === 'fr'
                                    ? 'Toutes les missions requises sont réussies et la completion Moodle est à jour.'
                                    : 'All required missions are complete and Moodle completion is up to date.'}
                            </span>
                        </div>
                    </div>
                    <span>{missions.length}/{missions.length}</span>
                </div>
            )}

            <section className="mod-lgcplayground-mission-header">
                <div className="mod-lgcplayground-mission-number">
                    <span>{locale === 'fr' ? 'Mission' : 'Mission'}</span>
                    <strong>{String(missionIndex + 1).padStart(2, '0')}</strong>
                </div>
                <div className="mod-lgcplayground-hero">
                    <span className="mod-lgcplayground-kicker">
                        {track} · {missionIndex + 1}/{missions.length}
                    </span>
                    <h2>{text(mission.title, locale)}</h2>
                    <p>{text(mission.scenario, locale)}</p>
                </div>
            </section>

            <section className="mod-lgcplayground-objective">
                <span>{locale === 'fr' ? 'Objectif' : 'Objective'}</span>
                <strong>{text(mission.objective, locale)}</strong>
            </section>

            <div className="mod-lgcplayground-concepts">
                {mission.concepts.map((concept) => (
                    <span key={concept.en}>{text(concept, locale)}</span>
                ))}
            </div>

            <ol className="mod-lgcplayground-workflow" aria-label={locale === 'fr' ? 'Étapes de travail' : 'Workflow'}>
                <li className={workflowClass('edit')}>
                    <span>1</span>
                    <div>
                        <strong>{locale === 'fr' ? 'Coder' : 'Code'}</strong>
                        <small>{locale === 'fr' ? 'Modifie le programme' : 'Edit the program'}</small>
                    </div>
                </li>
                <li className={workflowClass('run')}>
                    <span>2</span>
                    <div>
                        <strong>{locale === 'fr' ? 'Exécuter' : 'Run'}</strong>
                        <small>{locale === 'fr' ? 'Observe la sortie' : 'Inspect the output'}</small>
                    </div>
                </li>
                <li className={workflowClass('validate')}>
                    <span>3</span>
                    <div>
                        <strong>{locale === 'fr' ? 'Valider' : 'Validate'}</strong>
                        <small>{locale === 'fr' ? 'Enregistre la réussite' : 'Save the success'}</small>
                    </div>
                </li>
            </ol>

            <section className="mod-lgcplayground-workspace">
                <div className="mod-lgcplayground-editor">
                    <div className="mod-lgcplayground-pane-title">
                        <span>{mission.fileName}</span>
                        <span>{locale === 'fr' ? 'Python · exécution locale' : 'Python · local runtime'}</span>
                    </div>
                    <textarea
                        spellCheck={false}
                        value={code}
                        onChange={(event) => {
                            setCode(event.target.value);
                            setRuntimeError('');
                            setSyncError('');
                        }}
                        onKeyDown={(event) => {
                            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                                event.preventDefault();
                                if (!running) {
                                    void runCode();
                                }
                            }
                        }}
                        aria-label={mission.fileName}
                    />
                    <div className="mod-lgcplayground-actions">
                        <div className="mod-lgcplayground-secondary-actions">
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
                                {locale === 'fr'
                                    ? `Indice${hintCount ? ` ${hintCount}/${mission.hints.length}` : ''}`
                                    : `Hint${hintCount ? ` ${hintCount}/${mission.hints.length}` : ''}`}
                            </button>
                        </div>
                        <div className="mod-lgcplayground-primary-actions">
                            <button
                                type="button"
                                className="btn btn-primary mod-lgcplayground-run"
                                onClick={runCode}
                                disabled={running}
                            >
                                <span>
                                    {running
                                        ? (locale === 'fr' ? 'Exécution…' : 'Running…')
                                        : (locale === 'fr' ? '▶ Exécuter' : '▶ Run')}
                                </span>
                                {!running && <kbd>{locale === 'fr' ? 'Ctrl↵' : 'Ctrl↵'}</kbd>}
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={validate}
                                disabled={running || syncing || lastRunCode !== code}
                            >
                                {syncing
                                    ? (locale === 'fr' ? 'Synchronisation…' : 'Syncing…')
                                    : (locale === 'fr' ? '✓ Valider' : '✓ Validate')}
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="mod-lgcplayground-side">
                    <div className="mod-lgcplayground-console-title">
                        <div>
                            <span aria-hidden="true">›_</span>
                            <strong>{locale === 'fr' ? 'Console' : 'Console'}</strong>
                        </div>
                        <small>{running ? (locale === 'fr' ? 'en cours' : 'running') : (locale === 'fr' ? 'prête' : 'ready')}</small>
                    </div>

                    <div className="mod-lgcplayground-runtime-note">
                        <span aria-hidden="true">●</span>
                        <p>
                            {locale === 'fr'
                                ? 'Ton code reste dans le navigateur. Seule ta progression est synchronisée avec Moodle.'
                                : 'Your code stays in the browser. Only progress is synced with Moodle.'}
                        </p>
                    </div>

                    <div className="mod-lgcplayground-output" aria-live="polite">
                        <span>{locale === 'fr' ? 'Sortie du programme' : 'Program output'}</span>
                        <pre>{output || (locale === 'fr' ? 'Prêt. Exécute ton code pour voir la sortie.' : 'Ready. Run your code to see the output.')}</pre>
                    </div>

                    <p className="mod-lgcplayground-progress">
                        {canPersist
                            ? (locale === 'fr'
                                ? `Tentatives de validation : ${attempts} · progression Moodle active`
                                : `Validation attempts: ${attempts} · Moodle progress active`)
                            : (locale === 'fr'
                                ? 'Mode démo · progression conservée pour cette page seulement'
                                : 'Demo mode · progress is kept for this page only')}
                    </p>

                    {runtimeError && (
                        <p className="mod-lgcplayground-error" role="alert">{runtimeError}</p>
                    )}
                    {syncError && (
                        <p className="mod-lgcplayground-error" role="alert">{syncError}</p>
                    )}

                    {passed && (
                        <div className="mod-lgcplayground-success" aria-live="polite">
                            <div className="mod-lgcplayground-success-heading">
                                <span aria-hidden="true">✓</span>
                                <strong>{locale === 'fr' ? 'Mission validée' : 'Mission complete'}</strong>
                            </div>
                            <p>{text(mission.debrief, locale)}</p>
                            <div className="mod-lgcplayground-bonus">
                                <strong>{locale === 'fr' ? 'Pour aller plus loin' : 'Go further'}</strong>
                                <span>{text(mission.bonus, locale)}</span>
                            </div>
                            {missionIndex < missions.length - 1 && (
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() => selectMission(missionIndex + 1)}
                                    disabled={running || syncing}
                                >
                                    {locale === 'fr' ? 'Mission suivante →' : 'Next mission →'}
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

                    <a className="mod-lgcplayground-reference" href={mission.reference.href} target="_blank" rel="noreferrer">
                        {text(mission.reference.label, locale)} ↗
                    </a>
                </aside>
            </section>
        </main>
    );
}
