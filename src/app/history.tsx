import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AppFrame, AppHeader, LoadingScreen } from '@/components/AppFrame';
import { styles } from '@/constants/styles';
import { usePeriods } from '@/context/PeriodContext';
import { calculateDuration, formatDate, fromDateKey } from '@/utils/date';

export default function HistoryScreen() {
  const { periods, dailyLogs, isReady } = usePeriods();
  if (!isReady) return <LoadingScreen />;
  const sortedPeriods = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
  return <AppFrame>
    <AppHeader />
    <Text style={styles.greeting}>YOUR PERSONAL TIMELINE</Text>
    <Text style={styles.heading}>Your history, in one place.</Text>
    <Text style={styles.body}>Every entry is based on what you’ve chosen to record.</Text>
    <View style={styles.section}>
      <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Periods</Text><Text style={styles.sectionHint}>{sortedPeriods.length} recorded</Text></View><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: 'period' } } as never)}><Text style={styles.textButtonText}>＋ Add</Text></Pressable></View>
      {sortedPeriods.length ? <View style={styles.card}>{sortedPeriods.map((period) => <Pressable key={period.id} accessibilityRole="button" accessibilityLabel={`Period ${formatDate(fromDateKey(period.startDate))}, ${period.flow} flow`} onPress={() => router.push({ pathname: '/period/[id]', params: { id: period.id } } as never)} style={styles.logRow}>
        <View style={styles.logDateBlock}><Text style={styles.logDay}>{fromDateKey(period.startDate).getDate()}</Text><Text style={styles.logMonth}>{new Intl.DateTimeFormat('en', { month: 'short' }).format(fromDateKey(period.startDate))}</Text></View>
        <View style={styles.logInfo}><Text style={styles.logTitle}>{formatDate(fromDateKey(period.startDate))}{period.startDate === period.endDate ? '' : ` – ${formatDate(fromDateKey(period.endDate))}`}</Text><Text style={styles.logMeta}>{period.flow} flow · {calculateDuration(fromDateKey(period.startDate), fromDateKey(period.endDate))} days</Text></View>
        <Text style={styles.textButtonText}>›</Text>
      </Pressable>)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>No periods recorded yet</Text><Text style={styles.emptyText}>Add a period when you’re ready. Estimates appear once enough history exists.</Text></View>}
    </View>
    <View style={styles.section}>
      <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Daily check-ins</Text><Text style={styles.sectionHint}>{sortedLogs.length} recorded</Text></View><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: 'log' } } as never)}><Text style={styles.textButtonText}>＋ Add</Text></Pressable></View>
      {sortedLogs.length ? <View style={styles.card}>{sortedLogs.map((log) => <Pressable key={log.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/period/[id]', params: { id: log.id, type: 'daily' } } as never)} style={styles.logRow}>
        <View style={styles.logDateBlock}><Text style={styles.logDay}>{fromDateKey(log.date).getDate()}</Text><Text style={styles.logMonth}>{new Intl.DateTimeFormat('en', { month: 'short' }).format(fromDateKey(log.date))}</Text></View>
        <View style={styles.logInfo}><Text style={styles.logTitle}>{log.flow === 'none' ? 'Daily check-in' : `${log.flow[0].toUpperCase()}${log.flow.slice(1)} flow`}</Text><Text numberOfLines={1} style={styles.logMeta}>{[...log.symptoms, ...log.moods].join(' · ') || log.notes || 'No extra details'}</Text></View>
        <Text style={styles.textButtonText}>›</Text>
      </Pressable>)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>No daily check-ins yet</Text><Text style={styles.emptyText}>Save symptoms, mood, flow, and notes from a day to see them here.</Text></View>}
    </View>
    <Text style={[styles.hint, { marginTop: 24 }]}>Your cycle journal stays on this device. Device storage is not encrypted, so avoid shared or untrusted devices.</Text>
  </AppFrame>;
}
