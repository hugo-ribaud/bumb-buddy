import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addBloodPressureLog,
  addExerciseLog,
  addMoodLog,
  addSleepLog,
  addSymptom,
  addWeightLog,
  deleteBloodPressureLog,
  deleteExerciseLog,
  deleteMoodLog,
  deleteSleepLog,
  deleteSymptom,
  endContraction,
  endKickCount,
  fetchBloodPressureLogs,
  fetchContractions,
  fetchExerciseLogs,
  fetchKickCounts,
  fetchMoodLogs,
  fetchSleepLogs,
  fetchSymptoms,
  fetchWeightLogs,
  startContraction,
  startKickCount,
  updateBloodPressureLog,
  updateExerciseLog,
  updateKickCount,
  updateMoodLog,
  updateSleepLog,
} from '../redux/slices/healthSlice';
import { AppDispatch, RootState } from '../redux/store';

import FontedText from '@/components/FontedText';
import ThemedView from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  BloodPressureLog,
  ExerciseLog,
  MoodLog,
  SleepLog,
} from '../services/healthService';

// Define common symptom types
const SYMPTOM_TYPES = [
  {
    id: 'nausea',
    name: 'Nausea',
    description: 'Morning sickness or general nausea',
  },
  {
    id: 'fatigue',
    name: 'Fatigue',
    description: 'Feeling unusually tired',
  },
  {
    id: 'headache',
    name: 'Headache',
    description: 'Pain or pressure in the head',
  },
  {
    id: 'backache',
    name: 'Backache',
    description: 'Lower or upper back pain',
  },
  {
    id: 'swelling',
    name: 'Swelling',
    description: 'Swelling in feet, ankles, or hands',
  },
  {
    id: 'heartburn',
    name: 'Heartburn',
    description: 'Burning sensation in the chest',
  },
];

// Define common mood types
const MOOD_TYPES = [
  { id: 'happy', name: 'Happy' },
  { id: 'calm', name: 'Calm' },
  { id: 'anxious', name: 'Anxious' },
  { id: 'sad', name: 'Sad' },
  { id: 'irritable', name: 'Irritable' },
  { id: 'energetic', name: 'Energetic' },
  { id: 'tired', name: 'Tired' },
  { id: 'emotional', name: 'Emotional' },
  { id: 'stressed', name: 'Stressed' },
  { id: 'excited', name: 'Excited' },
];

// Define common mood triggers
const COMMON_TRIGGERS = [
  { id: 'sleep', name: 'Poor Sleep' },
  { id: 'food', name: 'Food/Hunger' },
  { id: 'hormones', name: 'Hormones' },
  { id: 'work', name: 'Work Stress' },
  { id: 'family', name: 'Family Issues' },
  { id: 'physical', name: 'Physical Discomfort' },
  { id: 'health', name: 'Health Concerns' },
  { id: 'social', name: 'Social Situation' },
];

// Define common sleep types
const SLEEP_TYPES = [
  { id: 'night', name: 'Night Sleep' },
  { id: 'nap', name: 'Nap' },
];

// Define common sleep disruptions
const COMMON_DISRUPTIONS = [
  { id: 'bathroom', name: 'Bathroom Breaks' },
  { id: 'discomfort', name: 'Physical Discomfort' },
  { id: 'movement', name: 'Baby Movement' },
  { id: 'heartburn', name: 'Heartburn' },
  { id: 'anxiety', name: 'Anxiety/Stress' },
  { id: 'noise', name: 'Noise/Environment' },
  { id: 'partner', name: 'Partner Disruption' },
];

// Define common exercise types
const EXERCISE_TYPES = [
  { id: 'walking', name: 'Walking' },
  { id: 'swimming', name: 'Swimming' },
  { id: 'yoga', name: 'Prenatal Yoga' },
  { id: 'stretching', name: 'Stretching' },
  { id: 'pilates', name: 'Pilates' },
  { id: 'cycling', name: 'Stationary Cycling' },
  { id: 'strength', name: 'Light Strength Training' },
  { id: 'dance', name: 'Dance' },
  { id: 'water', name: 'Water Aerobics' },
  { id: 'other', name: 'Other' },
];

