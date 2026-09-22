# Fichiers

![Illustration : dossier de fichiers](https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4c1.png)

Python permet de lire et écrire des fichiers avec `open()`, idéalement via un bloc `with` qui ferme le fichier automatiquement.

## Exemple

```python
with open("exemple.txt", "w") as f:
    f.write("Bonjour, le monde !")

with open("exemple.txt", "r") as f:
    contenu = f.read()
    print(contenu)
```
