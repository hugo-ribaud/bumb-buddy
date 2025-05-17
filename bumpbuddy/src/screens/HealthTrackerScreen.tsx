import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { AppDispatch, RootState } from "../redux/store";
import React, { useEffect, useRef, useState } from "react";
import {
  addBloodPressureLog,
  addSymptom,
  addWeightLog,
  deleteBloodPressureLog,
  deleteSymptom,
  endContraction,
  endKickCount,
  fetchBloodPressureLogs,
  fetchContractions,
  fetchKickCounts,
  fetchSymptoms,
  fetchWeightLogs,
  startContraction,
  startKickCount,
  updateBloodPressureLog,
  updateKickCount,
} from "../redux/slices/healthSlice";
import { useDispatch, useSelector } from "react-redux";

import { BloodPressureLog } from "../services/healthService";
import FontedText from "../components/FontedText";
import ThemedView from "../components/ThemedView";
import { format } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

// Define common symptom types
const SYMPTOM_TYPES = [
  {
    id: "nausea",
    name: "Nausea",
    description: "Morning sickness or general nausea",
  },
  {
    id: "fatigue",
    name: "Fatigue",
    description: "Feeling unusually tired",
  },
  {
    id: "headache",
    name: "Headache",
    description: "Pain or pressure in the head",
  },
  {
    id: "backache",
    name: "Backache",
    description: "Lower or upper back pain",
  },
  {
    id: "swelling",
    name: "Swelling",
    description: "Swelling in feet, ankles, or hands",
  },
  {
    id: "heartburn",
    name: "Heartburn",
    description: "Burning sensation in the chest",
  },
];

