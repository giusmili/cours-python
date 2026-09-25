# 02 — Vision du terrain de jeu

## Produit
Une **plateforme de missions de développement**, pas un manuel.

Parcours initiaux :
- Python ;
- Web : HTML + CSS -> JavaScript.

Langues : français et anglais.

## Boucle pédagogique
**Mission -> tentative -> exécution/preview -> feedback -> correction -> validation -> débrief -> bonus.**

Le terrain de jeu ne remplace pas le cours explicite : il fournit une autre porte d'entrée et permet de répéter dans des contextes variés.

### Exemple Python
> Le système de contrôle d'accès est cassé. À partir de l'âge et du badge, autorise ou refuse l'accès.

Débrief : booléens, comparaisons, `if`, `elif`, `else`.

### Exemple Web
> Le panneau d'urgence est illisible. Le HTML contient déjà les informations. Rends l'alerte visible et fais ressortir l'état critique.

Débrief : sélecteurs, couleurs, box model, flexbox.

## Difficulté
Une progression unique :
- mission essentielle ;
- bonus ;
- défi de maîtrise.

Pas trois cursus parallèles “débutant / avancé / expert”. Le niveau est une propriété de la mission, pas une branche Git.

## Mission zéro
Elle apprend le workflow de la plateforme.

Python : modifier une ligne, exécuter, lire stdout, corriger, valider.

Web : modifier HTML/CSS et voir immédiatement le résultat.

## CourseSpec
Pas de second CourseSpec. Le terrain de jeu utilise seulement une structure interne minimale : id, parcours, prérequis, scénario, fichiers de départ, tests, indices, débrief, bonus, chaînes FR/EN.

## Moodle
Moodle reste la colonne vertébrale : identité, inscriptions, cours, capacités, completion et état pédagogique.

Le cœur institutionnel est désormais une activité Moodle native, `mod_lgcplayground`. Le terrain de jeu gère l'éditeur, l'exécution/preview, les tests, le feedback et les missions ; Moodle possède la progression persistée et la completion.

Le prototype Next.js reste un harnais/preview. Un service externe n'est envisagé que pour de futurs labs que le navigateur ne peut pas exécuter proprement ; il ne doit pas créer un second système de comptes.

## Sécurité
- Python débutant : exécution navigateur isolée si possible.
- HTML/CSS/JS : iframe sandboxée.
- Futurs labs SISR/cyber : conteneurs/VM éphémères séparés de Moodle.
