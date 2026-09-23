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
- PHP/Moodle : permissions, instance, état institutionnel, future completion/progression/endpoints ;
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
- build Moodle ESM/React dès qu'un Moodle LOCAL est disponible ;
- installation/upgrade LOCAL avant STAGING.

Toujours indiquer les tests réellement exécutés et les limites.
