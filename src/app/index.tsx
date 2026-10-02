import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.appName}>WlueyOy</Text>
          <Text>your cycle, simply tracked</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Cycle</Text>
          <Text>UI will be completed later</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Period History</Text>

          {periodHistory.map((period) => (
            <View key={period.id} style={styles.periodRecord}>
              <Text style={styles.periodMonth}>{period.month}</Text>
              <Text>
                {period.startDate} - {period.endDate}
              </Text>
              <Text>Duration: {period.duration} days</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodRecord: {
    marginBottom: 20,
  },
  periodMonth: {
    fontWeight: '600',
  },
});
