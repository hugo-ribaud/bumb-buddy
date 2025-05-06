import AppointmentsScreen from "../screens/AppointmentsScreen";
import AuthScreen from "../screens/auth/AuthScreen";
import FoodGuideScreen from "../screens/FoodGuideScreen";
import HealthTrackerScreen from "../screens/HealthTrackerScreen";
import HomeScreen from "../screens/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import ProfileScreen from "../screens/ProfileScreen";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens







// Define types for our navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  FoodGuide: undefined;
  HealthTracker: undefined;
  Appointments: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator (bottom tabs)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="FoodGuide" component={FoodGuideScreen} />
      <Tab.Screen name="HealthTracker" component={HealthTrackerScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root stack navigator
const RootNavigator = () => {
  // Mock authentication state - will be replaced with actual auth logic
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
