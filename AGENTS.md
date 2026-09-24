# AGENTS.md

Instructions pour les agents travaillant sur le terrain de jeu du dépôt `giusmili/cours-python`.

## Frontière absolue : master
- `master` appartient au travail de Gius et reste **intouché** par ce chantier.
- Ne jamais commit, push, merge, rebase, nettoyer, déplacer ou réorganiser `master` pour le terrain de jeu.
- La branche longue durée de référence du terrain de jeu est `kevin/missions`.
- Pour un développement non trivial, partir de `kevin/missions` vers `dev/<sujet>`, puis réintégrer par fast-forward lorsque les tests sont verts.
- Aucun merge vers `master` sans demande explicite du propriétaire du dépôt.
- Nettoyer les branches `dev/*` devenues totalement ancêtres de `kevin/missions`; ne jamais supprimer une branche qui contient encore des commits uniques.

## AgentCtl / coordination
Projet repo : `cours-python-terrain-de-jeu`.
Ressource : `repo:giusmili/cours-python`.

Toute mutation partagée doit :
1. vérifier sessions/leases et état Git ;
2. démarrer une session AgentCtl ;
3. acquérir le lease exact ;
4. maintenir le heartbeat si nécessaire ;
5. revérifier branche/HEAD avant intégration ;
6. libérer le lease à la fin.

Ne jamais contourner le git gate AgentCtl. Pour un push local, utiliser le worktree/session prévu ou `agentctl run`.

Le projet peut être travaillé par plusieurs agents ou passes planifiées. Un lease marqué `stale` n'est jamais volé automatiquement : vérifier l'état externe (heartbeat, branche distante, processus éventuel), puis utiliser uniquement la récupération explicite `session-abandon` via le broker admin si l'agent a réellement disparu.

### Moodle LOCAL
Projet : `cours-python-playground-local`.
Ressources :
- `instance:moodle/mint-recipe`
- `host:mint/docker`

Acquérir ces ressources avant toute mutation du Moodle LOCAL ou de ses conteneurs. Le lease repo reste séparé : un test LOCAL d'un commit déjà existant ne nécessite pas de verrouiller GitHub.

Les assets `moodle-plugin/mod/lgcplayground/pyodide/` sont générés et ignorés par Git. Une copie du plugin depuis une archive Git ne les contient pas. Avant un E2E Python après remplacement complet du dossier LOCAL, exécuter dans le clone :
`node moodle-plugin/mod/lgcplayground/tools/prepare-pyodide.mjs`
puis synchroniser le dossier du plugin avec `pyodide/`. Un worker qui échoue immédiatement après une copie Git peut simplement indiquer que ces assets ont été supprimés.

### Déploiement Moodle STAGING
Cible actuelle : `https://moodle-dev.kiwinokoto.com`.

- STAGING est distinct de PROD ; **PROD n'est jamais un environnement de test**.
- Déployer uniquement un artefact produit par une CI verte du SHA exact de `kevin/missions`.
- La CI produit `lgcplayground-staging-<SHA40>` avec ZIP Moodle autonome, manifest et `SHA256SUMS`.
- Le ZIP doit contenir les assets Pyodide ; aucun build npm ne doit être requis sur STAGING.
- Vérifier le SHA-256 avant installation.
- Voie normale : Moodle Extension Promoter avec l'artefact exact issu d'une CI verte. L'installateur Moodle natif n'est qu'un fallback borné, pas un second pipeline.
- Si SSH est utilisé, vérifier explicitement `$CFG->wwwroot`, le marqueur STAGING et la destination `mod/lgcplayground` avant mutation.
- Après installation, smoke test avec élève nommé : exécution, validation, reload/reprise et completion ; pour le pack courant, viser ensuite P0 → P6 et vérifier la vue enseignant.
- Ne jamais faire de refresh STAGING destructif comme simple rollback de plugin.
- Procédure détaillée : `docs/terrain-de-jeu/11_deploiement_staging.md`.

### Déploiement preview LGC
Projet : `cours-python-playground-deploy`.

Ressources :
- `host:vps-lgc/git`
- `host:vps-lgc/docker`
- `deploy:vps-lgc/playground-dev`
- `service:playground-dev`

Le broker root-owned acquiert lui-même ses leases et déploie uniquement `kevin/missions`.

## Architecture produit

