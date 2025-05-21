import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authFailure, authSuccess } from "../redux/slices/authSlice";

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import NetworkStatusIndicator from "../components/NetworkStatusIndicator";
import supabase from "../config/supabaseConfig";
import { useTheme } from "../contexts/ThemeContext";
import { RootState } from "../redux/store";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import AuthScreen from "../screens/auth/AuthScreen";
import FoodGuideScreen from "../screens/FoodGuideScreen";
import HealthTrackerScreen from "../screens/HealthTrackerScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TimelineScreen from "../screens/TimelineScreen";
import WeekDetailScreen from "../screens/WeekDetailScreen";
import authService from "../services/authService";

// Define types for our navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Timeline: undefined;
  FoodGuide: undefined;
  HealthTracker: undefined;
  Appointments: undefined;
  Profile: undefined;
};

export type TimelineStackParamList = {
  TimelineMain: undefined;
  WeekDetail: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const TimelineStack = createStackNavigator<TimelineStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

// Timeline stack navigator
const TimelineNavigator = () => {
  const { t } = useTranslation();

  return (
    <TimelineStack.Navigator>
      <TimelineStack.Screen
        name="TimelineMain"
        component={TimelineScreen}
        options={{ headerShown: false }}
      />
      <TimelineStack.Screen
        name="WeekDetail"
        component={WeekDetailScreen}
        options={{
          headerShown: true,
          title: t("navigation.weekDetail"),
        }}
      />
    </TimelineStack.Navigator>
  );
};

// Main tab navigator (bottom tabs)
const MainTabNavigator = () => {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Timeline") {
            iconName = focused ? "calendar" : "calendar-outline";
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
        tabBarActiveTintColor: isDark ? "#60a5fa" : "#007bff",
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6c757d",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderTopColor: isDark ? "#374151" : "#e5e7eb",
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins",
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Timeline"
        component={TimelineNavigator}
        options={{ title: "Timeline" }}
      />
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
  const { t } = useTranslation();
  const navigationRef = useNavigationContainerRef();
  const isReady = useRef(false);
  const { isDark } = useTheme();

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
          const userId = data.session.user.id;

          // Fetch user data from public.users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);

            // Fall back to basic user data from session
            dispatch(
              authSuccess({
                user: {
                  id: userId,
                  email: data.session.user.email || "",
                  created_at:
                    data.session.user.created_at || new Date().toISOString(),
                },
                session: data.session,
              })
            );
            return;
          }

          // Dispatch success with user data
          dispatch(
            authSuccess({
              user: userData,
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
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReady.current = true;
      }}
      theme={isDark ? DarkTheme : DefaultTheme}
    >
      {isAuthenticated ? (
        <MainStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
        </MainStack.Navigator>
      ) : (
        <AuthScreen />
      )}
      <NetworkStatusIndicator />
    </NavigationContainer>
  );
};

export default RootNavigator;
