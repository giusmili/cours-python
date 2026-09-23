export type Locale = "fr" | "en";
export type Track = "python" | "web";

export type Localized = {
  fr: string;
  en: string;
};

export type PatternRule = {
  pattern: string;
  message: Localized;
};

export type WebRule =
  | {
      kind: "selectorText";
      selector: string;
      expected: string;
      message: Localized;
    }
  | {
      kind: "selectorExists";
      selector: string;
      message: Localized;
    }
  | {
      kind: "cssPattern";
      pattern: string;
      message: Localized;
    }
  | {
      kind: "codePattern";
      pattern: string;
      message: Localized;
    };

export type MissionValidation =
  | {
      kind: "python";
      expectedOutput: string;
      codeRules?: PatternRule[];
    }
  | {
      kind: "web";
      rules: WebRule[];
    };

export type Mission = {
  id: string;
  track: Track;
  order: number;
  fileName: string;
  title: Localized;
  scenario: Localized;
  objective: Localized;
  starter: string;
  hints: Localized[];
  debrief: Localized;
  bonus: Localized;
  concepts: Localized[];
  reference: {
    label: Localized;
    href: {
      fr: string;
      en: string;
    };
  };
  validation: MissionValidation;
};

const githubReference = (path: string) =>
  `https://github.com/giusmili/cours-python/blob/master/${path}`;

