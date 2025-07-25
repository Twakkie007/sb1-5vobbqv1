import { Tabs } from 'expo-router';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, MessageCircle, ChartBar as BarChart3, User, Sparkles, Store, Headphones, Heart } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { user, loading, initialized } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure component is ready before rendering
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if everything is ready and initialized
    if (!isReady || !initialized) return;
    
    // If no user and auth is initialized, redirect to login
    if (!user && initialized) {
      router.replace('/auth/login');
    }
  }, [user, initialized, isReady]);

  // Wait for auth to finish loading and be initialized
  if (!isReady || loading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  // Only redirect if we're sure there's no user and auth has finished loading
  if (!user && isReady && initialized) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: '#71717A',
        tabBarStyle: {
          backgroundColor: '#0F0F10',
          borderTopColor: '#2A2A2E',
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Community',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="stackie"
        options={{
          title: 'Stackie AI',
          tabBarIcon: ({ size, color }) => (
            <Sparkles size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: 'Media Hub',
          tabBarIcon: ({ size, color }) => (
            <Headphones size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ size, color }) => (
            <Store size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: 'Wellness',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
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