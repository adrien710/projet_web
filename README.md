# Portfolio Dallas Cowboys — Guide de personnalisation

## Structure des fichiers

```
portfolio/
├── index.html              ← Accueil
├── about.html              ← À propos
├── work.html               ← Travaux (avec overlay)
├── skills.html             ← Compétences (avec overlay)
├── contact.html            ← Contact
├── subpage-template.html   ← Modèle pour vos sous-pages
├── sub-work-web.html       ← Exemple de sous-page
├── style.css               ← Tous les styles
├── script.js               ← Logique JS
└── images/                 ← 📂 Mettez vos photos ici
    ├── photo1.jpg
    ├── photo2.jpg
    ...
```

---

## 1 — Ajouter vos images de fond

Créez un dossier `images/` à la racine et déposez-y vos photos.
Dans `script.js`, modifiez le tableau `PATCHWORK_IMAGES` :

```js
const PATCHWORK_IMAGES = [
  'images/ma-photo-1.jpg',
  'images/ma-photo-2.jpg',
  // ... autant que vous voulez
];
```

Le patchwork se génère aléatoirement à chaque chargement.
Idéalement 8 à 20 images pour une bonne diversité visuelle.

---

## 2 — Personnaliser le nom / logo

Dans chaque fichier HTML, remplacez :
```html
<span>Votre<span> Nom</span></span>
```
Par votre propre nom ou initiales.

---

## 3 — Ajouter / modifier des sous-pages

### a) Créer la page
Dupliquez `subpage-template.html`, renommez-la (ex: `sub-skills-dev.html`),
et modifiez son contenu.

### b) Déclarer les sous-pages dans l'overlay
Dans `script.js`, ajoutez ou modifiez l'objet `OVERLAY_CONFIGS` :

```js
const OVERLAY_CONFIGS = {

  work: {
    title: 'Mes Travaux',
    items: [
      { label: 'Projets Web',       href: 'sub-work-web.html' },
      { label: 'Design Graphique',  href: 'sub-work-design.html' },
      // ...
    ],
  },

  skills: {
    title: 'Compétences',
    items: [
      { label: 'Développement',  href: 'sub-skills-dev.html' },
      // ...
    ],
  },

};
```

### c) Déclencher l'overlay depuis un lien de page
Ajoutez `data-overlay="work"` (ou `"skills"`) sur n'importe quel élément :
```html
<span data-overlay="work">Mes travaux <span class="nav-arrow">→</span></span>
```

---

## 4 — Charte graphique Dallas Cowboys

Les couleurs sont définies dans `:root` dans `style.css` :
```css
--navy:   #003594   /* Bleu marine principal */
--silver: #869397   /* Argent / textes secondaires */
--white:  #F5F7FA   /* Blanc cassé */
--gold:   #C5A028   /* Accents dorés */
--dark:   #0a0e1a   /* Fond sombre */
```

---

## 5 — Modifier la typographie

Le site utilise **Bebas Neue** (titres) et **Barlow** (corps).
Ces polices sont chargées via Google Fonts dans `style.css`.
Pour changer, remplacez l'`@import` et les variables `--font-display` / `--font-body`.

---

## 6 — Tester en local

Ouvrez simplement `index.html` dans votre navigateur.
Pour que les images du patchwork se chargent correctement via un chemin relatif,
utilisez un petit serveur local si besoin :
```bash
# Python
python3 -m http.server 8080
# Node
npx serve .
```
Puis ouvrez `http://localhost:8080`.
