import React, {useState} from 'react';

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

    const showHint = () => {
        setHintCount((current) => Math.min(current + 1, mission.hints.length));
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
                        onChange={(event) => setCode(event.target.value)}
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
                        <button type="button" className="btn btn-primary" disabled>
                            {locale === 'fr' ? 'Exécuter — runtime suivant' : 'Run — runtime next'}
                        </button>
                    </div>
                </div>

                <aside className="mod-lgcplayground-side">
                    <strong>{activityName}</strong>
                    <p>
                        {locale === 'fr'
                            ? 'La mission arrive maintenant de Moodle/PHP. Le runtime Python navigateur sera branché dans la tranche suivante.'
                            : 'The mission now comes from Moodle/PHP. The browser Python runtime is the next slice.'}
                    </p>

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
