import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, LoadingScreen } from '@/components/AppFrame';
import { palette, styles } from '@/constants/styles';
import { type FlowLevel, usePeriods } from '@/context/PeriodContext';
import { calculateDuration, formatDate, fromDateKey, isFutureDate, startOfDay, toDateKey } from '@/utils/date';

type PickerTarget = 'start' | 'end' | 'day' | null;
const flowOptions: { value: FlowLevel; label: string }[] = [
  { value: 'none', label: 'No flow' }, { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'heavy', label: 'Heavy' },
];
const symptomOptions = ['Cramps', 'Headache', 'Fatigue', 'Nausea', 'Bloating', 'Tender breasts', 'Back pain', 'Acne'];
const moodOptions = ['Calm', 'Happy', 'Sensitive', 'Low', 'Irritable', 'Anxious', 'Energetic'];

export default function AddPeriodScreen() {
  const { isReady } = usePeriods();
  if (!isReady) return <LoadingScreen />;
  return <AddPeriodForm />;
}

function AddPeriodForm() {
  const params = useLocalSearchParams<{ mode?: string; date?: string; id?: string; type?: string }>();
  const { periods, dailyLogs, addPeriod, updatePeriod, deletePeriod, addDailyLog, updateDailyLog, deleteDailyLog } = usePeriods();
  const mode = params.mode === 'log' || params.type === 'daily' ? 'log' : 'period';
  const editingPeriod = mode === 'period' && params.id ? periods.find((item) => item.id === params.id) : undefined;
  const today = useMemo(() => startOfDay(new Date()), []);
  const requestedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? fromDateKey(params.date) : today;
  const editingLog = mode === 'log'
    ? (params.id ? dailyLogs.find((item) => item.id === params.id) : undefined)
      ?? dailyLogs.find((item) => item.date === toDateKey(requestedDate))
    : undefined;
  const [startDate, setStartDate] = useState(editingPeriod ? fromDateKey(editingPeriod.startDate) : requestedDate);
  const [endDate, setEndDate] = useState(editingPeriod ? fromDateKey(editingPeriod.endDate) : requestedDate);
  const [day, setDay] = useState(editingLog ? fromDateKey(editingLog.date) : requestedDate);
  const [flow, setFlow] = useState<FlowLevel>(editingLog?.flow ?? editingPeriod?.flow ?? (mode === 'log' ? 'none' : 'medium'));
  const [symptoms, setSymptoms] = useState<string[]>(editingLog?.symptoms ?? []);
  const [moods, setMoods] = useState<string[]>(editingLog?.moods ?? []);
  const [notes, setNotes] = useState(editingLog?.notes ?? '');
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const currentDate = picker === 'start' ? startDate : picker === 'end' ? endDate : day;
  const pickerMax = picker === 'start' && endDate < today ? endDate : today;
  const onDateChange = (event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === 'android') setPicker(null);
    if (!value || event.type === 'dismissed') return;
    if (picker === 'start') { setStartDate(startOfDay(value)); if (value > endDate) setEndDate(startOfDay(value)); }
    if (picker === 'end') setEndDate(startOfDay(value));
    if (picker === 'day') setDay(startOfDay(value));
  };
  const toggle = (value: string, selected: string[], setSelected: (values: string[]) => void) => setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  const renderChips = (options: readonly string[], selected: string[], setter: (values: string[]) => void, single = false) => <View style={styles.chipWrap}>{options.map((item) => {
    const active = selected.includes(item);
    return <Pressable key={item} accessibilityRole={single ? 'radio' : 'checkbox'} accessibilityState={single ? { selected: active } : { checked: active }} onPress={() => single ? setter([item]) : toggle(item, selected, setter)} style={[styles.chip, active && styles.chipSelected]}><Text style={[styles.chipText, active && styles.chipTextSelected]}>{item}</Text></Pressable>;
  })}</View>;
  const renderDate = (label: string, value: Date, target: PickerTarget) => <><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${formatDate(value)}`} onPress={() => setPicker(target)} style={styles.dateButton}><Text style={styles.dateText}>{formatDate(value)}</Text><Text style={{ color: palette.plum }}>▾</Text></Pressable></>;
  const displayError = (message: string) => setError(message);

  const save = async () => {
    setError('');
    if (saving) return;
    if (mode === 'period') {
      const startKey = toDateKey(startDate); const endKey = toDateKey(endDate);
      if (isFutureDate(startDate, today) || isFutureDate(endDate, today)) return displayError('Choose dates up to today.');
      if (endDate < startDate) return displayError('The end date must be on or after the start date.');
      if (flow === 'none') return displayError('Choose a flow level to save a period.');
      const overlap = periods.find((item) => item.id !== editingPeriod?.id && item.startDate <= endKey && item.endDate >= startKey);
      if (overlap) return displayError('These dates overlap another period record. Edit or remove that record first.');
      const input = { startDate: startKey, endDate: endKey, flow: flow as Exclude<FlowLevel, 'none'> };
      try {
        setSaving(true);
        const saved = editingPeriod ? { ...editingPeriod, ...input } : await addPeriod(input);
        if (editingPeriod) await updatePeriod(saved);
        router.replace({ pathname: '/period/[id]', params: { id: saved.id, saved: editingPeriod ? 'updated' : '1' } } as never);
      } catch { displayError('Could not save to this device. Please try again.'); }
      finally { setSaving(false); }
      return;
    }
    if (isFutureDate(day, today)) return displayError('Choose today or an earlier date.');
    const cleanNotes = notes.trim();
    if (flow === 'none' && symptoms.length === 0 && moods.length === 0 && !cleanNotes) return displayError('Add at least one detail before saving this check-in.');
    const logInput = { date: toDateKey(day), flow, symptoms, moods, notes: cleanNotes };
    try {
      setSaving(true);
      const saved = editingLog ? { ...editingLog, ...logInput } : await addDailyLog(logInput);
      if (editingLog) await updateDailyLog(saved);
      router.replace({ pathname: '/period/[id]', params: { id: saved.id, type: 'daily', saved: editingLog ? 'updated' : '1' } } as never);
    } catch { displayError('Could not save to this device. Please try again.'); }
    finally { setSaving(false); }
  };

  const screenTitle = mode === 'period' ? (editingPeriod ? 'Edit period' : 'Log a period') : (editingLog ? 'Edit check-in' : 'Daily check-in');
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <AppHeader />
    <Text style={styles.greeting}>{mode === 'period' ? 'MENSTRUAL CYCLE' : 'DAILY REFLECTION'}</Text>
    <Text style={styles.heading}>{screenTitle}</Text>
    <Text style={styles.body}>{mode === 'period' ? 'Add the dates you experienced bleeding. We use your history to estimate your cycle over time.' : 'Track how you felt and what you noticed. It’s okay to leave details blank.'}</Text>
    <View style={[styles.card, { marginTop: 22 }]}>
      {mode === 'period' ? <>
        {renderDate('First day', startDate, 'start')}
        {renderDate('Last day', endDate, 'end')}
        <Text style={styles.hint}>Duration: {calculateDuration(startDate, endDate)} {calculateDuration(startDate, endDate) === 1 ? 'day' : 'days'}</Text>
        <Text style={styles.label}>Overall flow</Text>
        {renderChips(flowOptions.filter((item) => item.value !== 'none').map((item) => item.label) as string[], [flow === 'none' ? '' : flowOptions.find((item) => item.value === flow)?.label ?? ''], (choice) => {
          const labels: Record<string, FlowLevel> = { Spotting: 'spotting', Light: 'light', Medium: 'medium', Heavy: 'heavy' };
          if (choice[0]) setFlow(labels[choice[0]]);
        }, true)}
        <Text style={styles.hint}>This describes the period overall. Add daily flow variations in a separate check-in.</Text>
      </> : <>
        {renderDate('Day', day, 'day')}
        <Text style={styles.label}>Flow</Text>
        {renderChips(flowOptions.map((item) => item.label), [flowOptions.find((item) => item.value === flow)?.label ?? ''], (choice) => {
          const labels: Record<string, FlowLevel> = { 'No flow': 'none', Spotting: 'spotting', Light: 'light', Medium: 'medium', Heavy: 'heavy' };
          if (choice[0]) setFlow(labels[choice[0]]);
        }, true)}
        <Text style={styles.label}>Symptoms</Text>{renderChips(symptomOptions, symptoms, setSymptoms)}
        <Text style={styles.label}>Mood</Text>{renderChips(moodOptions, moods, setMoods)}
        <Text style={styles.label}>Note</Text>
        <TextInput accessibilityLabel="Daily note" maxLength={1000} multiline numberOfLines={4} onChangeText={setNotes} placeholder="Anything you’d like to remember…" placeholderTextColor="#99918C" style={[styles.input, styles.notesInput]} textAlignVertical="top" value={notes} />
      </>}
      {picker ? <View style={styles.pickerCard}><DateTimePicker value={currentDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={pickerMax} onChange={onDateChange} /><Pressable accessibilityRole="button" onPress={() => setPicker(null)} style={styles.textButton}><Text style={styles.textButtonText}>Done</Text></Pressable></View> : null}
      {error ? <View accessibilityRole="alert" style={styles.notice}><Text style={styles.noticeText}>{error}</Text></View> : null}
    </View>
    <View style={styles.buttonRow}><View style={{ flex: 1 }}><Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={save} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, saving && { opacity: 0.6 }]}><Text style={styles.primaryButtonText}>{saving ? 'Saving…' : editingPeriod || editingLog ? 'Save changes' : 'Save entry'}</Text></Pressable></View><View style={{ flex: 1 }}><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable></View></View>
    {editingPeriod || editingLog ? <Pressable accessibilityRole="button" onPress={() => Alert.alert('Delete this entry?', 'This action cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { if (editingPeriod) await deletePeriod(editingPeriod.id); if (editingLog) await deleteDailyLog(editingLog.id); router.replace(editingPeriod ? '/history' as never : '/' as never); } catch { displayError('Could not delete this entry. Please try again.'); } } }])} style={[styles.textButton, { marginTop: 16 }]}><Text style={[styles.textButtonText, { color: palette.danger, textAlign: 'center' }]}>Delete entry</Text></Pressable> : null}
  </ScrollView></SafeAreaView>;
}
