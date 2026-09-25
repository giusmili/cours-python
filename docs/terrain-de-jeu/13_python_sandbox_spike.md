# Spike sécurité — sandbox Python à origine opaque

## Statut

Branche conservée temporairement : `dev/python-worker-sandbox`.

Décision au 24 septembre 2026 : **ne pas merger telle quelle dans `kevin/missions`** et **ne pas supprimer avant une revue sécurité dédiée**.

La branche contient deux commits uniques, dont `sec: isoler Python dans une origine opaque`. Elle ne représente pas une feature produit prête à intégrer ; c'est un spike de durcissement du runtime autonome Next.js.

## Ce que le spike explore

Le spike remplace l'exécution Python directe dans un Web Worker de la page par une chaîne :

1. page Playground ;
2. iframe cachée `sandbox="allow-scripts"` sans `allow-same-origin`, donc à origine opaque ;
3. protocole `postMessage` avec token aléatoire ;
4. Web Worker Pyodide créé depuis cette iframe ;
5. timeout et destruction du sandbox en cas de blocage.

Le runtime autonome doit alors exposer publiquement certains assets statiques nécessaires au sandbox :
- `/python-sandbox.html` ;
- `/pyodide-worker.mjs` ;
- `/pyodide/`.

Le spike ajoute aussi des en-têtes CORS/CORP spécifiques pour charger Pyodide depuis ce contexte opaque.

## Pourquoi il n'est pas mergé maintenant

Le produit institutionnel est désormais `mod_lgcplayground` dans Moodle. La branche `dev/python-worker-sandbox` ne touche que le prototype autonome `terrain-de-jeu`.

La version canonique actuelle coupe déjà les capacités réseau et de messagerie dangereuses dans le Worker Pyodide. Le spike ajoute une isolation d'origine supplémentaire, mais au prix d'une architecture plus complexe et de runtime assets accessibles sans la Basic Auth de la preview.

Il serait donc imprudent de merger ce spike tel quel uniquement parce qu'il « durcit » le prototype. Avant intégration, il faut répondre explicitement à ces questions :

- l'origine opaque apporte-t-elle une réduction de risque significative par rapport au Worker durci actuel ?
- quelle partie du modèle doit être portée dans le runtime Moodle, qui est la vraie surface institutionnelle ?
- les assets runtime publics sont-ils acceptables sur la preview et sur Moodle ?
- peut-on conserver la même isolation sans dupliquer une architecture spécifique au prototype Next.js ?
- les protections réseau actuelles restent-elles effectivement garanties après ce changement ?

## Prochaine décision

Faire une revue sécurité ciblée du runtime Python courant et du spike, puis choisir l'une des trois options :

1. **porter le principe d'origine opaque dans le runtime Moodle/partagé** avec tests dédiés ;
2. **garder seulement certains mécanismes** du spike, par exemple le protocole/token ou la limite de taille de code ;
3. **supprimer la branche** si le gain de sécurité est trop faible par rapport à la complexité introduite.

Tant que cette revue n'est pas faite, `dev/python-worker-sandbox` est la seule branche `dev/**` qui doit rester volontairement en dehors de la branche canonique.
