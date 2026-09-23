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
- capabilities and activity creation form;
- Moodle-native React/TypeScript mount point;
- bilingual mission P0 loaded from Moodle/PHP;
- isolated browser Python runtime (Web Worker + self-hosted Pyodide core assets);
- Run, output, validation, hints, debrief and bonus for P0;
- 5 s runaway-code timeout and blocked browser network capability in the Python worker.

Not implemented yet:
- learner attempts/progress persistence;
- custom Moodle completion rule;
- AJAX/external service endpoints;
- migration of the remaining mission catalogue;
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
- the compiled ESM artifacts are committed under `js/esm/build`;
- a real LOCAL activity instance (CMID 142 in the test course) renders P0 in Chromium;
- Run executes Python through the browser worker and returns `SYSTEM ONLINE`;
- validation displays the success/debrief state;
- `js.fetch()` from student Python is blocked by the worker sandbox;
- `while True: pass` is interrupted after about 5 seconds without freezing the Moodle page.

The browser E2E used LOCAL guest course access so it could remain credential-free in automation. A named enrolled-student pass is still worth doing before persistence/completion becomes the source of truth.

Next slice: Moodle-owned learner progress/tentative persistence and explicit completion semantics. Do not add more mission volume until that contract is clean.
