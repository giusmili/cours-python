---
title: Cours Python pour débutants
tags: python, cours, débutants
---

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/500px-Python-logo-notext.svg.png" alt="Logo Python" width="180">
</p>

<h1 align="center">Cours Python pour débutants</h1>

<p align="center"><i>Un cours progressif pour apprendre Python en partant de zéro — développement classique et bases réseau.</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/langage-Python-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/niveau-débutant-brightgreen" alt="Niveau débutant">
  <img src="https://img.shields.io/badge/chapitres-9-blue" alt="9 chapitres">
</p>

---

## Sommaire

[TOC]

---

## Introduction

Ce cours regroupe **9 chapitres progressifs** pour apprendre Python en partant de zéro, avec pour objectif de couvrir aussi bien le développement classique (variables, conditions, boucles, fonctions, fichiers) que des bases utiles pour le réseau. Le cours se termine par des exercices et des petits projets permettant de mettre en pratique l'ensemble des notions vues.

| # | Chapitre | Notion clé |
|:-:|---|---|
| 1 | [Introduction](#1-introduction) | Installation, premier script |
| 2 | [Variables et types](#2-variables-et-types) | `int`, `float`, `str`, `bool` |
| 3 | [Conditions](#3-conditions) | `if` / `elif` / `else` |
| 4 | [Boucles](#4-boucles) | `for`, `while` |
| 5 | [Fonctions](#5-fonctions) | `def`, `return` |
| 6 | [Listes et dictionnaires](#6-listes-et-dictionnaires) | `list`, `dict` |
| 7 | [Fichiers](#7-fichiers) | `open()`, `with` |
| 8 | [Exercices](#8-exercices) | Mise en pratique |
| 9 | [Projets](#9-projets) | Programmes complets |

---

## 1. Introduction

Cette section pose les bases : installation, exécution d'un script (`test.py`) et syntaxe minimale (`print`, variables). L'objectif est de vérifier que l'environnement Python fonctionne avant d'aborder les variables et types au chapitre suivant.

```python
# Premier programme Python
print("Bonjour, le monde !")

nom = "Gius"
print("Bienvenue,", nom)
```

:::info
**À retenir** : `print()` affiche du texte à l'écran ; une variable (ex. `nom`) stocke une valeur réutilisable.
:::

[Retour au sommaire](#sommaire)

---

## 2. Variables et types

Une variable stocke une valeur en mémoire sous un nom. Python détermine son type automatiquement (entier, flottant, chaîne, booléen) selon la valeur assignée.

```python
age = 25            # int
taille = 1.75        # float
prenom = "Gius"       # str
est_actif = True      # bool

print(prenom, "a", age, "ans")
```

| Type | Exemple | Description |
|---|---|---|
| `int` | `25` | Nombre entier |
| `float` | `1.75` | Nombre décimal |
| `str` | `"Gius"` | Chaîne de caractères |
| `bool` | `True` | Booléen (vrai/faux) |

[Retour au sommaire](#sommaire)

---

## 3. Conditions

Les instructions `if`, `elif` et `else` permettent d'exécuter du code selon qu'une condition est vraie ou fausse.

```python
age = 17

if age >= 18:
    print("Majeur")
elif age >= 13:
    print("Adolescent")
else:
    print("Enfant")
```

:::info
**À retenir** : seule la première condition vraie rencontrée est exécutée ; `else` couvre tous les autres cas.
:::

[Retour au sommaire](#sommaire)

---

## 4. Boucles

Les boucles `for` et `while` permettent de répéter des instructions. `for` parcourt une séquence, `while` s'exécute tant qu'une condition est vraie.

```python
for i in range(5):
    print("Itération", i)

compteur = 0
while compteur < 3:
    print("Compteur :", compteur)
    compteur += 1
```

| Boucle | Utilisation typique |
|---|---|
| `for` | Parcourir une séquence connue (liste, `range`, etc.) |
| `while` | Répéter tant qu'une condition reste vraie |

[Retour au sommaire](#sommaire)

---

## 5. Fonctions

Une fonction regroupe du code réutilisable sous un nom, avec des paramètres en entrée et une valeur de retour optionnelle (`return`).

```python
def saluer(nom):
    return f"Bonjour, {nom} !"

message = saluer("Gius")
print(message)
```

:::info
**À retenir** : `return` renvoie une valeur à l'appelant sans l'afficher ; il faut un `print()` pour la voir.
:::

[Retour au sommaire](#sommaire)

---

## 6. Listes et dictionnaires

Une liste stocke une collection ordonnée de valeurs. Un dictionnaire associe des clés à des valeurs.

```python
fruits = ["pomme", "banane", "cerise"]
print(fruits[0])
fruits.append("orange")

personne = {"nom": "Gius", "age": 25}
print(personne["nom"])
```

| Structure | Accès | Exemple |
|---|---|---|
| `list` | par index | `fruits[0]` |
| `dict` | par clé | `personne["nom"]` |

[Retour au sommaire](#sommaire)

---

## 7. Fichiers

Python permet de lire et écrire des fichiers avec `open()`, idéalement via un bloc `with` qui ferme le fichier automatiquement.

```python
with open("exemple.txt", "w") as f:
    f.write("Bonjour, le monde !")

with open("exemple.txt", "r") as f:
    contenu = f.read()
    print(contenu)
```

:::warning
Toujours préférer `with open(...)` à un `open()`/`close()` manuel : le fichier se ferme automatiquement, même en cas d'erreur.
:::

[Retour au sommaire](#sommaire)

---

## 8. Exercices

Cette section rassemble des exercices pratiques combinant les notions précédentes (variables, conditions, boucles, fonctions) pour consolider les acquis.

```python
def est_pair(nombre):
    return nombre % 2 == 0

for n in range(10):
    if est_pair(n):
        print(n, "est pair")
```

[Retour au sommaire](#sommaire)

---

## 9. Projets

Cette section propose de petits projets complets qui combinent toutes les notions du cours (fonctions, listes, fichiers, conditions) dans un programme fonctionnel.

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

[Retour au sommaire](#sommaire)

---

## Arborescence du dépôt

```
cours-python-debutants/
├── 01-introduction/
│   ├── notes.md
│   └── test.py
├── 02-variables-et-types/
│   └── notes.md
├── 03-conditions/
│   └── notes.md
├── 04-boucles/
│   └── notes.md
├── 05-fonctions/
│   └── notes.md
├── 06-listes-et-dictionnaires/
│   └── notes.md
├── 07-fichiers/
│   └── notes.md
├── 08-exercices/
│   └── notes.md
├── 09-projets/
│   └── notes.md
├── corrections/
├── ressources/
│   └── liens-utiles.md
└── test.py
```

---

<p align="center"><sub>Cours rédigé et compilé pour un usage sur HackMD</sub></p>
