import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define types
interface Appointment {
  id: string;
  title: string;
  dateTime: Date;
  notes: string;
  reminder: boolean;
}

const AppointmentsScreen = () => {
  const { t } = useTranslation();

  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      title: "First Prenatal Checkup",
      dateTime: new Date(2024, 4, 15, 10, 0),
      notes: "Bring insurance card and ID",
      reminder: true,
    },
    {
      id: "2",
      title: "Ultrasound",
      dateTime: new Date(2024, 5, 20, 14, 30),
      notes: "Gender reveal ultrasound",
      reminder: true,
    },
  ]);

  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handler for adding new appointment
  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setAppointmentTitle("");
    setAppointmentNotes("");
    setAppointmentDate(new Date());
    setAppointmentReminder(true);
    setModalVisible(true);
  };

  // Handler for editing appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentTitle(appointment.title);
    setAppointmentNotes(appointment.notes);
    setAppointmentDate(appointment.dateTime);
    setAppointmentReminder(appointment.reminder);
    setModalVisible(true);
  };

  // Handler for deleting appointment
  const handleDeleteAppointment = (id: string) => {
    setAppointments(
      appointments.filter((appointment) => appointment.id !== id)
    );
  };

  // Handler for saving appointment
  const handleSaveAppointment = () => {
    if (!appointmentTitle.trim()) {
      alert(t("appointments.titleRequired"));
      return;
    }

    if (editingAppointment) {
      // Update existing appointment
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === editingAppointment.id
            ? {
                ...appointment,
                title: appointmentTitle,
                dateTime: appointmentDate,
                notes: appointmentNotes,
                reminder: appointmentReminder,
              }
            : appointment
        )
      );
    } else {
      // Add new appointment
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        title: appointmentTitle,
        dateTime: appointmentDate,
        notes: appointmentNotes,
        reminder: appointmentReminder,
      };

      setAppointments([...appointments, newAppointment]);
    }

    setModalVisible(false);
  };

  // Handler for date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      // Preserve the time from the current appointmentDate
      const newDate = new Date(selectedDate);
      newDate.setHours(appointmentDate.getHours());
      newDate.setMinutes(appointmentDate.getMinutes());
      setAppointmentDate(newDate);
    }
  };

  // Handler for time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      // Preserve the date from the current appointmentDate
      const newDate = new Date(appointmentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setAppointmentDate(newDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    return (
      <View style={styles.appointmentItem}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentTitle}>{item.title}</Text>
          <View style={styles.appointmentActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditAppointment(item)}
            >
              <Text style={styles.actionButtonText}>
                {t("common.buttons.edit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteAppointment(item.id)}
            >
              <Text style={styles.actionButtonText}>
                {t("common.buttons.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.appointmentDetail}>
            <Text style={styles.detailLabel}>
              {t("appointments.dateTimeLabel")}:
            </Text>
            <Text style={styles.detailValue}>{formatDate(item.dateTime)}</Text>
          </View>

          <View style={styles.appointmentDetail}>
            <Text style={styles.detailLabel}>
              {t("appointments.timeLabel")}:
            </Text>
            <Text style={styles.detailValue}>{formatTime(item.dateTime)}</Text>
          </View>

          {item.notes && (
            <View style={styles.appointmentDetail}>
              <Text style={styles.detailLabel}>
                {t("appointments.notesLabel")}:
              </Text>
              <Text style={styles.detailValue}>{item.notes}</Text>
            </View>
          )}

          <View style={styles.appointmentDetail}>
            <Text style={styles.detailLabel}>
              {t("appointments.reminderLabel")}:
            </Text>
            <Text style={styles.detailValue}>
              {item.reminder ? t("common.yes") : t("common.no")}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("appointments.title")}</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
        <Text style={styles.addButtonText}>
          + {t("appointments.addButton")}
        </Text>
      </TouchableOpacity>

      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id}
          style={styles.appointmentsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t("appointments.noAppointments")}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {t("appointments.tapToAddAppointment")}
          </Text>
        </View>
      )}

      {/* Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAppointment
                ? t("appointments.editAppointment")
                : t("appointments.addNewAppointment")}
            </Text>

            <Text style={styles.inputLabel}>
              {t("appointments.titleLabel")}
            </Text>
            <TextInput
              style={styles.input}
              value={appointmentTitle}
              onChangeText={setAppointmentTitle}
              placeholder={t("appointments.titlePlaceholder")}
            />

            <Text style={styles.inputLabel}>{t("appointments.dateLabel")}</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formatDate(appointmentDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <Text style={styles.inputLabel}>{t("appointments.timeLabel")}</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{formatTime(appointmentDate)}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.inputLabel}>
              {t("appointments.notesLabel")}
            </Text>
            <TextInput
              style={styles.textArea}
              value={appointmentNotes}
              onChangeText={setAppointmentNotes}
              placeholder={t("appointments.notesPlaceholder")}
              multiline
            />

            <Text style={styles.inputLabel}>
              {t("appointments.reminderLabel")}
            </Text>
            <View style={styles.reminderToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.reminderToggle,
                  appointmentReminder
                    ? styles.reminderToggleActive
                    : styles.reminderToggleInactive,
                ]}
                onPress={() => setAppointmentReminder(!appointmentReminder)}
              >
                <Text
                  style={[
                    styles.reminderToggleText,
                    appointmentReminder
                      ? styles.reminderToggleTextActive
                      : styles.reminderToggleTextInactive,
                  ]}
                >
                  {appointmentReminder ? t("common.yes") : t("common.no")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {t("common.buttons.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveAppointment}
              >
                <Text style={styles.modalButtonText}>
                  {t("common.buttons.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    flex: 1,
  },
  appointmentActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  appointmentDetails: {
    marginTop: 5,
  },
  appointmentDetail: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: "#343a40",
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c757d",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#343a40",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#343a40",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  reminderToggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  reminderToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#e9ecef",
    marginRight: 10,
    borderRadius: 5,
  },
  reminderToggleActive: {
    backgroundColor: "#007bff",
  },
  reminderToggleInactive: {
    backgroundColor: "#e9ecef",
  },
  reminderToggleText: {
    fontSize: 16,
    color: "#495057",
  },
  reminderToggleTextActive: {
    color: "white",
  },
  reminderToggleTextInactive: {
    color: "#495057",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 15,
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

export default AppointmentsScreen;
