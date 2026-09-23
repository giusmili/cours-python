# 11 — Déploiement du Playground en Moodle STAGING

## Cible

Le STAGING Moodle de travail est :

`https://moodle-dev.kiwinokoto.com`

Il est distinct de PROD et protégé par HTTP Basic Auth. Toute installation du Playground doit rester limitée à cette cible.

**PROD n'est pas une cible de test.**

## Source de vérité

Le déploiement doit partir d'un commit exact de `kevin/missions` dont la CI **Terrain de jeu CI** est verte.

Le clone Linux/VM n'est jamais la source de vérité.

Pour chaque push, la CI produit désormais un artefact :

`lgcplayground-staging-<SHA40>`

Il contient :
- `lgcplayground-<SHA12>.zip` — plugin Moodle installable ;
- `lgcplayground-<SHA12>.manifest.json` — identité du repo, commit, version Moodle et hashes de tous les fichiers ;
- `SHA256SUMS` — hashes du ZIP et du manifest.

Le ZIP est autonome : les six assets Pyodide requis sont inclus. Aucun `npm install` n'est nécessaire sur STAGING.

## Construction reproductible

La CI exécute :

```bash
npm ci --prefix terrain-de-jeu
node moodle-plugin/mod/lgcplayground/tools/prepare-pyodide.mjs
python3 moodle-plugin/mod/lgcplayground/tools/package-plugin.py \
  --output-dir dist/playground-staging \
  --commit <SHA40>
```

Le packageur refuse :
- les assets Pyodide manquants ;
- un composant Moodle différent de `mod_lgcplayground` ;
- les symlinks ;
- les fichiers hors racine `lgcplayground/` dans le ZIP ;
- un commit qui n'est pas un SHA-1 complet ;
- un ZIP supérieur à 100 MiB.

Les dossiers de développement `tests/` et `tools/` ne sont pas inclus dans le plugin déployé.

## Installation STAGING recommandée

Pour une première installation, le chemin le plus simple et le plus borné est l'installateur Moodle lui-même.

1. Ouvrir le run CI vert du commit exact de `kevin/missions`.
2. Télécharger l'artefact `lgcplayground-staging-<SHA40>`.
3. Vérifier localement :

```bash
sha256sum -c SHA256SUMS
```

4. Ouvrir **Site administration → Plugins → Install plugins** sur le STAGING.
5. Envoyer `lgcplayground-<SHA12>.zip`.
6. Vérifier avant confirmation :
   - type : activité / module ;
   - composant : `mod_lgcplayground` ;
   - répertoire : `mod/lgcplayground` ;
   - la page est bien sur `moodle-dev.kiwinokoto.com`.
7. Laisser Moodle exécuter l'upgrade.
8. Purger les caches si Moodle ne le fait pas automatiquement.

Ne jamais utiliser ce ZIP sur PROD pendant la phase actuelle.

## Alternative SSH

L'installation CLI reste possible si la VM de travail atteint O2Switch en SSH.

Avant toute mutation, vérifier au minimum :
- que `$CFG->wwwroot` vaut exactement `https://moodle-dev.kiwinokoto.com` ;
- que le marqueur MoodleOps de la cible correspond au STAGING ;
- que `public/mod/lgcplayground` n'est pas un plugin non géré qu'on écraserait par erreur ;
- que le PHP CLI configuré pour Moodle est utilisé.

Le 23 septembre au soir, la connexion directe depuis Linux Mint vers `prise.o2switch.net:22` expirait au niveau réseau. Aucun contournement n'a été ajouté et aucun privilège MoodleOps/VPS n'a été élargi. Tester à nouveau depuis la VM du travail avant de conclure que SSH est indisponible.

## Smoke test STAGING

Après installation, créer l'activité dans un cours de test caché avec completion activée.

Gate minimal :
1. ouvrir l'activité avec un compte élève nommé ;
2. P0 : exécuter `print("SYSTEM ONLINE")` ;
3. valider la mission ;
4. recharger la page ;
5. vérifier que la réussite revient depuis Moodle ;
6. vérifier la completion de l'activité ;
7. faire au moins un passage P0 → P1 pour vérifier le déverrouillage ;
8. vérifier qu'il n'y a pas d'erreur visible navigateur.

Gate de démo recommandé :
- P0 → P4 ;
- 5/5 ;
- parcours complet ;
- progression restaurée après nouveau contexte navigateur ;
- aucune erreur console/page.

## Données et niveau de preuve

Le plugin stocke la progression et la completion Moodle, mais ne stocke pas le code source élève ni stdout.

Un pass Playground actuel reste une vérité pédagogique de pratique/completion. Il n'est pas automatiquement une preuve forte d'acquisition pour Roads.

## Rollback / incident

Avant confirmation d'installation, un échec n'a pas d'effet durable.

Après installation DB :
- ne pas supprimer simplement `mod/lgcplayground` du serveur ;
- ne pas tenter de downgrade de version Moodle ;
- conserver le plugin installé et masquer l'activité si le problème est uniquement fonctionnel ;
- utiliser la procédure d'uninstall Moodle explicite seulement si l'on décide réellement de retirer le plugin et ses données ;
- le refresh complet STAGING depuis PROD est un outil destructif de dernier recours, pas un rollback de plugin.

## État au 23 septembre 2026

- plugin LOCAL : validé ;
- version UI : `0.6.0-alpha` ;
- parcours Python P0–P4 : vert ;
- PHPUnit : 10 tests / 54 assertions avant la tranche backup/restore, puis backup/restore ajouté sur `kevin/missions` par la passe suivante ;
- build STAGING autonome : automatisé par GitHub CI ;
- STAGING Moodle : **pas encore installé** au moment de ce checkpoint ;
- PROD : inchangé.
