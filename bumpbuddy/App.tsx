import { Provider } from "react-redux";
import React from "react";
import RootNavigator from "./src/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./src/redux/store";

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
