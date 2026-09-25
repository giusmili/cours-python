# 10 — Démo interne du Playground

## Objectif

Cette démo doit montrer **une expérience pédagogique réelle dans Moodle**, pas une maquette technique.

Le message principal :

> Moodle reste le cœur institutionnel. Le Playground ajoute un laboratoire interactif moderne dans lequel l'élève code, exécute, reçoit du feedback, valide des missions et retrouve sa progression.

La démo peut être faite en 4 à 6 minutes.

## Préparation

Avant de montrer l'écran :
- utiliser le Moodle LOCAL tant que STAGING n'a pas été explicitement validé pour cette version ;
- ouvrir une activité `LGC Playground` sur le pack `python-basics-v1` ;
- préférer un compte élève nommé si l'on veut montrer la persistance Moodle ;
- vérifier que les assets Pyodide sont présents dans `mod/lgcplayground/pyodide/` ;
- ne pas ouvrir le repo GitHub au début : commencer par l'expérience élève.

## Déroulé conseillé

### 1. Montrer que l'on reste dans Moodle — 30 s

Ouvrir l'activité depuis le cours.

Faire remarquer :
- aucun second compte ;
- aucune redirection vers une application externe ;
- l'activité connaît déjà le cours et l'élève ;
- la barre d'état indique **Python navigateur** et **Progression Moodle**.

Phrase simple :

> « C'est une activité Moodle native, mais l'intérieur se comporte comme un petit laboratoire de programmation. »

### 2. Montrer la boucle pédagogique — 90 s

Rester sur P0 ou P1.

Montrer :
1. le scénario ;
2. l'objectif ;
3. le code de départ ;
4. une modification ;
5. **Exécuter** ;
6. la sortie console ;
7. **Valider** ;
8. le débrief et le bonus.

Faire volontairement une petite erreur une fois si le rythme le permet, puis utiliser **Indice**.

Le point à faire passer n'est pas « on a un éditeur de code », mais :

> « L'élève essaie, observe, corrige, puis seulement demande la validation. »

### 3. Montrer le parcours — 60 s

Après une mission réussie :
- montrer la coche sur la mission ;
- montrer la barre de progression ;
- passer à la mission suivante ;
- expliquer que les missions futures restent verrouillées tant que les précédentes ne sont pas réussies.

Le pack courant montre une progression courte mais complète :
- P0 — exécuter / `print()` ;
- P1 — variables ;
- P2 — types ;
- P3 — conditions ;
- P4 — boucles ;
- P5 — fonctions, paramètres, `return` ;
- P6 — incident final combinant liste + boucle + condition + fonction.

### 4. Montrer l'intégration Moodle — 60 s

Avec un compte élève nommé, expliquer que Moodle conserve :
- le nombre de validations ;
- la réussite des missions ;
- la completion de l'activité.

Le code source de l'élève et sa sortie console **ne sont pas stockés par cette persistance**.

Si possible, recharger l'activité ou l'ouvrir dans un second contexte navigateur et montrer que la progression revient.

Phrase simple :

> « Le navigateur fait tourner Python ; Moodle garde l'état pédagogique. »

### Option — montrer la vue enseignant — 30 s

Avec un compte enseignant, ouvrir **Suivi des apprenants** depuis l'activité.

Montrer uniquement :
- missions réussies / total ;
- barre de progression ;
- nombre de tentatives de validation ;
- dernière tentative.

Préciser que cette vue n'enregistre ni le code source ni la sortie console des apprenants. C'est une projection pédagogique Moodle, pas un outil de surveillance du travail écran par écran.

### 5. Ouvrir l'architecture — 60 s

Seulement si le public est intéressé par la technique.

Résumé :

```text
Moodle / PHP
  ├── cours, identité, permissions
  ├── progression / completion
  └── activité mod_lgcplayground
            │
            ▼
      React / TypeScript
            │
            ▼
 Web Worker + Pyodide/WASM
```

Pour le Web futur : iframe sandboxée.

Pour les futurs labs Linux/réseau/cyber : runner externe isolé, uniquement lorsque le navigateur ne suffit plus.

## Ce qui est déjà réel

État courant au 24 septembre 2026 :
- plugin Moodle installable et packagé par CI ;
- Moodle 5.2.3+ LOCAL validé sur le checkpoint P0–P4 ;
- sept missions Python P0–P6 présentes dans le pack courant ;
- exécution Python réelle dans le navigateur ;
- timeout des programmes bloqués ;
- accès réseau Python coupé dans le worker ;
- progression par utilisateur et reprise multi-contexte ;
- completion Moodle ;
- Privacy API et backup/restore ;
- première vue enseignant en lecture seule ;
- E2E Chromium P0 → P4 historique vert.

P5–P6 et la vue enseignant sont validés côté code/CI mais attendent encore leur premier passage navigateur Moodle complet.

## Ce qu'il ne faut pas survendre

La démo n'est pas encore une V1 de production complète.

Restent notamment :
- validation navigateur Moodle du parcours courant P0–P6 ;
- validation navigateur de la vue enseignant ;
- première promotion Playground réelle via Promoter sur STAGING ;
- politique de preuve forte pour Roads ;
- davantage de contenu pédagogique seulement après validation de la qualité du parcours actuel ;
- validation PROD uniquement lorsqu'une vraie mise en production sera décidée.

Une réussite Playground actuelle est une **bonne vérité de progression Moodle**, mais elle n'est pas automatiquement une preuve forte d'acquisition pour Roads : la validation technique de ces missions débutantes reste côté navigateur.

## Si quelque chose casse pendant la démo

Ordre de repli :
1. recharger la page ;
2. vérifier que le worker Python a fini de charger ;
3. si Python ne démarre pas, vérifier les assets générés `pyodide/` ;
4. ne pas improviser de mutation STAGING/PROD pendant la présentation.

Le parcours peut aussi être présenté en mode invité pour démontrer l'UX ; dans ce cas la page indique explicitement que la progression ne persiste que pour la session.

## Message de conclusion

> « Aujourd'hui c'est Python débutant. La même activité peut devenir le point d'entrée de nos laboratoires Web, puis plus tard de vrais environnements Linux/réseau isolés, tout en gardant Moodle comme colonne vertébrale pédagogique. »

## Gate de démo courant

**Gate navigateur confirmé (checkpoint 0.6.0-alpha)** :
- P0 → P4 entièrement jouable ;
- 5/5 et parcours complet ;
- verrouillage séquentiel correct ;
- raccourci clavier fonctionnel ;
- aucune erreur console/page.

**Version courante du code : 0.8.0-alpha** :
- P0–P6 présents ;
- vue enseignant présente ;
- CI et packaging verts ;
- 7/7 navigateur et vue enseignant encore à valider dans Moodle.

Pour une démo immédiate, ne pas présenter comme « validé en navigateur » ce qui appartient encore au second bloc.

