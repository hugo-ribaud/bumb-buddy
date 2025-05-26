/**
 * Language Context Provider
 * Manages language state and provides language switching functionality
 */

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { isRTL, supportedLanguages } from "../i18n/languages";

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import authService from "../services/authService";

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = "bumpbuddy_language";

// Context type definition
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof supportedLanguages;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
  isRTL: false,
  supportedLanguages,
});

// Props for provider
interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language Provider Component
 * Wraps the app to provide language context
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Ensure we always start with a valid language
  const getInitialLanguage = () => {
    const currentLang = i18next.language || "en";
    return Object.keys(supportedLanguages).includes(currentLang)
      ? currentLang
      : "en";
  };

  const [language, setLanguageState] = useState(getInitialLanguage());
  const [rtl, setRTL] = useState(isRTL(language));
  const { user } = useSelector((state: RootState) => state.auth);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage) {
          await changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
    };

    loadLanguage();
  }, []);

  // Change language function
  const changeLanguage = async (lang: string) => {
    try {
      // Check if language is valid
      if (!Object.keys(supportedLanguages).includes(lang)) {
        console.warn(
          `Language ${lang} is not supported, falling back to English`
        );
        lang = "en";
      }

      // Change i18next language
      await i18next.changeLanguage(lang);

      // Update state
      setLanguageState(lang);
      setRTL(isRTL(lang));

      // Save to AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // Save to user profile in database if user is logged in
      if (user) {
        try {
          await authService.updateProfile({
            id: user.id,
            appSettings: {
              language: lang,
            },
          });
        } catch (error) {
          console.error(
            "Failed to save language preference to profile:",
            error
          );
        }
      }
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  // Context value
  const value = {
    language,
    setLanguage: changeLanguage,
    isRTL: rtl,
    supportedLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook to use language context
 */
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
