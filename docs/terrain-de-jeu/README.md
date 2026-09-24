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

## État courant — 24 septembre 2026

Le chantier a dépassé le simple prototype autonome :

- le cœur institutionnel est maintenant l'activité Moodle `mod_lgcplayground` ;
- le pack Python courant contient **7 missions P0–P6**, en FR/EN ;
- Python s'exécute dans le navigateur via Web Worker + Pyodide, sans exécution du code élève dans PHP ;
- Moodle conserve tentatives, réussite des missions et completion, sans stocker le code source ni stdout ;
- une première vue enseignant en lecture seule résume progression, tentatives et dernière activité ;
- backup/restore et Privacy API sont présents ;
- le prototype Next.js reste un harnais/preview utile mais n'est plus le cœur institutionnel ;
- la CI construit un artefact Moodle autonome et une release compatible Moodle Extension Promoter.

Le dernier gate navigateur complet réellement validé reste le parcours **P0–P4**. P5–P6 et la nouvelle vue enseignant ont passé les gates code/CI mais attendent encore leur validation navigateur Moodle. La promotion Playground réelle sur STAGING via Promoter reste également à exécuter.

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
- `07_moteur_missions_v1.md`
- `08_integration_moodle.md`
- `09_checkpoint_integration_moodle.md`
- `10_demo_interne.md`
- `11_deploiement_staging.md`
- `12_extension_promotion_contract.md`
- `13_python_sandbox_spike.md` — statut du spike d’isolation Python à origine opaque
