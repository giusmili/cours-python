# 07 — Moteur de missions v1

## But

Le terrain de jeu ne doit pas devenir une suite de pages codées à la main.

Depuis le moteur v1, une mission est principalement une **donnée pédagogique** :
- identifiant stable ;
- parcours ;
- ordre ;
- fichier présenté à l'élève ;
- titre / scénario / objectif FR et EN ;
- code de départ ;
- indices graduels ;
- notions mobilisées ;
- débrief ;
- bonus ;
- référence externe ;
- règles de validation.

L'interface, la progression et la persistance restent communes.

## Fichiers

- `src/lib/missions.ts` : catalogue et typage des missions.
- `src/lib/validation.ts` : validateurs génériques.
- `src/components/Playground.tsx` : expérience élève.
- `src/app/globals.css` : mise en page et design.

## Progression

Pour chaque parcours :
1. la mission 0 est ouverte ;
2. valider une mission débloque la suivante ;
3. la progression est conservée dans `localStorage` pour le prototype ;
4. les brouillons de code sont également conservés localement ;
5. le professeur pourra plus tard disposer d'un déblocage manuel lorsque la persistance serveur/Moodle sera ajoutée.

La progression locale n'est pas une solution d'identité ou d'évaluation institutionnelle : c'est volontairement un mécanisme MVP.

## Parcours actuellement jouables

### Python
- P0 — Réveiller le terminal : `print`, chaîne, cycle exécuter/lire.
- P1 — Réparer le profil : variables, types, f-string.
- P2 — Contrôle d'accès : booléens, comparaisons, `if / else`.
- P3 — Scanner les événements : boucle `for`, liste, compteur.

### Web
- W0 — Faire apparaître le signal : structure HTML / `h1`.
- W1 — Rendre l'alerte lisible : classe CSS, fond, padding, coins arrondis.
- W2 — Organiser le poste de contrôle : Flexbox + gap.
- W3 — Le bouton doit agir : événement `click`, DOM, `textContent`.

## Validation

### Python
Le code est réellement exécuté dans le navigateur via Pyodide.

Le validateur peut vérifier :
- sortie exacte ;
- présence de constructions minimales dans le code.

À mesure que les missions deviennent plus complexes, préférer de vrais tests Python cachés plutôt qu'une multiplication de regex.

### Web
Le code HTML/CSS/JavaScript est rendu dans une iframe sandboxée **sans `allow-same-origin`**.

Pour les premières missions JavaScript :
- seuls les scripts inline sont autorisés ;
- `connect-src` est bloqué ;
- frames, objets, formulaires et ressources réseau externes sont bloqués par CSP ;
- le code reste dans une origine opaque et ne peut pas lire le parent.

Le validateur v1 sait vérifier :
- présence d'un sélecteur ;
- texte d'un élément ;
- règles CSS attendues ;
- constructions minimales JavaScript dans le code.

La mission W3 laisse surtout l'élève constater le comportement réel dans l'aperçu. Pour des validations JavaScript plus avancées, ajouter plus tard un harness de test contrôlé plutôt que d'assouplir le sandbox.

## Bilingue

L'identité de la mission et ses règles techniques ne dépendent pas de la langue.

Les chaînes FR/EN sont portées par la mission :
- titre ;
- scénario ;
- objectif ;
- indices ;
- débrief ;
- bonus ;
- références.

Une seule mission, deux présentations.

## Références

Les premières missions Python pointent volontairement vers les fiches correspondantes du `master` de Gius, sans modifier ce dernier.

Les premières missions Web pointent vers MDN.

## Prochaines étapes raisonnables

1. tester la boucle pédagogique avec un humain ;
2. renforcer la validation Python avec de vrais tests cachés ;
3. concevoir proprement le runtime JavaScript sandboxé ;
4. ajouter P4 listes/chaînes et W4 responsive ou mini-formulaire ;
5. renforcer progressivement les tests cachés ;
6. seulement ensuite augmenter fortement le catalogue.

Le nombre de missions reste secondaire tant que la boucle `mission → essai → feedback → validation → débrief` n'est pas excellente.
