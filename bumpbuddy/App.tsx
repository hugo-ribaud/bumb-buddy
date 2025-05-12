import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import "./src/i18n"; // Import i18n configuration
import RootNavigator from "./src/navigation";
import { store } from "./src/redux/store";

export default function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </LanguageProvider>
    </Provider>
  );
}
