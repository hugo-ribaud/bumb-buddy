import "./global.css";
import "./src/i18n"; // Import i18n configuration

import { FontProvider } from "./src/contexts/FontContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { Provider } from "react-redux";
import { RTLProvider } from "./src/contexts/RTLContext";
import React from "react";
import RootNavigator from "./src/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import ThemedStatusBar from "./src/components/ThemedStatusBar";
import { store } from "./src/redux/store";

export default function App() {
  return (
    <Provider store={store}>
      <FontProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <LanguageProvider>
            <RTLProvider>
              <SafeAreaProvider>
                <RootNavigator />
              </SafeAreaProvider>
            </RTLProvider>
          </LanguageProvider>
        </ThemeProvider>
      </FontProvider>
    </Provider>
  );
}
