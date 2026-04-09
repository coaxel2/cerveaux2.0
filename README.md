# Cerveau 2.0

Second cerveau personnel avec IA embarquée. Stack : React + Vite, fichiers JSON locaux, API Anthropic.

## Démarrage rapide

### 1. Installer les dépendances

```bash
cd cerveau2
npm install
```

### 2. Configurer la clé API Anthropic

Crée un fichier `.env` à la racine :

```
VITE_ANTHROPIC_KEY=sk-ant-xxxxxxxxxxxx
```

> La clé est utilisée directement depuis le front (usage local uniquement). Ne déploie pas ce projet publiquement avec ta clé.

### 3. Lancer l'application

```bash
npm run dev
```

Cela lance en parallèle :
- L'app React sur http://localhost:5173
- Le serveur JSON local sur http://localhost:3001

### 4. (Optionnel) Serveur JSON seul

```bash
npm run server
```

## Structure

```
cerveau2/
  data/
    journal.json      ← check-ins quotidiens
    ideas.json        ← idées capturées
    projects.json     ← projets suivis
    context.json      ← ton profil (injecté dans chaque prompt IA)
  src/
    modules/
      Dashboard.jsx   ← vue d'ensemble + analyse IA semaine
      Journal.jsx     ← check-in quotidien + agenda type + historique
      Ideas.jsx       ← capture + développement IA par idée
      Projects.jsx    ← suivi + plan d'action / déblocage IA
      AIAssistant.jsx ← assistant conversationnel avec contexte complet
    hooks/
      useData.js      ← lecture / écriture JSON via API locale
      useAI.js        ← appel API Anthropic avec système de contexte
    utils/
      helpers.js      ← dates, scores, couleurs
    App.jsx           ← navigation sidebar
    main.jsx          ← point d'entrée React
    styles.css        ← design system complet
  server.js           ← API Express locale (GET / POST / PATCH)
  vite.config.js
  package.json
```

## Personnaliser ton profil

Édite `data/context.json` pour adapter le système de prompt IA à ton profil :

```json
{
  "name": "Ton prénom",
  "role": "Ton poste",
  "tools": ["tes", "outils"],
  "interests": ["tes", "centres d'intérêt"],
  "preferences": {
    "wakeTarget": "07:00",
    "sleepTarget": "23:00"
  }
}
```

## Déploiement sur GitHub Pages

```bash
npm run build
```

Le dossier `dist/` est prêt pour GitHub Pages. Note : sans serveur Express, les lectures/écritures JSON ne fonctionnent pas. Pour GitHub Pages, remplace `useData.js` par une intégration GitHub API ou Supabase.

## Ajouter un module

1. Crée `src/modules/MonModule.jsx`
2. Ajoute l'entrée dans `MODULES` dans `App.jsx`
3. Importe et mappe le composant dans `App.jsx`