export const missions: Mission[] = [
  {
    id: "python-00-terminal",
    track: "python",
    order: 0,
    fileName: "main.py",
    title: { fr: "Réveiller le terminal", en: "Wake the terminal" },
    scenario: {
      fr: "Le terminal de secours est muet. Le poste de contrôle attend son signal de vie.",
      en: "The backup terminal is silent. Control is waiting for its heartbeat.",
    },
    objective: {
      fr: "Fais afficher exactement SYSTEM ONLINE.",
      en: "Print exactly SYSTEM ONLINE.",
    },
    starter: `# Mission 0
# Fais afficher exactement : SYSTEM ONLINE

`,
    hints: [
      {
        fr: "La fonction print() écrit du texte dans la sortie standard.",
        en: "The print() function writes text to standard output.",
      },
      {
        fr: 'Le texte doit être placé entre guillemets : print("...").',
        en: 'Put the text between quotes: print("...").',
      },
    ],
    debrief: {
      fr: "Tu viens d'utiliser print(), une chaîne de caractères et la boucle essentielle modifier → exécuter → lire la sortie.",
      en: "You just used print(), a string, and the essential edit → run → read-output loop.",
    },
    bonus: {
      fr: "Ajoute une seconde ligne qui affiche READY après SYSTEM ONLINE.",
      en: "Add a second line that prints READY after SYSTEM ONLINE.",
    },
    concepts: [
      { fr: "print()", en: "print()" },
      { fr: "chaîne", en: "string" },
      { fr: "exécution", en: "execution" },
    ],
    reference: {
      label: { fr: "Fiche Gius — Introduction", en: "Gius sheet — Introduction" },
      href: {
        fr: githubReference("01-introduction/notes.md"),
        en: githubReference("01-introduction/notes.md"),
      },
    },
    validation: {
      kind: "python",
      expectedOutput: "SYSTEM ONLINE",
    },
  },
  {
    id: "python-01-profile",
    track: "python",
    order: 1,
    fileName: "profile.py",
    title: { fr: "Réparer le profil opérateur", en: "Repair the operator profile" },
    scenario: {
      fr: "Le terminal connaît l'opérateur, mais les données ont été effacées. Reconstruis son profil avant le prochain contrôle.",
      en: "The terminal knows the operator, but the data was wiped. Rebuild the profile before the next check.",
    },
    objective: {
      fr: "Crée operator_name = \"Ada\" et level = 3, puis affiche exactement deux lignes : OPERATOR: ADA et LEVEL: 3.",
      en: "Create operator_name = \"Ada\" and level = 3, then print exactly two lines: OPERATOR: ADA and LEVEL: 3.",
    },
    starter: `# Mission 1
# Crée les deux variables demandées puis affiche le profil.

`,
    hints: [
      {
        fr: 'Une variable se crée avec =, par exemple name = "Ada".',
        en: 'Create a variable with =, for example name = "Ada".',
      },
      {
        fr: "Une f-string permet d'insérer une variable : f\"OPERATOR: {operator_name.upper()}\".",
        en: 'An f-string can insert a variable: f"OPERATOR: {operator_name.upper()}".',
      },
    ],
    debrief: {
      fr: "Une variable associe un nom à une valeur. Ici tu as manipulé une chaîne, un entier et une interpolation de valeurs.",
      en: "A variable associates a name with a value. Here you used a string, an integer and value interpolation.",
    },
    bonus: {
      fr: "Ajoute active = True et affiche une troisième ligne STATUS: ACTIVE sans casser les deux premières.",
      en: "Add active = True and print a third line STATUS: ACTIVE without breaking the first two.",
    },
    concepts: [
      { fr: "variables", en: "variables" },
      { fr: "str / int", en: "str / int" },
      { fr: "f-string", en: "f-string" },
    ],
    reference: {
      label: { fr: "Fiche Gius — Variables et types", en: "Gius sheet — Variables and types" },
      href: {
        fr: githubReference("02-variables-et-types/notes.md"),
        en: githubReference("02-variables-et-types/notes.md"),
      },
    },
    validation: {
      kind: "python",
      expectedOutput: "OPERATOR: ADA\nLEVEL: 3",
      codeRules: [
        {
          pattern: "^\\s*operator_name\\s*=",
          message: {
            fr: "Crée une vraie variable operator_name.",
            en: "Create an actual operator_name variable.",
          },
        },
        {
          pattern: "^\\s*level\\s*=",
          message: {
            fr: "Crée une vraie variable level.",
            en: "Create an actual level variable.",
          },
        },
      ],
    },
  },
  {
    id: "python-02-access",
    track: "python",
    order: 2,
    fileName: "access.py",
    title: { fr: "Contrôle d'accès", en: "Access control" },
    scenario: {
      fr: "Le sas laisse entrer tout le monde. Pour ce test, un visiteur de 17 ans se présente. Le système doit décider au lieu d'obéir aveuglément.",
      en: "The airlock lets everyone in. For this test, a 17-year-old visitor arrives. The system must decide instead of blindly obeying.",
    },
    objective: {
      fr: 'Avec if / else, affiche ACCESS GRANTED seulement si age >= 18 et badge == "staff". Sinon affiche ACCESS DENIED.',
      en: 'Using if / else, print ACCESS GRANTED only when age >= 18 and badge == "staff". Otherwise print ACCESS DENIED.',
    },
    starter: `# Mission 2
age = 17
badge = "visitor"

# Décide ici si l'accès est autorisé.
`,
    hints: [
      {
        fr: 'Une condition peut combiner deux tests avec and.',
        en: 'A condition can combine two tests with and.',
      },
      {
        fr: 'Le test attendu ressemble à : if age >= 18 and badge == "staff":',
        en: 'The expected test looks like: if age >= 18 and badge == "staff":',
      },
    ],
    debrief: {
      fr: "Tu viens de faire prendre une décision au programme avec une expression booléenne, une comparaison et if / else.",
      en: "You just made the program decide using a boolean expression, comparisons and if / else.",
    },
    bonus: {
      fr: "Ajoute un cas badge == \"admin\" qui autorise l'accès quel que soit l'âge, en utilisant elif.",
      en: 'Add an admin badge case that grants access regardless of age, using elif.',
    },
    concepts: [
      { fr: "booléens", en: "booleans" },
      { fr: "comparaisons", en: "comparisons" },
      { fr: "if / else", en: "if / else" },
    ],
    reference: {
      label: { fr: "Fiche Gius — Conditions", en: "Gius sheet — Conditionals" },
      href: {
        fr: githubReference("03-conditions/notes.md"),
        en: githubReference("03-conditions/notes.md"),
      },
    },
    validation: {
      kind: "python",
      expectedOutput: "ACCESS DENIED",
      codeRules: [
        {
          pattern: "^\\s*if\\s+.+:",
          message: {
            fr: "Utilise une vraie instruction if.",
            en: "Use an actual if statement.",
          },
        },
        {
          pattern: "^\\s*else\\s*:",
          message: {
            fr: "Prévois aussi le cas refusé avec else.",
            en: "Handle the denied case with else as well.",
          },
        },
      ],
    },
  },
  {
    id: "python-03-loop",
    track: "python",
    order: 3,
    fileName: "scanner.py",
    title: { fr: "Scanner les événements", en: "Scan the events" },
    scenario: {
      fr: "Le journal du poste de contrôle contient quatre états. Deux services sont tombés, mais personne ne veut les compter à la main.",
      en: "The control log contains four states. Two services went down, and nobody wants to count them by hand.",
    },
    objective: {
      fr: "Parcours states avec une boucle for, compte les valeurs \"offline\" et affiche exactement OFFLINE: 2.",
      en: "Loop through states with for, count the \"offline\" values and print exactly OFFLINE: 2.",
    },
    starter: `# Mission 3
states = ["online", "offline", "online", "offline"]
offline_count = 0

# Parcours les états ici.

print(f"OFFLINE: {offline_count}")
`,
    hints: [
      {
        fr: "Une boucle for peut parcourir directement une liste : for state in states:",
        en: "A for loop can iterate directly over a list: for state in states:",
      },
      {
        fr: "Quand state vaut \"offline\", augmente offline_count de 1.",
        en: "When state equals \"offline\", increase offline_count by 1.",
      },
    ],
    debrief: {
      fr: "Une boucle évite de répéter la même instruction. Ici, tu as parcouru une collection et maintenu un compteur.",
      en: "A loop avoids repeating the same instruction. Here you iterated over a collection and maintained a counter.",
    },
    bonus: {
      fr: "Affiche aussi ONLINE: 2 sans écrire une deuxième boucle.",
      en: "Also print ONLINE: 2 without writing a second loop.",
    },
    concepts: [
      { fr: "for", en: "for" },
      { fr: "liste", en: "list" },
      { fr: "compteur", en: "counter" },
    ],
    reference: {
      label: { fr: "Fiche Gius — Boucles", en: "Gius sheet — Loops" },
      href: {
        fr: githubReference("04-boucles/notes.md"),
        en: githubReference("04-boucles/notes.md"),
      },
    },
    validation: {
      kind: "python",
      expectedOutput: "OFFLINE: 2",
      codeRules: [
        {
          pattern: "^\\s*for\\s+.+\\s+in\\s+.+:",
          message: {
            fr: "Utilise une vraie boucle for pour parcourir les états.",
            en: "Use an actual for loop to iterate over the states.",
          },
        },
        {
          pattern: "offline_count\\s*\\+=\\s*1|offline_count\\s*=\\s*offline_count\\s*\\+\\s*1",
          message: {
            fr: "Fais évoluer offline_count dans la boucle.",
            en: "Update offline_count inside the loop.",
          },
        },
      ],
    },
  },
  {
    id: "web-00-signal",
    track: "web",
    order: 0,
    fileName: "index.html",
    title: { fr: "Faire apparaître le signal", en: "Bring the signal online" },
    scenario: {
      fr: "Le panneau de contrôle est vide. La donnée existe, mais personne ne peut la voir.",
      en: "The control panel is blank. The data exists, but nobody can see it.",
    },
    objective: {
      fr: "Ajoute un titre h1 contenant exactement SYSTEM ONLINE.",
      en: "Add an h1 heading containing exactly SYSTEM ONLINE.",
    },
    starter: `<main>
  <!-- Ajoute ici le titre principal -->
</main>`,
    hints: [
      {
        fr: "Le titre principal d'une page utilise la balise <h1>.",
        en: "A page's main heading uses the <h1> element.",
      },
      {
        fr: "Une balise a une ouverture et une fermeture : <h1>...</h1>.",
        en: "An element has an opening and closing tag: <h1>...</h1>.",
      },
    ],
    debrief: {
      fr: "HTML décrit le contenu et sa structure. Tu as créé un élément h1 : le titre principal de la page.",
      en: "HTML describes content and structure. You created an h1 element: the page's main heading.",
    },
    bonus: {
      fr: "Ajoute un paragraphe p contenant READY sous le titre.",
      en: "Add a p paragraph containing READY below the heading.",
    },
    concepts: [
      { fr: "HTML", en: "HTML" },
      { fr: "balise", en: "element" },
      { fr: "h1", en: "h1" },
    ],
    reference: {
      label: { fr: "MDN — Structurer le contenu", en: "MDN — Structuring content" },
      href: {
        fr: "https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Structuring_content",
        en: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
      },
    },
    validation: {
      kind: "web",
      rules: [
        {
          kind: "selectorText",
          selector: "h1",
          expected: "SYSTEM ONLINE",
          message: {
            fr: "Il faut un <h1> contenant exactement SYSTEM ONLINE.",
            en: "You need an <h1> containing exactly SYSTEM ONLINE.",
          },
        },
      ],
    },
  },
  {
    id: "web-01-status-card",
    track: "web",
    order: 1,
    fileName: "index.html",
    title: { fr: "Rendre l'alerte lisible", en: "Make the alert readable" },
    scenario: {
      fr: "Le contenu est revenu, mais le panneau ressemble encore à du texte brut. Donne-lui une vraie hiérarchie visuelle.",
      en: "The content is back, but the panel still looks like raw text. Give it a real visual hierarchy.",
    },
    objective: {
      fr: "Style .status-card avec un fond, au moins 16px de padding et des coins arrondis.",
      en: "Style .status-card with a background, at least 16px of padding and rounded corners.",
    },
    starter: `<style>
  body {
    font-family: system-ui, sans-serif;
    background: #0b1020;
    color: white;
  }

  .status-card {
    /* À toi de jouer */
  }
</style>

<main>
  <section class="status-card">
    <p>CORE STATUS</p>
    <h1>SYSTEM ONLINE</h1>
  </section>
</main>`,
    hints: [
      {
        fr: "Commence par background, padding et border-radius.",
        en: "Start with background, padding and border-radius.",
      },
      {
        fr: "Exemple de forme : padding: 24px; border-radius: 18px;",
        en: "Example shape: padding: 24px; border-radius: 18px;",
      },
    ],
    debrief: {
      fr: "CSS transforme la présentation sans changer le sens du HTML. Tu viens de travailler sélecteur de classe, espacement interne et forme d'un composant.",
      en: "CSS changes presentation without changing HTML meaning. You just used a class selector, inner spacing and component shape.",
    },
    bonus: {
      fr: "Ajoute une bordure légèrement transparente et une ombre discrète.",
      en: "Add a slightly transparent border and a subtle shadow.",
    },
    concepts: [
      { fr: "sélecteur de classe", en: "class selector" },
      { fr: "padding", en: "padding" },
      { fr: "border-radius", en: "border-radius" },
    ],
    reference: {
      label: { fr: "MDN — Premiers pas CSS", en: "MDN — CSS first steps" },
      href: {
        fr: "https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Styling_basics",
        en: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics",
      },
    },
    validation: {
      kind: "web",
      rules: [
        {
          kind: "selectorExists",
          selector: ".status-card",
          message: {
            fr: "La carte .status-card doit rester présente.",
            en: "The .status-card element must remain present.",
          },
        },
        {
          kind: "cssPattern",
          pattern: "\\.status-card\\s*\\{[\\s\\S]*?background(?:-color)?\\s*:",
          message: {
            fr: "Ajoute un background à .status-card.",
            en: "Add a background to .status-card.",
          },
        },
        {
          kind: "cssPattern",
          pattern: "\\.status-card\\s*\\{[\\s\\S]*?padding\\s*:\\s*(?:1[6-9]|[2-9][0-9])px",
          message: {
            fr: "Ajoute au moins 16px de padding à .status-card.",
            en: "Give .status-card at least 16px of padding.",
          },
        },
        {
          kind: "cssPattern",
          pattern: "\\.status-card\\s*\\{[\\s\\S]*?border-radius\\s*:",
          message: {
            fr: "Ajoute un border-radius à .status-card.",
            en: "Add a border-radius to .status-card.",
          },
        },
      ],
    },
  },
  {
    id: "web-02-layout",
    track: "web",
    order: 2,
    fileName: "index.html",
    title: { fr: "Organiser le poste de contrôle", en: "Organize the control deck" },
    scenario: {
      fr: "Trois modules de supervision s'empilent verticalement. Sur grand écran, l'équipe veut les lire d'un seul coup d'œil.",
      en: "Three monitoring modules are stacked vertically. On a wide screen, the team needs to scan them at a glance.",
    },
    objective: {
      fr: "Transforme .panel-grid en disposition Flexbox et ajoute un gap entre les cartes.",
      en: "Turn .panel-grid into a Flexbox layout and add a gap between cards.",
    },
    starter: `<style>
  body {
    font-family: system-ui, sans-serif;
    background: #0b1020;
    color: white;
  }

  .panel-grid {
    /* Les cartes doivent se placer côte à côte */
  }

  .panel {
    flex: 1;
    padding: 20px;
    border: 1px solid #53627f;
    border-radius: 16px;
  }
</style>

<main class="panel-grid">
  <section class="panel">NETWORK</section>
  <section class="panel">STORAGE</section>
  <section class="panel">SECURITY</section>
</main>`,
    hints: [
      {
        fr: "Flexbox commence avec display: flex.",
        en: "Flexbox starts with display: flex.",
      },
      {
        fr: "La propriété gap ajoute un espace régulier entre les enfants.",
        en: "The gap property adds consistent spacing between children.",
      },
    ],
    debrief: {
      fr: "Tu viens de séparer structure et mise en page : le HTML garde trois sections, tandis que Flexbox décide comment elles occupent l'espace.",
      en: "You just separated structure from layout: HTML keeps three sections while Flexbox decides how they share space.",
    },
    bonus: {
      fr: "Ajoute flex-wrap: wrap pour que les cartes puissent revenir à la ligne sur un écran étroit.",
      en: "Add flex-wrap: wrap so cards can flow onto another line on a narrow screen.",
    },
    concepts: [
      { fr: "Flexbox", en: "Flexbox" },
      { fr: "display", en: "display" },
      { fr: "gap", en: "gap" },
    ],
    reference: {
      label: { fr: "MDN — Flexbox", en: "MDN — Flexbox" },
      href: {
        fr: "https://developer.mozilla.org/fr/docs/Learn_web_development/Core/CSS_layout/Flexbox",
        en: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox",
      },
    },
    validation: {
      kind: "web",
      rules: [
        {
          kind: "selectorExists",
          selector: ".panel-grid",
          message: {
            fr: "La zone .panel-grid doit rester présente.",
            en: "The .panel-grid element must remain present.",
          },
        },
        {
          kind: "cssPattern",
          pattern: "\\.panel-grid\\s*\\{[\\s\\S]*?display\\s*:\\s*flex",
          message: {
            fr: "Active Flexbox avec display: flex sur .panel-grid.",
            en: "Enable Flexbox with display: flex on .panel-grid.",
          },
        },
        {
          kind: "cssPattern",
          pattern: "\\.panel-grid\\s*\\{[\\s\\S]*?gap\\s*:",
          message: {
            fr: "Ajoute un gap à .panel-grid.",
            en: "Add a gap to .panel-grid.",
          },
        },
      ],
    },
  },
  {
    id: "web-03-interaction",
    track: "web",
    order: 3,
    fileName: "index.html",
    title: { fr: "Le bouton doit agir", en: "Make the button react" },
    scenario: {
      fr: "L'interface affiche OFFLINE même après le retour du service. Le bouton ACTIVATE doit maintenant modifier réellement l'état de la page.",
      en: "The interface still shows OFFLINE after the service recovers. The ACTIVATE button must now change the page state for real.",
    },
    objective: {
      fr: "Au clic sur #activate, change le texte de #status en ONLINE avec JavaScript.",
      en: "When #activate is clicked, change #status text to ONLINE with JavaScript.",
    },
    starter: `<style>
  body {
    font-family: system-ui, sans-serif;
    background: #0b1020;
    color: white;
  }

  button {
    padding: 12px 18px;
  }
</style>

<main>
  <p id="status">OFFLINE</p>
  <button id="activate">ACTIVATE</button>
</main>

<script>
  const button = document.getElementById("activate");
  const status = document.getElementById("status");

  // Fais réagir le bouton ici.
</script>`,
    hints: [
      {
        fr: 'Écoute le clic avec button.addEventListener("click", () => { ... }).',
        en: 'Listen for the click with button.addEventListener("click", () => { ... }).',
      },
      {
        fr: 'Dans la fonction, change status.textContent en "ONLINE".',
        en: 'Inside the function, change status.textContent to "ONLINE".',
      },
    ],
    debrief: {
      fr: "JavaScript ajoute le comportement. Tu as relié un événement utilisateur à une modification du DOM sans changer la structure HTML initiale.",
      en: "JavaScript adds behavior. You connected a user event to a DOM update without changing the original HTML structure.",
    },
    bonus: {
      fr: "Fais ensuite alterner le bouton entre ONLINE et OFFLINE à chaque clic.",
      en: "Then make the button toggle between ONLINE and OFFLINE on every click.",
    },
    concepts: [
      { fr: "événement", en: "event" },
      { fr: "DOM", en: "DOM" },
      { fr: "textContent", en: "textContent" },
    ],
    reference: {
      label: { fr: "MDN — Événements", en: "MDN — Events" },
      href: {
        fr: "https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Scripting/Events",
        en: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events",
      },
    },
    validation: {
      kind: "web",
      rules: [
        {
          kind: "selectorExists",
          selector: "#activate",
          message: {
            fr: "Le bouton #activate doit rester présent.",
            en: "The #activate button must remain present.",
          },
        },
        {
          kind: "selectorExists",
          selector: "#status",
          message: {
            fr: "L'élément #status doit rester présent.",
            en: "The #status element must remain present.",
          },
        },
        {
          kind: "codePattern",
          pattern: "addEventListener\\s*\\(\\s*[\\\"']click[\\\"']",
          message: {
            fr: "Écoute réellement l'événement click avec addEventListener.",
            en: "Listen to the click event with addEventListener.",
          },
        },
        {
          kind: "codePattern",
          pattern: "textContent\\s*=\\s*[\\\"']ONLINE[\\\"']",
          message: {
            fr: "Change le texte du statut en ONLINE.",
            en: "Change the status text to ONLINE.",
          },
        },
      ],
    },
  },
];

export function missionsForTrack(track: Track) {
  return missions.filter((mission) => mission.track === track).sort((a, b) => a.order - b.order);
}

export function localize(value: Localized, locale: Locale) {
  return value[locale];
}
