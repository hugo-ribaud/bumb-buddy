import { StyleSheet, Text, View } from "react-native";

import React from "react";

const FoodGuideScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Safety Guide</Text>
      <Text style={styles.subtitle}>
        Safe and restricted foods during pregnancy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
  },
});

export default FoodGuideScreen;
