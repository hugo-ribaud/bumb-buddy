import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser } from "../redux/slices/authSlice";

import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import FontedText from "../components/FontedText";
import PreferencesPanel from "../components/PreferencesPanel";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { usePreferences } from "../contexts/PreferencesContext";
import { useTheme } from "../contexts/ThemeContext";
import { RootState } from "../redux/store";
import authService from "../services/authService";
import realtimeService from "../services/realtimeService";
import { calculatePregnancyWeek } from "../utils/pregnancyCalculations";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const colorScheme = useColorScheme();
  const { isDark } = useTheme();
  const { updateTheme } = usePreferences();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState(
    t("common.labels.loading")
  );
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(
    user?.dueDate ? new Date(user.dueDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [preferencesVisible, setPreferencesVisible] = useState(false);

  // Set up Realtime subscription
  useEffect(() => {
    if (!user) return;

    console.log("Setting up Realtime subscription for Users table...");
    setRealtimeStatus(t("common.labels.loading"));

    const subscription = realtimeService.subscribeToUsers({
      onUpdate: (payload) => {
        // Only update if it's the current user's record
        if (payload.new && payload.new.id === user.id) {
          console.log("Current user updated:", payload.new);
          setLastUpdate(
            `${t("profile.profileUpdated")} ${new Date().toLocaleTimeString()}`
          );

          // Update the Redux store with the new data from Realtime
          const updatedUserData = {
            dueDate: payload.new.due_date,
            pregnancyWeek: payload.new.pregnancy_week,
            // Add any other fields that may have changed
          };

          // Check if app_settings were updated
          if (payload.new.app_settings) {
            // If theme setting changed, update theme context
            if (payload.new.app_settings.theme) {
              const savedTheme = payload.new.app_settings.theme;
              if (
                savedTheme === "light" ||
                savedTheme === "dark" ||
                savedTheme === "system"
              ) {
                updateTheme(savedTheme);
                console.log("Theme updated from remote:", savedTheme);
              }
            }
          }

          dispatch(updateUser(updatedUserData));
        }
      },
      onError: (error) => {
        console.error("Realtime subscription error:", error);
        setRealtimeStatus(t("profile.realtimeError"));
      },
    });

    if (subscription) {
      setRealtimeStatus(t("profile.realtimeConnected"));
    } else {
      setRealtimeStatus(t("profile.realtimeConnectionFailed"));
    }

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        realtimeService.unsubscribe(subscription);
        console.log("Cleaned up Realtime subscription");
      }
    };
  }, [user, dispatch, t]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      dispatch(logout());
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Calculate pregnancy week based on due date (using standardized utility function)
      const formattedDueDate = dueDate.toISOString().split("T")[0];
      const calculatedPregnancyWeek = calculatePregnancyWeek(formattedDueDate);

      // Update user in Supabase
      const { error } = await authService.updateProfile({
        id: user.id,
        name,
        dueDate: formattedDueDate,
        pregnancyWeek: calculatedPregnancyWeek,
      });

      if (error) {
        throw new Error(error);
      }

      // Update Redux state
      dispatch(
        updateUser({
          name,
          dueDate: formattedDueDate,
          pregnancyWeek: calculatedPregnancyWeek,
        })
      );

      setEditing(false);
      setLastUpdate(
        `${t("profile.profileUpdated")} ${new Date().toLocaleTimeString()}`
      );
      Alert.alert(
        t("common.labels.success"),
        t("profile.profileUpdateSuccess")
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("common.errors.generic"), t("profile.profileUpdateError"));
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  if (!user) {
    return (
      <SafeAreaWrapper>
        <ThemedView className="flex-1 p-5">
          <FontedText>{t("auth.login.pleaseLoginFirst")}</FontedText>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      {/* Header with options icon */}
      <View className="flex-row items-center justify-end px-5 pt-3">
        <Pressable
          onPress={() => setPreferencesVisible(true)}
          accessibilityLabel={t("preferences.title")}
        >
          <Feather name="settings" size={28} color={isDark ? "#fff" : "#222"} />
        </Pressable>
      </View>
      <ScrollView
        className="flex-1 bg-background-light dark:bg-background-dark"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ThemedView className="flex-1 p-5">
          <FontedText variant="heading-2" className="mb-5 text-center">
            {t("profile.title")}
          </FontedText>

          {/* Realtime Status Indicator */}
          <ThemedView
            backgroundColor="surface"
            className="p-4 mb-5 border-l-4 border-purple-400 rounded-lg dark:border-purple-500"
          >
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-purple-400 dark:bg-purple-500 mr-2.5" />
              <FontedText className="font-bold text-purple-800 dark:text-purple-300">
                {t("profile.realtime")}: {realtimeStatus}
              </FontedText>
            </View>
            {lastUpdate && (
              <FontedText className="mt-1.5 pl-5 italic text-purple-700 dark:text-purple-400">
                {lastUpdate}
              </FontedText>
            )}
          </ThemedView>

          {/* Preferences Modal Triggered by Icon */}
          <Modal
            visible={preferencesVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setPreferencesVisible(false)}
          >
            <View className="items-center justify-center flex-1 bg-black/40">
              <ThemedView
                backgroundColor="surface"
                className="w-[90%] max-w-md p-6 rounded-2xl shadow-lg relative"
              >
                <Pressable
                  onPress={() => setPreferencesVisible(false)}
                  className="absolute z-10 top-4 right-4"
                  accessibilityLabel={t("common.buttons.cancel")}
                >
                  <Feather
                    name="x"
                    size={24}
                    color={isDark ? "#fff" : "#222"}
                  />
                </Pressable>
                <PreferencesPanel />
              </ThemedView>
            </View>
          </Modal>

          {/* User Details Section */}
          <ThemedView
            backgroundColor="surface"
            className="p-5 rounded-lg shadow"
          >
            <FontedText
              variant="heading-4"
              colorVariant="primary"
              className="mb-3"
            >
              {t("profile.userDetails")}
            </FontedText>

            <FontedText
              variant="body-small"
              colorVariant="secondary"
              className="mt-4"
            >
              {t("auth.login.emailLabel")}
            </FontedText>
            <FontedText variant="body" className="mt-1 mb-1">
              {user.email}
            </FontedText>

            {editing ? (
              <>
                <FontedText
                  variant="body-small"
                  colorVariant="secondary"
                  className="mt-4"
                >
                  {t("profile.name")}
                </FontedText>
                <View className="px-3 py-3 mt-1 mb-4 bg-white border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t("profile.namePlaceholder")}
                    className="text-body dark:text-body-dark"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#9ca3af" : "#6b7280"
                    }
                  />
                </View>

                <FontedText
                  variant="body-small"
                  colorVariant="secondary"
                  className="mt-4"
                >
                  {t("profile.dueDate")}
                </FontedText>
                <TouchableOpacity
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3.5 mt-1 mb-4 bg-white dark:bg-gray-800"
                  onPress={() => setShowDatePicker(true)}
                >
                  <FontedText>{dueDate.toLocaleDateString()}</FontedText>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    themeVariant={colorScheme === "dark" ? "dark" : "light"}
                  />
                )}

                <View className="flex-row justify-between mt-6">
                  <TouchableOpacity
                    className="bg-gray-500 dark:bg-gray-600 rounded-xl p-3.5 flex-1 items-center mr-2.5"
                    onPress={() => setEditing(false)}
                  >
                    <FontedText className="font-bold text-white">
                      {t("common.buttons.cancel")}
                    </FontedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="items-center flex-1 p-3.5 rounded-xl bg-primary dark:bg-primary-dark"
                    onPress={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <FontedText className="font-bold text-white">
                        {t("common.buttons.save")}
                      </FontedText>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <FontedText
                  variant="body-small"
                  colorVariant="secondary"
                  className="mt-4"
                >
                  {t("profile.name")}
                </FontedText>
                <FontedText variant="body" className="mt-1 mb-1">
                  {user.name || t("profile.notSet")}
                </FontedText>

                <FontedText
                  variant="body-small"
                  colorVariant="secondary"
                  className="mt-4"
                >
                  {t("profile.dueDate")}
                </FontedText>
                <FontedText variant="body" className="mt-1 mb-1">
                  {user.dueDate
                    ? new Date(user.dueDate).toLocaleDateString()
                    : t("profile.notSet")}
                </FontedText>

                <FontedText
                  variant="body-small"
                  colorVariant="secondary"
                  className="mt-4"
                >
                  {t("profile.pregnancyWeek")}
                </FontedText>
                <FontedText variant="body" className="mt-1 mb-1">
                  {user.pregnancyWeek !== undefined
                    ? `Week ${user.pregnancyWeek}`
                    : "Not set"}
                </FontedText>

                <TouchableOpacity
                  className="items-center p-3 mt-4 rounded bg-primary"
                  onPress={() => setEditing(true)}
                >
                  <FontedText className="font-bold text-white">
                    {t("common.buttons.editProfile")}
                  </FontedText>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              className="items-center p-3 bg-red-500 rounded dark:bg-red-600 mt-7"
              onPress={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <FontedText className="font-bold text-white">
                  {t("common.buttons.logout")}
                </FontedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ProfileScreen;
