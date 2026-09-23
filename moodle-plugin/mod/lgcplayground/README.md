# mod_lgcplayground

Moodle-native activity shell for the LGC development Playground.

## Architecture status

This directory is the first executable slice of the validated target architecture:

- Moodle/PHP owns activity instances, capabilities and later institutional progress/completion state.
- Moodle 5.2 React/TypeScript owns the rich interactive UI.
- Student code never executes in PHP.
- Python remains browser-side in an isolated Pyodide worker.
- HTML/CSS/JavaScript remains in a sandboxed browser runtime.
- Future Linux/network/cyber labs will use a separate isolated runner only when required.

The existing `terrain-de-jeu/` Next.js application remains the reference harness and protected preview while the Moodle-native shell is validated. It is not discarded.

## Alpha scope

Implemented:
- installable activity table;
- add/update/delete callbacks;
- capabilities;
- activity creation form;
- Moodle-native React/TypeScript mount point;
- bilingual strings.

Not implemented yet:
- learner attempts/progress persistence;
- custom Moodle completion rule;
- AJAX/external service endpoints;
- migration of the existing mission engine;
- backup/restore;
- grading;
- Roads binding automation.

## Validation status

Validated on the Linux LOCAL recipe against Moodle **5.2.3+ (Build: 20260916)**:

- plugin installation/upgrade succeeds;
- Moodle registers the `lgcplayground` module;
- the `lgcplayground` table is created;
- every PHP file passes `php -l`;
- `db/install.xml` is well-formed;
- Moodle's own React build pipeline compiles the component successfully;
- the compiled ESM artifact is committed under `js/esm/build`.

The remaining end-to-end validation for this shell is a real browser visit to an activity instance. That is intentionally separate from the architecture/build validation.

After that, the next functional slice migrates one real Python mission and only then adds per-user state/completion.
