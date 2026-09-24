# 03 — Roadmap du prototype

## Phase 0 — Git / coordination
- `master` reste intouché.
- Branche longue durée de référence : `kevin/missions`.
- Développements non triviaux : branches `dev/<sujet>` depuis `kevin/missions`.
- AgentCtl obligatoire avant mutation partagée.
- Ne pas déplacer les cours de Gius tant qu'il travaille dessus.

## Phase 1 — squelette
Application locale :
- Node / Next.js / React / TypeScript ;
- choix FR/EN ;
- choix Python/Web ;
- page mission ;
- éditeur ;
- exécuter/preview ;
- valider ;
- feedback ;
- indices ;
- débrief ;
- progression locale.

## Phase 2 — mini-parcours Python
- P0 Réveiller le terminal — `print`, chaînes, erreurs simples.
- P1 Réparer le profil — variables, types, f-string.
- P2 Contrôle d'accès — booléens, comparaisons, conditions.
- P3 Scanner les événements — boucles, `range`, compteurs.
- P4 Scanner les secteurs — boucle `for`, `range`.
- P5 Calibrer le niveau de risque — fonctions, paramètres, `return`.
- P6 Résoudre l’incident final — liste + boucle + condition + fonction.

## Phase 3 — mini-parcours Web
- W0 Faire apparaître le signal — HTML minimal.
- W1 Rendre l'alerte lisible — CSS couleur/taille/espacements.
- W2 Organiser le poste de contrôle — box model + flexbox.
- W3 Reproduire une maquette — HTML sémantique + CSS.
- W4 Adapter au mobile — responsive.
- W5 Le bouton est mort — événement JS.
- W6 État dynamique — DOM + variable + condition.
- W7 Tableau interactif — tableaux + boucles + DOM.

## Phase 4 — progression Moodle
Réalisé :
- progression/tentatives par utilisateur dans Moodle ;
- reprise multi-device ;
- réussite monotone par mission ;
- completion automatique de l'activité ;
- Privacy API ;
- backup/restore ;
- première vue enseignant en lecture seule.

À poursuivre :
- filtres groupe/cohorte et analytics enseignant seulement s'ils répondent à un besoin réel ;
- politique de preuve explicite avec Roads ;
- grading uniquement si le besoin pédagogique le justifie.

## Phase 5 — déploiement
Architecture actuelle :
- GitHub est la source de vérité ;
- la CI construit le plugin Moodle autonome avec Pyodide ;
- Moodle Extension Promoter est la voie normale vers STAGING ;
- le prototype Next.js reste une preview protégée séparée.

Gate restant : première promotion réelle de `mod_lgcplayground` par Promoter sur STAGING, puis smoke test Moodle du parcours courant. Aucun PROD pendant cette phase.

## Critères de réussite
- objectif compris sans longue explication ;
- exécution/recommencement immédiats ;
- feedback utile en cas d'erreur ;
- débrief clair ;
- bonus intéressant ;
- FR/EN cohérents ;
- envie de lancer la mission suivante.
