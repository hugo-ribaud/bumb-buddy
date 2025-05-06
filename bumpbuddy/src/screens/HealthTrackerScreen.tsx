import { StyleSheet, Text, View } from "react-native";

import React from "react";

const HealthTrackerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Tracker</Text>
      <Text style={styles.subtitle}>
        Monitor symptoms, kicks, and contractions
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

export default HealthTrackerScreen;
