# AGENTS.md

Instructions pour les agents travaillant sur le terrain de jeu du dépôt `giusmili/cours-python`.

## Frontière absolue : master
- `master` appartient au travail de Gius et reste **intouché** par ce chantier.
- Ne jamais commit, push, merge, rebase, nettoyer, déplacer ou réorganiser `master` pour le terrain de jeu.
- La branche longue durée de référence du terrain de jeu est `kevin/missions`. Elle joue le rôle de notre branche principale.
- Pour un développement non trivial, partir si utile de `kevin/missions` vers `dev/<sujet>`, puis réintégrer dans `kevin/missions`.
- Aucun merge vers `master` sans demande explicite du propriétaire du dépôt.

## AgentCtl / coordination
Projet AgentCtl : `cours-python-terrain-de-jeu`.
Ressource mutable : `repo:giusmili/cours-python`.

Toute mutation partagée, y compris via GitHub connector ou RDC, doit respecter AgentCtl :
1. vérifier l'état / les sessions / leases ;
2. démarrer une session ;
3. acquérir le lease exact `repo:giusmili/cours-python` ;
4. maintenir le heartbeat pendant un travail long ;
5. revérifier lease, branche et HEAD avant commit/push ;
6. terminer la session et libérer le lease en fin de passe.

Si le projet n'est pas enregistré sur une autre machine, utiliser le broker restreint documenté par AgentCtl ; ne jamais chercher, afficher ou copier le jeton admin.

RDC n'est pas l'outil par défaut : préférer GitHub/connecteurs quand ils suffisent. Utiliser RDC quand l'accès machine, les tests locaux, AgentCtl ou une ressource locale le nécessitent.

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
Avant intégration dans `kevin/missions`, exécuter au minimum les tests ciblés du sous-projet puis :
- `npm run type-check`
- `npm run build`

Toujours indiquer les tests réellement exécutés et les limites.