const HealthTrackerScreen = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    symptoms,
    kickCounts,
    weightLogs,
    contractions,
    bloodPressureLogs,
    moodLogs,
    sleepLogs,
    exerciseLogs,
  } = useSelector((state: RootState) => state.health);

  // Local state for UI
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymptomType, setSelectedSymptomType] = useState<string | null>(
    null
  );
  const [symptomNotes, setSymptomNotes] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState(3);
  const [endSessionModalVisible, setEndSessionModalVisible] = useState(false);
  const [kickSessionNotes, setKickSessionNotes] = useState('');

  // Weight tracking state
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');

  // Contraction timer state
  const [contractionTimerActive, setContractionTimerActive] = useState(false);
  const [contractionStartTime, setContractionStartTime] = useState<Date | null>(
    null
  );
  const [contractionEndTime, setContractionEndTime] = useState<Date | null>(
    null
  );
  const [contractionIntensity, setContractionIntensity] = useState(3);
  const [contractionNotes, setContractionNotes] = useState('');
  const [contractionModalVisible, setContractionModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Blood pressure tracking state
  const [bpModalVisible, setBpModalVisible] = useState(false);
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [bpPulse, setBpPulse] = useState('');
  const [bpPosition, setBpPosition] = useState('sitting');
  const [bpArm, setBpArm] = useState('left');
  const [bpNotes, setBpNotes] = useState('');
  const [editingBpLog, setEditingBpLog] = useState<string | null>(null);

  // Mood tracking state
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [moodRating, setMoodRating] = useState(3);
  const [moodType, setMoodType] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [editingMoodLog, setEditingMoodLog] = useState<string | null>(null);

  // Sleep tracking state
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [sleepDuration, setSleepDuration] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepType, setSleepType] = useState('night');
  const [selectedDisruptions, setSelectedDisruptions] = useState<string[]>([]);
  const [customDisruption, setCustomDisruption] = useState('');
  const [sleepNotes, setSleepNotes] = useState('');
  const [editingSleepLog, setEditingSleepLog] = useState<string | null>(null);

  // Exercise tracking state
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState(3);
  const [heartRate, setHeartRate] = useState('');
  const [modifiedPositions, setModifiedPositions] = useState(false);
  const [feltContractions, setFeltContractions] = useState(false);
  const [feltDiscomfort, setFeltDiscomfort] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [editingExerciseLog, setEditingExerciseLog] = useState<string | null>(
    null
  );

  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSymptoms(user.id));
      dispatch(fetchKickCounts(user.id));
      dispatch(fetchWeightLogs(user.id));
      dispatch(fetchContractions(user.id));
      dispatch(fetchBloodPressureLogs(user.id));
      dispatch(fetchMoodLogs(user.id));
      dispatch(fetchSleepLogs(user.id));
      dispatch(fetchExerciseLogs(user.id));
    }
  }, [dispatch, user]);

  // Timer effect for contraction tracking
  useEffect(() => {
    if (contractionTimerActive && contractionStartTime) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
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
  const today = new Date().toISOString().split('T')[0];
  const todaysSymptoms = symptoms.items.filter(
    symptom => symptom.date === today
  );

  // Check if a symptom type is active today
  const isSymptomActiveToday = (symptomType: string) => {
    return todaysSymptoms.some(s => s.symptom_type === symptomType);
  };

  // Get symptom data for a specific type
  const getSymptomData = (symptomType: string) => {
    return todaysSymptoms.find(s => s.symptom_type === symptomType);
  };

  // Handler for toggling a symptom
  const toggleSymptom = (symptomType: string) => {
    const isActive = isSymptomActiveToday(symptomType);

    if (isActive) {
      // If active, find and delete the symptom
      const symptom = getSymptomData(symptomType);
      if (symptom && user?.id) {
        Alert.alert(
          t('health.removeSymptom'),
          t('health.confirmRemoveSymptom'),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
            },
            {
              text: t('common.remove'),
              onPress: () => {
                dispatch(deleteSymptom(symptom.id));
              },
              style: 'destructive',
            },
          ]
        );
      }
    } else {
      // If not active, show modal to add details
      setSelectedSymptomType(symptomType);
      setSymptomNotes('');
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
      time: new Date().toISOString().split('T')[1].substring(0, 8),
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
      setKickSessionNotes('');
    }
  };

  // Format time for display
  const formatTimeElapsed = () => {
    if (!kickCounts.currentSession?.start_time) return '00:00';

    const startTime = new Date(kickCounts.currentSession.start_time);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins.toString().padStart(2, '0')}:${diffSecs
      .toString()
      .padStart(2, '0')}`;
  };

  // Format seconds to minutes:seconds
  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
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
    setContractionNotes('');
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
    setWeight('');
    setWeightNotes('');
    setWeightModalVisible(true);
  };

  // Handler for saving weight log
  const saveWeightLog = () => {
    if (!user?.id || !weight) return;

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) {
      Alert.alert(
        t('common.errors.invalidInput'),
        t('health.invalidWeightValue')
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
    setBpSystolic('');
    setBpDiastolic('');
    setBpPulse('');
    setBpPosition('sitting');
    setBpArm('left');
    setBpNotes('');
    setEditingBpLog(null);
    setBpModalVisible(true);
  };

  // Handler for editing blood pressure log
  const handleEditBloodPressure = (bpLog: BloodPressureLog) => {
    setBpSystolic(bpLog.systolic.toString());
    setBpDiastolic(bpLog.diastolic.toString());
    setBpPulse(bpLog.pulse?.toString() || '');
    setBpPosition(bpLog.position || 'sitting');
    setBpArm(bpLog.arm || 'left');
    setBpNotes(bpLog.notes || '');
    setEditingBpLog(bpLog.id);
    setBpModalVisible(true);
  };

  // Handler for deleting blood pressure log
  const handleDeleteBloodPressure = (id: string) => {
    Alert.alert(
      t('health.deleteBloodPressure'),
      t('health.confirmDeleteBloodPressure'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          onPress: () => {
            dispatch(deleteBloodPressureLog(id));
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handler for saving blood pressure log
  const saveBloodPressureLog = () => {
    if (!user?.id || !bpSystolic || !bpDiastolic) {
      Alert.alert(
        t('common.errors.invalidInput'),
        t('health.invalidBloodPressureValues')
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
        t('common.errors.invalidInput'),
        t('health.invalidBloodPressureValues')
      );
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toISOString().split('T')[1].substring(0, 8);

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
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Mood tracking handlers
  const handleAddMood = () => {
    setMoodRating(3);
    setMoodType('');
    setSelectedTriggers([]);
    setCustomTrigger('');
    setMoodNotes('');
    setEditingMoodLog(null);
    setMoodModalVisible(true);
  };

  const handleEditMood = (moodLog: MoodLog) => {
    setMoodRating(moodLog.mood_rating);
    setMoodType(moodLog.mood_type);
    setSelectedTriggers(moodLog.triggers || []);
    setCustomTrigger('');
    setMoodNotes(moodLog.notes || '');
    setEditingMoodLog(moodLog.id);
    setMoodModalVisible(true);
  };

  const handleDeleteMood = (id: string) => {
    Alert.alert(t('health.deleteMood'), t('health.confirmDeleteMood'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.delete'),
        onPress: () => {
          if (user?.id) {
            dispatch(deleteMoodLog(id));
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const toggleTrigger = (triggerId: string) => {
    if (selectedTriggers.includes(triggerId)) {
      setSelectedTriggers(selectedTriggers.filter(id => id !== triggerId));
    } else {
      setSelectedTriggers([...selectedTriggers, triggerId]);
    }
  };

  const addCustomTrigger = () => {
    if (
      customTrigger.trim() !== '' &&
      !selectedTriggers.includes(customTrigger.trim())
    ) {
      setSelectedTriggers([...selectedTriggers, customTrigger.trim()]);
      setCustomTrigger('');
    }
  };

  const saveMoodLog = () => {
    if (!moodType || moodRating < 1) {
      Alert.alert(
        t('common.errors.invalidInput'),
        t('health.invalidMoodValues')
      );
      return;
    }

    if (user?.id) {
      const currentDate = new Date();
      const moodData = {
        user_id: user.id,
        date: currentDate.toISOString().split('T')[0],
        time: currentDate.toISOString().split('T')[1].substring(0, 8),
        mood_rating: moodRating,
        mood_type: moodType,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        notes: moodNotes.trim() || undefined,
      };

      if (editingMoodLog) {
        dispatch(
          updateMoodLog({
            id: editingMoodLog,
            updates: moodData,
          })
        );
      } else {
        dispatch(addMoodLog(moodData));
      }

      setMoodModalVisible(false);
      setMoodRating(3);
      setMoodType('');
      setSelectedTriggers([]);
      setCustomTrigger('');
      setMoodNotes('');
      setEditingMoodLog(null);
    }
  };

  // Sleep tracking handlers
  const handleAddSleep = () => {
    setSleepDuration('');
    setSleepQuality(3);
    setSleepType('night');
    setSelectedDisruptions([]);
    setCustomDisruption('');
    setSleepNotes('');
    setEditingSleepLog(null);
    setSleepModalVisible(true);
  };

  const handleEditSleep = (sleepLog: SleepLog) => {
    // Calculate duration in hours and minutes for display
    setSleepDuration(sleepLog.duration.toString());
    setSleepQuality(sleepLog.sleep_quality);
    setSleepType(sleepLog.sleep_type || 'night');
    setSelectedDisruptions(sleepLog.disruptions || []);
    setCustomDisruption('');
    setSleepNotes(sleepLog.notes || '');
    setEditingSleepLog(sleepLog.id);
    setSleepModalVisible(true);
  };

  const handleDeleteSleep = (id: string) => {
    Alert.alert(t('health.deleteSleep'), t('health.confirmDeleteSleep'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.delete'),
        onPress: () => {
          if (user?.id) {
            dispatch(deleteSleepLog(id));
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const toggleDisruption = (disruptionId: string) => {
    if (selectedDisruptions.includes(disruptionId)) {
      setSelectedDisruptions(
        selectedDisruptions.filter(id => id !== disruptionId)
      );
    } else {
      setSelectedDisruptions([...selectedDisruptions, disruptionId]);
    }
  };

  const addCustomDisruption = () => {
    if (
      customDisruption.trim() !== '' &&
      !selectedDisruptions.includes(customDisruption.trim())
    ) {
      setSelectedDisruptions([...selectedDisruptions, customDisruption.trim()]);
      setCustomDisruption('');
    }
  };

  const saveSleepLog = () => {
    if (!user?.id || !sleepDuration) {
      Alert.alert(
        t('common.errors.invalidInput'),
        t('health.invalidSleepValues')
      );
      return;
    }

    const durationValue = parseInt(sleepDuration, 10);

    if (isNaN(durationValue) || durationValue <= 0) {
      Alert.alert(
        t('common.errors.invalidInput'),
        t('health.invalidSleepDuration')
      );
      return;
    }

    const currentDate = new Date();
    const sleepData = {
      user_id: user.id,
      date: currentDate.toISOString().split('T')[0],
      time: currentDate.toISOString().split('T')[1].substring(0, 8),
      duration: durationValue,
      sleep_quality: sleepQuality,
      sleep_type: sleepType,
      disruptions:
        selectedDisruptions.length > 0 ? selectedDisruptions : undefined,
      notes: sleepNotes.trim() || undefined,
    };

    if (editingSleepLog) {
      dispatch(
        updateSleepLog({
          id: editingSleepLog,
          updates: sleepData,
        })
      );
    } else {
      dispatch(addSleepLog(sleepData));
    }

    setSleepModalVisible(false);
    setSleepDuration('');
    setSleepQuality(3);
    setSleepType('night');
    setSelectedDisruptions([]);
    setCustomDisruption('');
    setSleepNotes('');
    setEditingSleepLog(null);
  };

  // Format duration from minutes to hours and minutes
  const formatSleepDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  // Add Exercise log
  const handleAddExercise = () => {
    setExerciseType('');
    setExerciseDuration('');
    setExerciseIntensity(3);
    setHeartRate('');
    setModifiedPositions(false);
    setFeltContractions(false);
    setFeltDiscomfort(false);
    setExerciseNotes('');
    setEditingExerciseLog(null);
    setExerciseModalVisible(true);
  };

  // Edit Exercise log
  const handleEditExercise = (exerciseLog: ExerciseLog) => {
    setExerciseType(exerciseLog.exercise_type || '');
    setExerciseDuration(exerciseLog.duration.toString() || '');
    setExerciseIntensity(exerciseLog.intensity || 3);
    setHeartRate(exerciseLog.heart_rate?.toString() || '');
    setModifiedPositions(exerciseLog.modified_positions || false);
    setFeltContractions(exerciseLog.felt_contractions || false);
    setFeltDiscomfort(exerciseLog.felt_discomfort || false);
    setExerciseNotes(exerciseLog.notes || '');
    setEditingExerciseLog(exerciseLog.id);
    setExerciseModalVisible(true);
  };

  // Delete Exercise log
  const handleDeleteExercise = (id: string) => {
    Alert.alert(t('health.deleteExercise'), t('health.confirmDeleteExercise'), [
      {
        text: t('common.buttons.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.buttons.delete'),
        onPress: () => {
          if (user?.id) {
            dispatch(deleteExerciseLog(id));
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // Save Exercise log
  const saveExerciseLog = () => {
    if (
      !exerciseType ||
      !exerciseDuration ||
      isNaN(parseInt(exerciseDuration))
    ) {
      Alert.alert(
        t('common.errors.invalidInput'),
        t('health.invalidExerciseValues')
      );
      return;
    }

    if (user?.id) {
      const now = new Date();
      const exerciseData = {
        user_id: user.id,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        exercise_type: exerciseType,
        duration: parseInt(exerciseDuration),
        intensity: exerciseIntensity,
        modified_positions: modifiedPositions,
        heart_rate: heartRate ? parseInt(heartRate) : undefined,
        felt_contractions: feltContractions,
        felt_discomfort: feltDiscomfort,
        notes: exerciseNotes.trim() || undefined,
      };

      if (editingExerciseLog) {
        dispatch(
          updateExerciseLog({
            id: editingExerciseLog,
            updates: exerciseData,
          })
        );
      } else {
        dispatch(addExerciseLog(exerciseData));
      }

      setExerciseModalVisible(false);
      setExerciseType('');
      setExerciseDuration('');
      setExerciseIntensity(3);
      setHeartRate('');
      setModifiedPositions(false);
      setFeltContractions(false);
      setFeltDiscomfort(false);
      setExerciseNotes('');
      setEditingExerciseLog(null);
    }
  };

  return (
    <ThemedView backgroundColor='background' className='flex-1'>
      <ScrollView className='flex-1'>
        <View className='p-5'>
          <FontedText
            variant='heading-2'
            fontFamily='comfortaa'
            className='mb-4'
          >
            {t('health.title')}
          </FontedText>

          {/* Symptoms Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.dailySymptoms')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.symptomsDescription')}
            </FontedText>

            {symptoms.loading ? (
              <ActivityIndicator
                size='large'
                color='#87D9C4'
                className='my-4'
              />
            ) : (
              SYMPTOM_TYPES.map(symptom => {
                const isActive = isSymptomActiveToday(symptom.id);
                const symptomData = isActive
                  ? getSymptomData(symptom.id)
                  : null;

                return (
                  <View
                    key={symptom.id}
                    className='flex-row items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700'
                  >
                    <View className='flex-1 mr-3'>
                      <FontedText variant='body' className='font-medium'>
                        {t(`health.symptoms.${symptom.id}`)}
                      </FontedText>
                      <FontedText variant='caption' textType='secondary'>
                        {t(`health.symptomsDesc.${symptom.id}`)}
                      </FontedText>
                      {isActive && symptomData && (
                        <>
                          <FontedText
                            variant='body-small'
                            colorVariant='primary'
                            className='mt-1'
                          >
                            {t('health.severity')}: {symptomData.severity}/5
                          </FontedText>
                          {symptomData.notes && (
                            <FontedText
                              variant='caption'
                              className='mt-1 italic'
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
                      trackColor={{ false: '#ced4da', true: '#87D9C4' }}
                    />
                  </View>
                );
              })
            )}
          </ThemedView>

          {/* Kick Counter Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.kickCounter')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.kickCounterDescription')}
            </FontedText>

            <View className='items-center mb-4'>
              <View className='flex-row justify-around w-full mb-4'>
                <View className='items-center'>
                  <FontedText variant='heading-1' colorVariant='primary'>
                    {kickCounts.currentSession?.count || 0}
                  </FontedText>
                  <FontedText variant='caption' textType='secondary'>
                    {t('health.kicks')}
                  </FontedText>
                </View>

                <View className='items-center'>
                  <FontedText variant='heading-1' colorVariant='primary'>
                    {formatTimeElapsed()}
                  </FontedText>
                  <FontedText variant='caption' textType='secondary'>
                    {t('health.time')}
                  </FontedText>
                </View>
              </View>

              {kickCounts.loading ? (
                <ActivityIndicator
                  size='large'
                  color='#87D9C4'
                  className='my-4'
                />
              ) : (
                <>
                  <TouchableOpacity
                    className={`px-6 py-3 rounded-full mb-3 ${
                      kickCounts.currentSession
                        ? 'bg-primary dark:bg-primary-dark'
                        : 'bg-primary dark:bg-primary-dark'
                    }`}
                    onPress={handleKickCounter}
                  >
                    <FontedText className='font-bold text-white'>
                      {kickCounts.currentSession
                        ? t('health.recordKick')
                        : t('health.startCounting')}
                    </FontedText>
                  </TouchableOpacity>

                  {kickCounts.currentSession && (
                    <TouchableOpacity
                      className='px-6 py-3 rounded-full bg-accent dark:bg-accent-dark'
                      onPress={handleEndKickCounter}
                    >
                      <FontedText className='font-bold text-white'>
                        {t('health.endSession')}
                      </FontedText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </ThemedView>

          {/* Weight Tracker Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.weightTracker')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.weightTrackerDescription')}
            </FontedText>

            <View className='items-center mb-4'>
              {weightLogs.loading ? (
                <ActivityIndicator
                  size='large'
                  color='#87D9C4'
                  className='my-4'
                />
              ) : (
                <>
                  {latestWeightLog ? (
                    <View className='flex-row items-center justify-between mb-4'>
                      <FontedText variant='body' className='font-medium'>
                        {t('health.currentWeight')}
                      </FontedText>
                      <FontedText variant='body' className='font-bold'>
                        {latestWeightLog.weight} kg
                      </FontedText>
                    </View>
                  ) : (
                    <FontedText className='text-center text-gray-500'>
                      {t('health.noWeightData')}
                    </FontedText>
                  )}

                  <TouchableOpacity
                    className='px-6 py-3 rounded-full bg-primary dark:bg-primary-dark'
                    onPress={handleAddWeight}
                  >
                    <FontedText className='font-bold text-white'>
                      {t('health.addWeight')}
                    </FontedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ThemedView>

          {/* Blood Pressure Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.bloodPressure')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.bloodPressureDescription')}
            </FontedText>

            <View className='items-center mb-4'>
              {bloodPressureLogs.loading ? (
                <ActivityIndicator
                  size='large'
                  color='#87D9C4'
                  className='my-4'
                />
              ) : (
                <>
                  {bloodPressureLogs.items.length > 0 ? (
                    <View className='flex-row items-center justify-between w-full mb-4'>
                      <FontedText variant='body' className='font-medium'>
                        {t('health.currentBloodPressure')}
                      </FontedText>
                      <View className='items-end'>
                        <FontedText variant='heading-4' className='font-bold'>
                          {bloodPressureLogs.items[0].systolic}/
                          {bloodPressureLogs.items[0].diastolic} mmHg
                        </FontedText>
                        {bloodPressureLogs.items[0].pulse && (
                          <FontedText variant='caption' textType='secondary'>
                            {t('health.pulse')}:{' '}
                            {bloodPressureLogs.items[0].pulse} bpm
                          </FontedText>
                        )}
                      </View>
                    </View>
                  ) : (
                    <FontedText className='mb-4 text-center text-gray-500'>
                      {t('health.noBloodPressureData')}
                    </FontedText>
                  )}

                  <TouchableOpacity
                    className='px-6 py-3 mb-4 rounded-full bg-primary dark:bg-primary-dark'
                    onPress={handleAddBloodPressure}
                  >
                    <FontedText className='font-bold text-white'>
                      {t('health.addBloodPressure')}
                    </FontedText>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Blood Pressure History */}
            {bloodPressureLogs.items.length > 0 && (
              <View className='mt-2'>
                <FontedText
                  variant='heading-4'
                  fontFamily='comfortaa'
                  className='mb-2'
                >
                  {t('health.history')}
                </FontedText>

                {bloodPressureLogs.items.slice(0, 5).map(bpLog => (
                  <ThemedView
                    key={bpLog.id}
                    backgroundColor='background'
                    className='flex-row items-center justify-between p-3 mb-2 rounded-lg'
                  >
                    <View className='flex-1'>
                      <FontedText variant='body' className='font-bold'>
                        {bpLog.systolic}/{bpLog.diastolic} mmHg
                      </FontedText>
                      <View className='flex-row items-center mt-1'>
                        <FontedText variant='caption' textType='secondary'>
                          {formatDate(bpLog.date)}
                        </FontedText>
                        {bpLog.pulse && (
                          <FontedText
                            variant='caption'
                            textType='secondary'
                            className='ml-3'
                          >
                            {bpLog.pulse} bpm
                          </FontedText>
                        )}
                      </View>
                      {bpLog.notes && (
                        <FontedText variant='caption' className='mt-1 italic'>
                          {bpLog.notes.length > 50
                            ? `${bpLog.notes.substring(0, 50)}...`
                            : bpLog.notes}
                        </FontedText>
                      )}
                    </View>

                    <View className='flex-row'>
                      <TouchableOpacity
                        className='p-2 mr-2'
                        onPress={() => handleEditBloodPressure(bpLog)}
                      >
                        <FontedText colorVariant='primary'>
                          {t('common.buttons.edit')}
                        </FontedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className='p-2'
                        onPress={() => handleDeleteBloodPressure(bpLog.id)}
                      >
                        <FontedText colorVariant='accent'>
                          {t('common.buttons.delete')}
                        </FontedText>
                      </TouchableOpacity>
                    </View>
                  </ThemedView>
                ))}
              </View>
            )}
          </ThemedView>

          {/* Mood Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.moodTracker')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.moodTrackerDescription')}
            </FontedText>

            <View className='items-center mb-4'>
              {moodLogs.loading ? (
                <ActivityIndicator
                  size='large'
                  color='#87D9C4'
                  className='my-4'
                />
              ) : (
                <>
                  <TouchableOpacity
                    className='px-6 py-3 mb-4 rounded-full bg-primary-light'
                    onPress={handleAddMood}
                  >
                    <FontedText className='font-semibold text-center text-white'>
                      {t('health.addMood')}
                    </FontedText>
                  </TouchableOpacity>

                  {moodLogs.items.length > 0 && (
                    <View className='w-full mt-2'>
                      <FontedText
                        variant='body'
                        className='mt-4 mb-2 font-bold'
                      >
                        {t('health.moodHistory')}
                      </FontedText>

                      {moodLogs.items.slice(0, 5).map(log => (
                        <TouchableOpacity
                          key={log.id}
                          className='flex-row items-center justify-between p-3 mb-3 border border-neutral-200 dark:border-neutral-700 rounded-xl'
                          onPress={() => handleEditMood(log)}
                        >
                          <View className='flex-1'>
                            <View className='flex-row justify-between mb-1'>
                              <FontedText variant='body' className='font-bold'>
                                {t(`health.moodTypes.${log.mood_type}`) ||
                                  log.mood_type}
                              </FontedText>
                              <FontedText
                                variant='body-small'
                                textType='secondary'
                              >
                                {formatDate(log.date)},{' '}
                                {log.time.substring(0, 5)}
                              </FontedText>
                            </View>

                            <View className='flex-row mb-1'>
                              <FontedText
                                variant='body-small'
                                textType='secondary'
                                className='mr-1'
                              >
                                {t('health.moodRating')}:
                              </FontedText>
                              <FontedText variant='body-small'>
                                {log.mood_rating}/5
                              </FontedText>
                            </View>

                            {log.triggers && log.triggers.length > 0 && (
                              <View className='flex-row flex-wrap'>
                                <FontedText
                                  variant='body-small'
                                  textType='secondary'
                                  className='mr-1'
                                >
                                  {t('health.triggers')}:
                                </FontedText>
                                <FontedText
                                  variant='body-small'
                                  className='flex-1'
                                >
                                  {log.triggers
                                    .map(
                                      trigger =>
                                        t(`health.commonTriggers.${trigger}`) ||
                                        trigger
                                    )
                                    .join(', ')}
                                </FontedText>
                              </View>
                            )}

                            {log.notes && (
                              <FontedText variant='body-small' className='mt-1'>
                                {log.notes}
                              </FontedText>
                            )}
                          </View>

                          <TouchableOpacity
                            className='p-2 ml-2'
                            onPress={() => handleDeleteMood(log.id)}
                          >
                            <FontedText
                              variant='body-small'
                              textType='secondary'
                              className='text-red-500'
                            >
                              ✕
                            </FontedText>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {moodLogs.items.length === 0 && (
                    <FontedText
                      variant='body'
                      textType='secondary'
                      className='mt-2 text-center'
                    >
                      {t('health.noMoodData')}
                    </FontedText>
                  )}
                </>
              )}
            </View>
          </ThemedView>

          {/* Sleep Tracking Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.sleepTracker')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.sleepTrackerDescription')}
            </FontedText>

            <View className='items-center mb-4'>
              {sleepLogs.loading ? (
                <ActivityIndicator
                  size='large'
                  color='#87D9C4'
                  className='my-4'
                />
              ) : (
                <>
                  <TouchableOpacity
                    className='px-6 py-3 mb-4 rounded-full bg-primary-light'
                    onPress={handleAddSleep}
                  >
                    <FontedText className='font-semibold text-center text-white'>
                      {t('health.addSleep')}
                    </FontedText>
                  </TouchableOpacity>

                  {sleepLogs.items.length > 0 && (
                    <View className='w-full mt-2'>
                      <FontedText
                        variant='body'
                        className='mt-4 mb-2 font-bold'
                      >
                        {t('health.sleepHistory')}
                      </FontedText>

                      {sleepLogs.items.slice(0, 5).map(log => (
                        <TouchableOpacity
                          key={log.id}
                          className='flex-row items-center justify-between p-3 mb-3 border border-neutral-200 dark:border-neutral-700 rounded-xl'
                          onPress={() => handleEditSleep(log)}
                        >
                          <View className='flex-1'>
                            <View className='flex-row justify-between mb-1'>
                              <FontedText variant='body' className='font-bold'>
                                {t(`health.sleepTypes.${log.sleep_type}`) ||
                                  log.sleep_type}
                              </FontedText>
                              <FontedText
                                variant='body-small'
                                textType='secondary'
                              >
                                {formatDate(log.date)},{' '}
                                {log.time.substring(0, 5)}
                              </FontedText>
                            </View>

                            <View className='flex-row mb-1'>
                              <FontedText
                                variant='body-small'
                                textType='secondary'
                                className='mr-1'
                              >
                                {t('health.duration')}:
                              </FontedText>
                              <FontedText variant='body-small'>
                                {formatSleepDuration(log.duration)}
                              </FontedText>
                            </View>

                            <View className='flex-row mb-1'>
                              <FontedText
                                variant='body-small'
                                textType='secondary'
                                className='mr-1'
                              >
                                {t('health.quality')}:
                              </FontedText>
                              <FontedText variant='body-small'>
                                {log.sleep_quality}/5
                              </FontedText>
                            </View>

                            {log.disruptions && log.disruptions.length > 0 && (
                              <View className='flex-row flex-wrap'>
                                <FontedText
                                  variant='body-small'
                                  textType='secondary'
                                  className='mr-1'
                                >
                                  {t('health.disruptions')}:
                                </FontedText>
                                <FontedText
                                  variant='body-small'
                                  className='flex-1'
                                >
                                  {log.disruptions
                                    .map(
                                      disruption =>
                                        t(
                                          `health.commonDisruptions.${disruption}`
                                        ) || disruption
                                    )
                                    .join(', ')}
                                </FontedText>
                              </View>
                            )}

                            {log.notes && (
                              <FontedText variant='body-small' className='mt-1'>
                                {log.notes}
                              </FontedText>
                            )}
                          </View>

                          <TouchableOpacity
                            className='p-2 ml-2'
                            onPress={() => handleDeleteSleep(log.id)}
                          >
                            <FontedText
                              variant='body-small'
                              textType='secondary'
                              className='text-red-500'
                            >
                              ✕
                            </FontedText>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {sleepLogs.items.length === 0 && (
                    <FontedText
                      variant='body'
                      textType='secondary'
                      className='mt-2 text-center'
                    >
                      {t('health.noSleepData')}
                    </FontedText>
                  )}
                </>
              )}
            </View>
          </ThemedView>

          {/* Contraction Timer Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.contractionTimer')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.contractionTimerDescription')}
            </FontedText>

            <View className='items-center mb-4'>
              <View className='flex-row justify-around w-full mb-4'>
                <View className='items-center'>
                  <FontedText variant='heading-1' colorVariant='primary'>
                    {formatSeconds(timerSeconds)}
                  </FontedText>
                  <FontedText variant='caption' textType='secondary'>
                    {contractionTimerActive
                      ? t('health.contractionInProgress')
                      : t('health.readyToStart')}
                  </FontedText>
                </View>
              </View>

              <View className='flex-row justify-around w-full'>
                {!contractionTimerActive ? (
                  <TouchableOpacity
                    className='px-6 py-3 rounded-full bg-primary dark:bg-primary-dark'
                    onPress={handleStartContraction}
                  >
                    <FontedText className='font-bold text-white'>
                      {t('health.startContraction')}
                    </FontedText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className='px-6 py-3 rounded-full bg-accent dark:bg-accent-dark'
                    onPress={handleEndContraction}
                  >
                    <FontedText className='font-bold text-white'>
                      {t('health.endContraction')}
                    </FontedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ThemedView>

          {/* Exercise Tracker Section */}
          <ThemedView
            backgroundColor='surface'
            className='p-4 mb-6 shadow-sm rounded-xl'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-2'
            >
              {t('health.exerciseTracker')}
            </FontedText>
            <FontedText
              variant='body-small'
              textType='secondary'
              className='mb-4'
            >
              {t('health.exerciseTrackerDescription')}
            </FontedText>

            <View className='mb-4'>
              <TouchableOpacity
                className='items-center w-full px-6 py-3 mb-4 rounded-full bg-primary dark:bg-primary-dark'
                onPress={handleAddExercise}
              >
                <FontedText className='font-bold text-white'>
                  {t('health.addExercise')}
                </FontedText>
              </TouchableOpacity>

              <FontedText
                variant='body'
                fontFamily='comfortaa'
                className='mb-2'
              >
                {t('health.exerciseHistory')}
              </FontedText>

              {exerciseLogs.loading ? (
                <ActivityIndicator
                  size='large'
                  color='#87D9C4'
                  className='my-4'
                />
              ) : exerciseLogs.items.length === 0 ? (
                <FontedText className='my-4 text-center text-gray-500'>
                  {t('health.noExerciseData')}
                </FontedText>
              ) : (
                exerciseLogs.items.slice(0, 5).map(exerciseLog => (
                  <ThemedView
                    key={exerciseLog.id}
                    backgroundColor='background'
                    className='p-3 mb-3 border border-gray-200 rounded-lg dark:border-gray-700'
                  >
                    <View className='flex-row justify-between mb-1'>
                      <FontedText
                        variant='body'
                        colorVariant='primary'
                        className='font-medium'
                      >
                        {t(`health.exerciseTypes.${exerciseLog.exercise_type}`)}
                      </FontedText>
                      <FontedText variant='body-small' textType='secondary'>
                        {formatDate(exerciseLog.date)}
                      </FontedText>
                    </View>

                    <View className='flex-row flex-wrap mb-1'>
                      <ThemedView
                        backgroundColor='primary'
                        className='px-2 py-1 mb-1 mr-2 rounded-full'
                      >
                        <FontedText variant='caption' className='text-white'>
                          {exerciseLog.duration} {t('health.minutes')}
                        </FontedText>
                      </ThemedView>

                      <ThemedView
                        backgroundColor='primary'
                        className='px-2 py-1 mb-1 mr-2 rounded-full'
                      >
                        <FontedText variant='caption' className='text-white'>
                          {t('health.intensity')}: {exerciseLog.intensity}/5
                        </FontedText>
                      </ThemedView>

                      {exerciseLog.heart_rate && (
                        <ThemedView
                          backgroundColor='primary'
                          className='px-2 py-1 mb-1 mr-2 rounded-full'
                        >
                          <FontedText variant='caption' className='text-white'>
                            {exerciseLog.heart_rate} {t('health.bpm')}
                          </FontedText>
                        </ThemedView>
                      )}

                      {exerciseLog.modified_positions && (
                        <ThemedView
                          backgroundColor='primary'
                          className='px-2 py-1 mb-1 mr-2 rounded-full'
                        >
                          <FontedText variant='caption' className='text-white'>
                            {t('health.modifiedPositions')}
                          </FontedText>
                        </ThemedView>
                      )}

                      {exerciseLog.felt_contractions && (
                        <ThemedView
                          backgroundColor='accent'
                          className='px-2 py-1 mb-1 mr-2 rounded-full'
                        >
                          <FontedText variant='caption' className='text-white'>
                            {t('health.feltContractions')}
                          </FontedText>
                        </ThemedView>
                      )}

                      {exerciseLog.felt_discomfort && (
                        <ThemedView
                          backgroundColor='accent'
                          className='px-2 py-1 mb-1 mr-2 rounded-full'
                        >
                          <FontedText variant='caption' className='text-white'>
                            {t('health.feltDiscomfort')}
                          </FontedText>
                        </ThemedView>
                      )}
                    </View>

                    {exerciseLog.notes && (
                      <FontedText variant='caption' className='mt-1 italic'>
                        {exerciseLog.notes}
                      </FontedText>
                    )}

                    <View className='flex-row justify-end mt-2'>
                      <TouchableOpacity
                        className='mr-4'
                        onPress={() => handleEditExercise(exerciseLog)}
                      >
                        <FontedText variant='body-small' colorVariant='primary'>
                          {t('common.buttons.edit')}
                        </FontedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteExercise(exerciseLog.id)}
                      >
                        <FontedText variant='body-small' colorVariant='accent'>
                          {t('common.buttons.delete')}
                        </FontedText>
                      </TouchableOpacity>
                    </View>
                  </ThemedView>
                ))
              )}
            </View>

            <FontedText
              variant='caption'
              textType='secondary'
              className='mt-2 text-center'
            >
              {t('health.exerciseWarning')}
            </FontedText>
          </ThemedView>
        </View>
      </ScrollView>

      {/* Blood Pressure Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={bpModalVisible}
        onRequestClose={() => setBpModalVisible(false)}
      >
        <View className='items-center justify-center flex-1 bg-black/50'>
          <ThemedView
            backgroundColor='surface'
            className='w-[90%] rounded-xl p-6 max-w-md shadow-md'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-4 text-center'
            >
              {editingBpLog
                ? t('health.editBloodPressure')
                : t('health.addBloodPressure')}
            </FontedText>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-2'>
                {t('health.systolic')} (mmHg) *
              </FontedText>
              <View className='flex-row px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='flex-1 text-base text-gray-800 dark:text-gray-200'
                  value={bpSystolic}
                  onChangeText={setBpSystolic}
                  keyboardType='number-pad'
                  placeholder={t('health.systolicPlaceholder')}
                  placeholderTextColor='#9CA3AF'
                />
              </View>

              <FontedText variant='body' className='mb-2'>
                {t('health.diastolic')} (mmHg) *
              </FontedText>
              <View className='flex-row px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='flex-1 text-base text-gray-800 dark:text-gray-200'
                  value={bpDiastolic}
                  onChangeText={setBpDiastolic}
                  keyboardType='number-pad'
                  placeholder={t('health.diastolicPlaceholder')}
                  placeholderTextColor='#9CA3AF'
                />
              </View>

              <FontedText variant='body' className='mb-2'>
                {t('health.pulse')} (bpm)
              </FontedText>
              <View className='flex-row px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='flex-1 text-base text-gray-800 dark:text-gray-200'
                  value={bpPulse}
                  onChangeText={setBpPulse}
                  keyboardType='number-pad'
                  placeholder={t('health.pulsePlaceholder')}
                  placeholderTextColor='#9CA3AF'
                />
              </View>

              <FontedText variant='body' className='mb-2'>
                {t('health.position')}
              </FontedText>
              <View className='flex-row justify-between mb-4'>
                {['sitting', 'standing', 'lying'].map(pos => (
                  <TouchableOpacity
                    key={pos}
                    className={`py-2 px-4 rounded-full border ${
                      bpPosition === pos
                        ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onPress={() => setBpPosition(pos)}
                  >
                    <FontedText
                      className={bpPosition === pos ? 'text-white' : ''}
                    >
                      {t(`health.positions.${pos}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>

              <FontedText variant='body' className='mb-2'>
                {t('health.arm')}
              </FontedText>
              <View className='flex-row justify-around mb-4'>
                {['left', 'right'].map(arm => (
                  <TouchableOpacity
                    key={arm}
                    className={`py-2 px-8 rounded-full border ${
                      bpArm === arm
                        ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onPress={() => setBpArm(arm)}
                  >
                    <FontedText className={bpArm === arm ? 'text-white' : ''}>
                      {t(`health.arms.${arm}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>

              <FontedText variant='body' className='mb-2'>
                {t('health.notes')}
              </FontedText>
              <View className='px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='h-20 text-base text-gray-800 dark:text-gray-200'
                  value={bpNotes}
                  onChangeText={setBpNotes}
                  placeholder={t('health.notesPlaceholder')}
                  placeholderTextColor='#9CA3AF'
                  multiline
                  textAlignVertical='top'
                />
              </View>
            </View>

            <View className='flex-row justify-between'>
              <TouchableOpacity
                className='flex-1 py-3 mr-2 bg-gray-400 rounded-lg dark:bg-gray-600'
                onPress={() => setBpModalVisible(false)}
              >
                <FontedText className='font-bold text-center text-white'>
                  {t('common.buttons.cancel')}
                </FontedText>
              </TouchableOpacity>
              <TouchableOpacity
                className='flex-1 py-3 ml-2 rounded-lg bg-primary dark:bg-primary-dark'
                onPress={saveBloodPressureLog}
              >
                <FontedText className='font-bold text-center text-white'>
                  {t('common.buttons.save')}
                </FontedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Mood Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={moodModalVisible}
        onRequestClose={() => setMoodModalVisible(false)}
      >
        <View className='items-center justify-center flex-1 bg-black/50'>
          <ThemedView
            backgroundColor='surface'
            className='w-[90%] rounded-xl p-6 max-w-md shadow-md'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-4 text-center'
            >
              {editingMoodLog ? t('health.editMood') : t('health.addMood')}
            </FontedText>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.moodRating')} (1-5)
              </FontedText>
              <View className='flex-row justify-between mb-2'>
                {[1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    className={`w-[18%] py-2 rounded-full ${
                      moodRating === rating
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => setMoodRating(rating)}
                  >
                    <FontedText
                      className={`text-center ${
                        moodRating === rating
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {rating}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.moodType')}
              </FontedText>
              <View className='flex-row flex-wrap justify-start'>
                {MOOD_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    className={`mb-2 mr-2 py-1 px-3 rounded-full ${
                      moodType === type.id
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => setMoodType(type.id)}
                  >
                    <FontedText
                      className={`${
                        moodType === type.id
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {t(`health.moodTypes.${type.id}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.triggers')}
              </FontedText>
              <View className='flex-row flex-wrap justify-start mb-2'>
                {COMMON_TRIGGERS.map(trigger => (
                  <TouchableOpacity
                    key={trigger.id}
                    className={`mb-2 mr-2 py-1 px-3 rounded-full ${
                      selectedTriggers.includes(trigger.id)
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => toggleTrigger(trigger.id)}
                  >
                    <FontedText
                      className={`${
                        selectedTriggers.includes(trigger.id)
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {t(`health.commonTriggers.${trigger.id}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View className='flex-row items-center mb-2'>
                <TextInput
                  className='flex-1 px-3 py-2 mr-2 rounded-md bg-neutral-100 dark:bg-neutral-800'
                  placeholder={t('health.triggerPlaceholder')}
                  value={customTrigger}
                  onChangeText={setCustomTrigger}
                />
                <TouchableOpacity
                  className='px-3 py-2 rounded-md bg-primary'
                  onPress={addCustomTrigger}
                >
                  <FontedText className='text-white'>
                    {t('health.addTrigger')}
                  </FontedText>
                </TouchableOpacity>
              </View>

              {selectedTriggers.filter(
                t => !COMMON_TRIGGERS.map(ct => ct.id).includes(t)
              ).length > 0 && (
                <View className='flex-row flex-wrap'>
                  {selectedTriggers
                    .filter(t => !COMMON_TRIGGERS.map(ct => ct.id).includes(t))
                    .map((trigger, index) => (
                      <View
                        key={index}
                        className='flex-row items-center px-3 py-1 mb-2 mr-2 rounded-full bg-primary dark:bg-primary-dark'
                      >
                        <FontedText className='mr-1 text-white'>
                          {trigger}
                        </FontedText>
                        <TouchableOpacity
                          onPress={() => toggleTrigger(trigger)}
                        >
                          <FontedText className='font-bold text-white'>
                            ×
                          </FontedText>
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              )}
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.notesLabel')}
              </FontedText>
              <TextInput
                className='bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md min-h-[80px] text-neutral-900 dark:text-white'
                placeholder={t('health.moodNotesPlaceholder')}
                value={moodNotes}
                onChangeText={setMoodNotes}
                multiline
                textAlignVertical='top'
              />
            </View>

            <View className='flex-row justify-end'>
              <TouchableOpacity
                className='px-5 py-2 mr-3'
                onPress={() => {
                  setMoodModalVisible(false);
                  setEditingMoodLog(null);
                }}
              >
                <FontedText>{t('common.buttons.cancel')}</FontedText>
              </TouchableOpacity>
              <TouchableOpacity
                className='px-5 py-2 rounded-md bg-primary'
                onPress={saveMoodLog}
              >
                <FontedText className='text-white'>
                  {t('common.buttons.save')}
                </FontedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Sleep Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={sleepModalVisible}
        onRequestClose={() => setSleepModalVisible(false)}
      >
        <View className='items-center justify-center flex-1 bg-black/50'>
          <ThemedView
            backgroundColor='surface'
            className='w-[90%] rounded-xl p-6 max-w-md shadow-md'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-4 text-center'
            >
              {editingSleepLog ? t('health.editSleep') : t('health.addSleep')}
            </FontedText>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.duration')} ({t('health.minutes')})
              </FontedText>
              <View className='flex-row px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='flex-1 text-base text-gray-800 dark:text-gray-200'
                  value={sleepDuration}
                  onChangeText={setSleepDuration}
                  keyboardType='number-pad'
                  placeholder={t('health.durationPlaceholder')}
                  placeholderTextColor='#9CA3AF'
                />
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.sleepQuality')} (1-5)
              </FontedText>
              <View className='flex-row justify-between mb-2'>
                {[1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    className={`w-[18%] py-2 rounded-full ${
                      sleepQuality === rating
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => setSleepQuality(rating)}
                  >
                    <FontedText
                      className={`text-center ${
                        sleepQuality === rating
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {rating}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.sleepType')}
              </FontedText>
              <View className='flex-row justify-around mb-2'>
                {SLEEP_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    className={`py-2 px-6 rounded-full ${
                      sleepType === type.id
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => setSleepType(type.id)}
                  >
                    <FontedText
                      className={`${
                        sleepType === type.id
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {t(`health.sleepTypes.${type.id}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.disruptions')}
              </FontedText>
              <View className='flex-row flex-wrap justify-start mb-2'>
                {COMMON_DISRUPTIONS.map(disruption => (
                  <TouchableOpacity
                    key={disruption.id}
                    className={`mb-2 mr-2 py-1 px-3 rounded-full ${
                      selectedDisruptions.includes(disruption.id)
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => toggleDisruption(disruption.id)}
                  >
                    <FontedText
                      className={`${
                        selectedDisruptions.includes(disruption.id)
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {t(`health.commonDisruptions.${disruption.id}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View className='flex-row items-center mb-2'>
                <TextInput
                  className='flex-1 px-3 py-2 mr-2 rounded-md bg-neutral-100 dark:bg-neutral-800'
                  placeholder={t('health.disruptionPlaceholder')}
                  value={customDisruption}
                  onChangeText={setCustomDisruption}
                />
                <TouchableOpacity
                  className='px-3 py-2 rounded-md bg-primary'
                  onPress={addCustomDisruption}
                >
                  <FontedText className='text-white'>
                    {t('health.addDisruption')}
                  </FontedText>
                </TouchableOpacity>
              </View>

              {selectedDisruptions.filter(
                d => !COMMON_DISRUPTIONS.map(cd => cd.id).includes(d)
              ).length > 0 && (
                <View className='flex-row flex-wrap'>
                  {selectedDisruptions
                    .filter(
                      d => !COMMON_DISRUPTIONS.map(cd => cd.id).includes(d)
                    )
                    .map((disruption, index) => (
                      <View
                        key={index}
                        className='flex-row items-center px-3 py-1 mb-2 mr-2 rounded-full bg-primary dark:bg-primary-dark'
                      >
                        <FontedText className='mr-1 text-white'>
                          {disruption}
                        </FontedText>
                        <TouchableOpacity
                          onPress={() => toggleDisruption(disruption)}
                        >
                          <FontedText className='font-bold text-white'>
                            ×
                          </FontedText>
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              )}
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.notesLabel')}
              </FontedText>
              <TextInput
                className='bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md min-h-[80px] text-neutral-900 dark:text-white'
                placeholder={t('health.sleepNotesPlaceholder')}
                value={sleepNotes}
                onChangeText={setSleepNotes}
                multiline
                textAlignVertical='top'
              />
            </View>

            <View className='flex-row justify-end'>
              <TouchableOpacity
                className='px-5 py-2 mr-3'
                onPress={() => {
                  setSleepModalVisible(false);
                  setEditingSleepLog(null);
                }}
              >
                <FontedText>{t('common.buttons.cancel')}</FontedText>
              </TouchableOpacity>
              <TouchableOpacity
                className='px-5 py-2 rounded-md bg-primary'
                onPress={saveSleepLog}
              >
                <FontedText className='text-white'>
                  {t('common.buttons.save')}
                </FontedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Exercise Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={exerciseModalVisible}
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View className='items-center justify-center flex-1 bg-black/50'>
          <ThemedView
            backgroundColor='surface'
            className='w-[90%] rounded-xl p-6 max-w-md shadow-md'
          >
            <FontedText
              variant='heading-3'
              fontFamily='comfortaa'
              className='mb-4 text-center'
            >
              {editingExerciseLog
                ? t('health.editExercise')
                : t('health.addExercise')}
            </FontedText>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.exerciseType')}
              </FontedText>
              <View className='flex-row flex-wrap justify-start mb-2'>
                {EXERCISE_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    className={`mb-2 mr-2 py-1 px-3 rounded-full ${
                      exerciseType === type.id
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => setExerciseType(type.id)}
                  >
                    <FontedText
                      className={`${
                        exerciseType === type.id
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {t(`health.exerciseTypes.${type.id}`)}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.duration')} ({t('health.minutes')})
              </FontedText>
              <View className='flex-row px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='flex-1 text-base text-gray-800 dark:text-gray-200'
                  value={exerciseDuration}
                  onChangeText={setExerciseDuration}
                  keyboardType='number-pad'
                  placeholder={t('health.durationPlaceholder')}
                  placeholderTextColor='#9CA3AF'
                />
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.intensity')} (1-5)
              </FontedText>
              <View className='flex-row justify-between mb-2'>
                {[1, 2, 3, 4, 5].map(intensity => (
                  <TouchableOpacity
                    key={intensity}
                    className={`w-[18%] py-2 rounded-full ${
                      exerciseIntensity === intensity
                        ? 'bg-primary dark:bg-primary-dark border-0'
                        : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                    }`}
                    onPress={() => setExerciseIntensity(intensity)}
                  >
                    <FontedText
                      className={`text-center ${
                        exerciseIntensity === intensity
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {intensity}
                    </FontedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.heartRate')} (bpm)
              </FontedText>
              <View className='flex-row px-3 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600'>
                <TextInput
                  className='flex-1 text-base text-gray-800 dark:text-gray-200'
                  value={heartRate}
                  onChangeText={setHeartRate}
                  keyboardType='number-pad'
                  placeholder={t('health.heartRatePlaceholder')}
                  placeholderTextColor='#9CA3AF'
                />
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.modifiedPositions')}
              </FontedText>
              <View className='flex-row justify-between mb-2'>
                <TouchableOpacity
                  className={`w-[48%] py-2 rounded-full ${
                    modifiedPositions
                      ? 'bg-primary dark:bg-primary-dark border-0'
                      : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                  }`}
                  onPress={() => setModifiedPositions(!modifiedPositions)}
                >
                  <FontedText
                    className={`text-center ${
                      modifiedPositions
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {t('health.yes')}
                  </FontedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`w-[48%] py-2 rounded-full ${
                    !modifiedPositions
                      ? 'bg-primary dark:bg-primary-dark border-0'
                      : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                  }`}
                  onPress={() => setModifiedPositions(!modifiedPositions)}
                >
                  <FontedText
                    className={`text-center ${
                      !modifiedPositions
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {t('health.no')}
                  </FontedText>
                </TouchableOpacity>
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.feltContractions')}
              </FontedText>
              <View className='flex-row justify-between mb-2'>
                <TouchableOpacity
                  className={`w-[48%] py-2 rounded-full ${
                    feltContractions
                      ? 'bg-primary dark:bg-primary-dark border-0'
                      : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                  }`}
                  onPress={() => setFeltContractions(!feltContractions)}
                >
                  <FontedText
                    className={`text-center ${
                      feltContractions
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {t('health.yes')}
                  </FontedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`w-[48%] py-2 rounded-full ${
                    !feltContractions
                      ? 'bg-primary dark:bg-primary-dark border-0'
                      : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                  }`}
                  onPress={() => setFeltContractions(!feltContractions)}
                >
                  <FontedText
                    className={`text-center ${
                      !feltContractions
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {t('health.no')}
                  </FontedText>
                </TouchableOpacity>
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.feltDiscomfort')}
              </FontedText>
              <View className='flex-row justify-between mb-2'>
                <TouchableOpacity
                  className={`w-[48%] py-2 rounded-full ${
                    feltDiscomfort
                      ? 'bg-primary dark:bg-primary-dark border-0'
                      : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                  }`}
                  onPress={() => setFeltDiscomfort(!feltDiscomfort)}
                >
                  <FontedText
                    className={`text-center ${
                      feltDiscomfort
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {t('health.yes')}
                  </FontedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`w-[48%] py-2 rounded-full ${
                    !feltDiscomfort
                      ? 'bg-primary dark:bg-primary-dark border-0'
                      : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent dark:border-neutral-500'
                  }`}
                  onPress={() => setFeltDiscomfort(!feltDiscomfort)}
                >
                  <FontedText
                    className={`text-center ${
                      !feltDiscomfort
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {t('health.no')}
                  </FontedText>
                </TouchableOpacity>
              </View>
            </View>

            <View className='mb-4'>
              <FontedText variant='body' className='mb-1'>
                {t('health.notesLabel')}
              </FontedText>
              <TextInput
                className='bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md min-h-[80px] text-neutral-900 dark:text-white'
                placeholder={t('health.exerciseNotesPlaceholder')}
                value={exerciseNotes}
                onChangeText={setExerciseNotes}
                multiline
                textAlignVertical='top'
              />
            </View>

            <View className='flex-row justify-end'>
              <TouchableOpacity
                className='px-5 py-2 mr-3'
                onPress={() => {
                  setExerciseModalVisible(false);
                  setEditingExerciseLog(null);
                }}
              >
                <FontedText>{t('common.buttons.cancel')}</FontedText>
              </TouchableOpacity>
              <TouchableOpacity
                className='px-5 py-2 rounded-md bg-primary'
                onPress={saveExerciseLog}
              >
                <FontedText className='text-white'>
                  {t('common.buttons.save')}
                </FontedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#343a40',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
  },
  symptomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
  },
  symptomDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  symptomSeverity: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 5,
  },
  symptomNotes: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 5,
  },
  kickCounterContainer: {
    alignItems: 'center',
    padding: 15,
  },
  kickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  kickStatItem: {
    alignItems: 'center',
  },
  kickStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#343a40',
  },
  kickStatLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  kickButton: {
    backgroundColor: '#007bff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  kickButtonActive: {
    backgroundColor: '#28a745',
  },
  kickButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endButton: {
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  endButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#343a40',
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  severityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  activeSeverityButton: {
    backgroundColor: '#007bff',
  },
  severityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  activeSeverityButtonText: {
    color: 'white',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  kickSessionSummary: {
    fontSize: 16,
    color: '#343a40',
    textAlign: 'center',
    marginBottom: 20,
  },
  weightContainer: {
    alignItems: 'center',
    padding: 15,
  },
  currentWeightContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentWeightLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  currentWeightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#343a40',
  },
  currentWeightDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  noWeightData: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  addWeightButton: {
    backgroundColor: '#007bff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  addWeightButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weightHistoryContainer: {
    marginTop: 20,
    width: '100%',
  },
  weightHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  weightHistoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  weightHistoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightHistoryDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  weightHistoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  weightHistoryNotes: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 5,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    height: 50,
    marginBottom: 20,
  },
  contractionContainer: {
    alignItems: 'center',
    padding: 15,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#343a40',
  },
  timerLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  contractionButtonContainer: {
    marginBottom: 20,
  },
  startContractionButton: {
    backgroundColor: '#007bff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  endContractionButton: {
    backgroundColor: '#dc3545',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  contractionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contractionHistoryContainer: {
    marginTop: 20,
    width: '100%',
  },
  contractionHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  contractionHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contractionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  contractionHistoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  contractionHistoryText: {
    fontSize: 14,
    color: '#6c757d',
  },
  contractionList: {
    width: '100%',
  },
  contractionSummary: {
    fontSize: 16,
    color: '#343a40',
    textAlign: 'center',
    marginBottom: 20,
  },
  bpContainer: {
    alignItems: 'center',
    padding: 15,
  },
  currentBpContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentBpLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  currentBpValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#343a40',
  },
  currentBpDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  currentBpPulse: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 5,
  },
  noBpData: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  addBpButton: {
    backgroundColor: '#007bff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  addBpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bpHistoryContainer: {
    marginTop: 20,
    width: '100%',
  },
  bpHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  bpHistoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  bpHistoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bpHistoryDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  bpHistoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  bpHistoryNotes: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 5,
  },
  bpInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    height: 50,
    marginBottom: 20,
  },
  bpHistoryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpHistoryPulse: {
    fontSize: 14,
    color: '#6c757d',
  },
  bpHistoryPosition: {
    fontSize: 14,
    color: '#6c757d',
  },
  bpHistoryArm: {
    fontSize: 14,
    color: '#6c757d',
  },
  bpHistoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpEditButton: {
    backgroundColor: '#007bff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  bpEditButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bpDeleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bpDeleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HealthTrackerScreen;
