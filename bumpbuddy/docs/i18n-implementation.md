# Internationalization (i18n) Implementation

This document outlines the internationalization (i18n) implementation for BumpBuddy, a pregnancy tracking app.

## Table of Contents

1. [Architecture](#architecture)
2. [Directory Structure](#directory-structure)
3. [Components](#components)
4. [Usage Examples](#usage-examples)
5. [Adding New Languages](#adding-new-languages)
6. [Performance Considerations](#performance-considerations)

## Architecture

BumpBuddy's i18n implementation is built using:

- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **react-native-localize**: Native device language detection
- **expo-localization**: Additional localization utilities
- **date-fns**: Date formatting with locale support

The implementation follows these principles:

- Type-safe translation keys with TypeScript
- Automatic language detection based on device settings
- User-selectable language preferences saved to AsyncStorage
- Locale-aware formatting for dates, numbers, and currencies
- Support for RTL languages (future)

## Directory Structure

```
src/
├── i18n/
│   ├── languages/
│   │   ├── en.json     # English translations
│   │   ├── es.json     # Spanish translations
│   │   ├── fr.json     # French translations
│   │   └── index.ts    # Exports and utilities
│   ├── types/
│   │   └── translations.ts  # TypeScript interfaces
│   ├── formatters/
│   │   ├── dateFormatter.ts # Date formatting utilities
│   │   └── numberFormatter.ts # Number formatting utilities
│   └── index.ts        # i18n configuration
├── contexts/
│   └── LanguageContext.tsx # Language state provider
└── components/
    └── LanguageSwitcher.tsx # Language selection UI
```

## Components

### LanguageContext

The `LanguageContext` provides language state and switching functionality throughout the app:

- `language`: Current language code (e.g., 'en', 'es')
- `setLanguage`: Function to change the language
- `isRTL`: Whether the current language is RTL
- `supportedLanguages`: List of available languages

### LanguageSwitcher

A UI component for selecting the app language with features:

- Displays language in its native name (e.g., "English", "Español")
- Modal selector with all available languages
- Visual indication of the currently selected language
- Automatic app-wide language switching

## Usage Examples

### Basic Text Translation

```jsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t("common.buttons.save")}</Text>; // "Save" or "Guardar" based on language
}
```

### Translations with Variables

```jsx
// For interpolation with variables
const welcomeMessage = t("home.welcome", { name: userName });
// "Welcome, John!" or "¡Bienvenida, John!" based on language
```

### Formatting Dates

```jsx
import { formatDate } from "../i18n/formatters/dateFormatter";

// Will format based on current locale
const formattedDate = formatDate(new Date(), "PPP");
```

### Formatting Numbers

```jsx
import {
  formatNumber,
  formatCurrency,
} from "../i18n/formatters/numberFormatter";

// Format based on current locale
const formattedNumber = formatNumber(1000.5); // "1,000.5" or "1 000,5" based on locale
const price = formatCurrency(19.99, "USD"); // "$19.99" or "19,99 $" based on locale
```

## Adding New Languages

To add a new language:

1. Create a new file in `src/i18n/languages/` (e.g., `de.json`)
2. Copy the structure from an existing language file
3. Translate all strings to the new language
4. Add the language to `supportedLanguages` in `src/i18n/languages/index.ts`:

```typescript
export const supportedLanguages = {
  // Existing languages...
  de: {
    name: "German",
    nativeName: "Deutsch",
    isRTL: false,
  },
};
```

5. Add the language to the resources in `src/i18n/index.ts`:

```typescript
import de from "./languages/de.json";

const resources = {
  // Existing languages...
  de: {
    translation: de,
  },
};
```

## Performance Considerations

- Translation files are loaded on app start
- No additional network requests are needed for translations
- The app uses format-js and Intl API for formatting, which are optimized for performance
- The language context is only updated when the user changes the language, minimizing re-renders
