# Internationalization (i18n) Implementation Plan

## Overview

This document outlines the implementation plan for adding internationalization (i18n) support to the BumpBuddy application. Implementing i18n will make the app more accessible to users who speak different languages and live in different regions, expanding our potential user base.

## Goals

- Create a flexible, maintainable i18n infrastructure
- Support initial languages: English, Spanish, French
- Ensure all UI text is externalized to translation files
- Handle locale-specific formatting for dates, numbers, and times
- Support right-to-left (RTL) languages for future expansion
- Allow users to change the app language independent of device settings

## Technical Approach

### 1. Libraries and Tools

We will implement i18n using the following libraries:

- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-react-native-language-detector**: For device language detection
- **react-native-localize**: For device locale information
- **expo-localization**: Expo's localization utilities
- **date-fns**: For locale-aware date formatting (with locale add-ons)

### 2. Directory Structure

```
src/
├── i18n/
│   ├── index.ts               # i18n configuration
│   ├── languages/
│   │   ├── en.json            # English translations
│   │   ├── es.json            # Spanish translations
│   │   ├── fr.json            # French translations
│   │   └── index.ts           # Languages export file
│   ├── types/
│   │   └── translations.ts    # TypeScript types for translations
│   └── formatters/
│       ├── dateFormatter.ts   # Date formatting utilities
│       └── numberFormatter.ts # Number formatting utilities
```

### 3. Translation Keys Organization

Translation keys will be organized by feature/module to maintain scalability:

```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email"
    }
  },
  "auth": {
    "login": {
      "title": "Log In",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "forgotPassword": "Forgot Password?",
      "submitButton": "Log In"
    }
  },
  "profile": {
    "title": "My Profile",
    "dueDate": "Due Date",
    "pregnancyWeek": "Pregnancy Week"
  }
}
```

### 4. Implementation Steps

#### Phase 1: Initial Setup (1-2 days)

1. Install required libraries:

```bash
bunx expo install i18next react-i18next i18next-react-native-language-detector react-native-localize expo-localization date-fns
```

2. Create basic configuration in `src/i18n/index.ts`
3. Create translation types for TypeScript support
4. Add English translations for common elements
5. Set up language detection and fallback mechanism

#### Phase 2: Basic Integration (2-3 days)

1. Create a language context provider component
2. Add language switching functionality in settings
3. Implement translation HOC (Higher-Order Component) and hooks
4. Create date and number formatting utilities
5. Update babel.config.js to support extraction of i18n keys if needed

#### Phase 3: Refactor Existing UI (3-4 days)

1. Update all existing screens to use translation hooks
2. Extract all hardcoded strings to translation files
3. Apply date/number formatting to all displays
4. Create a translation guide for developers

#### Phase 4: Advanced Features (2-3 days)

1. Add support for dynamic content (interpolation, pluralization)
2. Implement RTL layout support for future languages
3. Set up translation loading on demand (code splitting)
4. Create language switcher component in settings

#### Phase 5: Testing and Refinement (2-3 days)

1. Test UI in all supported languages
2. Check for text overflow and layout issues
3. Verify RTL layout works correctly
4. Test language switching and persistence
5. Create translation workflow for non-technical contributors

### 5. Implementation Details

#### i18n Configuration Example

```typescript
// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import RNLanguageDetector from "i18next-react-native-language-detector";
import * as Localization from "expo-localization";
import { getLocales } from "react-native-localize";

// Import translations
import { en, es, fr } from "./languages";

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: __DEV__,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

#### Usage Example in Components

```tsx
// Example of i18n usage in a component
import React from "react";
import { View, Text, Button } from "react-native";
import { useTranslation } from "react-i18next";
import { formatDate } from "../i18n/formatters/dateFormatter";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const today = new Date();

  return (
    <View>
      <Text>{t("profile.title")}</Text>
      <Text>
        {t("profile.today")}: {formatDate(today)}
      </Text>
      <Button title={t("common.buttons.save")} onPress={() => {}} />
    </View>
  );
};
```

#### Language Context Provider

```tsx
// src/contexts/LanguageContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

const LANGUAGE_KEY = "bumpbuddy_language";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
  isRTL: false,
});

export const LanguageProvider: React.FC = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.language || "en");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Load saved language
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
          await changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguageState(lang);
      setIsRTL(["ar", "he"].includes(lang)); // RTL languages
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
```

## Testing and Quality Assurance

- Test all UI components with various text lengths (some languages expand text)
- Check for text truncation and layout shifts
- Verify RTL layout works properly where needed
- Test language switching at runtime
- Ensure all dates, times, and numbers are correctly formatted per locale

## Success Criteria

- All user-facing text is externalized to translation files
- The app correctly displays in all supported languages
- Users can switch languages within the app
- Date and time formats follow locale conventions
- Layout supports both LTR and RTL orientations
- Translation process is documented for future language additions

## Timeline

- Initial setup: 1-2 days
- Basic integration: 2-3 days
- Refactor existing UI: 3-4 days
- Advanced features: 2-3 days
- Testing and refinement: 2-3 days

**Total estimated time: 10-15 days**

## Future Considerations

- Add a translation management system for external translators
- Expand language support based on user demographics
- Consider machine translation for user-generated content
- Implement region-specific content (pregnancy guidance may vary by country)
- Add voice support in multiple languages as the app grows

---

This plan provides a comprehensive approach to implementing internationalization in the BumpBuddy app, ensuring a solid foundation that can scale as the app grows and expands to new markets.
