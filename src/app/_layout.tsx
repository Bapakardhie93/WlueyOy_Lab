import { Stack } from 'expo-router';
import { PeriodProvider } from '@/context/PeriodContext';

export default function RootLayout() {
  return (
    <PeriodProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'WlueyOy Home' }} />
        <Stack.Screen name="add-period" options={{ title: 'Daily Monitor' }} />
        <Stack.Screen name="period/[id]" options={{ title: 'Daily Log Detail' }} />
      </Stack>
    </PeriodProvider>
  );
}
