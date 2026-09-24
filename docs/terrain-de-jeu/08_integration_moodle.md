# 08 — Architecture Moodle / Roads

## Décision validée — 23 septembre 2026

Le Playground devient **Moodle-native pour son cœur institutionnel**.

La cible n'est plus un backend Node séparé relié à Moodle par LTI par défaut. Le composant canonique sera une activité Moodle `mod_lgcplayground`.

Le prototype Next.js actuel reste utile comme :
- harnais de développement indépendant ;
- preview protégée ;
- référence UX ;
- éventuellement futur shell autonome si un besoin réel apparaît.

Il n'est pas supprimé et son moteur de mission n'est pas jeté.

## Répartition des responsabilités

### Moodle / PHP

PHP décide la vérité institutionnelle :
- instance d'activité ;
- contexte cours/utilisateur ;
- capacités ;
- paramètres du pack de missions ;
- tentatives, progression multi-device et completion ;
- éventuellement notes plus tard si un besoin pédagogique réel le justifie ;
- endpoints serveur supportés par Moodle.

Ne jamais exécuter le code élève dans PHP.

### Moodle 5.2 React / TypeScript

Le frontend moderne porte :
- carte/parcours de missions ;
- éditeur ;
- terminal et preview ;
- feedback, indices et débrief ;
- moteur de mission réutilisé depuis le prototype.

Le source frontend vit sous le plugin Moodle dans `js/esm/src` et utilise la toolchain ESM/TypeScript/React de Moodle 5.2.

### Runtimes navigateur

Python débutant :
- Web Worker dédié ;
- Pyodide/WASM auto-hébergé ;
- timeout ;
- capacités réseau coupées autant que possible ;
- aucun passage du code élève par le serveur Moodle.

HTML/CSS/JavaScript :
- iframe sandboxée ;
- origine opaque ;
- CSP restrictive ;
- pas d'accès au parent.

### Futurs labs système/réseau/cyber

Ils justifieront un service externe isolé :
- containers ou VM jetables ;
- réseau borné ;
- aucun accès direct au processus Moodle.

Ce service n'existe que lorsqu'un besoin de runtime système le rend nécessaire.

## Pourquoi un module d'activité

Le Playground est une activité pédagogique dans un cours : un enseignant l'ajoute, l'élève l'ouvre, travaille, réussit des missions, et Moodle doit pouvoir connaître l'état pédagogique résultant.

Un `mod_` donne naturellement :
- contexte et authentification Moodle ;
- capabilities ;
- intégration au cours ;
- disponibilité ;
- completion ;
- gradebook si nécessaire ;
- backup/restore ;
- visibilité dans les surfaces d'activité Moodle.

Le plugin s'appelle provisoirement `mod_lgcplayground` (dossier `mod/lgcplayground`).

## Relation avec Moodle Roads

Roads reste séparé.

Roads connaît :
- curriculum ;
- route pédagogique ;
- learning bindings ;
- achievement evidence ;
- progression globale.

Roads ne connaît pas :
- les règles internes d'une mission Python ;
- Pyodide ;
- l'éditeur ;
- les tests techniques internes du Playground.

La frontière cible est une preuve Moodle stable :

```text
Roads milestone
      |
      | learning / evidence binding
      v
Moodle activity: mod_lgcplayground
      |
      | internal mission progression
      v
Playground engine
```

Une activité Playground peut enseigner un jalon sans suffire à prouver son acquisition. Roads conserve donc sa séparation learning coverage / achievement evidence.

## Relation avec Course Factory

Course Factory reste le pipeline généraliste sources -> cours Moodle reproductibles.

Plus tard, lorsque le contrat est stable, Factory pourra éventuellement créer/configurer une activité Playground par identifiant stable de pack de missions.

Factory ne fabrique pas le moteur du Playground et le Playground ne devient pas un second CourseSpec.

## Persistance

Le prototype Next utilise `localStorage`. Cela reste acceptable pour le harnais autonome.

Dans Moodle, la source de vérité est maintenant la table de progression du plugin :
- tentatives par utilisateur et mission ;
- réussite monotone d'une mission ;
- reprise de progression multi-device ;
- completion de l'activité lorsque toutes les missions requises sont réussies ;
- Privacy API et backup/restore ;
- aucune persistance serveur du code source élève ni de stdout.

Le navigateur peut conserver un état UX transitoire, mais il ne remplace pas la vérité Moodle. Ne pas ajouter de base séparée ou de second backend.

## Migration progressive — état actuel

- **Phase 0 — prototype conservé :** fait. Next.js reste le harnais/preview.
- **Phase 1 — shell Moodle :** fait en LOCAL.
- **Phase 2 — missions Python :** P0–P6 sont maintenant dans le pack Moodle bilingue.
- **Phase 3 — état Moodle :** fait pour tentatives, réussite, reprise multi-device et completion.
- **Phase 4 — suivi enseignant :** première projection en lecture seule implémentée ; validation navigateur encore à faire.
- **Prochaine frontière :** promotion réelle sur STAGING via Promoter, validation 7/7, puis connexion Roads sur une preuve Moodle stable.

La vue enseignant reste volontairement sobre : missions réussies, progression, tentatives de validation et dernière activité. Elle ne stocke ni n'expose le code élève ni stdout.

## Environnements

LOCAL -> STAGING -> PROD.

La migration vers le plugin se valide d'abord sur Moodle LOCAL. STAGING seulement lorsque le plugin s'installe, s'upgrade et se désinstalle proprement.

Aucune mutation PROD pendant cette phase.
