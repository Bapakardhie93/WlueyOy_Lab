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

        <Text style={styles.periodDates}>
          {period.startDate} — {period.endDate}
        </Text>
      </View>
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
          <View>
            <Text style={styles.appName}>WlueyOy</Text>
            <Text style={styles.subtitle}>Your cycle, gently understood.</Text>
          </View>

          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>W</Text>
          </View>
        </View>

        <View style={styles.currentCycleCard}>
          <View style={styles.cardBubbleLarge} />
          <View style={styles.cardBubbleSmall} />

          <Text
            style={{
              color: '#FBE7EF',
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.7,
            }}>
            CURRENT CYCLE
          </Text>

          <View style={styles.cycleOverview}>
            <View>
              <Text style={styles.cycleDayLabel}>Cycle day</Text>
              <Text style={styles.cycleDay}>14</Text>
            </View>

            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>14</Text>
              <Text style={styles.countdownLabel}>days to go</Text>
            </View>
          </View>

          <View style={styles.cycleEstimate}>
            <View style={styles.estimateDot} />
            <View>
              <Text style={styles.estimateLabel}>Estimated next period</Text>
              <Text style={styles.estimateValue}>About 14 days away</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Period History</Text>
              <Text style={styles.sectionSubtitle}>A little look back</Text>
            </View>

            <View style={styles.recordCount}>
              <Text style={styles.recordCountText}>3 records</Text>
            </View>
          </View>

          {periodHistory.map((period) => (
            <View key={period.id}>{renderPeriodCard(period)}</View>
          ))}
        </View>

        <Pressable
          accessibilityLabel="Add period"
          accessibilityRole="button"
          style={styles.addButton}>
          <View>
            <Text style={styles.addButtonText}>Add Period</Text>
            <Text style={styles.addButtonHint}>Keep your history up to date</Text>
          </View>

          <View style={styles.addButtonIcon}>
            <Text style={styles.addButtonIconText}>+</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
