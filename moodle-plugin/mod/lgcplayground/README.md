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

## First real validation

LOCAL Moodle 5.2 first:

1. copy/symlink this directory to `mod/lgcplayground`;
2. install/upgrade Moodle;
3. build the ESM/React source with Moodle's frontend build tooling;
4. add an LGC Playground activity to a test course;
5. confirm that `view.php` renders the React shell.

Only after this slice works do we migrate one real mission and add per-user state/completion.
