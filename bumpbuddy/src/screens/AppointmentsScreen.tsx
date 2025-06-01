import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import FontedText from '@/components/FontedText';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import ThemedView from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

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
      id: '1',
      title: 'First Prenatal Checkup',
      dateTime: new Date(2024, 4, 15, 10, 0),
      notes: 'Bring insurance card and ID',
      reminder: true,
    },
    {
      id: '2',
      title: 'Ultrasound',
      dateTime: new Date(2024, 5, 20, 14, 30),
      notes: 'Gender reveal ultrasound',
      reminder: true,
    },
  ]);

  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handler for adding new appointment
  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setAppointmentTitle('');
    setAppointmentNotes('');
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
    setAppointments(appointments.filter(appointment => appointment.id !== id));
  };

  // Handler for saving appointment
  const handleSaveAppointment = () => {
    if (!appointmentTitle.trim()) {
      alert(t('appointments.titleRequired'));
      return;
    }

    if (editingAppointment) {
      // Update existing appointment
      setAppointments(
        appointments.map(appointment =>
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
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    return (
      <ThemedView
        backgroundColor='surface'
        className='p-4 mb-4 shadow rounded-xl'
      >
        <View className='flex-row justify-between items-center mb-2.5'>
          <FontedText variant='heading-4' className='flex-1'>
            {item.title}
          </FontedText>
          <View className='flex-row'>
            <TouchableOpacity
              className='px-2.5 py-1.5 rounded bg-yellow-500 mr-2.5'
              onPress={() => handleEditAppointment(item)}
            >
              <FontedText className='text-sm font-medium text-white'>
                {t('common.buttons.edit')}
              </FontedText>
            </TouchableOpacity>
            <TouchableOpacity
              className='px-2.5 py-1.5 rounded bg-red-500'
              onPress={() => handleDeleteAppointment(item.id)}
            >
              <FontedText className='text-sm font-medium text-white'>
                {t('common.buttons.delete')}
              </FontedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className='mt-1'>
          <View className='flex-row mb-1'>
            <FontedText
              variant='body-small'
              colorVariant='secondary'
              className='w-[70px]'
            >
              {t('appointments.dateTimeLabel')}:
            </FontedText>
            <FontedText variant='body-small' className='flex-1'>
              {formatDate(item.dateTime)}
            </FontedText>
          </View>

          <View className='flex-row mb-1'>
            <FontedText
              variant='body-small'
              colorVariant='secondary'
              className='w-[70px]'
            >
              {t('appointments.timeLabel')}:
            </FontedText>
            <FontedText variant='body-small' className='flex-1'>
              {formatTime(item.dateTime)}
            </FontedText>
          </View>

          {item.notes && (
            <View className='flex-row mb-1'>
              <FontedText
                variant='body-small'
                colorVariant='secondary'
                className='w-[70px]'
              >
                {t('appointments.notesLabel')}:
              </FontedText>
              <FontedText variant='body-small' className='flex-1'>
                {item.notes}
              </FontedText>
            </View>
          )}

          <View className='flex-row mb-1'>
            <FontedText
              variant='body-small'
              colorVariant='secondary'
              className='w-[70px]'
            >
              {t('appointments.reminderLabel')}:
            </FontedText>
            <FontedText variant='body-small' className='flex-1'>
              {item.reminder ? t('common.yes') : t('common.no')}
            </FontedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  return (
    <SafeAreaWrapper>
      <ThemedView className='flex-1 p-5'>
        <FontedText variant='heading-2' className='mb-5'>
          {t('appointments.title')}
        </FontedText>

        <TouchableOpacity
          className='items-center p-4 mb-5 bg-primary rounded-xl'
          onPress={handleAddAppointment}
        >
          <FontedText className='text-base font-bold text-white'>
            + {t('appointments.addButton')}
          </FontedText>
        </TouchableOpacity>

        {appointments.length > 0 ? (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={item => item.id}
            className='flex-1'
          />
        ) : (
          <View className='items-center justify-center flex-1 p-5'>
            <FontedText
              variant='heading-3'
              colorVariant='secondary'
              className='mb-2.5'
            >
              {t('appointments.noAppointments')}
            </FontedText>
            <FontedText
              variant='body-small'
              colorVariant='secondary'
              className='text-center'
            >
              {t('appointments.tapToAddAppointment')}
            </FontedText>
          </View>
        )}

        {/* Appointment Modal */}
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className='items-center justify-center flex-1 px-5 bg-black/50'>
            <ThemedView
              backgroundColor='surface'
              className='rounded-xl p-5 w-full max-h-[90%]'
            >
              <FontedText variant='heading-3' className='mb-5 text-center'>
                {editingAppointment
                  ? t('appointments.editAppointment')
                  : t('appointments.addNewAppointment')}
              </FontedText>

              <FontedText variant='body' className='mb-1'>
                {t('appointments.titleLabel')}
              </FontedText>
              <TextInput
                className='border border-gray-300 rounded p-2.5 mb-4 text-base'
                value={appointmentTitle}
                onChangeText={setAppointmentTitle}
                placeholder={t('appointments.titlePlaceholder')}
              />

              <FontedText variant='body' className='mb-1'>
                {t('appointments.dateLabel')}
              </FontedText>
              <TouchableOpacity
                className='p-3 mb-4 border border-gray-300 rounded'
                onPress={() => setShowDatePicker(true)}
              >
                <FontedText>{formatDate(appointmentDate)}</FontedText>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode='date'
                  display='default'
                  onChange={onDateChange}
                />
              )}

              <FontedText variant='body' className='mb-1'>
                {t('appointments.timeLabel')}
              </FontedText>
              <TouchableOpacity
                className='p-3 mb-4 border border-gray-300 rounded'
                onPress={() => setShowTimePicker(true)}
              >
                <FontedText>{formatTime(appointmentDate)}</FontedText>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode='time'
                  display='default'
                  onChange={onTimeChange}
                />
              )}

              <FontedText variant='body' className='mb-1'>
                {t('appointments.notesLabel')}
              </FontedText>
              <TextInput
                className='border border-gray-300 rounded p-2.5 mb-4 text-base h-[100px]'
                style={{ textAlignVertical: 'top' }}
                value={appointmentNotes}
                onChangeText={setAppointmentNotes}
                placeholder={t('appointments.notesPlaceholder')}
                multiline
              />

              <FontedText variant='body' className='mb-1'>
                {t('appointments.reminderLabel')}
              </FontedText>
              <View className='flex-row mb-5'>
                <TouchableOpacity
                  className={`flex-1 py-2.5 items-center rounded ${
                    appointmentReminder ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setAppointmentReminder(!appointmentReminder)}
                >
                  <FontedText
                    className={
                      appointmentReminder ? 'text-white' : 'text-gray-700'
                    }
                  >
                    {appointmentReminder ? t('common.yes') : t('common.no')}
                  </FontedText>
                </TouchableOpacity>
              </View>

              <View className='flex-row justify-between'>
                <TouchableOpacity
                  className='flex-1 p-4 rounded bg-gray-500 mr-2.5 items-center'
                  onPress={() => setModalVisible(false)}
                >
                  <FontedText className='text-base font-bold text-white'>
                    {t('common.buttons.cancel')}
                  </FontedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className='items-center flex-1 p-4 rounded bg-primary'
                  onPress={handleSaveAppointment}
                >
                  <FontedText className='text-base font-bold text-white'>
                    {t('common.buttons.save')}
                  </FontedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default AppointmentsScreen;
