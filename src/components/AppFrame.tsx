import { router, usePathname } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, styles } from '@/constants/styles';

const destinations = [
  { path: '/', label: 'Today', icon: '◷' },
  { path: '/calendar', label: 'Calendar', icon: '▦' },
  { path: '/history', label: 'History', icon: '↺' },
  { path: '/insights', label: 'Insights', icon: '⌁' },
] as const;

export function AppFrame({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const pathname = usePathname();
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={styles.page}>{children}</View>}
      <View style={styles.nav} accessibilityRole="tablist">
        {destinations.map((item) => {
          const selected = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          return (
            <Pressable key={item.path} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => router.replace(item.path as never)} style={[styles.navItem, selected && styles.navActive]}>
              <Text style={[styles.navIcon, selected && styles.navLabelActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View><Text style={styles.brandName}>wlueoy</Text><Text style={styles.subtitle}>A little closer to your rhythm</Text></View>
      <View style={styles.avatar} accessibilityLabel="Wlueoy"><Text style={styles.avatarText}>w</Text></View>
    </View>
  );
}

export function LoadingScreen({ label = 'Loading your cycle…' }: { label?: string }) {
  return <SafeAreaView style={styles.safeArea}><View style={styles.spinner}><ActivityIndicator color={palette.plum} size="large" /><Text style={styles.body}>{label}</Text></View></SafeAreaView>;
}

export function PressableButton({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [secondary ? styles.secondaryButton : styles.primaryButton, pressed && styles.pressed, disabled && { opacity: 0.5 }]}><Text style={secondary ? styles.secondaryButtonText : styles.primaryButtonText}>{label}</Text></Pressable>;
}
