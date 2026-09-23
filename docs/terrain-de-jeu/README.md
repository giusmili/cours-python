# Terrain de jeu Dev — cadrage

## Vision
Construire une plateforme bilingue **FR/EN** où l'élève apprend en accomplissant des missions.

Premiers parcours :
1. **Python**
2. **Web : HTML + CSS, puis JavaScript**

Le cours du professeur, les fiches de référence et le terrain de jeu sont trois objets complémentaires.

## Trois objets
### Cours / référentiel
Explique les concepts, le vocabulaire et la progression. Références : Vincent Le Goff, Harvard CS50P, Helsinki, MDN, web.dev.

### Fiches pratiques
Rôle naturel du travail actuel de Gius : aide-mémoire, syntaxe, exemples courts, référence consultable pendant une mission.

### Terrain de jeu
Contextualiser, faire pratiquer, donner un objectif concret, tester, fournir des indices, débloquer progressivement, puis expliciter ce qui vient d'être appris.

Exemple Python :
> Mission : le système de contrôle d'accès est cassé. À partir de l'âge et du badge, autorise ou refuse l'accès.

Après réussite :
> Notions mobilisées : booléens, comparaisons, `if`, `elif`, `else`.

## Décisions
- Pas de second CourseSpec.
- Moodle Course Factory reste l'outil généraliste vers Moodle.
- Python est le chantier pédagogique immédiat.
- Le premier usage réel pourra être le parcours Web.
- FR et EN existent dès le prototype.
- Aucun code élève non fiable ne s'exécute directement sur le VPS.
- `master` reste intouché ; `kevin/missions` est notre branche de référence.

## Documents
- `01_sources_pedagogiques.md`
- `02_vision_terrain_de_jeu.md`
- `03_roadmap_prototype.md`
- `04_etat_repo_giuseppe.md`
- `05_benchmark_plateformes_interactives.md`
- `06_parcours_web_et_bilingue.md`
