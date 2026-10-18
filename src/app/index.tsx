import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/constants/styles';
import { DailyLog, initialPeriodHistory, PeriodRecord, usePeriods } from '@/context/PeriodContext';
import { getCyclePrediction } from '@/utils/cycle';
import { formatDate, fromDateKey } from '@/utils/date';

const flowLabels: Record<DailyLog['flow'], string> = {
  none: 'No menstruation',
  spotting: 'Spotting',
  light: 'Light flow',
  medium: 'Medium flow',
  heavy: 'Heavy flow',
};

function renderPeriodCard(period: PeriodRecord) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${period.month} period details`}
      onPress={() => router.push({ pathname: '/period/[id]', params: { id: String(period.id) } } as never)}
      style={({ pressed }) => [styles.periodCard, pressed && styles.pressedCard]}>
      <View style={styles.periodMarker}>
        <View style={styles.periodDot} />
        <View style={styles.periodLine} />
      </View>

      <View style={styles.periodContent}>
        <View style={styles.periodCardHeader}>
          <Text style={styles.monthTitle}>{period.month}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{period.duration} days</Text>
          </View>
        </View>
        <Text style={styles.periodDates}>{period.startDate} — {period.endDate}</Text>
        <Text style={styles.viewDetailsText}>Tap to view details</Text>
      </View>
    </Pressable>
  );
}

function renderDailyLogCard(log: DailyLog) {
  const date = fromDateKey(log.date);
  const selectedDetails = [
    log.symptoms.length ? `${log.symptoms.length} symptom${log.symptoms.length > 1 ? 's' : ''}` : '',
    log.moods.length ? `${log.moods.length} mood${log.moods.length > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View daily log for ${formatDate(date)}`}
      onPress={() => router.push({
        pathname: '/period/[id]',
        params: { id: String(log.id), type: 'daily' },
      } as never)}
      style={({ pressed }) => [styles.dailyLogCard, pressed && styles.pressedCard]}>
      <Text style={styles.dailyLogDate}>{formatDate(date)}</Text>
      <Text style={styles.dailyLogMeta}>{flowLabels[log.flow]}{selectedDetails ? ` · ${selectedDetails}` : ''}</Text>
      {log.notes ? <Text numberOfLines={2} style={styles.dailyLogText}>{log.notes}</Text> : null}
      <Text style={styles.viewDetailsText}>Tap to view daily details</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { periods, dailyLogs } = usePeriods();
  const today = useMemo(() => new Date(), []);
  const prediction = useMemo(
    () => getCyclePrediction(periods, dailyLogs, today),
    [dailyLogs, periods, today],
  );

  const sortedPeriods = useMemo(
    () => [...periods].sort((first, second) => second.id - first.id),
    [periods],
  );
  const sortedDailyLogs = useMemo(
    () => [...dailyLogs].sort((first, second) => second.date.localeCompare(first.date)),
    [dailyLogs],
  );

  const historyNotice = periods.length > initialPeriodHistory.length
    ? 'Your new period has been saved'
    : 'A little look back';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>WlueyOy</Text>
            <Text style={styles.subtitle}>Your cycle, gently understood.</Text>
          </View>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>W</Text></View>
        </View>

        <View style={styles.currentCycleCard}>
          <View style={styles.cardBubbleLarge} />
          <View style={styles.cardBubbleSmall} />
          <Text style={styles.currentCycleLabel}>CURRENT CYCLE</Text>

          <View style={styles.cycleOverview}>
            <View>
              <Text style={styles.cycleDayLabel}>Cycle day</Text>
              <Text style={styles.cycleDay}>{prediction.cycleDay}</Text>
            </View>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>{prediction.daysUntilNextPeriod}</Text>
              <Text style={styles.countdownLabel}>days to go</Text>
            </View>
          </View>

          <View style={styles.cycleEstimate}>
            <View style={styles.estimateDot} />
            <View>
              <Text style={styles.estimateLabel}>Estimated next period</Text>
              <Text style={styles.estimateValue}>{formatDate(prediction.nextPeriodDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Daily notes</Text>
              <Text style={styles.sectionSubtitle}>One day at a time, just like Wluey.</Text>
            </View>
            <View style={styles.recordCount}>
              <Text style={styles.recordCountText}>{dailyLogs.length} logs</Text>
            </View>
          </View>

          {sortedDailyLogs.length ? (
            sortedDailyLogs.map((log) => <View key={log.id}>{renderDailyLogCard(log)}</View>)
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.formDescription}>No daily notes yet. Record a symptom, mood, note, or menstruation level.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Period History</Text>
              <Text style={styles.sectionSubtitle}>{historyNotice}</Text>
            </View>
            <View style={styles.recordCount}>
              <Text style={styles.recordCountText}>{periods.length} records</Text>
            </View>
          </View>

          {sortedPeriods.map((period) => <View key={period.id}>{renderPeriodCard(period)}</View>)}
        </View>

        <Pressable
          accessibilityLabel="Log a day"
          accessibilityRole="button"
          onPress={() => router.push('/add-period' as never)}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressedButton]}>
          <View>
            <Text style={styles.addButtonText}>Log a day</Text>
            <Text style={styles.addButtonHint}>Record menstruation, complaints, or mood</Text>
          </View>
          <View style={styles.addButtonIcon}><Text style={styles.addButtonIconText}>+</Text></View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
