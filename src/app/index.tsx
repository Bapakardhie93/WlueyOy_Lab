import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/constants/styles';

type PeriodRecord = {
  id: number;
  month: string;
  startDate: string;
  endDate: string;
  duration: number;
};

const periodHistory: PeriodRecord[] = [
  {
    id: 1,
    month: 'September 2026',
    startDate: '1 Sep',
    endDate: '6 Sep',
    duration: 6,
  },
  {
    id: 2,
    month: 'August 2026',
    startDate: '4 Aug',
    endDate: '9 Aug',
    duration: 6,
  },
  {
    id: 3,
    month: 'July 2026',
    startDate: '7 Jul',
    endDate: '12 Jul',
    duration: 6,
  },
];

function renderPeriodCard(period: PeriodRecord) {
  return (
    <View style={styles.periodCard}>
      <View style={styles.periodCardHeader}>
        <Text style={styles.monthTitle}>{period.month}</Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{period.duration} days</Text>
        </View>
      </View>

      <Text style={styles.periodDates}>
        {period.startDate} - {period.endDate}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>WlueyOy</Text>
          <Text style={styles.subtitle}>your cycle, simply tracked</Text>
        </View>

        <View style={styles.currentCycleCard}>
          <Text
            style={{
              color: '#F8DCE7',
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.5,
            }}>
            CURRENT CYCLE
          </Text>

          <View style={styles.cycleDayGroup}>
            <Text style={styles.cycleDay}>Day 14</Text>
            <Text style={styles.cycleDescription}>of your current cycle</Text>
          </View>

          <View style={styles.cycleEstimate}>
            <Text style={styles.estimateLabel}>Estimated next period</Text>
            <Text style={styles.estimateValue}>~14 days</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Period History</Text>

          {periodHistory.map((period) => (
            <View key={period.id}>{renderPeriodCard(period)}</View>
          ))}
        </View>

        <Pressable
          accessibilityLabel="Add period"
          accessibilityRole="button"
          style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Period</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
