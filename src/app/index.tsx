import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AppFrame, AppHeader, LoadingScreen } from '@/components/AppFrame';
import { CareQuoteCard } from '@/components/CareQuoteCard';
import { styles } from '@/constants/styles';
import { usePeriods } from '@/context/PeriodContext';
import { getCycleSummary } from '@/utils/cycle';
import { formatDate, fromDateKey, toDateKey } from '@/utils/date';

export default function HomeScreen() {
  const { periods, dailyLogs, isReady, storageError } = usePeriods();
  if (!isReady) return <LoadingScreen />;
  const summary = getCycleSummary(periods, dailyLogs, new Date());
  const todayKey = toDateKey(new Date());
  const todayLog = dailyLogs.find((log) => log.date === todayKey);
  const recentLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <AppFrame>
      <AppHeader />
      {storageError ? <View style={styles.notice} accessibilityRole="alert"><Text style={styles.noticeText}>{storageError}</Text></View> : null}
      <Text style={styles.greeting}>Your cycle, your pace</Text>
      <Text style={styles.heading}>Listen to what your body is telling you.</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{summary.cycleDay ? 'YOUR CURRENT CYCLE' : 'YOUR CYCLE JOURNEY'}</Text>
        {summary.cycleDay ? <><Text style={styles.heroNumber}>{summary.cycleDay}</Text><Text style={styles.heroLabel}>day of this cycle</Text></> : <><Text style={[styles.heroLabel, { fontSize: 22, marginTop: 12 }]}>Start with a first period record</Text><Text style={[styles.heroMeta, { marginTop: 7, lineHeight: 18 }]}>We’ll learn your personal rhythm as you add real entries.</Text></>}
        <View style={styles.heroRule} />
        <View style={styles.heroBottom}>
          <View><Text style={styles.heroMeta}>NEXT PERIOD</Text><Text style={styles.heroValue}>{summary.nextPeriodDate ? formatDate(summary.nextPeriodDate) : 'Not enough data'}</Text></View>
          <View><Text style={styles.heroMeta}>AVERAGE CYCLE</Text><Text style={styles.heroValue}>{summary.averageCycleLength ? `${summary.averageCycleLength} days` : '—'}</Text></View>
        </View>
        {summary.nextPeriodDate ? <View style={styles.estimateTag}><Text style={styles.estimateTagText}>ESTIMATE · MAY VARY</Text></View> : null}
      </View>

      {summary.nextPeriodDate ? <View style={styles.notice}><Text style={styles.noticeText}>This date is an estimate based on the cycles you’ve recorded, not a medical prediction. Cycle timing can vary.</Text></View> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Today’s check-in</Text><Text style={styles.sectionHint}>{formatDate(new Date())}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: 'log', date: todayKey } } as never)}><Text style={styles.textButtonText}>{todayLog ? 'Edit' : 'Add'} +</Text></Pressable></View>
        {todayLog ? <View style={styles.card}><Text style={styles.cardTitle}>{todayLog.flow === 'none' ? 'Daily check-in saved' : `${todayLog.flow[0].toUpperCase()}${todayLog.flow.slice(1)} flow recorded`}</Text><Text style={styles.cardText}>{[...todayLog.symptoms, ...todayLog.moods].join(' · ') || todayLog.notes || 'No symptoms or notes added.'}</Text></View> : <View style={styles.empty}><Text style={styles.emptyTitle}>Take a moment for yourself</Text><Text style={styles.emptyText}>Add flow, symptoms, mood, or a note. Your entry stays on this device.</Text></View>}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Recent activity</Text><Text style={styles.sectionHint}>Your latest saved entries</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/history' as never)}><Text style={styles.textButtonText}>See all</Text></Pressable></View>
        {recentLogs.length ? <View style={styles.card}>{recentLogs.map((log) => <View key={log.id} style={styles.logRow}><View style={styles.logDateBlock}><Text style={styles.logDay}>{fromDateKey(log.date).getDate()}</Text><Text style={styles.logMonth}>{new Intl.DateTimeFormat('en', { month: 'short' }).format(fromDateKey(log.date))}</Text></View><View style={styles.logInfo}><Text style={styles.logTitle}>{log.flow === 'none' ? 'Daily check-in' : `${log.flow[0].toUpperCase()}${log.flow.slice(1)} flow`}</Text><Text style={styles.logMeta}>{log.symptoms.concat(log.moods).join(' · ') || (log.notes ? 'Note added' : 'No extra details')}</Text></View></View>)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>Your timeline begins here</Text><Text style={styles.emptyText}>Period and daily entries will appear here after you log them.</Text></View>}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>A little care for today</Text><Text style={styles.sectionHint}>A simple thought from the wider world</Text></View></View>
        <CareQuoteCard />
      </View>

      <View style={styles.section}>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: 'period' } } as never)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>＋  Log a period</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/calendar' as never)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, { marginTop: 10 }]}><Text style={styles.secondaryButtonText}>Open cycle calendar</Text></Pressable>
      </View>
    </AppFrame>
  );
}
