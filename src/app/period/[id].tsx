import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { AppFrame, AppHeader, LoadingScreen } from '@/components/AppFrame';
import { palette, styles } from '@/constants/styles';
import { usePeriods } from '@/context/PeriodContext';
import { calculateDuration, formatDate, fromDateKey } from '@/utils/date';

export default function PeriodDetailScreen() {
  const { id, saved, type } = useLocalSearchParams<{ id: string; saved?: string; type?: string }>();
  const { findPeriod, findDailyLog, deletePeriod, deleteDailyLog, isReady } = usePeriods();
  if (!isReady) return <LoadingScreen />;
  const log = type === 'daily' ? findDailyLog(id) : undefined;
  const period = type === 'daily' ? undefined : findPeriod(id);
  const exists = Boolean(log || period);
  const remove = () => Alert.alert('Delete this entry?', 'You can’t undo this action.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { if (log) await deleteDailyLog(log.id); if (period) await deletePeriod(period.id); router.replace('/history' as never); } catch { Alert.alert('Could not delete entry', 'Please try again when device storage is available.'); } } },
  ]);
  if (!exists) return <AppFrame><AppHeader /><Text style={styles.heading}>Entry not found</Text><Text style={styles.body}>It may have been removed from your history.</Text><Pressable onPress={() => router.replace('/history' as never)} style={[styles.primaryButton, { marginTop: 22 }]}><Text style={styles.primaryButtonText}>Back to history</Text></Pressable></AppFrame>;
  const title = log ? formatDate(fromDateKey(log.date)) : `${formatDate(fromDateKey(period!.startDate))}${period!.startDate === period!.endDate ? '' : ` – ${formatDate(fromDateKey(period!.endDate))}`}`;
  return <AppFrame>
    <AppHeader />
    <Text style={styles.greeting}>{log ? 'DAILY CHECK-IN' : 'PERIOD RECORD'}</Text>
    <Text style={styles.heading}>{title}</Text>
    {saved ? <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: '#E8F0E5' }]}><Text style={[styles.noticeText, { color: '#49634A' }]}>{saved === 'updated' ? 'Changes saved to your history.' : 'Entry saved to your history.'}</Text></View> : null}
    <View style={[styles.card, { marginTop: 22 }]}>
      {period ? <>
        <Text style={styles.detailLabel}>Dates</Text><Text style={styles.detailValue}>{formatDate(fromDateKey(period.startDate))} – {formatDate(fromDateKey(period.endDate))}</Text>
        <Text style={styles.detailLabel}>Duration</Text><Text style={styles.detailValue}>{calculateDuration(fromDateKey(period.startDate), fromDateKey(period.endDate))} days</Text>
        <Text style={styles.detailLabel}>Overall flow</Text><Text style={styles.detailValue}>{period.flow}</Text>
      </> : null}
      {log ? <>
        <Text style={styles.detailLabel}>Flow</Text><Text style={styles.detailValue}>{log.flow === 'none' ? 'No flow recorded' : `${log.flow[0].toUpperCase()}${log.flow.slice(1)} flow`}</Text>
        <Text style={styles.detailLabel}>Symptoms</Text><Text style={styles.detailValue}>{log.symptoms.join(', ') || 'None recorded'}</Text>
        <Text style={styles.detailLabel}>Mood</Text><Text style={styles.detailValue}>{log.moods.join(', ') || 'None recorded'}</Text>
        {log.notes ? <><Text style={styles.detailLabel}>Note</Text><Text style={styles.detailValue}>{log.notes}</Text></> : null}
      </> : null}
    </View>
    <View style={styles.buttonRow}><View style={{ flex: 1 }}><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/add-period', params: { mode: log ? 'log' : 'period', ...(log ? { type: 'daily' } : {}), id: log?.id ?? period?.id } } as never)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Edit entry</Text></Pressable></View><View style={{ flex: 1 }}><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Back</Text></Pressable></View></View>
    <Pressable accessibilityRole="button" onPress={remove} style={[styles.textButton, { marginTop: 12 }]}><Text style={[styles.textButtonText, { color: palette.danger, textAlign: 'center' }]}>Delete entry</Text></Pressable>
  </AppFrame>;
}
