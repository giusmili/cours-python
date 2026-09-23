# 08 — Intégration Moodle / Roads

## Décision d'architecture

Le Playground reste un outil autonome.

Moodle reste la référence institutionnelle pour :
- l'identité ;
- les rôles et inscriptions ;
- le contexte de cours ;
- la complétion ;
- les notes / résultats ;
- le parcours global exposé par Moodle Roads.

Moodle Roads reste Moodle-native :
- backend et état canonique en PHP/Moodle ;
- UI interactive TypeScript/React dans Moodle lorsque nécessaire.

Le Playground reste séparé parce qu'il possède une autre responsabilité :
- exécuter et tester du code élève ;
- fournir une expérience de mission interactive ;
- isoler les runtimes Python / Web ;
- pouvoir évoluer plus tard vers des labs Linux, réseau ou cyber hors du processus PHP de Moodle.

## Frontière cible

```text
Roads
  |
  | curriculum / route / bindings
  v
Moodle
  |
  | activité + contexte + completion
  v
Playground
  |
  | mission / code / tests / feedback
  |
  +---- résultat ----> Moodle
                         |
                         +----> Roads observe la preuve Moodle
```

Roads ne doit pas comprendre les règles internes d'une mission Python.

Le binding Roads doit viser une preuve Moodle stable : activité terminée, note minimale, cours terminé, ou une future combinaison explicitement modélisée.

## Intégration recommandée : LTI 1.3

La cible privilégiée est LTI 1.3 / LTI Advantage plutôt qu'un SSO maison ou une API privée couplée à Roads.

Capacités utiles :
- lancement depuis Moodle sans second login ;
- contexte cours/utilisateur/ressource ;
- Deep Linking pour sélectionner une mission ou un parcours lors de l'ajout de l'activité ;
- Assignment and Grade Services pour renvoyer un résultat ;
- Names and Role Provisioning seulement si le Playground a réellement besoin d'un roster.

Ne pas implémenter toutes les extensions LTI au premier passage.

Ordre raisonnable :
1. launch LTI 1.3 ;
2. résultat / grade ;
3. Deep Linking ;
4. NRPS seulement si un besoin concret apparaît.

## Persistance

Le prototype utilise actuellement `localStorage`.

C'est volontairement un adaptateur MVP, pas la future source de vérité.

À terme :
- Moodle garde la preuve pédagogique institutionnelle à gros grain ;
- le Playground peut garder sa progression fine propre si reprise multi-device nécessaire ;
- la couche mission ne doit pas connaître le mécanisme de stockage.

Avant l'ajout d'une base, extraire une interface de persistance :
- charger progression ;
- enregistrer brouillon ;
- enregistrer tentative ;
- enregistrer validation.

Le premier adaptateur restera local.
Un adaptateur serveur/LTI pourra ensuite être ajouté sans modifier les définitions de missions.

## Hébergement

Le sous-domaine autonome du Playground reste pertinent même après intégration Moodle.

Le fait qu'un outil soit lancé depuis Moodle ne signifie pas qu'il doit être servi par PHP ou dans le même dépôt.

## Sécurité

Ne jamais déplacer l'exécution de code élève dans le processus PHP Moodle.

Python débutant :
- worker navigateur dédié ;
- Pyodide auto-hébergé ;
- timeout ;
- réseau coupé après initialisation.

HTML/CSS/JS :
- iframe sandboxée ;
- origine opaque ;
- CSP restrictive.

Futurs labs système/réseau :
- infrastructure d'exécution isolée distincte du VPS applicatif Moodle.

## Ce qui ne change pas

Moodle Course Factory reste généraliste et séparé :
- sources pédagogiques -> cours Moodle reproductibles.

Moodle Roads :
- programme, route, dépendances, preuves et progression globale.

Playground :
- expérience d'apprentissage par mission et exécution spécialisée.

Ces trois outils collaborent mais ne fusionnent pas.
