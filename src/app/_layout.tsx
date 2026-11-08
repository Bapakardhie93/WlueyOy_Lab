import { Stack } from 'expo-router';
import '../safe-area.css';
import { PeriodProvider } from '@/context/PeriodContext';

export default function RootLayout() {
  return (
    <PeriodProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Today' }} />
        <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="insights" options={{ title: 'Insights' }} />
        <Stack.Screen name="add-period" options={{ title: 'Add entry' }} />
        <Stack.Screen name="period/[id]" options={{ title: 'Entry detail' }} />
      </Stack>
    </PeriodProvider>
  );
}