### Cœur cible
Le cœur institutionnel devient une activité Moodle :
- composant : `mod_lgcplayground` ;
- chemin repo : `moodle-plugin/mod/lgcplayground/` ;
- PHP/Moodle : permissions, instance, progression/completion, endpoints de persistance, backup/restore et projection enseignant ;
- Moodle 5.2 React/TypeScript : UI interactive.

### Runtimes élève
- Python débutant : Web Worker + Pyodide/WASM côté navigateur ;
- HTML/CSS/JS : iframe sandboxée à origine opaque ;
- futurs labs Linux/réseau/cyber : runner externe isolé seulement lorsque nécessaire ;
- ne jamais exécuter de code élève dans PHP/Moodle.

### Prototype autonome
`terrain-de-jeu/` reste un harnais de développement et une preview de référence. Ne pas le supprimer lors de la migration Moodle.

### Écosystème
- Course Factory construit les cours Moodle ;
- Roads organise curriculum, route et preuves ;
- Playground fournit l'expérience de pratique interactive ;
- Roads se lie à des preuves Moodle stables, pas aux règles internes d'une mission.

## Portabilité entre machines / source de vérité
- **GitHub est la source de vérité du chantier.** Aucun état indispensable ne doit vivre uniquement dans un clone local.
- Les clones Linux/VM servent de workspace, cache et environnement de test ; ils doivent pouvoir être supprimés puis recréés depuis GitHub sans perte de travail.
- Avant de terminer une passe : pousser tout changement utile, mettre à jour la documentation/passation existante et vérifier qu'aucun fichier critique non généré n'existe uniquement localement.
- Un changement de machine doit pouvoir se faire par `git clone` / `git fetch`, lecture d'`AGENTS.md` et reprise depuis les branches distantes.
- Ne pas faire du clone `/home/ubuntu/projects/cours-python-playground` une dépendance conceptuelle du projet. Il reste utile aujourd'hui pour les tests LOCAL, mais n'est jamais canonique.
- Les gros artefacts générés (par exemple `pyodide/`) peuvent rester hors Git si leur procédure de régénération est documentée et reproductible.

## Organisation
- `docs/terrain-de-jeu/` : cadrage et décisions ;
- `terrain-de-jeu/` : prototype/harnais Next.js ;
- `moodle-plugin/mod/lgcplayground/` : plugin Moodle cible ;
- les cours existants de Gius restent à leur place.

## Preview
URL : `https://playground-dev.lagrandeclasse.fr`.

La preview autonome reste protégée par Basic Auth et sert exclusivement `kevin/missions`. Aucun secret VPS dans Git.

## Tests

### Prototype Next
- `npm ci`
- `npm run type-check`
- `npm run build`
- `npm audit --audit-level=moderate`

### Plugin Moodle
Avant intégration :
- `php -l` sur tous les fichiers PHP ;
- validation XML de `db/install.xml` ;
- build Moodle ESM/React dans Moodle LOCAL 5.2 ;
- installation/upgrade LOCAL avant STAGING ;
- exécuter la suite ciblée Moodle LOCAL : `vendor/bin/phpunit --testsuite mod_lgcplayground_testsuite` (depuis le conteneur / dirroot Moodle) ;
- pour toute modification de progression/completion : test avec un utilisateur élève nommé, persistance après nouveau contexte navigateur et vérification de `course_modules_completion` ;
- ne jamais considérer automatiquement un pass validé côté navigateur comme preuve forte Roads : documenter le niveau de preuve.

Toujours indiquer les tests réellement exécutés et les limites.


### Frontière de promotion des extensions Moodle

Le Playground est un consommateur de La-Grande-Classe-R-D/moodle-extension-promoter pour la promotion de mod_lgcplayground vers un Moodle existant.

Ne pas créer ici un nouveau moteur de déploiement générique, de safety markers ou de gestion d'environnements. Conserver le build autonome actuel, notamment les assets Pyodide. La CI produit déjà en parallèle une release Promoter générique (manifest.json + plugin/).

Le worker Promoter STAGING est désormais installé. Les promotions réelles doivent utiliser son contrat install / identical / upgrade forward-only ; une divergence à version égale ou un downgrade doivent rester refusés. Aucun PROD.

MoodleOps reste responsable du cycle de vie des environnements. Course Factory reste responsable des cours. Roads reste responsable des parcours. Voir docs/terrain-de-jeu/12_extension_promotion_contract.md.
