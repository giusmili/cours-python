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

## Checkpoint — 23 septembre soir

La tranche P0 Moodle est désormais validée en LOCAL au-delà du simple shell.

État réel :
- activité `mod_lgcplayground` installée dans Moodle LOCAL 5.2.3+ ;
- P0 chargé depuis le pack Moodle/PHP ;
- React/TypeScript compilé par la toolchain Moodle ;
- Python exécuté uniquement dans un Web Worker navigateur ;
- cœur Pyodide auto-hébergé dans l'artefact plugin, pas chargé depuis un CDN ;
- sortie `SYSTEM ONLINE` réellement exécutée puis validée ;
- indices, débrief et bonus rendus ;
- tentative réseau via `js.fetch()` refusée ;
- boucle infinie interrompue après ~5 s sans bloquer Moodle.

Le test E2E automatisé a utilisé l'accès invité du cours LOCAL pour rester sans secret. Avant de faire de la progression Moodle la source de vérité, refaire un passage avec un utilisateur élève nommé.

### Prochain contrat à construire

Ne pas augmenter le catalogue en priorité. La prochaine tranche doit définir et implémenter le minimum Moodle pour :
1. enregistrer la réussite d'une mission pour un utilisateur ;
2. reprendre cet état sur un autre appareil ;
3. exposer une completion Moodle explicite et stable ;
4. conserver la distinction entre pratique effectuée et preuve de réussite ;
5. fournir plus tard à Roads une preuve Moodle stable sans lui exposer les règles internes du moteur.

Aucun passage STAGING tant que ce contrat et son test LOCAL ne sont pas verts.
