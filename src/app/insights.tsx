import { Text, View } from 'react-native';
import { AppFrame, AppHeader, LoadingScreen } from '@/components/AppFrame';
import { styles } from '@/constants/styles';
import { usePeriods } from '@/context/PeriodContext';
import { getCycleSummary } from '@/utils/cycle';

export default function InsightsScreen() {
  const { periods, dailyLogs, isReady } = usePeriods();
  if (!isReady) return <LoadingScreen />;
  const summary = getCycleSummary(periods, dailyLogs, new Date());
  const recentLengths = summary.cycleLengths.slice(-6);
  const maxLength = Math.max(...recentLengths, 1);
  const symptomCounts = new Map<string, number>();
  dailyLogs.forEach((log) => log.symptoms.forEach((symptom) => symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1)));
  const commonSymptoms = [...symptomCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const total = Math.max(dailyLogs.length, 1);
  return <AppFrame>
    <AppHeader />
    <Text style={styles.greeting}>PATTERNS, NOT PROMISES</Text>
    <Text style={styles.heading}>What your notes are showing.</Text>
    <Text style={styles.body}>Simple summaries of entries you’ve recorded. They’re for reflection, not diagnosis.</Text>
    <View style={[styles.section, styles.statRow]}>
      <View style={styles.statCard}><Text style={styles.statValue}>{summary.averageCycleLength ? `${summary.averageCycleLength}` : '—'}</Text><Text style={styles.statLabel}>average cycle length in days</Text></View>
      <View style={styles.statCard}><Text style={styles.statValue}>{summary.averagePeriodLength ? `${summary.averagePeriodLength}` : '—'}</Text><Text style={styles.statLabel}>average recorded period in days</Text></View>
    </View>
    <View style={styles.section}>
      <View style={styles.card}><Text style={styles.cardTitle}>Cycle length</Text><Text style={styles.cardText}>Calculated between recorded period start dates. We show the six most recent intervals.</Text>
        {recentLengths.length ? <View style={styles.chart}>{recentLengths.map((length, index) => <View key={`${index}-${length}`} style={styles.chartColumn}><Text style={styles.chartValue}>{length}d</Text><View style={[styles.chartBar, { height: `${Math.max(8, (length / maxLength) * 70)}%` }]} /><Text style={styles.chartLabel}>Cycle {index + 1}</Text></View>)}</View> : <View style={[styles.empty, { marginTop: 14 }]}><Text style={styles.emptyTitle}>A little more history helps</Text><Text style={styles.emptyText}>Record two period start dates to calculate your first cycle length. Nothing is filled in with sample data.</Text></View>}
        {summary.cycleVariation !== null ? <><View style={styles.divider} /><Text style={styles.detailLabel}>Range across these cycles</Text><Text style={styles.detailValue}>{Math.min(...recentLengths)}–{Math.max(...recentLengths)} days ({summary.cycleVariation} day difference)</Text></> : null}
      </View>
    </View>
    <View style={styles.section}>
      <View style={styles.card}><Text style={styles.cardTitle}>Symptoms you’ve logged</Text><Text style={styles.cardText}>{dailyLogs.length ? `From ${dailyLogs.length} daily ${dailyLogs.length === 1 ? 'entry' : 'entries'}. A symptom may appear more than once.` : 'Log symptoms in a daily check-in to see your most common notes here.'}</Text>
        {commonSymptoms.length ? commonSymptoms.map(([symptom, count]) => <View key={symptom} style={[styles.logRow, { justifyContent: 'space-between' }]}><Text style={styles.logTitle}>{symptom}</Text><Text style={styles.logMeta}>{count} {count === 1 ? 'entry' : 'entries'} · {Math.round(count / total * 100)}% of check-ins</Text></View>) : null}
      </View>
    </View>
    <View style={styles.notice}><Text style={styles.noticeText}>Cycle estimates can be less reliable when cycles vary or there are few records. This app doesn’t diagnose conditions or provide contraception guidance.</Text></View>
  </AppFrame>;
}
