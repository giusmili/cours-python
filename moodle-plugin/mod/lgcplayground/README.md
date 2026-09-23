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
- bilingual Python missions P0–P2 loaded from Moodle/PHP;
- isolated browser Python runtime (Web Worker + self-hosted Pyodide core assets);
- multi-mission navigation plus Run, output, validation, hints, debrief and bonus for P0–P2;
- 5 s runaway-code timeout and blocked browser network capability in the Python worker.

Implemented in the current progress slice:
- Moodle-owned per-user validation attempts;
- monotonic mission pass state (a later failure never erases a pass);
- authenticated AJAX persistence;
- cross-device restoration of attempts/pass state;
- explicit Moodle automatic completion when all required missions are passed;
- privacy metadata/export/deletion support for stored progress.

Not implemented yet:
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

The persistence slice was validated with a named enrolled LOCAL student:
- first failed validation persisted as attempt 1 without passing;
- second successful validation persisted as attempt 2 and marked the mission passed;
- a fresh browser context restored attempts=2 and the success state from Moodle;
- Moodle recorded activity completion state `COMPLETION_COMPLETE`;
- no learner source code or stdout is stored server-side.

The current pass is deliberately low-stakes: "passed" means the browser mission engine validated the exercise. It is a stable Moodle fact, but Roads must still decide whether that fact is sufficient achievement evidence for a curriculum milestone.

Next slice: harden the proof contract and tests, then migrate further missions only when the Moodle-owned state semantics remain clean.


## PHPUnit regression suite

The Moodle-owned progress contract now has a focused PHPUnit suite covering:
- mission-pack identifiers and ordering;
- path-traversal rejection for pack ids;
- failed/pass attempt persistence;
- monotonic pass state;
- per-user/per-mission isolation;
- all-required-missions completion semantics;
- the authenticated progress endpoint;
- Moodle activity completion.

On the prepared Moodle LOCAL recipe:

```bash
docker exec -w /var/www/moodle moodle-coursefactory-recipe-web-1 \
  vendor/bin/phpunit --testsuite mod_lgcplayground_testsuite
```

Current result: **10 tests, 48 assertions, green** on Moodle 5.2.3+ / PHP 8.4.

The LOCAL recipe has a dedicated PHPUnit prefix/dataroot and the `en_AU.UTF-8` locale required by Moodle's test bootstrap. If that disposable container is rebuilt, rerun Moodle's PHPUnit init before the suite.


## Multi-mission checkpoint

The first Python pack now contains three small missions:
- P0: execution workflow and `print()`;
- P1: variables, `str` and `int`;
- P2: `float`, `bool` and `type()`.

The Moodle React shell:
- renders the complete mission rail;
- opens the first incomplete mission for an enrolled learner;
- keeps validation state per mission;
- restores all mission states from Moodle in a fresh browser context;
- marks the activity complete only when every required mission id in the track has passed.

Named-student Chromium E2E on LOCAL:
`P0 -> P1 -> P2 -> fresh browser context` is green, with 3/3 progress restored and Moodle `completionstate=1`.

### Pyodide assets in LOCAL

The Pyodide core assets are intentionally ignored by Git because they are generated/vendor artifacts (~13 MB for the current core subset).

Before copying a fresh Git checkout of the plugin into Moodle LOCAL, prepare them from the already installed `terrain-de-jeu/node_modules/pyodide`:

```bash
cd /home/ubuntu/projects/cours-python-playground
node moodle-plugin/mod/lgcplayground/tools/prepare-pyodide.mjs
```

Then copy/sync the plugin directory **including** its generated `pyodide/` folder. Replacing the Moodle plugin with a Git archive alone will otherwise remove those ignored assets and the Python worker will fail to load.
