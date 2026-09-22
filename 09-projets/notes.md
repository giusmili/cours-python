# Projets

![Illustration : fusée](https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png)

Cette section propose de petits projets complets qui combinent toutes les notions du cours (fonctions, listes, fichiers, conditions) dans un programme fonctionnel.

## Exemple

```python
def ajouter_tache(taches, tache):
    taches.append(tache)
    return taches

taches = []
taches = ajouter_tache(taches, "Apprendre Python")
taches = ajouter_tache(taches, "Faire un projet réseau")

for t in taches:
    print("-", t)
```
