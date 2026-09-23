# Preview LGC — playground-dev

URL cible : `https://playground-dev.lagrandeclasse.fr`

## Modèle retenu
- source déployée : exclusivement `kevin/missions` ;
- aucun secret GitHub requis : le repo est public et le clone VPS est en HTTPS lecture seule ;
- CI GitHub sans secret avant déploiement ;
- build Docker sur le VPS ;
- TLS via le Traefik LGC existant ;
- Basic Auth temporaire gérée par l'application ;
- déploiement privilégié via un broker systemd root-owned, pas via l'accès Docker direct de `moodle-agent`.

## Pourquoi un broker
Le compte RDC LGC `moodle-agent` n'appartient volontairement pas au groupe `docker`. L'ajouter à ce groupe lui donnerait pratiquement les privilèges root.

Le broker ne donne aucun accès Docker générique. `moodle-agent` peut uniquement déposer une requête contenant un SHA.

Le service root :
1. acquiert et maintient les leases AgentCtl exacts ;
2. vérifie que le SHA est la tête actuelle de `kevin/missions` ;
3. vérifie qu'une CI `Terrain de jeu CI` réussie existe pour ce SHA ;
4. refuse tout rollback/non-fast-forward ;
5. build l'application avec un **Dockerfile root-owned figé lors du bootstrap** ;
6. smoke-teste l'image dans un conteneur sans privilèges avant le swap ;
7. lance uniquement un conteneur `playground-dev` avec un réseau, des labels Traefik et des options de sécurité fixés dans le broker ;
8. attend le healthcheck Docker puis le healthcheck HTTPS Traefik ;
9. vérifie que la racine publique reste protégée par HTTP 401 ;
10. tente un rollback vers l'image précédente si le nouveau runtime devient malsain.

### Frontière importante
Le broker root **ne lit pas le Compose versionné pour déployer**. Un Compose modifiable depuis Git pourrait sinon demander des volumes hôte, des capacités ou un mode privilégié.

Le Dockerfile utilisé en production est copié une fois vers `/usr/local/libexec/playground-dev-Dockerfile` et appartient à root. Une modification future de `ops/Dockerfile.preview` ou du broker impose donc une nouvelle installation root volontaire.

Le Compose du repo reste utile pour les tests locaux ; ce n'est pas la frontière d'autorité du VPS.

## Bootstrap root one-shot
Le broker nécessite une seule installation privilégiée. Depuis un clone **exactement synchronisé sur `kevin/missions`** :

```bash
cd terrain-de-jeu
sudo ./ops/install-playground-dev-broker
```

L'installateur :
- copie le client AgentCtl déjà enrôlé du VPS vers des chemins root-owned ;
- copie sa configuration dans `/etc/playground-dev/agentctl-worker.env` sans afficher le token ;
- installe le Dockerfile figé, le dispatcher, le worker de déploiement et les unités systemd ;
- crée un mot de passe de preview aléatoire sans l'afficher ;
- stocke les identifiants uniquement dans `/home/moodle-agent/.config/playground-dev/env` en mode 600.

Ne jamais committer ce fichier.

## Déclencher ensuite un déploiement
Aucun sudo ni accès Docker n'est nécessaire :

```bash
playground-dev-request
```

La commande résout par défaut la tête courante de `kevin/missions` puis écrit une requête bornée dans `/run/playground-dev/deploy.request`.

Pour demander explicitement un SHA :

```bash
playground-dev-request <40-hex-sha>
```

## Vérifications
```bash
curl -fsS https://playground-dev.lagrandeclasse.fr/api/health
curl -I https://playground-dev.lagrandeclasse.fr/
systemctl status playground-dev-deploy.service --no-pager
```

Attendu :
- `/api/health` : HTTP 200 ;
- `/` sans identifiants : HTTP 401 ;
- navigateur avec identifiants : application accessible.

## AgentCtl
Projet de déploiement : `cours-python-playground-deploy`.

Ressources acquises par le broker :
- `host:vps-lgc/git`
- `host:vps-lgc/docker`
- `deploy:vps-lgc/playground-dev`
- `service:playground-dev`

Le déploiement d'un SHA déjà présent dans la branche de référence ne mute pas GitHub et n'acquiert donc pas le lease repo.
