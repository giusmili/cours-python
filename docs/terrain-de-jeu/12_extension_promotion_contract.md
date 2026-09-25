# Contrat de promotion des extensions Moodle

Décision d architecture du 23 septembre 2026.

Le Playground reste propriétaire de tout ce qui est spécifique à son produit :

- composant Moodle mod_lgcplayground ;
- génération et inclusion des assets Pyodide ;
- missions et runtime Python ;
- progression et completion propres à l activité ;
- packaging autonome du plugin.

Le déploiement du code du plugin dans un Moodle existant doit converger vers le dépôt frère La-Grande-Classe-R-D/moodle-extension-promoter.

## Frontières

MoodleOps gère les environnements : snapshots, restore et refresh, protections, monitoring, safety markers et coordination des mutations d environnement.

Moodle Extension Promoter gère la promotion de code d extension Moodle versionné dans un environnement déjà existant. Il ne gère ni backup ni contenu pédagogique.

Course Factory reste propriétaire de la génération et de la publication de cours. Seul le déploiement de son plugin Moodle pourra plus tard passer par Promoter.

Roads reste propriétaire des parcours et utilise Promoter uniquement pour son plugin local_roads.

Playground reste propriétaire de son build et utilise Promoter uniquement pour mod_lgcplayground.

## Conséquence pour le pipeline actuel Playground

Ne pas supprimer ni réécrire le pipeline actuel. Il produit un artefact STAGING autonome avec ZIP, manifest et SHA256SUMS, et produit désormais en parallèle un répertoire de release conforme au contrat V1 de Promoter (`manifest.json` + `plugin/`).

Le ZIP historique reste disponible pendant la transition. La release Promoter porte les métadonnées génériques (`extension.component`, `type`, `version`, `release`) et les hashes de tous les fichiers sous `plugin/`.

Promoter ne doit jamais lancer la génération Pyodide ou un build npm spécifique au Playground sur le serveur STAGING. Tous les assets nécessaires doivent déjà être présents dans l artefact produit par la CI Playground.

## État actuel du contrat — 24 septembre 2026

Le worker Moodle Extension Promoter est maintenant installé sur le Moodle STAGING et son contrat générique a été validé avec Roads.

Promoter sait distinguer trois états :
- `install` : extension absente ;
- `identical` : extension déjà identique ;
- `upgrade` : version Moodle entrante strictement supérieure à la version installée.

Une divergence à version égale et un downgrade restent refusés. L'approbation est liée à l'action observée, puis l'upgrade remplace l'arbre de code de façon atomique avant d'exécuter l'upgrade Moodle et de purger les caches.

La release Playground produite par la CI est déjà conforme au contrat Promoter (`manifest.json` + `plugin/`) et doit continuer à embarquer tous les assets Pyodide. Promoter ne construit rien de spécifique au Playground sur STAGING.

Le prochain test d'intégration Playground consiste à prendre l'artefact exact d'un commit vert de `kevin/missions`, vérifier ses hashes, puis exécuter `prepare` / `apply` contre le worker STAGING. Aucun runner Playground spécifique ne doit être ajouté dans MoodleOps et aucun PROD n'est autorisé.
