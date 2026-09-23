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

## Tant que le worker Promoter n est pas installé sur STAGING

- conserver la procédure STAGING actuelle ;
- ne pas élargir MoodleOps avec un runner Playground spécifique ;
- ne pas ajouter un nouveau transport SSH ou une nouvelle gestion des safety markers dans le Playground ;
- si un besoin de déploiement générique apparaît, le consigner pour Promoter au lieu de le réimplémenter ici ;
- aucun PROD.

Le dépôt `La-Grande-Classe-R-D/moodle-extension-promoter` est enrôlé dans AgentCtl et sa V1 est fusionnée dans `main`. Le worker STAGING n est pas encore installé : cette installation est explicitement reportée à la VM de travail, sans transporter de clé privée depuis Mint.

Le prochain test d intégration réel consiste donc à télécharger la release Promoter produite par la CI Playground, la valider avec Promoter sur la VM, puis exécuter `prepare`/`apply` sur Moodle STAGING après installation du worker.
