import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7FA',
  },
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  appName: {
    color: '#2C1D23',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#7D6870',
    fontSize: 15,
    marginTop: 4,
  },
  currentCycleCard: {
    backgroundColor: '#8F3157',
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,
  },
  cycleDayGroup: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cycleDay: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  cycleDescription: {
    color: '#F8DCE7',
    fontSize: 14,
    marginTop: 4,
  },
  cycleEstimate: {
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  estimateLabel: {
    color: '#F8DCE7',
    fontSize: 13,
  },
  estimateValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 3,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#2C1D23',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 14,
  },
  periodCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0DDE5',
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
  },
  periodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  monthTitle: {
    flex: 1,
    color: '#39262E',
    fontSize: 17,
    fontWeight: '700',
  },
  durationBadge: {
    backgroundColor: '#FCEAF1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  durationText: {
    color: '#8F3157',
    fontSize: 12,
    fontWeight: '700',
  },
  periodDates: {
    color: '#7D6870',
    fontSize: 14,
    marginTop: 10,
  },
  addButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4C7D8',
    borderRadius: 18,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#6F2141',
    fontSize: 16,
    fontWeight: '700',
  },
});
