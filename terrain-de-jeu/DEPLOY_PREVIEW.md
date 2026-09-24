# Preview LGC — playground-dev

URL cible : `https://playground-dev.lagrandeclasse.fr`

## Flux normal

La source déployée est exclusivement `kevin/missions`.

```text
push kevin/missions
  -> Terrain de jeu CI
  -> poll VPS
  -> CI verte pour le SHA exact
  -> playground-dev-request
  -> broker AgentCtl
  -> build + smoke test + swap
  -> playground-dev.lagrandeclasse.fr
```

Le VPS vérifie le HEAD environ une fois par minute. Il ne contacte l'API Actions que si ce HEAD diffère du SHA déjà déployé ou déjà demandé.

Le broker revérifie ensuite lui-même que :
- le SHA demandé est toujours le HEAD de `kevin/missions` ;
- une CI push `Terrain de jeu CI` réussie existe pour ce SHA ;
- le déploiement reste fast-forward.

Il build une image avec le Dockerfile root-owned, smoke-teste un candidat, swappe le conteneur, vérifie Docker puis HTTPS/Traefik, exige HTTP 401 à la racine sans identifiants, et tente un rollback si le nouveau runtime devient malsain.

## Sécurité

`moodle-agent` n'a pas d'accès Docker générique. Le broker root acquiert uniquement :
- `host:vps-lgc/git`
- `host:vps-lgc/docker`
- `deploy:vps-lgc/playground-dev`
- `service:playground-dev`

GitHub Actions ne reçoit aucun accès SSH au VPS.

Le broker ne lit pas le Compose versionné pour déployer. Le Dockerfile de déploiement est copié root-owned lors de l'installation du broker.

## Installation / mise à jour du broker

Depuis un clone synchronisé sur `kevin/missions` :

```bash
cd terrain-de-jeu
sudo ./ops/install-playground-dev-broker
```

L'installateur crée si nécessaire `/etc/playground-dev/source.env`, installe le poller et active `playground-dev-auto-request.timer`.

Configuration publique par défaut :

```bash
PLAYGROUND_REPO_URL=https://github.com/giusmili/cours-python.git
PLAYGROUND_BRANCH=kevin/missions
PLAYGROUND_GIT_SSH_KEY=
PLAYGROUND_GIT_KNOWN_HOSTS=/etc/playground-dev/github_known_hosts
PLAYGROUND_GITHUB_TOKEN_FILE=
```

Aucun secret GitHub n'est nécessaire tant que le dépôt est public.

## Compatibilité dépôt privé

Le chemin privé est prévu sans credential d'écriture sur le VPS.

Utiliser :
1. une GitHub Deploy Key **Read-only** dédiée à ce dépôt pour Git ;
2. un fine-grained token limité au dépôt avec **Actions: Read-only** pour la vérification CI.

Exemple de clé Git, créée sous `moodle-agent` :

```bash
sudo -u moodle-agent install -d -m 0700 /home/moodle-agent/.ssh
sudo -u moodle-agent ssh-keygen -t ed25519 \
  -f /home/moodle-agent/.ssh/playground-dev-readonly \
  -N '' -C 'playground-dev@vps-lgc'
sudo -u moodle-agent cat /home/moodle-agent/.ssh/playground-dev-readonly.pub
```

Ajouter uniquement la clé publique dans GitHub comme Deploy Key sans write access.

Les host keys GitHub peuvent être écrites depuis l'API HTTPS GitHub :

```bash
curl -fsSL https://api.github.com/meta | python3 -c \
'import json,sys; [print("github.com "+k) for k in json.load(sys.stdin)["ssh_keys"]]' \
| sudo tee /etc/playground-dev/github_known_hosts >/dev/null
sudo chown root:root /etc/playground-dev/github_known_hosts
sudo chmod 0644 /etc/playground-dev/github_known_hosts
```

Stocker le token Actions read-only dans un fichier root-only, par exemple :

```text
/etc/playground-dev/github-actions-read.token
```

Puis configurer :

```bash
PLAYGROUND_REPO_URL=git@github.com:giusmili/cours-python.git
PLAYGROUND_BRANCH=kevin/missions
PLAYGROUND_GIT_SSH_KEY=/home/moodle-agent/.ssh/playground-dev-readonly
PLAYGROUND_GIT_KNOWN_HOSTS=/etc/playground-dev/github_known_hosts
PLAYGROUND_GITHUB_TOKEN_FILE=/etc/playground-dev/github-actions-read.token
```

Ne jamais mettre la clé privée ou le token dans Git ni directement dans `source.env`.

## Fallback manuel

L'automatisation ne redemande pas en boucle un SHA déjà demandé. Après un incident, diagnostiquer puis utiliser explicitement :

```bash
playground-dev-request
```

ou :

```bash
playground-dev-request <SHA40>
```

Une requête manuelle ne contourne pas les gates du broker.

## Vérifications

```bash
curl -fsS https://playground-dev.lagrandeclasse.fr/api/health
curl -I https://playground-dev.lagrandeclasse.fr/
systemctl status playground-dev-auto-request.timer --no-pager
systemctl status playground-dev-deploy.service --no-pager
cat /var/lib/playground-dev/deployed_commit
```

Attendu :
- `/api/health` : HTTP 200 ;
- `/` sans identifiants : HTTP 401 ;
- timer actif ;
- navigateur avec identifiants : application accessible.
