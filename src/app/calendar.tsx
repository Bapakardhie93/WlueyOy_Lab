import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppFrame, AppHeader, LoadingScreen } from '@/components/AppFrame';
import { palette, styles } from '@/constants/styles';
import { usePeriods } from '@/context/PeriodContext';
import { getCycleSummary, getPeriodForDate } from '@/utils/cycle';
import { formatDate, formatMonth, fromDateKey, startOfDay, toDateKey } from '@/utils/date';

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function monthStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function moveMonth(date: Date, delta: number) { return new Date(date.getFullYear(), date.getMonth() + delta, 1); }

export default function CalendarScreen() {
  const { periods, dailyLogs, isReady } = usePeriods();
  const [month, setMonth] = useState(monthStart(new Date()));
  const [selected, setSelected] = useState(toDateKey(startOfDay(new Date())));
  if (!isReady) return <LoadingScreen />;
  const todayKey = toDateKey(startOfDay(new Date()));
  const summary = getCycleSummary(periods, dailyLogs, new Date());
  const firstOffset = (monthStart(month).getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((firstOffset + dayCount) / 7) * 7;
  const selectedDate = fromDateKey(selected);
  const selectedPeriod = getPeriodForDate(periods, selected);
  const selectedLog = dailyLogs.find((log) => log.date === selected);
  const estimateKey = summary.nextPeriodDate ? toDateKey(summary.nextPeriodDate) : null;
  const monthDays = Array.from({ length: cellCount }, (_, index) => {
    const dayNum = index - firstOffset + 1;
    return dayNum > 0 && dayNum <= dayCount ? toDateKey(new Date(month.getFullYear(), month.getMonth(), dayNum)) : null;
  });

  return <AppFrame>
    <AppHeader />
    <Text style={styles.greeting}>CYCLE CALENDAR</Text>
    <Text style={styles.heading}>Your month, at a glance.</Text>
    <Text style={styles.body}>Recorded days are filled. An outlined day is only an estimate.</Text>
    <View style={[styles.card, { marginTop: 21 }]}>
      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => setMonth((value) => moveMonth(value, -1))} style={styles.monthArrow}><Text style={styles.monthArrowText}>‹</Text></Pressable>
        <Text style={styles.monthTitle}>{formatMonth(month)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => setMonth((value) => moveMonth(value, 1))} style={styles.monthArrow}><Text style={styles.monthArrowText}>›</Text></Pressable>
      </View>
      <View style={styles.weekdays}>{weekdays.map((label, i) => <Text key={`${label}-${i}`} style={styles.weekday}>{label}</Text>)}</View>
      <View style={styles.calendarGrid}>{monthDays.map((dateKey, index) => {
        if (!dateKey) return <View key={`blank-${index}`} style={styles.calendarCell} />;
        const period = getPeriodForDate(periods, dateKey);
        const daily = dailyLogs.find((log) => log.date === dateKey);
        const actualBleeding = Boolean(period || daily?.flow !== undefined && daily.flow !== 'none');
        const isSelected = selected === dateKey;
        const predicted = estimateKey === dateKey && !actualBleeding;
        return <Pressable key={dateKey} accessibilityRole="button" accessibilityLabel={`${formatDate(fromDateKey(dateKey))}${period ? ', recorded period' : ''}${predicted ? ', estimated period' : ''}${daily ? ', has daily note' : ''}`} accessibilityState={{ selected: isSelected }} onPress={() => setSelected(dateKey)} style={styles.calendarCell}>
          <View style={[styles.dayCircle, actualBleeding && styles.dayActual, predicted && styles.dayPredicted, dateKey === todayKey && styles.dayToday, isSelected && styles.daySelected]}><Text style={[styles.dayText, isSelected && styles.daySelectedText]}>{fromDateKey(dateKey).getDate()}</Text>{daily && !isSelected ? <View style={[styles.dayDot, actualBleeding && { backgroundColor: palette.plumDark }]} /> : null}</View>
        </Pressable>;
      })}</View>
      <View style={styles.legend}><View style={styles.legendItem}><View style={styles.legendDot} /><Text style={styles.legendText}>Recorded period</Text></View><View style={styles.legendItem}><View style={styles.legendOutline} /><Text style={styles.legendText}>Estimated start</Text></View><View style={styles.legendItem}><View style={[styles.dayDot, { position: 'relative', bottom: 0 }]} /><Text style={styles.legendText}>Daily check-in</Text></View></View>
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>{formatDate(selectedDate)}</Text><Text style={styles.sectionHint}>Selected day</Text></View></View>
      {selectedPeriod || selectedLog ? <View style={styles.card}>
        {selectedPeriod ? <><Text style={styles.cardTitle}>Recorded period</Text><Text style={styles.cardText}>{formatDate(fromDateKey(selectedPeriod.startDate))} – {formatDate(fromDateKey(selectedPeriod.endDate))} · {selectedPeriod.flow} flow</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/period/[id]', params: { id: selectedPeriod.id } } as never)} style={styles.textButton}><Text style={styles.textButtonText}>View period details</Text></Pressable></> : null}
        {selectedLog ? <><Text style={[styles.cardTitle, selectedPeriod && { marginTop: 10 }]}>Daily check-in</Text><Text style={styles.cardText}>{[selectedLog.flow === 'none' ? '' : `${selectedLog.flow} flow`, ...selectedLog.symptoms, ...selectedLog.moods].filter(Boolean).join(' · ') || selectedLog.notes || 'No additional details'}</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/period/[id]', params: { id: selectedLog.id, type: 'daily' } } as never)} style={styles.textButton}><Text style={styles.textButtonText}>View check-in</Text></Pressable></> : null}
      </View> : <View style={styles.empty}><Text style={styles.emptyTitle}>{estimateKey === selected ? 'Estimated period start' : 'No entry for this day'}</Text><Text style={styles.emptyText}>{estimateKey === selected ? 'This date is an estimate based on recent cycles and may shift.' : 'Add a period or a daily check-in whenever you’re ready.'}</Text></View>}
      <View style={styles.buttonRow}><View style={{ flex: 1 }}><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: 'log', date: selected, ...(selectedLog ? { id: selectedLog.id } : {}) } } as never)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{selectedLog ? 'Edit check-in' : 'Add check-in'}</Text></Pressable></View><View style={{ flex: 1 }}><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: 'period', date: selected } } as never)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Log a period</Text></Pressable></View></View>
    </View>
  </AppFrame>;
}
