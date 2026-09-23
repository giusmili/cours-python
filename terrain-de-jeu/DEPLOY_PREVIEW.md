# Preview LGC — playground-dev

URL cible : `https://playground-dev.lagrandeclasse.fr`

## Modèle
- source : branche `kevin/missions` ;
- aucun secret GitHub requis ;
- clone/fetch HTTPS public en lecture seule ;
- build sur le VPS ;
- conteneur Next.js sur `traefik_network` ;
- TLS via le Traefik LGC existant ;
- protection temporaire par HTTP Basic Auth gérée par l'application.

## Secret local VPS
Créer `terrain-de-jeu/.env.preview` à partir de `.env.preview.example`.

Ce fichier est ignoré par Git et contient seulement :
- `PREVIEW_USER`
- `PREVIEW_PASSWORD`

Générer un mot de passe long et aléatoire. Ne jamais le commit.

## Déploiement
Le compte qui exécute le déploiement doit avoir accès au démon Docker.

Depuis le clone :
```sh
git fetch origin
git switch kevin/missions
git pull --ff-only origin kevin/missions
cd terrain-de-jeu
./scripts/deploy-preview.sh
```

## Vérifications
```sh
curl -fsS https://playground-dev.lagrandeclasse.fr/api/health
curl -I https://playground-dev.lagrandeclasse.fr/
```

Attendu :
- `/api/health` : HTTP 200 ;
- `/` sans identifiants : HTTP 401 ;
- navigateur avec identifiants : application accessible.

## État d'accès actuel
La session RDC LGC utilise le compte `moodle-agent`, qui n'appartient pas au groupe Docker.
Ne pas lui accorder l'accès Docker automatiquement : cela équivaut pratiquement à un accès root.
Utiliser un compte de déploiement Docker existant ou faire approuver explicitement ce changement.
