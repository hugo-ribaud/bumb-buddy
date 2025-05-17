import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  addSymptom,
  addWeightLog,
  deleteSymptom,
  endContraction,
  endKickCount,
  fetchContractions,
  fetchKickCounts,
  fetchSymptoms,
  fetchWeightLogs,
  startContraction,
  startKickCount,
  updateKickCount,
} from "../redux/slices/healthSlice";
import { AppDispatch, RootState } from "../redux/store";

import { format } from "date-fns";
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
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { symptoms, kickCounts, weightLogs, contractions } = useSelector(
    (state: RootState) => state.health
  );

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

  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSymptoms(user.id));
      dispatch(fetchKickCounts(user.id));
      dispatch(fetchWeightLogs(user.id));
      dispatch(fetchContractions(user.id));
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("health.title")}</Text>

        {/* Symptoms Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("health.dailySymptoms")}</Text>
          <Text style={styles.sectionDescription}>
            {t("health.symptomsDescription")}
          </Text>

          {symptoms.loading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={styles.loader}
            />
          ) : (
            SYMPTOM_TYPES.map((symptom) => {
              const isActive = isSymptomActiveToday(symptom.id);
              const symptomData = isActive ? getSymptomData(symptom.id) : null;

              return (
                <View key={symptom.id} style={styles.symptomItem}>
                  <View style={styles.symptomInfo}>
                    <Text style={styles.symptomName}>
                      {t(`health.symptoms.${symptom.id}`)}
                    </Text>
                    <Text style={styles.symptomDescription}>
                      {t(`health.symptomsDesc.${symptom.id}`)}
                    </Text>
                    {isActive && symptomData && (
                      <>
                        <Text style={styles.symptomSeverity}>
                          {t("health.severity")}: {symptomData.severity}/5
                        </Text>
                        {symptomData.notes && (
                          <Text style={styles.symptomNotes}>
                            {symptomData.notes}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleSymptom(symptom.id)}
                    trackColor={{ false: "#ced4da", true: "#007bff" }}
                  />
                </View>
              );
            })
          )}
        </View>

        {/* Kick Counter Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("health.kickCounter")}</Text>
          <Text style={styles.sectionDescription}>
            {t("health.kickCounterDescription")}
          </Text>

          <View style={styles.kickCounterContainer}>
            <View style={styles.kickStats}>
              <View style={styles.kickStatItem}>
                <Text style={styles.kickStatValue}>
                  {kickCounts.currentSession?.count || 0}
                </Text>
                <Text style={styles.kickStatLabel}>{t("health.kicks")}</Text>
              </View>

              <View style={styles.kickStatItem}>
                <Text style={styles.kickStatValue}>{formatTimeElapsed()}</Text>
                <Text style={styles.kickStatLabel}>{t("health.time")}</Text>
              </View>
            </View>

            {kickCounts.loading ? (
              <ActivityIndicator
                size="large"
                color="#007bff"
                style={styles.loader}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.kickButton,
                    kickCounts.currentSession && styles.kickButtonActive,
                  ]}
                  onPress={handleKickCounter}
                >
                  <Text style={styles.kickButtonText}>
                    {kickCounts.currentSession
                      ? t("health.recordKick")
                      : t("health.startCounting")}
                  </Text>
                </TouchableOpacity>

                {kickCounts.currentSession && (
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={handleEndKickCounter}
                  >
                    <Text style={styles.endButtonText}>
                      {t("health.endSession")}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Weight Tracker Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("health.weightTracker")}</Text>
          <Text style={styles.sectionDescription}>
            {t("health.weightTrackerDescription")}
          </Text>

          <View style={styles.weightContainer}>
            {weightLogs.loading ? (
              <ActivityIndicator
                size="large"
                color="#007bff"
                style={styles.loader}
              />
            ) : (
              <>
                {latestWeightLog ? (
                  <View style={styles.currentWeightContainer}>
                    <Text style={styles.currentWeightLabel}>
                      {t("health.currentWeight")}
                    </Text>
                    <Text style={styles.currentWeightValue}>
                      {latestWeightLog.weight} kg
                    </Text>
                    <Text style={styles.currentWeightDate}>
                      {formatDate(latestWeightLog.date)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noWeightData}>
                    {t("health.noWeightData")}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.addWeightButton}
                  onPress={handleAddWeight}
                >
                  <Text style={styles.addWeightButtonText}>
                    {t("health.addWeight")}
                  </Text>
                </TouchableOpacity>

                {weightLogs.items.length > 0 && (
                  <View style={styles.weightHistoryContainer}>
                    <Text style={styles.weightHistoryTitle}>
                      {t("health.weightHistory")}
                    </Text>

                    {weightLogs.items.slice(0, 5).map((log) => (
                      <View key={log.id} style={styles.weightHistoryItem}>
                        <View style={styles.weightHistoryInfo}>
                          <Text style={styles.weightHistoryDate}>
                            {formatDate(log.date)}
                          </Text>
                          <Text style={styles.weightHistoryValue}>
                            {log.weight} kg
                          </Text>
                        </View>
                        {log.notes && (
                          <Text style={styles.weightHistoryNotes}>
                            {log.notes}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Contraction Timer Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {t("health.contractionTimer")}
          </Text>
          <Text style={styles.sectionDescription}>
            {t("health.contractionTimerDescription")}
          </Text>

          <View style={styles.contractionContainer}>
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>
                {formatSeconds(timerSeconds)}
              </Text>
              <Text style={styles.timerLabel}>
                {contractionTimerActive
                  ? t("health.contractionInProgress")
                  : t("health.readyToStart")}
              </Text>
            </View>

            <View style={styles.contractionButtonContainer}>
              {!contractionTimerActive ? (
                <TouchableOpacity
                  style={styles.startContractionButton}
                  onPress={handleStartContraction}
                >
                  <Text style={styles.contractionButtonText}>
                    {t("health.startContraction")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.endContractionButton}
                  onPress={handleEndContraction}
                >
                  <Text style={styles.contractionButtonText}>
                    {t("health.endContraction")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Contraction history section */}
            {contractions.items.length > 0 && (
              <View style={styles.contractionHistoryContainer}>
                <Text style={styles.contractionHistoryTitle}>
                  {t("health.recentContractions")}
                </Text>

                <View style={styles.contractionHistoryHeader}>
                  <Text style={[styles.contractionHeaderText, { flex: 1 }]}>
                    {t("health.time")}
                  </Text>
                  <Text style={[styles.contractionHeaderText, { flex: 1 }]}>
                    {t("health.duration")}
                  </Text>
                  <Text style={[styles.contractionHeaderText, { flex: 1 }]}>
                    {t("health.interval")}
                  </Text>
                </View>

                <FlatList
                  data={contractions.items.slice(0, 10)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => {
                    // Calculate duration from start and end times
                    const startTime = new Date(item.start_time);
                    const endTime = item.end_time
                      ? new Date(item.end_time)
                      : new Date();
                    const durationSeconds = Math.floor(
                      (endTime.getTime() - startTime.getTime()) / 1000
                    );

                    // Calculate interval if not the first contraction
                    let intervalSeconds;
                    if (index < contractions.items.length - 1) {
                      const prevEndTime = new Date(
                        contractions.items[index + 1].end_time || ""
                      );
                      intervalSeconds = Math.floor(
                        (startTime.getTime() - prevEndTime.getTime()) / 1000
                      );
                    }

                    return (
                      <View style={styles.contractionHistoryItem}>
                        <Text
                          style={[styles.contractionHistoryText, { flex: 1 }]}
                        >
                          {format(startTime, "HH:mm:ss")}
                        </Text>
                        <Text
                          style={[styles.contractionHistoryText, { flex: 1 }]}
                        >
                          {formatSeconds(durationSeconds)}
                        </Text>
                        <Text
                          style={[styles.contractionHistoryText, { flex: 1 }]}
                        >
                          {intervalSeconds
                            ? formatSeconds(intervalSeconds)
                            : "-"}
                        </Text>
                      </View>
                    );
                  }}
                  style={styles.contractionList}
                />
              </View>
            )}
          </View>
        </View>

        {/* Symptom Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedSymptomType &&
                  t(`health.symptoms.${selectedSymptomType}`)}
              </Text>

              <Text style={styles.modalLabel}>{t("health.severityLabel")}</Text>
              <View style={styles.severityContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.severityButton,
                      symptomSeverity === level && styles.activeSeverityButton,
                    ]}
                    onPress={() => setSymptomSeverity(level)}
                  >
                    <Text
                      style={[
                        styles.severityButtonText,
                        symptomSeverity === level &&
                          styles.activeSeverityButtonText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>{t("health.notesLabel")}</Text>
              <TextInput
                style={styles.notesInput}
                value={symptomNotes}
                onChangeText={setSymptomNotes}
                placeholder={t("health.notesPlaceholder")}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveSymptomDetails}
                >
                  <Text style={styles.modalButtonText}>{t("common.save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* End Kick Session Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={endSessionModalVisible}
          onRequestClose={() => setEndSessionModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t("health.endKickSession")}
              </Text>

              <Text style={styles.kickSessionSummary}>
                {t("health.kickSessionSummary", {
                  count: kickCounts.currentSession?.count || 0,
                  time: formatTimeElapsed(),
                })}
              </Text>

              <Text style={styles.modalLabel}>{t("health.notesLabel")}</Text>
              <TextInput
                style={styles.notesInput}
                value={kickSessionNotes}
                onChangeText={setKickSessionNotes}
                placeholder={t("health.kickNotesPlaceholder")}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEndSessionModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={confirmEndKickCounter}
                >
                  <Text style={styles.modalButtonText}>
                    {t("health.endSession")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Weight Log Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={weightModalVisible}
          onRequestClose={() => setWeightModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t("health.addWeight")}</Text>

              <Text style={styles.modalLabel}>{t("health.weight")}</Text>
              <TextInput
                style={styles.weightInput}
                value={weight}
                onChangeText={setWeight}
                placeholder={t("health.weightPlaceholder")}
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>{t("health.notesLabel")}</Text>
              <TextInput
                style={styles.notesInput}
                value={weightNotes}
                onChangeText={setWeightNotes}
                placeholder={t("health.weightNotesPlaceholder")}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setWeightModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveWeightLog}
                >
                  <Text style={styles.modalButtonText}>{t("common.save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Contraction Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={contractionModalVisible}
          onRequestClose={() => setContractionModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t("health.contractionDetails")}
              </Text>

              <Text style={styles.contractionSummary}>
                {contractions.currentContraction && (
                  <React.Fragment>
                    {t("health.contractionSummary", {
                      duration: formatSeconds(
                        contractionEndTime && contractionStartTime
                          ? Math.floor(
                              (contractionEndTime.getTime() -
                                contractionStartTime.getTime()) /
                                1000
                            )
                          : 0
                      ),
                      interval:
                        contractions.items.length > 1
                          ? formatSeconds(
                              Math.floor(
                                (new Date(
                                  contractions.currentContraction.start_time
                                ).getTime() -
                                  new Date(
                                    contractions.items[1].end_time || ""
                                  ).getTime()) /
                                  1000
                              )
                            )
                          : t("health.firstContraction"),
                    })}
                  </React.Fragment>
                )}
              </Text>

              <Text style={styles.modalLabel}>
                {t("health.intensityLabel")}
              </Text>
              <View style={styles.severityContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.severityButton,
                      contractionIntensity === level &&
                        styles.activeSeverityButton,
                    ]}
                    onPress={() => setContractionIntensity(level)}
                  >
                    <Text
                      style={[
                        styles.severityButtonText,
                        contractionIntensity === level &&
                          styles.activeSeverityButtonText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>{t("health.notesLabel")}</Text>
              <TextInput
                style={styles.notesInput}
                value={contractionNotes}
                onChangeText={setContractionNotes}
                placeholder={t("health.contractionNotesPlaceholder")}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setContractionModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveContractionDetails}
                >
                  <Text style={styles.modalButtonText}>{t("common.save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
});

export default HealthTrackerScreen;
