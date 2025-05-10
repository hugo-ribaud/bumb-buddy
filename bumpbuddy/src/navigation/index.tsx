import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authFailure, authSuccess } from "../redux/slices/authSlice";
import { RootState } from "../redux/store";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import AuthScreen from "../screens/auth/AuthScreen";
import FoodGuideScreen from "../screens/FoodGuideScreen";
import HealthTrackerScreen from "../screens/HealthTrackerScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import authService from "../services/authService";

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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "FoodGuide") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "HealthTracker") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Appointments") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#6c757d",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="FoodGuide"
        component={FoodGuideScreen}
        options={{ title: "Food Guide" }}
      />
      <Tab.Screen
        name="HealthTracker"
        component={HealthTrackerScreen}
        options={{ title: "Health" }}
      />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root stack navigator
const RootNavigator = () => {
  // Get authentication state from Redux
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await authService.getSession();

        if (error || !data?.session) {
          dispatch(authFailure(error?.message || "No active session"));
          return;
        }

        if (data.session.user) {
          dispatch(
            authSuccess({
              user: {
                id: data.session.user.id,
                email: data.session.user.email || "",
                createdAt:
                  data.session.user.created_at || new Date().toISOString(),
              },
              session: data.session,
            })
          );
        }
      } catch (error: any) {
        console.error("Session check error:", error);
      }
    };

    checkSession();
  }, [dispatch]);

  // Show loading screen while checking session
  if (isLoading) {
    return null; // Or a loading spinner
  }

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
