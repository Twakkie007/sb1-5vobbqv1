import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert as AlertTriangle, RefreshCw, Chrome as Home } from 'lucide-react-native';
import { router } from 'expo-router';

interface ErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

export default function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.gradient}>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={64} color="#EF4444" strokeWidth={2} />
          </View>
          
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            We're sorry, but something unexpected happened. Our team has been notified.
          </Text>
          
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.retryButton} onPress={retry}>
              <RefreshCw size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
              <Home size={20} color="#7C3AED" strokeWidth={2} />
              <Text style={styles.homeText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#A1A1AA',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7C3AED',
    gap: 8,
  },
  homeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
});