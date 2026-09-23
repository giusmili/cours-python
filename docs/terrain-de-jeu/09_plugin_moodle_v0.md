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


## Checkpoint — persistance Moodle v1

La tranche suivante est maintenant validée en Moodle LOCAL avec un utilisateur élève nommé.

### Contrat retenu

Moodle stocke une ligne par `activité + utilisateur + mission` :
- nombre de tentatives de **validation** ;
- réussite monotone de la mission ;
- dates de première/dernière tentative et première réussite.

Le serveur ne stocke volontairement ni code élève, ni stdout.

Une tentative correspond au bouton **Valider**, pas à chaque exécution. L'élève peut donc expérimenter librement avant de demander une validation.

### Reprise multi-appareil

Au chargement de l'activité, PHP injecte la progression Moodle dans les props React.

Test réel :
1. appareil/contexte navigateur A : validation fausse → tentative 1, mission non réussie ;
2. validation correcte → tentative 2, mission réussie ;
3. nouveau contexte navigateur authentifié avec le même élève ;
4. Moodle restitue `attempts=2` et l'état réussi sans dépendre du localStorage.

### Completion

Le module expose maintenant une règle de completion Moodle explicite :
`Réussir toutes les missions Playground requises`.

La règle s'appuie sur les identifiants stables du pack et sur la progression Moodle. Pour P0, après réussite :
- la ligne de progression vaut `passed=1` ;
- `course_modules_completion.completionstate = COMPLETION_COMPLETE`.

### Limite de preuve assumée

Le code Python reste exécuté et validé côté navigateur. Un utilisateur techniquement capable de forger l'appel AJAX pourrait donc falsifier un "pass".

Pour cette raison :
- la progression est une excellente vérité de reprise et de completion pédagogique ;
- elle n'est **pas automatiquement** une preuve forte de maîtrise pour Roads ;
- Roads conservera sa politique séparée de `learning coverage` et `achievement evidence`.

Une future mission à enjeu élevé devra utiliser une preuve plus forte (test signé/runner isolé, validation humaine ou autre mécanisme explicitement conçu), sans déplacer l'exécution arbitraire de code dans Moodle/PHP.

### Vie privée

`lgcplayground_progress` est déclaré auprès de la Privacy API Moodle. Le provider couvre :
- métadonnées ;
- découverte des contextes/utilisateurs ;
- export ;
- suppression par contexte ;
- suppression pour un utilisateur ;
- suppression pour une liste d'utilisateurs.

### Tests exécutés

- `php -l` sur tous les PHP : vert ;
- `install.xml` bien formé ;
- migration `2026092302` sur le Moodle LOCAL existant : verte ;
- création de `lgcplayground_progress` : vérifiée ;
- enregistrement du service AJAX : vérifié ;
- build React Moodle 5.2 : 5/5 composants ;
- E2E Chromium élève nommé : échec → réussite → second contexte navigateur : vert ;
- progression DB : `attempts=2, passed=1` ;
- completion Moodle : état `1` (complete) ;
- console/page errors Chromium : aucune.

### Prochaine étape

Avant d'augmenter fortement le catalogue :
1. ajouter des tests automatisés PHP ciblés du repository/progress/completion ;
2. décider quels états Playground Roads peut considérer comme simples traces de pratique versus preuves d'acquisition ;
3. ensuite migrer P1/P2 puis le parcours Web en conservant le même contrat.
