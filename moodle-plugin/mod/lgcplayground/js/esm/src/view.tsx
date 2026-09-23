import React from 'react';

type PlaygroundViewProps = {
    activityName: string;
    track: 'python' | 'web' | string;
    missionPack: string;
    courseModuleId: number;
};

export default function PlaygroundView({
    activityName,
    track,
    missionPack,
    courseModuleId,
}: PlaygroundViewProps) {
    return (
        <main className="mod-lgcplayground-app" data-cmid={courseModuleId}>
            <header className="mod-lgcplayground-hero">
                <span className="mod-lgcplayground-kicker">LGC Playground</span>
                <h2>{activityName}</h2>
                <p>
                    Moodle owns the activity context and institutional state.
                    The interactive mission engine will mount here.
                </p>
            </header>

            <section className="mod-lgcplayground-architecture" aria-label="Playground runtime">
                <div>
                    <strong>Track</strong>
                    <span>{track}</span>
                </div>
                <div>
                    <strong>Mission pack</strong>
                    <span>{missionPack}</span>
                </div>
                <div>
                    <strong>Runtime</strong>
                    <span>Browser sandbox</span>
                </div>
            </section>
        </main>
    );
}
