import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define types
interface Symptom {
  id: string;
  name: string;
  description: string;
  active: boolean;
  severity?: number; // 1-5 scale
  notes?: string;
}

const HealthTrackerScreen = () => {
  // State for symptoms
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    {
      id: "1",
      name: "Nausea",
      description: "Morning sickness or general nausea",
      active: false,
    },
    {
      id: "2",
      name: "Fatigue",
      description: "Feeling unusually tired",
      active: false,
    },
    {
      id: "3",
      name: "Headache",
      description: "Pain or pressure in the head",
      active: false,
    },
    {
      id: "4",
      name: "Backache",
      description: "Lower or upper back pain",
      active: false,
    },
    {
      id: "5",
      name: "Swelling",
      description: "Swelling in feet, ankles, or hands",
      active: false,
    },
    {
      id: "6",
      name: "Heartburn",
      description: "Burning sensation in the chest",
      active: false,
    },
  ]);

  // State for kick counter
  const [kickCount, setKickCount] = useState(0);
  const [kickCounterActive, setKickCounterActive] = useState(false);
  const [kickStartTime, setKickStartTime] = useState<Date | null>(null);

  // State for symptom detail modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [symptomNotes, setSymptomNotes] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState(3);

  // Handler for toggling a symptom
  const toggleSymptom = (symptom: Symptom) => {
    const updatedSymptoms = symptoms.map((s) =>
      s.id === symptom.id ? { ...s, active: !s.active } : s
    );
    setSymptoms(updatedSymptoms);

    // If activating a symptom, show modal for details
    if (!symptom.active) {
      setSelectedSymptom(symptom);
      setSymptomNotes(symptom.notes || "");
      setSymptomSeverity(symptom.severity || 3);
      setModalVisible(true);
    }
  };

  // Handler for saving symptom details
  const saveSymptomDetails = () => {
    if (!selectedSymptom) return;

    const updatedSymptoms = symptoms.map((s) =>
      s.id === selectedSymptom.id
        ? { ...s, notes: symptomNotes, severity: symptomSeverity }
        : s
    );

    setSymptoms(updatedSymptoms);
    setModalVisible(false);
  };

  // Handler for kick counter
  const handleKickCounter = () => {
    if (!kickCounterActive) {
      // Start counter
      setKickCounterActive(true);
      setKickStartTime(new Date());
      setKickCount(0);
    } else {
      // Record a kick
      setKickCount((prevCount) => prevCount + 1);
    }
  };

  // Handler for ending kick count session
  const endKickCounter = () => {
    setKickCounterActive(false);
    // In a real app, we would save this data
    alert(`Kick counting session ended. Total kicks: ${kickCount}`);
  };

  // Format time for display
  const formatTimeElapsed = () => {
    if (!kickStartTime) return "00:00";

    const now = new Date();
    const diffMs = now.getTime() - kickStartTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins.toString().padStart(2, "0")}:${diffSecs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Health Tracker</Text>

        {/* Symptoms Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Symptoms</Text>
          <Text style={styles.sectionDescription}>
            Track your pregnancy symptoms and their severity
          </Text>

          {symptoms.map((symptom) => (
            <View key={symptom.id} style={styles.symptomItem}>
              <View style={styles.symptomInfo}>
                <Text style={styles.symptomName}>{symptom.name}</Text>
                <Text style={styles.symptomDescription}>
                  {symptom.description}
                </Text>
                {symptom.active && symptom.severity && (
                  <Text style={styles.symptomSeverity}>
                    Severity: {symptom.severity}/5
                  </Text>
                )}
              </View>
              <Switch
                value={symptom.active}
                onValueChange={() => toggleSymptom(symptom)}
                trackColor={{ false: "#ced4da", true: "#007bff" }}
              />
            </View>
          ))}
        </View>

        {/* Kick Counter Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Kick Counter</Text>
          <Text style={styles.sectionDescription}>
            Track your baby's movements
          </Text>

          <View style={styles.kickCounterContainer}>
            <View style={styles.kickStats}>
              <View style={styles.kickStatItem}>
                <Text style={styles.kickStatValue}>{kickCount}</Text>
                <Text style={styles.kickStatLabel}>Kicks</Text>
              </View>

              <View style={styles.kickStatItem}>
                <Text style={styles.kickStatValue}>{formatTimeElapsed()}</Text>
                <Text style={styles.kickStatLabel}>Time</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.kickButton,
                kickCounterActive && styles.kickButtonActive,
              ]}
              onPress={handleKickCounter}
            >
              <Text style={styles.kickButtonText}>
                {kickCounterActive ? "Record Kick" : "Start Counting"}
              </Text>
            </TouchableOpacity>

            {kickCounterActive && (
              <TouchableOpacity
                style={styles.endButton}
                onPress={endKickCounter}
              >
                <Text style={styles.endButtonText}>End Session</Text>
              </TouchableOpacity>
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
              <Text style={styles.modalTitle}>{selectedSymptom?.name}</Text>

              <Text style={styles.modalLabel}>Severity (1-5)</Text>
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

              <Text style={styles.modalLabel}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={symptomNotes}
                onChangeText={setSymptomNotes}
                placeholder="Add any notes about this symptom..."
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveSymptomDetails}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
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
});

export default HealthTrackerScreen;
