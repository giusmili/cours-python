# 06 — Parcours Web et bilingue FR/EN

## HTML, CSS, JavaScript : ensemble ou séparés ?
**Un seul parcours Web, avec trois couches clairement distinguées :**
- HTML : contenu et structure ;
- CSS : présentation ;
- JavaScript : comportement et interaction.

## HTML + CSS
Pour des débutants, HTML et CSS deviennent très vite intéressants ensemble.

Une très courte Mission W0 peut introduire balise, contenu, titre, paragraphe, lien, image et structure.

Dès la mission suivante, CSS arrive : le feedback visuel est gratifiant et l'élève comprend immédiatement “quoi” (HTML) vs “comment ça apparaît” (CSS).

## JavaScript
Il arrive quelques missions plus tard, quand l'élève reconnaît déjà une page et sait cibler un élément.

Transition :
> Jusqu'ici la page avait une structure et une apparence. Maintenant elle va réagir.

Premières actions : clic, changement de texte/classe, afficher/masquer, compteur, état.

## Mini-parcours
- W0 Le message doit apparaître — HTML minimal.
- W1 Le centre de contrôle est illisible — sélecteurs, couleurs, tailles, espacements.
- W2 Remets les panneaux à leur place — box model + flexbox.
- W3 Reproduis la maquette — HTML sémantique + CSS.
- W4 Adapte l'interface au mobile — responsive.
- W5 Le bouton est mort — événement JavaScript.
- W6 Le panneau doit changer d'état — DOM + variable + condition.
- W7 Affiche les alertes — tableau + boucle + DOM.
- W8 Mission libre — petite interface ou mini-jeu.

## CSS comme terrain de jeu
CSS se prête très bien aux missions : déplacer, aligner, colorer, rendre transparent, reproduire, transformer, animer, adapter à la taille d'écran.

Inspirations : CSSBattle, Flexbox Froggy, Grid Garden, Frontend Mentor, CodePen Challenges.

## Bilingue dès le début
Ne pas “traduire plus tard”.

Architecture :
- logique de mission indépendante de la langue ;
- identifiants stables ;
- catalogues i18n ;
- FR et EN dès le prototype ;
- tests techniques indépendants des textes traduits autant que possible.

Exemple : `mission.id = "web-control-room-01"`, puis titre/scénario/indices/débrief FR et EN.

Français par défaut pour notre public, bouton EN visible, choix conservé.

On peut afficher ponctuellement les deux termes utiles :
- boucle — loop ;
- condition — conditional ;
- feuille de style — stylesheet.

## À ne pas faire
- deux bases de code FR/EN ;
- dupliquer les tests par langue ;
- cacher JavaScript jusqu'à un cursus Web totalement séparé ;
- enseigner CSS comme une simple liste de propriétés ;
- fabriquer artificiellement un niveau “expert” de chaque notion.
