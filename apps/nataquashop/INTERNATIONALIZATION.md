# Système d'Internationalisation - Nataquashop

Ce document explique comment utiliser le système d'internationalisation mis en place dans l'application Nataquashop.

## 🏗️ Architecture

Le système suit les bonnes pratiques de Next.js pour l'internationalisation :

### Structure des dossiers
```
app/
├── [lang]/           # Routes dynamiques pour les langues
│   ├── page.tsx      # Page d'accueil
│   └── (auth)/       # Routes d'authentification
├── dictionaries/     # Fichiers de traduction
│   ├── fr.json       # Traductions françaises
│   ├── en.json       # Traductions anglaises
│   └── index.ts      # Fonction d'import des dictionnaires
└── middleware.ts     # Middleware pour la détection de langue
```

## 🌐 Langues supportées

- **Français (fr)** : Langue par défaut
- **Anglais (en)** : Langue secondaire

## 🔧 Configuration

### Middleware
Le middleware (`middleware.ts`) gère automatiquement :
- La détection de la langue préférée du navigateur
- La redirection vers l'URL avec la langue appropriée
- L'authentification utilisateur

### URLs
- `/fr/` : Version française
- `/en/` : Version anglaise
- `/` : Redirection automatique vers la langue détectée

## 📝 Utilisation

### Dans les composants serveur (Server Components)

```tsx
import { getDictionary } from "~/app/dictionaries"
import { LangParams } from "~/app/utils";

export default async function Page({ params }: { params: Promise<LangsParams> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return <h1>{dict.home.title}</h1>
}
```

### Dans les composants client (Client Components)

```tsx
"use client"
import { useDictionary } from "~/hooks/use-dictionary"

export function MyComponent() {
  const { dict, loading } = useDictionary()
  
  if (loading) return <div>Chargement...</div>
  
  return <p>{dict.home.description}</p>
}
```

### Sélecteur de langue
Le composant `LanguageSelector` est déjà intégré dans la navbar et permet de changer de langue en cliquant sur le drapeau.

## 📚 Ajouter des traductions

### 1. Modifier les fichiers JSON
Ajoutez vos traductions dans `app/dictionaries/fr.json` et `app/dictionaries/en.json` :

```json
{
  "maSection": {
    "titre": "Mon titre",
    "description": "Ma description"
  }
}
```

### 2. Utiliser dans les composants
```tsx
// Dans un composant serveur
const dict = await getDictionary(lang)
return <h1>{dict.maSection.titre}</h1>

// Dans un composant client
const { dict } = useDictionary()
return <p>{dict.maSection.description}</p>
```

## 🎯 Composants disponibles

### LanguageSelector
Composant minimaliste affichant un drapeau SVG pour changer de langue :
- Affiche le drapeau SVG de la langue actuelle (utilise flag-icons)
- Menu déroulant au clic avec les langues disponibles
- Navigation automatique vers la nouvelle URL
- Drapeaux ronds et professionnels

### useDictionary Hook
Hook personnalisé pour utiliser les traductions dans les composants client :
- Gestion automatique du chargement
- Fallback vers le français en cas d'erreur
- Mise à jour automatique lors du changement de langue

## 🚀 Fonctionnalités

- ✅ Détection automatique de la langue du navigateur
- ✅ Redirection automatique vers l'URL appropriée
- ✅ Persistance de la langue sélectionnée
- ✅ Support des composants serveur et client
- ✅ Fallback vers le français en cas d'erreur
- ✅ Interface utilisateur intuitive avec drapeaux SVG
- ✅ Drapeaux professionnels avec flag-icons

## 🎨 Drapeaux SVG

Le système utilise la bibliothèque `flag-icons` pour afficher des drapeaux SVG de haute qualité :
- Drapeaux ronds et professionnels
- Taille adaptative (w-5 h-5 par défaut)
- Support de l'accessibilité avec aria-label
- Styles CSS personnalisés pour une intégration parfaite

## 🔍 Test

Pour tester le système, vous pouvez :
1. Visiter `/fr/` pour la version française
2. Visiter `/en/` pour la version anglaise
3. Cliquer sur le drapeau dans la navbar pour changer de langue
4. Vérifier que l'URL change et que le contenu se traduit

Le composant `LanguageTest` peut être utilisé pour déboguer et vérifier que les traductions fonctionnent correctement. 