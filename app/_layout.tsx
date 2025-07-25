import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorBoundaryProps } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import CustomErrorBoundary from './error-boundary';

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <CustomErrorBoundary {...props} />;
}

export default function RootLayout() {
  useFrameworkReady();
  const { loading, initialized } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure proper mounting
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (!isReady || loading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#0F0F10" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F10',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});