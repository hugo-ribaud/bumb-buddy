import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser } from "../redux/slices/authSlice";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import FontedText from "../components/FontedText";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { RootState } from "../redux/store";
import authService from "../services/authService";
import realtimeService from "../services/realtimeService";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const colorScheme = useColorScheme();

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
      // Calculate pregnancy week based on due date
      const currentDate = new Date();
      const dueDateObj = new Date(dueDate);

      // Approximate pregnancy weeks (40 weeks total)
      const timeDiff = dueDateObj.getTime() - currentDate.getTime();
      const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));
      const pregnancyWeek = 40 - weeksDiff;

      // Update user in Supabase
      const formattedDueDate = dueDate.toISOString().split("T")[0];
      const calculatedPregnancyWeek = pregnancyWeek > 0 ? pregnancyWeek : 0;

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
      <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
        <ThemedView className="flex-1 p-5">
          <FontedText variant="heading-2" className="mb-5 text-center">
            {t("profile.title")}
          </FontedText>

          {/* Realtime Status Indicator */}
          <ThemedView
            backgroundColor="surface"
            className="p-4 mb-5 border-l-4 border-blue-400 dark:border-blue-600 rounded-lg"
          >
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-blue-400 dark:bg-blue-600 mr-2.5" />
              <FontedText className="font-bold text-blue-800 dark:text-blue-300">
                {t("profile.realtime")}: {realtimeStatus}
              </FontedText>
            </View>
            {lastUpdate && (
              <FontedText className="mt-1.5 pl-5 italic text-blue-700 dark:text-blue-400">
                {lastUpdate}
              </FontedText>
            )}
          </ThemedView>

          {/* Language Settings Section */}
          <ThemedView
            backgroundColor="surface"
            className="rounded-lg shadow mb-5 overflow-hidden"
          >
            <View className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <FontedText
                  variant="heading-4"
                  colorVariant="primary"
                  className="flex-1"
                >
                  {t("profile.languageSettings")}
                </FontedText>
                <FontedText
                  variant="caption"
                  colorVariant="secondary"
                  className="text-right"
                >
                  {t("profile.selectYourLanguage")}
                </FontedText>
              </View>
            </View>
            <View className="p-5">
              <LanguageSwitcher />
            </View>
          </ThemedView>

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
                <View className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3 mt-1 mb-4 bg-white dark:bg-gray-800">
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
              className="items-center p-3 bg-red-500 dark:bg-red-600 rounded mt-7"
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
