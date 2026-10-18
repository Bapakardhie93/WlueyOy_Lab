import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/constants/styles';
import { FlowLevel, usePeriods } from '@/context/PeriodContext';
import { formatDate, fromDateKey } from '@/utils/date';

const flowLabels: Record<FlowLevel, string> = {
  none: 'No menstruation',
  spotting: 'Spotting',
  light: 'Light flow',
  medium: 'Medium flow',
  heavy: 'Heavy flow',
};

function NotFound() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.emptyState}>
        <Text style={styles.formTitle}>Record not found</Text>
        <Text style={styles.formDescription}>This record may have been removed.</Text>
        <Pressable onPress={() => router.replace('/')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function PeriodDetailScreen() {
  const { id, saved, type } = useLocalSearchParams<{ id: string; saved?: string; type?: string }>();
  const { findPeriod, findDailyLog } = usePeriods();

  if (type === 'daily') {
    const dailyLog = findDailyLog(Number(id));
    if (!dailyLog) return <NotFound />;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.formEyebrow}>{saved === '1' ? 'SAVED SUCCESSFULLY' : 'DAILY LOG'}</Text>
          <Text style={styles.formTitle}>{formatDate(fromDateKey(dailyLog.date))}</Text>
          <Text style={styles.formDescription}>Your one-day Wluey monitor record.</Text>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Menstruation</Text>
            <Text style={styles.detailValue}>{flowLabels[dailyLog.flow]}</Text>

            {dailyLog.symptoms.length ? (
              <>
                <Text style={styles.detailLabel}>Symptoms</Text>
                <Text style={styles.detailValue}>{dailyLog.symptoms.join(', ')}</Text>
              </>
            ) : null}

            {dailyLog.moods.length ? (
              <>
                <Text style={styles.detailLabel}>Mood</Text>
                <Text style={styles.detailValue}>{dailyLog.moods.join(', ')}</Text>
              </>
            ) : null}

            {dailyLog.notes ? (
              <>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{dailyLog.notes}</Text>
              </>
            ) : null}
          </View>

          <Pressable onPress={() => router.back()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to history</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const period = findPeriod(Number(id));
  if (!period) return <NotFound />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.detailContainer}>
        <Text style={styles.formEyebrow}>PERIOD DETAIL</Text>
        <Text style={styles.formTitle}>{period.month}</Text>
        <Text style={styles.formDescription}>Here is the record saved in your cycle history.</Text>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Dates</Text>
          <Text style={styles.detailValue}>{period.startDate} — {period.endDate}</Text>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{period.duration} days</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to history</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
