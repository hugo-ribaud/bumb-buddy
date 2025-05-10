import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser } from "../redux/slices/authSlice";
import { RootState } from "../redux/store";
import authService from "../services/authService";
import realtimeService from "../services/realtimeService";

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("Setting up...");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(
    user?.dueDate ? new Date(user.dueDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set up Realtime subscription
  useEffect(() => {
    if (!user) return;

    console.log("Setting up Realtime subscription for Users table...");
    setRealtimeStatus("Connecting...");

    const subscription = realtimeService.subscribeToUsers({
      onUpdate: (payload) => {
        // Only update if it's the current user's record
        if (payload.new && payload.new.id === user.id) {
          console.log("Current user updated:", payload.new);
          setLastUpdate(
            `Profile updated at ${new Date().toLocaleTimeString()}`
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
        setRealtimeStatus("Error connecting to Realtime");
      },
    });

    if (subscription) {
      setRealtimeStatus("Connected to Realtime");
    } else {
      setRealtimeStatus("Failed to connect to Realtime");
    }

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        realtimeService.unsubscribe(subscription);
        console.log("Cleaned up Realtime subscription");
      }
    };
  }, [user, dispatch]);

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
    setLoading(true);
    try {
      // Calculate pregnancy week based on due date
      const currentDate = new Date();
      const dueDateObj = new Date(dueDate);

      // Approximate pregnancy weeks (40 weeks total)
      const timeDiff = dueDateObj.getTime() - currentDate.getTime();
      const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));
      const pregnancyWeek = 40 - weeksDiff;

      // In a real implementation, we would update the user in Supabase here
      // For example:
      // await supabase
      //   .from('users')
      //   .update({
      //     due_date: dueDate.toISOString().split("T")[0],
      //     pregnancy_week: pregnancyWeek > 0 ? pregnancyWeek : 0
      //   })
      //   .eq('id', user.id);

      // Update Redux state
      dispatch(
        updateUser({
          dueDate: dueDate.toISOString().split("T")[0],
          pregnancyWeek: pregnancyWeek > 0 ? pregnancyWeek : 0,
        })
      );

      setEditing(false);
      setLastUpdate(`Profile updated at ${new Date().toLocaleTimeString()}`);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
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
      <View style={styles.container}>
        <Text>Please log in to view your profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>My Profile</Text>

        {/* Realtime Status Indicator */}
        <View style={styles.realtimeCard}>
          <Text style={styles.realtimeStatus}>Realtime: {realtimeStatus}</Text>
          {lastUpdate && <Text style={styles.lastUpdate}>{lastUpdate}</Text>}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>

          {editing ? (
            <>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{dueDate.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>
                {user.dueDate
                  ? new Date(user.dueDate).toLocaleDateString()
                  : "Not set"}
              </Text>

              <Text style={styles.label}>Pregnancy Week</Text>
              <Text style={styles.value}>
                {user.pregnancyWeek !== undefined
                  ? `Week ${user.pregnancyWeek}`
                  : "Not set"}
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Log Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  realtimeCard: {
    backgroundColor: "#e6f7ff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#91d5ff",
  },
  realtimeStatus: {
    fontWeight: "bold",
    color: "#0050b3",
  },
  lastUpdate: {
    marginTop: 5,
    color: "#096dd9",
    fontStyle: "italic",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    padding: 12,
    alignItems: "center",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    marginTop: 30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
