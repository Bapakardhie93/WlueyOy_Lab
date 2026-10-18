import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/constants/styles';
import { FlowLevel, usePeriods } from '@/context/PeriodContext';
import { formatDate, isFutureDate, startOfDay, toDateKey } from '@/utils/date';

type PickerMode = 'date' | null;
type SelectionTone = 'flow' | 'symptom' | 'mood';

const flowOptions: { value: FlowLevel; label: string }[] = [
  { value: 'none', label: 'No menstruation' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const symptomOptions = ['Cramps', 'Headache', 'Nausea', 'Bloating', 'Breast tenderness', 'Acne'];
const moodOptions = ['Happy', 'Sad', 'Sensitive', 'Angry', 'Calm', 'Energetic'];

export default function AddPeriodScreen() {
  const { addDailyLog } = usePeriods();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [flow, setFlow] = useState<FlowLevel>('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;

    const timeoutId = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [message]);

  const handleDateChange = (event: DateTimePickerEvent, nextDate?: Date) => {
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }

    if (event.type === 'dismissed' || !nextDate) return;

    const normalizedDate = startOfDay(nextDate);
    if (isFutureDate(normalizedDate, today)) {
      setMessage('A future date cannot be recorded.');
      return;
    }

    setSelectedDate(normalizedDate);
  };

  const toggleSelection = (
    value: string,
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    setter((currentValues) => currentValues.includes(value)
      ? currentValues.filter((currentValue) => currentValue !== value)
      : [...currentValues, value]);
  };

  const handleSave = () => {
    if (isFutureDate(selectedDate, today)) {
      setMessage('A future date cannot be recorded.');
      return;
    }

    const cleanNotes = notes.trim();
    if (flow === 'none' && symptoms.length === 0 && moods.length === 0 && !cleanNotes) {
      setMessage('Select a complaint, mood, or note when you are not menstruating.');
      return;
    }

    const savedLog = addDailyLog({
      date: toDateKey(selectedDate),
      flow,
      symptoms,
      moods,
      notes: cleanNotes,
    });

    router.replace({
      pathname: '/period/[id]',
      params: { id: String(savedLog.id), type: 'daily', saved: '1' },
    } as never);
  };

  const renderChip = (label: string, selected: boolean, tone: SelectionTone, onPress: () => void) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.selectionChip,
        tone === 'flow' ? styles.flowChip : tone === 'symptom' ? styles.symptomChip : styles.moodChip,
        selected && styles.selectionChipSelected,
      ]}>
      <Text style={[styles.selectionChipText, selected && styles.selectionChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.formEyebrow}>DAILY MONITOR</Text>
        <Text style={styles.formTitle}>How are you today?</Text>
        <Text style={styles.formDescription}>
          Choose one day to record menstruation, symptoms, mood, or a note.
        </Text>

        <View style={styles.formCard}>
          <View style={styles.compactDateRow}>
            <View style={styles.compactDateInfo}>
              <Text style={styles.compactDateLabel}>Selected day</Text>
              <Text style={styles.compactDateHint}>Future dates are unavailable</Text>
            </View>
            <Pressable
              accessibilityLabel="Select day"
              accessibilityRole="button"
              onPress={() => setPickerMode('date')}
              style={styles.compactDateButton}>
              <Text style={styles.compactDateValue}>{formatDate(selectedDate)}</Text>
              <Text style={styles.compactDateChevron}>⌄</Text>
            </Pressable>
          </View>

          {pickerMode ? (
            <View style={styles.pickerPanel}>
              <Text style={styles.pickerTitle}>Select a day</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={today}
                onChange={handleDateChange}
              />
              {Platform.OS === 'ios' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPickerMode(null)}
                  style={styles.pickerDoneButton}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Menstruation</Text>
            <Text style={styles.selectionHint}>Leave this as “No menstruation” if you only want to record complaints.</Text>
            <View style={styles.chipWrap}>
              {flowOptions.map((option) => renderChip(
                option.label,
                flow === option.value,
                'flow',
                () => setFlow(option.value),
              ))}
            </View>
          </View>

          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Symptoms</Text>
            <View style={styles.chipWrap}>
              {symptomOptions.map((symptom) => renderChip(
                symptom,
                symptoms.includes(symptom),
                'symptom',
                () => toggleSelection(symptom, setSymptoms),
              ))}
            </View>
          </View>

          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Mood</Text>
            <View style={styles.chipWrap}>
              {moodOptions.map((mood) => renderChip(
                mood,
                moods.includes(mood),
                'mood',
                () => toggleSelection(mood, setMoods),
              ))}
            </View>
          </View>

          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Notes</Text>
            <TextInput
              accessibilityLabel="Daily note"
              multiline
              numberOfLines={3}
              onChangeText={setNotes}
              placeholder="Add anything you want to remember"
              placeholderTextColor="#B49DA6"
              style={styles.notesInput}
              textAlignVertical="top"
              value={notes}
            />
          </View>

          {message ? <Text style={styles.formMessage}>{message}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}>
          <Text style={styles.primaryButtonText}>Save daily log</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
