import "./global.css";
import "./src/i18n"; // Import i18n configuration

import React, { useEffect } from "react";
import { persistor, store } from "./src/redux/store";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { FontProvider } from "./src/contexts/FontContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import { PreferencesProvider } from "./src/contexts/PreferencesContext";
import { RTLProvider } from "./src/contexts/RTLContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import RootNavigator from "./src/navigation";
import networkService from "./src/services/networkService";

export default function App() {
  // Initialize network service singleton
  useEffect(() => {
    return () => {
      // Clean up network service on unmount
      networkService.cleanup();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NetworkProvider>
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
        </NetworkProvider>
      </PersistGate>
    </Provider>
  );
}
