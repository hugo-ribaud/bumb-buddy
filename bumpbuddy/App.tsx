import "./global.css";
import "./src/i18n"; // Import i18n configuration

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { FontProvider } from "./src/contexts/FontContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { PreferencesProvider } from "./src/contexts/PreferencesContext";
import { RTLProvider } from "./src/contexts/RTLContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import RootNavigator from "./src/navigation";
import { store } from "./src/redux/store";

export default function App() {
  return (
    <Provider store={store}>
      <PreferencesProvider>
        <FontProvider>
          <ThemeProvider>
            <LanguageProvider>
              <RTLProvider>
                <SafeAreaProvider>
                  <RootNavigator />
                </SafeAreaProvider>
              </RTLProvider>
            </LanguageProvider>
          </ThemeProvider>
        </FontProvider>
      </PreferencesProvider>
    </Provider>
  );
}
