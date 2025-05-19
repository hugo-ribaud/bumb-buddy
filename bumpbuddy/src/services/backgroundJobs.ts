import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import AsyncStorage from "@react-native-async-storage/async-storage";
import appointmentService from "./appointmentService";

// Define task names
const CHECK_DOCTOLIB_APPOINTMENTS_TASK = "check-doctolib-appointments";

// Register the background task
TaskManager.defineTask(CHECK_DOCTOLIB_APPOINTMENTS_TASK, async () => {
  try {
    // Get the current user ID
    const userId = await AsyncStorage.getItem("current_user_id");
    if (!userId) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Mock checking for new Doctolib appointments
    const appointments = await appointmentService.mockDoctolibAPICheck(userId);

    if (appointments && appointments.length > 0) {
      // Store appointments to be displayed when user opens the app
      await AsyncStorage.setItem(
        `doctolib_pending_appointments_${userId}`,
        JSON.stringify(appointments)
      );

      // Return a successful result
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTasks = async () => {
  try {
    // Register Doctolib appointment check task (runs every hour)
    await BackgroundFetch.registerTaskAsync(CHECK_DOCTOLIB_APPOINTMENTS_TASK, {
      minimumInterval: 60 * 60, // 1 hour in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("Background tasks registered successfully");
  } catch (error) {
    console.error("Error registering background tasks:", error);
  }
};

export const unregisterBackgroundTasks = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(CHECK_DOCTOLIB_APPOINTMENTS_TASK);
    console.log("Background tasks unregistered successfully");
  } catch (error) {
    console.error("Error unregistering background tasks:", error);
  }
};

export const isBackgroundTaskRegistered = async (taskName: string) => {
  return await TaskManager.isTaskRegisteredAsync(taskName);
};