const HealthTrackerScreen = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { symptoms, kickCounts, weightLogs, contractions, bloodPressureLogs } =
    useSelector((state: RootState) => state.health);

  // Local state for UI
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymptomType, setSelectedSymptomType] = useState<string | null>(
    null
  );
  const [symptomNotes, setSymptomNotes] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState(3);
  const [endSessionModalVisible, setEndSessionModalVisible] = useState(false);
  const [kickSessionNotes, setKickSessionNotes] = useState("");

  // Weight tracking state
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  // Contraction timer state
  const [contractionTimerActive, setContractionTimerActive] = useState(false);
  const [contractionStartTime, setContractionStartTime] = useState<Date | null>(
    null
  );
  const [contractionEndTime, setContractionEndTime] = useState<Date | null>(
    null
  );
  const [contractionIntensity, setContractionIntensity] = useState(3);
  const [contractionNotes, setContractionNotes] = useState("");
  const [contractionModalVisible, setContractionModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Blood pressure tracking state
  const [bpModalVisible, setBpModalVisible] = useState(false);
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [bpPulse, setBpPulse] = useState("");
  const [bpPosition, setBpPosition] = useState("sitting");
  const [bpArm, setBpArm] = useState("left");
  const [bpNotes, setBpNotes] = useState("");
  const [editingBpLog, setEditingBpLog] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSymptoms(user.id));
      dispatch(fetchKickCounts(user.id));
      dispatch(fetchWeightLogs(user.id));
      dispatch(fetchContractions(user.id));
      dispatch(fetchBloodPressureLogs(user.id));
    }
  }, [dispatch, user]);

  // Timer effect for contraction tracking
  useEffect(() => {
    if (contractionTimerActive && contractionStartTime) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contractionTimerActive, contractionStartTime]);

  // Get active symptoms for today
  const today = new Date().toISOString().split("T")[0];
  const todaysSymptoms = symptoms.items.filter(
    (symptom) => symptom.date === today
  );

  // Check if a symptom type is active today
  const isSymptomActiveToday = (symptomType: string) => {
    return todaysSymptoms.some((s) => s.symptom_type === symptomType);
  };

  // Get symptom data for a specific type
  const getSymptomData = (symptomType: string) => {
    return todaysSymptoms.find((s) => s.symptom_type === symptomType);
  };

  // Handler for toggling a symptom
  const toggleSymptom = (symptomType: string) => {
    const isActive = isSymptomActiveToday(symptomType);

    if (isActive) {
      // If active, find and delete the symptom
      const symptom = getSymptomData(symptomType);
      if (symptom && user?.id) {
        Alert.alert(
          t("health.removeSymptom"),
          t("health.confirmRemoveSymptom"),
          [
            {
              text: t("common.cancel"),
              style: "cancel",
            },
            {
              text: t("common.remove"),
              onPress: () => {
                dispatch(deleteSymptom(symptom.id));
              },
              style: "destructive",
            },
          ]
        );
      }
    } else {
      // If not active, show modal to add details
      setSelectedSymptomType(symptomType);
      setSymptomNotes("");
      setSymptomSeverity(3);
      setModalVisible(true);
    }
  };

  // Handler for saving symptom details
  const saveSymptomDetails = () => {
    if (!selectedSymptomType || !user?.id) return;

    const newSymptom = {
      user_id: user.id,
      symptom_type: selectedSymptomType,
      severity: symptomSeverity,
      date: today,
      time: new Date().toISOString().split("T")[1].substring(0, 8),
      notes: symptomNotes,
    };

    dispatch(addSymptom(newSymptom));
    setModalVisible(false);
  };

  // Handler for kick counter
  const handleKickCounter = () => {
    if (!kickCounts.currentSession) {
      // Start counter if no active session
      if (user?.id) {
        dispatch(startKickCount(user.id));
      }
    } else {
      // Record a kick
      dispatch(
        updateKickCount({
          id: kickCounts.currentSession.id,
          count: kickCounts.currentSession.count + 1,
        })
      );
    }
  };

  // Handler for ending kick count session
  const handleEndKickCounter = () => {
    setEndSessionModalVisible(true);
  };

  const confirmEndKickCounter = () => {
    if (kickCounts.currentSession) {
      dispatch(
        endKickCount({
          id: kickCounts.currentSession.id,
          notes: kickSessionNotes,
        })
      );
      setEndSessionModalVisible(false);
      setKickSessionNotes("");
    }
  };

  // Format time for display
  const formatTimeElapsed = () => {
    if (!kickCounts.currentSession?.start_time) return "00:00";

    const startTime = new Date(kickCounts.currentSession.start_time);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins.toString().padStart(2, "0")}:${diffSecs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format seconds to minutes:seconds
  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handler for starting a contraction
  const handleStartContraction = () => {
    if (!user?.id) return;

    setContractionTimerActive(true);
    setContractionStartTime(new Date());
    setTimerSeconds(0);
    dispatch(startContraction(user.id));
  };

  // Handler for ending a contraction
  const handleEndContraction = () => {
    if (!contractionStartTime || !contractions.currentContraction) return;

    const endTime = new Date();
    setContractionEndTime(endTime);
    setContractionTimerActive(false);

    // Open modal to record intensity and notes
    setContractionModalVisible(true);
    setContractionIntensity(3);
    setContractionNotes("");
  };

  // Handler for saving contraction details
  const saveContractionDetails = () => {
    if (!contractions.currentContraction) return;

    dispatch(
      endContraction({
        id: contractions.currentContraction.id,
        intensity: contractionIntensity,
        notes: contractionNotes || undefined,
      })
    );

    setContractionModalVisible(false);
    setContractionStartTime(null);
    setContractionEndTime(null);
  };

  // Handler for opening weight modal
  const handleAddWeight = () => {
    setWeight("");
    setWeightNotes("");
    setWeightModalVisible(true);
  };

  // Handler for saving weight log
  const saveWeightLog = () => {
    if (!user?.id || !weight) return;

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) {
      Alert.alert(
        t("common.errors.invalidInput"),
        t("health.invalidWeightValue")
      );
      return;
    }

    const newWeightLog = {
      user_id: user.id,
      date: today,
      weight: weightValue,
      notes: weightNotes,
    };

    dispatch(addWeightLog(newWeightLog));
    setWeightModalVisible(false);
  };

  // Get the latest weight log
  const latestWeightLog = weightLogs.items[0];

  // Handler for opening blood pressure modal
  const handleAddBloodPressure = () => {
    setBpSystolic("");
    setBpDiastolic("");
    setBpPulse("");
    setBpPosition("sitting");
    setBpArm("left");
    setBpNotes("");
    setEditingBpLog(null);
    setBpModalVisible(true);
  };

  // Handler for editing blood pressure log
  const handleEditBloodPressure = (bpLog: BloodPressureLog) => {
    setBpSystolic(bpLog.systolic.toString());
    setBpDiastolic(bpLog.diastolic.toString());
    setBpPulse(bpLog.pulse?.toString() || "");
    setBpPosition(bpLog.position || "sitting");
    setBpArm(bpLog.arm || "left");
    setBpNotes(bpLog.notes || "");
    setEditingBpLog(bpLog.id);
    setBpModalVisible(true);
  };

  // Handler for deleting blood pressure log
  const handleDeleteBloodPressure = (id: string) => {
    Alert.alert(
      t("health.deleteBloodPressure"),
      t("health.confirmDeleteBloodPressure"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          onPress: () => {
            dispatch(deleteBloodPressureLog(id));
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handler for saving blood pressure log
  const saveBloodPressureLog = () => {
    if (!user?.id || !bpSystolic || !bpDiastolic) {
      Alert.alert(
        t("common.errors.invalidInput"),
        t("health.invalidBloodPressureValues")
      );
      return;
    }

    const systolicValue = parseInt(bpSystolic, 10);
    const diastolicValue = parseInt(bpDiastolic, 10);
    const pulseValue = bpPulse ? parseInt(bpPulse, 10) : undefined;

    if (
      isNaN(systolicValue) ||
      isNaN(diastolicValue) ||
      (bpPulse && isNaN(pulseValue as number))
    ) {
      Alert.alert(
        t("common.errors.invalidInput"),
        t("health.invalidBloodPressureValues")
      );
      return;
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toISOString().split("T")[1].substring(0, 8);

    if (editingBpLog) {
      // Update existing log
      dispatch(
        updateBloodPressureLog({
          id: editingBpLog,
          updates: {
            systolic: systolicValue,
            diastolic: diastolicValue,
            pulse: pulseValue,
            position: bpPosition,
            arm: bpArm,
            notes: bpNotes || undefined,
          },
        })
      );
    } else {
      // Add new log
      const newBpLog = {
        user_id: user.id,
        date,
        time,
        systolic: systolicValue,
        diastolic: diastolicValue,
        pulse: pulseValue,
        position: bpPosition,
        arm: bpArm,
        notes: bpNotes || undefined,
      };

      dispatch(addBloodPressureLog(newBpLog));
    }

    setBpModalVisible(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <ThemedView backgroundColor="background" className="flex-1">
      <ScrollView className="flex-1">
        <View className="p-5">
          <FontedText
            variant="heading-2"
            fontFamily="comfortaa"
            className="mb-4"
          >
            {t("health.title")}
          </FontedText>

          {/* Symptoms Section */}
          <ThemedView
            backgroundColor="surface"
            className="rounded-xl p-4 mb-6 shadow-sm"
          >
            <FontedText
              variant="heading-3"
              fontFamily="comfortaa"
              className="mb-2"
            >
              {t("health.dailySymptoms")}
            </FontedText>
            <FontedText
              variant="body-small"
              textType="secondary"
              className="mb-4"
            >
              {t("health.symptomsDescription")}
            </FontedText>

            {symptoms.loading ? (
              <ActivityIndicator
                size="large"
                color="#87D9C4"
                className="my-4"
              />
            ) : (
              SYMPTOM_TYPES.map((symptom) => {
                const isActive = isSymptomActiveToday(symptom.id);
                const symptomData = isActive
                  ? getSymptomData(symptom.id)
                  : null;

                return (
                  <View
                    key={symptom.id}
                    className="flex-row items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
                  >
                    <View className="flex-1 mr-3">
                      <FontedText variant="body" className="font-medium">
                        {t(`health.symptoms.${symptom.id}`)}
                      </FontedText>
                      <FontedText variant="caption" textType="secondary">
                        {t(`health.symptomsDesc.${symptom.id}`)}
                      </FontedText>
                      {isActive && symptomData && (
                        <>
                          <FontedText
                            variant="body-small"
                            colorVariant="primary"
                            className="mt-1"
                          >
                            {t("health.severity")}: {symptomData.severity}/5
                          </FontedText>
                          {symptomData.notes && (
                            <FontedText
                              variant="caption"
                              className="mt-1 italic"
                            >
                              {symptomData.notes}
                            </FontedText>
                          )}
                        </>
                      )}
                    </View>
                    <Switch
                      value={isActive}
                      onValueChange={() => toggleSymptom(symptom.id)}
                      trackColor={{ false: "#ced4da", true: "#87D9C4" }}
                    />
                  </View>
                );
              })
            )}
          </ThemedView>

          {/* Kick Counter Section */}
          <ThemedView
            backgroundColor="surface"
            className="rounded-xl p-4 mb-6 shadow-sm"
          >
            <FontedText
              variant="heading-3"
              fontFamily="comfortaa"
              className="mb-2"
            >
              {t("health.kickCounter")}
            </FontedText>
            <FontedText
              variant="body-small"
              textType="secondary"
              className="mb-4"
            >
              {t("health.kickCounterDescription")}
            </FontedText>

            <View className="items-center mb-4">
              <View className="flex-row justify-around w-full mb-4">
                <View className="items-center">
                  <FontedText variant="heading-1" colorVariant="primary">
                    {kickCounts.currentSession?.count || 0}
                  </FontedText>
                  <FontedText variant="caption" textType="secondary">
                    {t("health.kicks")}
                  </FontedText>
                </View>

                <View className="items-center">
                  <FontedText variant="heading-1" colorVariant="primary">
                    {formatTimeElapsed()}
                  </FontedText>
                  <FontedText variant="caption" textType="secondary">
                    {t("health.time")}
                  </FontedText>
                </View>
              </View>

              {kickCounts.loading ? (
                <ActivityIndicator
                  size="large"
                  color="#87D9C4"
                  className="my-4"
                />
              ) : (
                <>
                  <TouchableOpacity
                    className={`px-6 py-3 rounded-full mb-3 ${
                      kickCounts.currentSession
                        ? "bg-primary dark:bg-primary-dark"
                        : "bg-primary dark:bg-primary-dark"
                    }`}
                    onPress={handleKickCounter}
                  >
                    <FontedText className="text-white font-bold">
                      {kickCounts.currentSession
                        ? t("health.recordKick")
                        : t("health.startCounting")}
                    </FontedText>
                  </TouchableOpacity>

                  {kickCounts.currentSession && (
                    <TouchableOpacity
                      className="px-6 py-3 rounded-full bg-accent dark:bg-accent-dark"
                      onPress={handleEndKickCounter}
                    >
                      <FontedText className="text-white font-bold">
                        {t("health.endSession")}
                      </FontedText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </ThemedView>

          {/* Weight Tracker Section */}
          <ThemedView
            backgroundColor="surface"
            className="rounded-xl p-4 mb-6 shadow-sm"
          >
            <FontedText
              variant="heading-3"
              fontFamily="comfortaa"
              className="mb-2"
            >
              {t("health.weightTracker")}
            </FontedText>
            <FontedText
              variant="body-small"
              textType="secondary"
              className="mb-4"
            >
              {t("health.weightTrackerDescription")}
            </FontedText>

            <View className="items-center mb-4">
              {weightLogs.loading ? (
                <ActivityIndicator
                  size="large"
                  color="#87D9C4"
                  className="my-4"
                />
              ) : (
                <>
                  {latestWeightLog ? (
                    <View className="flex-row items-center justify-between mb-4">
                      <FontedText variant="body" className="font-medium">
                        {t("health.currentWeight")}
                      </FontedText>
                      <FontedText variant="body" className="font-bold">
                        {latestWeightLog.weight} kg
                      </FontedText>
                    </View>
                  ) : (
                    <FontedText className="text-center text-gray-500">
                      {t("health.noWeightData")}
                    </FontedText>
                  )}

                  <TouchableOpacity
                    className="px-6 py-3 rounded-full bg-primary dark:bg-primary-dark"
                    onPress={handleAddWeight}
                  >
                    <FontedText className="text-white font-bold">
                      {t("health.addWeight")}
                    </FontedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ThemedView>

          {/* Blood Pressure Section */}
          <ThemedView
            backgroundColor="surface"
            className="rounded-xl p-4 mb-6 shadow-sm"
          >
            <FontedText
              variant="heading-3"
              fontFamily="comfortaa"
              className="mb-2"
            >
              {t("health.bloodPressure")}
            </FontedText>
            <FontedText
              variant="body-small"
              textType="secondary"
              className="mb-4"
            >
              {t("health.bloodPressureDescription")}
            </FontedText>

            <View className="items-center mb-4">
              {bloodPressureLogs.loading ? (
                <ActivityIndicator
                  size="large"
                  color="#87D9C4"
                  className="my-4"
                />
              ) : (
                <>
                  {bloodPressureLogs.items.length > 0 ? (
                    <View className="flex-row items-center justify-between mb-4">
                      <FontedText variant="body" className="font-medium">
                        {t("health.currentBloodPressure")}
                      </FontedText>
                      <FontedText variant="body" className="font-bold">
                        {bloodPressureLogs.items[0].systolic}/
                        {bloodPressureLogs.items[0].diastolic} mmHg
                      </FontedText>
                    </View>
                  ) : (
                    <FontedText className="text-center text-gray-500">
                      {t("health.noBloodPressureData")}
                    </FontedText>
                  )}

                  <TouchableOpacity
                    className="px-6 py-3 rounded-full bg-primary dark:bg-primary-dark"
                    onPress={handleAddBloodPressure}
                  >
                    <FontedText className="text-white font-bold">
                      {t("health.addBloodPressure")}
                    </FontedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ThemedView>

          {/* Contraction Timer Section */}
          <ThemedView
            backgroundColor="surface"
            className="rounded-xl p-4 mb-6 shadow-sm"
          >
            <FontedText
              variant="heading-3"
              fontFamily="comfortaa"
              className="mb-2"
            >
              {t("health.contractionTimer")}
            </FontedText>
            <FontedText
              variant="body-small"
              textType="secondary"
              className="mb-4"
            >
              {t("health.contractionTimerDescription")}
            </FontedText>

            <View className="items-center mb-4">
              <View className="flex-row justify-around w-full mb-4">
                <View className="items-center">
                  <FontedText variant="heading-1" colorVariant="primary">
                    {formatSeconds(timerSeconds)}
                  </FontedText>
                  <FontedText variant="caption" textType="secondary">
                    {contractionTimerActive
                      ? t("health.contractionInProgress")
                      : t("health.readyToStart")}
                  </FontedText>
                </View>
              </View>

              <View className="flex-row justify-around w-full">
                {!contractionTimerActive ? (
                  <TouchableOpacity
                    className="px-6 py-3 rounded-full bg-primary dark:bg-primary-dark"
                    onPress={handleStartContraction}
                  >
                    <FontedText className="text-white font-bold">
                      {t("health.startContraction")}
                    </FontedText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="px-6 py-3 rounded-full bg-accent dark:bg-accent-dark"
                    onPress={handleEndContraction}
                  >
                    <FontedText className="text-white font-bold">
                      {t("health.endContraction")}
                    </FontedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
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
    color: "#343a40",
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#343a40",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 15,
  },
  symptomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343a40",
  },
  symptomDescription: {
    fontSize: 14,
    color: "#6c757d",
  },
  symptomSeverity: {
    fontSize: 14,
    color: "#007bff",
    marginTop: 5,
  },
  symptomNotes: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 5,
  },
  kickCounterContainer: {
    alignItems: "center",
    padding: 15,
  },
  kickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  kickStatItem: {
    alignItems: "center",
  },
  kickStatValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#343a40",
  },
  kickStatLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  kickButton: {
    backgroundColor: "#007bff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  kickButtonActive: {
    backgroundColor: "#28a745",
  },
  kickButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  endButton: {
    borderWidth: 1,
    borderColor: "#dc3545",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  endButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#343a40",
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#343a40",
  },
  severityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  severityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9ecef",
  },
  activeSeverityButton: {
    backgroundColor: "#007bff",
  },
  severityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  activeSeverityButtonText: {
    color: "white",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  kickSessionSummary: {
    fontSize: 16,
    color: "#343a40",
    textAlign: "center",
    marginBottom: 20,
  },
  weightContainer: {
    alignItems: "center",
    padding: 15,
  },
  currentWeightContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentWeightLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
  },
  currentWeightValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#343a40",
  },
  currentWeightDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  noWeightData: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 20,
    textAlign: "center",
  },
  addWeightButton: {
    backgroundColor: "#007bff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  addWeightButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  weightHistoryContainer: {
    marginTop: 20,
    width: "100%",
  },
  weightHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 10,
  },
  weightHistoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  weightHistoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightHistoryDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  weightHistoryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  weightHistoryNotes: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 5,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    height: 50,
    marginBottom: 20,
  },
  contractionContainer: {
    alignItems: "center",
    padding: 15,
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#343a40",
  },
  timerLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  contractionButtonContainer: {
    marginBottom: 20,
  },
  startContractionButton: {
    backgroundColor: "#007bff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  endContractionButton: {
    backgroundColor: "#dc3545",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  contractionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  contractionHistoryContainer: {
    marginTop: 20,
    width: "100%",
  },
  contractionHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 10,
  },
  contractionHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contractionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  contractionHistoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  contractionHistoryText: {
    fontSize: 14,
    color: "#6c757d",
  },
  contractionList: {
    width: "100%",
  },
  contractionSummary: {
    fontSize: 16,
    color: "#343a40",
    textAlign: "center",
    marginBottom: 20,
  },
  bpContainer: {
    alignItems: "center",
    padding: 15,
  },
  currentBpContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentBpLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
  },
  currentBpValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#343a40",
  },
  currentBpDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  currentBpPulse: {
    fontSize: 16,
    color: "#343a40",
    marginBottom: 5,
  },
  noBpData: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 20,
    textAlign: "center",
  },
  addBpButton: {
    backgroundColor: "#007bff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  addBpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  bpHistoryContainer: {
    marginTop: 20,
    width: "100%",
  },
  bpHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 10,
  },
  bpHistoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  bpHistoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bpHistoryDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  bpHistoryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  bpHistoryNotes: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 5,
  },
  bpInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    height: 50,
    marginBottom: 20,
  },
  bpHistoryDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  bpHistoryPulse: {
    fontSize: 14,
    color: "#6c757d",
  },
  bpHistoryPosition: {
    fontSize: 14,
    color: "#6c757d",
  },
  bpHistoryArm: {
    fontSize: 14,
    color: "#6c757d",
  },
  bpHistoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  bpEditButton: {
    backgroundColor: "#007bff",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  bpEditButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bpDeleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bpDeleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HealthTrackerScreen;
