import { StyleSheet, Text, View } from "react-native";

import React from "react";

const AppointmentsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      <Text style={styles.subtitle}>Track and manage your prenatal visits</Text>
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

export default AppointmentsScreen;
