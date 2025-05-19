import * as WebBrowser from "expo-web-browser";

import { enUS, es, fr } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  createAppointment,
  deleteAppointment,
  fetchAppointments,
  selectAppointmentError,
  selectAppointmentLoading,
  selectPastAppointments,
  selectUpcomingAppointments,
  updateAppointment,
} from "../redux/slices/appointmentSlice";
import { AppDispatch, RootState } from "../redux/store";
import { Appointment, DoctolibAppointment } from "../types/appointment";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import appointmentService from "../services/appointmentService";

const AppointmentsScreen = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const currentLanguage = i18n.language;

  // Get the date-fns locale object based on the current language
  const getDateLocale = () => {
    switch (currentLanguage) {
      case "fr":
        return fr;
      case "es":
        return es;
      default:
        return enUS;
    }
  };

  // Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const upcomingAppointments = useSelector(selectUpcomingAppointments);
  const pastAppointments = useSelector(selectPastAppointments);
  const loading = useSelector(selectAppointmentLoading);
  const error = useSelector(selectAppointmentError);

  // Local state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [appointmentReminderTime, setAppointmentReminderTime] = useState(30); // minutes
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showDoctolibModal, setShowDoctolibModal] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  // Add new state variables for Doctolib integration
  const [doctolibSuggestions, setDoctolibSuggestions] = useState<
    DoctolibAppointment[]
  >([]);
  const [showDoctolibSuggestionModal, setShowDoctolibSuggestionModal] =
    useState(false);
  const [selectedDoctolibAppointment, setSelectedDoctolibAppointment] =
    useState<DoctolibAppointment | null>(null);
  const [checkingExternalAppointments, setCheckingExternalAppointments] =
    useState(false);

  // Fetch appointments on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAppointments(user.id));
    }
  }, [dispatch, user?.id]);

  // Add useEffect to check for Doctolib appointments
  useEffect(() => {
    if (user?.id && currentLanguage === "fr") {
      checkForDoctolibAppointments();
    }
  }, [user?.id, currentLanguage]);

  // Handler for adding new appointment
  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setAppointmentTitle("");
    setAppointmentNotes("");
    setAppointmentDate(new Date());
    setAppointmentReminder(true);
    setAppointmentReminderTime(30);
    setAppointmentLocation("");
    setModalVisible(true);
  };

  // Handler for editing appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentTitle(appointment.title);
    setAppointmentNotes(appointment.notes || "");
    setAppointmentLocation(appointment.location || "");
    setAppointmentDate(new Date(appointment.date_time));
    setAppointmentReminder(appointment.reminder);
    setAppointmentReminderTime(appointment.reminder_time || 30);
    setModalVisible(true);
  };

  // Handler for deleting appointment
  const handleDeleteAppointment = (id: string) => {
    Alert.alert(
      t("appointments.deleteConfirmTitle"),
      t("appointments.deleteConfirmMessage"),
      [
        {
          text: t("common.buttons.cancel"),
          style: "cancel",
        },
        {
          text: t("common.buttons.delete"),
          style: "destructive",
          onPress: () => {
            dispatch(deleteAppointment(id));
          },
        },
      ]
    );
  };

  // Handler for saving appointment
  const handleSaveAppointment = () => {
    if (!appointmentTitle.trim()) {
      Alert.alert(t("appointments.error"), t("appointments.titleRequired"));
      return;
    }

    if (user?.id) {
      if (editingAppointment) {
        // Update existing appointment
        dispatch(
          updateAppointment({
            id: editingAppointment.id,
            appointment: {
              title: appointmentTitle,
              date_time: appointmentDate.toISOString(),
              notes: appointmentNotes,
              location: appointmentLocation,
              reminder: appointmentReminder,
              reminder_time: appointmentReminderTime,
            },
          })
        );
      } else {
        // Add new appointment
        dispatch(
          createAppointment({
            user_id: user.id,
            title: appointmentTitle,
            date_time: appointmentDate.toISOString(),
            notes: appointmentNotes,
            location: appointmentLocation,
            reminder: appointmentReminder,
            reminder_time: appointmentReminderTime,
          })
        );
      }

      setModalVisible(false);
    }
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
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "EEEE, MMMM d, yyyy", { locale: getDateLocale() });
  };

  // Format time for display
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "h:mm a", { locale: getDateLocale() });
  };

  // Handle opening Doctolib
  const handleOpenDoctolib = () => {
    setShowDoctolibModal(true);
  };

  // Handle Doctolib search
  const handleDoctolibSearch = async () => {
    try {
      await appointmentService.openDoctolibBooking(
        specialtySearch,
        locationSearch
      );
      setShowDoctolibModal(false);
    } catch (error) {
      console.error("Error opening Doctolib:", error);
      Alert.alert(
        t("appointments.doctolibError"),
        t("appointments.doctolibErrorMessage")
      );
    }
  };

  // Function to check for potential Doctolib appointments
  const checkForDoctolibAppointments = async () => {
    if (!user?.id) return;

    try {
      setCheckingExternalAppointments(true);

      // Check for newly created appointments
      // In a real implementation with Doctolib API, this would use a proper API call
      // For now, we use our mock implementation
      const appointments = await appointmentService.mockDoctolibAPICheck(
        user.id
      );

      if (appointments && appointments.length > 0) {
        setDoctolibSuggestions(appointments);
        setShowDoctolibSuggestionModal(true);
      }
    } catch (error) {
      console.error("Error checking for Doctolib appointments:", error);
    } finally {
      setCheckingExternalAppointments(false);
    }
  };

  // Handle adding a Doctolib appointment to our system
  const handleAddDoctolibAppointment = async (
    appointment: DoctolibAppointment
  ) => {
    if (!user?.id) return;

    try {
      // Add the appointment using our service
      await appointmentService.addDoctolibAppointment(user.id, appointment);

      // Refresh the appointments list
      dispatch(fetchAppointments(user.id));

      // Close the suggestion modal
      setShowDoctolibSuggestionModal(false);

      // Show success message
      Alert.alert(
        t("appointments.appointmentAdded"),
        t("appointments.doctolibAppointmentImported")
      );
    } catch (error) {
      console.error("Error adding Doctolib appointment:", error);
      Alert.alert(
        t("appointments.error"),
        t("appointments.errorImportingAppointment")
      );
    }
  };

  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    return (
      <ThemedView
        backgroundColor="surface"
        className="p-4 mb-4 shadow rounded-xl"
      >
        <View className="flex-row justify-between items-center mb-2.5">
          <FontedText variant="heading-4" className="flex-1">
            {item.title}
          </FontedText>
          <View className="flex-row">
            <TouchableOpacity
              className="px-2.5 py-1.5 rounded bg-yellow-500 mr-2.5"
              onPress={() => handleEditAppointment(item)}
            >
              <FontedText className="text-sm font-medium text-white">
                {t("common.buttons.edit")}
              </FontedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-2.5 py-1.5 rounded bg-red-500"
              onPress={() => handleDeleteAppointment(item.id)}
            >
              <FontedText className="text-sm font-medium text-white">
                {t("common.buttons.delete")}
              </FontedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-1">
          <View className="flex-row mb-1">
            <FontedText
              variant="body-small"
              colorVariant="secondary"
              className="w-[70px]"
            >
              {t("appointments.dateTimeLabel")}:
            </FontedText>
            <FontedText variant="body-small" className="flex-1">
              {formatDate(item.date_time)}
            </FontedText>
          </View>

          <View className="flex-row mb-1">
            <FontedText
              variant="body-small"
              colorVariant="secondary"
              className="w-[70px]"
            >
              {t("appointments.timeLabel")}:
            </FontedText>
            <FontedText variant="body-small" className="flex-1">
              {formatTime(item.date_time)}
            </FontedText>
          </View>

          {item.location && (
            <View className="flex-row mb-1">
              <FontedText
                variant="body-small"
                colorVariant="secondary"
                className="w-[70px]"
              >
                {t("appointments.locationLabel")}:
              </FontedText>
              <FontedText variant="body-small" className="flex-1">
                {item.location}
              </FontedText>
            </View>
          )}

          {item.doctor_name && (
            <View className="flex-row mb-1">
              <FontedText
                variant="body-small"
                colorVariant="secondary"
                className="w-[70px]"
              >
                {t("health.doctorLabel")}:
              </FontedText>
              <FontedText variant="body-small" className="flex-1">
                {item.doctor_name}
              </FontedText>
            </View>
          )}

          {item.specialty && (
            <View className="flex-row mb-1">
              <FontedText
                variant="body-small"
                colorVariant="secondary"
                className="w-[70px]"
              >
                {t("appointments.specialtyLabel")}:
              </FontedText>
              <FontedText variant="body-small" className="flex-1">
                {item.specialty}
              </FontedText>
            </View>
          )}

          {item.notes && (
            <View className="flex-row mb-1">
              <FontedText
                variant="body-small"
                colorVariant="secondary"
                className="w-[70px]"
              >
                {t("appointments.notesLabel")}:
              </FontedText>
              <FontedText variant="body-small" className="flex-1">
                {item.notes}
              </FontedText>
            </View>
          )}

          <View className="flex-row mb-1">
            <FontedText
              variant="body-small"
              colorVariant="secondary"
              className="w-[70px]"
            >
              {t("appointments.reminderLabel")}:
            </FontedText>
            <FontedText variant="body-small" className="flex-1">
              {item.reminder ? t("common.yes") : t("common.no")}
            </FontedText>
          </View>

          {item.external_service && (
            <View className="flex-row mb-1">
              <FontedText
                variant="body-small"
                colorVariant="secondary"
                className="w-[70px]"
              >
                {t("appointments.source")}:
              </FontedText>
              <FontedText variant="body-small" className="flex-1">
                {item.external_service}
                {item.external_url && (
                  <TouchableOpacity
                    onPress={() => {
                      if (item.external_url) {
                        WebBrowser.openBrowserAsync(item.external_url);
                      }
                    }}
                    className="ml-2"
                  >
                    <Ionicons name="open-outline" size={14} color="#0596DE" />
                  </TouchableOpacity>
                )}
              </FontedText>
            </View>
          )}
        </View>
      </ThemedView>
    );
  };

  // Show Doctolib button for French users
  const showDoctolibButton = currentLanguage === "fr";

  // Add the Doctolib suggestions modal
  const renderDoctolibSuggestionsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDoctolibSuggestionModal}
        onRequestClose={() => setShowDoctolibSuggestionModal(false)}
      >
        <View className="items-center justify-center flex-1 px-5 bg-black/50">
          <ThemedView
            backgroundColor="surface"
            className="rounded-xl p-5 w-full max-h-[90%]"
          >
            <FontedText variant="heading-3" className="mb-5 text-center">
              {t("appointments.importFromDoctolib")}
            </FontedText>

            <View className="items-center mb-5">
              <Ionicons name="medical" size={50} color="#0596DE" />
              <FontedText
                className="text-center mt-2 text-lg font-medium"
                style={{ color: "#0596DE" }}
              >
                Doctolib
              </FontedText>
            </View>

            <FontedText variant="body" className="mb-5 text-center">
              {t("appointments.doctolibAppointmentFound")}
            </FontedText>

            {doctolibSuggestions.map((appointment, index) => (
              <ThemedView
                key={index}
                backgroundColor="background"
                className="p-4 mb-4 rounded-lg"
              >
                <FontedText variant="heading-4" className="mb-2">
                  {t("appointments.appointmentWith")} {appointment.doctorName}
                </FontedText>
                <FontedText variant="body-small" className="mb-1">
                  {t("appointments.specialtyLabel")}: {appointment.specialty}
                </FontedText>
                <FontedText variant="body-small" className="mb-1">
                  {t("appointments.dateTimeLabel")}:{" "}
                  {format(new Date(appointment.dateTime), "PPP p", {
                    locale: getDateLocale(),
                  })}
                </FontedText>
                <FontedText variant="body-small" className="mb-3">
                  {t("appointments.locationLabel")}: {appointment.location}
                </FontedText>

                <TouchableOpacity
                  className="p-3 rounded"
                  style={{ backgroundColor: "#0596DE" }}
                  onPress={() => handleAddDoctolibAppointment(appointment)}
                >
                  <FontedText className="text-center text-white font-medium">
                    {t("appointments.importAppointment")}
                  </FontedText>
                </TouchableOpacity>
              </ThemedView>
            ))}

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="flex-1 p-4 rounded bg-gray-500 items-center"
                onPress={() => setShowDoctolibSuggestionModal(false)}
              >
                <FontedText className="text-base font-bold text-white">
                  {t("common.buttons.cancel")}
                </FontedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaWrapper>
      <ThemedView className="flex-1 p-5">
        <FontedText variant="heading-2" className="mb-3">
          {t("appointments.title")}
        </FontedText>

        {/* Tab buttons */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 p-2 items-center rounded-l-lg ${
              activeTab === "upcoming" ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("upcoming")}
          >
            <FontedText
              className={`font-medium ${
                activeTab === "upcoming" ? "text-white" : "text-gray-700"
              }`}
            >
              {t("appointments.upcomingTitle")}
            </FontedText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-2 items-center rounded-r-lg ${
              activeTab === "past" ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("past")}
          >
            <FontedText
              className={`font-medium ${
                activeTab === "past" ? "text-white" : "text-gray-700"
              }`}
            >
              {t("appointments.pastTitle")}
            </FontedText>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className="items-center flex-1 p-3 mr-2 rounded-lg bg-primary"
            onPress={handleAddAppointment}
          >
            <FontedText className="text-sm font-bold text-white">
              + {t("appointments.addButton")}
            </FontedText>
          </TouchableOpacity>

          {showDoctolibButton && (
            <TouchableOpacity
              className="items-center flex-1 p-3 ml-2 bg-blue-500 rounded-lg"
              onPress={handleOpenDoctolib}
            >
              <FontedText className="text-sm font-bold text-white">
                Doctolib
              </FontedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading state */}
        {loading && (
          <View className="items-center justify-center p-4">
            <ActivityIndicator size="large" color="#0000ff" />
            <FontedText className="mt-2">
              {t("common.labels.loading")}
            </FontedText>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View className="p-4 mb-4 bg-red-100 rounded-lg">
            <FontedText className="text-red-800">{error}</FontedText>
          </View>
        )}

        {/* Appointment list */}
        {!loading &&
          (activeTab === "upcoming" ? (
            upcomingAppointments.length > 0 ? (
              <FlatList
                data={upcomingAppointments}
                renderItem={renderAppointmentItem}
                keyExtractor={(item) => item.id}
                className="flex-1"
              />
            ) : (
              <View className="items-center justify-center flex-1 p-5">
                <FontedText
                  variant="heading-3"
                  colorVariant="secondary"
                  className="mb-2.5"
                >
                  {t("appointments.noAppointments")}
                </FontedText>
                <FontedText
                  variant="body-small"
                  colorVariant="secondary"
                  className="text-center"
                >
                  {t("appointments.tapToAddAppointment")}
                </FontedText>
              </View>
            )
          ) : pastAppointments.length > 0 ? (
            <FlatList
              data={pastAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={(item) => item.id}
              className="flex-1"
            />
          ) : (
            <View className="items-center justify-center flex-1 p-5">
              <FontedText
                variant="heading-3"
                colorVariant="secondary"
                className="mb-2.5"
              >
                {t("appointments.noPastAppointments")}
              </FontedText>
            </View>
          ))}

        {/* Appointment Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="items-center justify-center flex-1 px-5 bg-black/50">
            <ThemedView
              backgroundColor="surface"
              className="rounded-xl p-5 w-full max-h-[90%]"
            >
              <FontedText variant="heading-3" className="mb-5 text-center">
                {editingAppointment
                  ? t("appointments.editAppointment")
                  : t("appointments.addNewAppointment")}
              </FontedText>

              <FontedText variant="body" className="mb-1">
                {t("appointments.titleLabel")}
              </FontedText>
              <TextInput
                className="border border-gray-300 rounded p-2.5 mb-4 text-base"
                value={appointmentTitle}
                onChangeText={setAppointmentTitle}
                placeholder={t("appointments.titlePlaceholder")}
              />

              <FontedText variant="body" className="mb-1">
                {t("appointments.locationLabel")}
              </FontedText>
              <TextInput
                className="border border-gray-300 rounded p-2.5 mb-4 text-base"
                value={appointmentLocation}
                onChangeText={setAppointmentLocation}
                placeholder={t("appointments.locationPlaceholder")}
              />

              <FontedText variant="body" className="mb-1">
                {t("appointments.dateLabel")}
              </FontedText>
              <TouchableOpacity
                className="p-3 mb-4 border border-gray-300 rounded"
                onPress={() => setShowDatePicker(true)}
              >
                <FontedText>{formatDate(appointmentDate)}</FontedText>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              <FontedText variant="body" className="mb-1">
                {t("appointments.timeLabel")}
              </FontedText>
              <TouchableOpacity
                className="p-3 mb-4 border border-gray-300 rounded"
                onPress={() => setShowTimePicker(true)}
              >
                <FontedText>{formatTime(appointmentDate)}</FontedText>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}

              <FontedText variant="body" className="mb-1">
                {t("appointments.notesLabel")}
              </FontedText>
              <TextInput
                className="border border-gray-300 rounded p-2.5 mb-4 text-base h-[100px]"
                style={{ textAlignVertical: "top" }}
                value={appointmentNotes}
                onChangeText={setAppointmentNotes}
                placeholder={t("appointments.notesPlaceholder")}
                multiline
              />

              <FontedText variant="body" className="mb-1">
                {t("appointments.reminderLabel")}
              </FontedText>
              <View className="flex-row mb-5">
                <TouchableOpacity
                  className={`flex-1 py-2.5 items-center rounded ${
                    appointmentReminder ? "bg-primary" : "bg-gray-200"
                  }`}
                  onPress={() => setAppointmentReminder(!appointmentReminder)}
                >
                  <FontedText
                    className={
                      appointmentReminder ? "text-white" : "text-gray-700"
                    }
                  >
                    {appointmentReminder ? t("common.yes") : t("common.no")}
                  </FontedText>
                </TouchableOpacity>
              </View>

              {appointmentReminder && (
                <>
                  <FontedText variant="body" className="mb-1">
                    {t("appointments.reminderTimeLabel")}
                  </FontedText>
                  <View className="flex-row justify-between mb-5">
                    {[15, 30, 60, 120].map((minutes) => (
                      <TouchableOpacity
                        key={minutes}
                        className={`px-3 py-2 items-center rounded ${
                          appointmentReminderTime === minutes
                            ? "bg-primary"
                            : "bg-gray-200"
                        }`}
                        onPress={() => setAppointmentReminderTime(minutes)}
                      >
                        <FontedText
                          className={
                            appointmentReminderTime === minutes
                              ? "text-white"
                              : "text-gray-700"
                          }
                        >
                          {minutes} {t("appointments.minutesBefore")}
                        </FontedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 p-4 rounded bg-gray-500 mr-2.5 items-center"
                  onPress={() => setModalVisible(false)}
                >
                  <FontedText className="text-base font-bold text-white">
                    {t("common.buttons.cancel")}
                  </FontedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className="items-center flex-1 p-4 rounded bg-primary"
                  onPress={handleSaveAppointment}
                >
                  <FontedText className="text-base font-bold text-white">
                    {t("common.buttons.save")}
                  </FontedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </Modal>

        {/* Doctolib Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDoctolibModal}
          onRequestClose={() => setShowDoctolibModal(false)}
        >
          <View className="items-center justify-center flex-1 px-5 bg-black/50">
            <ThemedView
              backgroundColor="surface"
              className="rounded-xl p-5 w-full max-h-[90%]"
            >
              <FontedText variant="heading-3" className="mb-5 text-center">
                {t("appointments.findOnDoctolib")}
              </FontedText>

              <View className="items-center mb-5">
                <Ionicons name="medical" size={50} color="#0596DE" />
                <FontedText
                  className="mt-2 text-lg font-medium text-center"
                  style={{ color: "#0596DE" }}
                >
                  Doctolib
                </FontedText>
              </View>

              <FontedText variant="body" className="mb-1">
                {t("appointments.specialtyLabel")}
              </FontedText>
              <TextInput
                className="border border-gray-300 rounded p-2.5 mb-4 text-base"
                value={specialtySearch}
                onChangeText={setSpecialtySearch}
                placeholder={t("appointments.specialtyPlaceholder")}
              />

              <FontedText variant="body" className="mb-1">
                {t("appointments.cityLabel")}
              </FontedText>
              <TextInput
                className="border border-gray-300 rounded p-2.5 mb-5 text-base"
                value={locationSearch}
                onChangeText={setLocationSearch}
                placeholder={t("appointments.cityPlaceholder")}
              />

              <FontedText
                variant="body-small"
                className="mb-4 text-center text-gray-500"
              >
                {t("appointments.doctolibInfo")}
              </FontedText>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 p-4 rounded bg-gray-500 mr-2.5 items-center"
                  onPress={() => setShowDoctolibModal(false)}
                >
                  <FontedText className="text-base font-bold text-white">
                    {t("common.buttons.cancel")}
                  </FontedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className="items-center flex-1 p-4 rounded"
                  style={{ backgroundColor: "#0596DE" }}
                  onPress={handleDoctolibSearch}
                >
                  <FontedText className="text-base font-bold text-white">
                    {t("appointments.searchDoctolib")}
                  </FontedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </Modal>

        {/* Doctolib Suggestions Modal */}
        {renderDoctolibSuggestionsModal()}
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default AppointmentsScreen;
