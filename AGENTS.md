# AGENTS.md

Instructions pour les agents travaillant sur le terrain de jeu du dépôt `giusmili/cours-python`.

## Frontière absolue : master
- `master` appartient au travail de Gius et reste **intouché** par ce chantier.
- Ne jamais commit, push, merge, rebase, nettoyer, déplacer ou réorganiser `master` pour le terrain de jeu.
- La branche longue durée de référence du terrain de jeu est `kevin/missions`. Elle joue le rôle de notre branche principale.
- Pour un développement non trivial, partir si utile de `kevin/missions` vers `dev/<sujet>`, puis réintégrer dans `kevin/missions`.
- Aucun merge vers `master` sans demande explicite du propriétaire du dépôt.

## AgentCtl / coordination

### Travail sur le repo
Projet AgentCtl : `cours-python-terrain-de-jeu`.

Ressource :
- `repo:giusmili/cours-python`.

Le fichier `.agentctl.json` de cette branche identifie ce projet.

### Déploiement preview LGC
Projet AgentCtl : `cours-python-playground-deploy`.

Ressources :
- `host:vps-lgc/git`
- `host:vps-lgc/docker`
- `deploy:vps-lgc/playground-dev`
- `service:playground-dev`

Le broker de déploiement root-owned acquiert lui-même ce bundle via `agentctl-host-run` et maintient le heartbeat pendant le build/deploy. Déployer un SHA déjà présent dans `kevin/missions` ne mute pas GitHub et ne nécessite pas le lease repo.

Pour les mutations GitHub, toute écriture partagée doit respecter AgentCtl :
1. vérifier l'état / les sessions / leases ;
2. démarrer une session adaptée ;
3. acquérir le lease exact `repo:giusmili/cours-python` ;
4. maintenir le heartbeat pendant un travail long ;
5. revérifier lease, branche et HEAD avant commit/push ;
6. terminer la session et libérer le lease en fin de passe.

Si un projet n'est pas enregistré sur une autre machine, utiliser le broker restreint documenté par AgentCtl ; ne jamais chercher, afficher ou copier le jeton admin.

RDC n'est pas l'outil par défaut : préférer GitHub/connecteurs quand ils suffisent. Utiliser RDC quand l'accès machine, les tests locaux, AgentCtl ou une ressource locale le nécessitent.

## Preview LGC
- URL : `https://playground-dev.lagrandeclasse.fr`
- Source déployée : exclusivement `kevin/missions`.
- Le repo est public : le VPS peut fetch en HTTPS, aucune deploy key GitHub n'est requise.
- Aucun secret VPS ne doit être stocké dans le repo.
- La preview est protégée par Basic Auth ; les identifiants vivent uniquement dans `/home/moodle-agent/.config/playground-dev/env` sur le VPS.
- `moodle-agent` n'a pas accès au démon Docker et ne doit pas être ajouté au groupe `docker`.
- Le runtime privilégié passe par le broker documenté dans `terrain-de-jeu/DEPLOY_PREVIEW.md`.
- Le bootstrap du broker est une opération root one-shot ; après installation, `moodle-agent` ne fait qu'écrire une requête SHA bornée via `playground-dev-request`.
- Le déploiement root n'utilise jamais un Compose contrôlé par Git comme frontière de sécurité : Dockerfile, réseau, labels, nom de conteneur et options sensibles sont figés dans des fichiers root-owned installés par le bootstrap.

## Organisation
- `docs/terrain-de-jeu/` : cadrage, sources, benchmark, roadmap.
- `terrain-de-jeu/` : application interactive.
- Les cours existants de Gius restent à leur place tant qu'il travaille dessus. Ne pas les déplacer vers un autre dossier sans synchronisation et accord.

## Produit
Plateforme de missions de développement bilingue FR/EN.

Premiers parcours :
1. Python ;
2. Web : HTML + CSS, puis JavaScript.

Boucle cible :
`mission -> tentative -> exécution/preview -> feedback -> validation -> débrief -> bonus`.

Pas de second CourseSpec : Moodle Course Factory reste l'outil généraliste d'intégration Moodle.

## Sécurité
- Ne jamais exécuter du code élève non fiable directement sur le serveur applicatif.
- Python débutant : privilégier une exécution navigateur isolée.
- HTML/CSS/JS : preview dans une iframe sandboxée.
- Futurs labs Linux/réseau/cyber : environnement isolé distinct de Moodle et du serveur applicatif.

## Tests
Avant intégration dans `kevin/missions`, exécuter au minimum :
- `npm ci`
- `npm run type-check`
- `npm run build`
- `npm audit --audit-level=moderate`

Pour les changements de packaging/déploiement :
- `bash -n` et `shellcheck` sur les helpers shell ;
- construire `ops/Dockerfile.preview` localement ;
- vérifier le conteneur avec `/api/health` ;
- vérifier HTTP 401 sans identifiants et HTTP 200 avec identifiants ;
- valider la syntaxe systemd des unités du broker.

Toujours indiquer les tests réellement exécutés et les limites.
