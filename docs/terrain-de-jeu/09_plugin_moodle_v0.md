# 09 — Plugin Moodle v0

## Objectif de la tranche

Valider le choix d'architecture avant de migrer le moteur complet.

Le premier `mod_lgcplayground` doit seulement prouver qu'une activité Moodle 5.2 peut :
1. être créée dans un cours ;
2. conserver un track et un identifiant de pack de missions ;
3. appliquer les capabilities Moodle ;
4. monter une UI React/TypeScript moderne depuis le plugin.

Aucun code élève n'est envoyé au serveur dans cette tranche.

## Modèle d'instance minimal

Table `lgcplayground` :
- `course` ;
- `name` ;
- `intro` / `introformat` ;
- `track` ;
- `missionpack` ;
- timestamps.

Ce n'est pas encore le modèle de progression élève.

## Choix volontairement différés

Avant la première validation LOCAL, ne pas ajouter :
- table de tentatives ;
- grades ;
- custom completion ;
- backup/restore ;
- endpoints AJAX ;
- synchronisation Roads ;
- migration automatique des missions du prototype.

Le risque principal actuel est l'intégration frontend Moodle, pas l'absence de ces tables.

## Critère de succès

Dans un Moodle LOCAL 5.2 :
- l'installation du plugin ne produit pas d'erreur ;
- un enseignant peut ajouter l'activité ;
- l'élève autorisé peut l'ouvrir ;
- la page affiche le composant React avec les props de l'instance ;
- aucun second login, CORS ou backend Node n'est nécessaire.

Une fois ce test vert, la prochaine tranche migre une mission Python complète.
