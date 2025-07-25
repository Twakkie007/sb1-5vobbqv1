import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const StackieLogo = require('../../assets/images/Stackie.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Setup Required', 
        'Please connect to Supabase first using the "Connect to Supabase" button in the top right corner.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D', '#2A1A3D']}
        style={styles.backgroundGradient}>
        
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <View style={[styles.floatingCircle, styles.circle1]} />
          <View style={[styles.floatingCircle, styles.circle2]} />
          <View style={[styles.floatingCircle, styles.circle3]} />
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Image source={StackieLogo} style={styles.stackieLogo} />
                <View style={styles.logoGlow} />
              </View>
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color="#A855F7" strokeWidth={2} />
                <Sparkles size={12} color="#7C3AED" strokeWidth={2} />
                <Sparkles size={14} color="#DDD6FE" strokeWidth={2} />
              </View>
            </View>
            
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your HR Community account and continue your journey
            </Text>
          </View>

          {/* Form Section */}
          <BlurView intensity={20} style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.formGradient}>
              
              <View style={styles.form}>
                {/* Email Input */}
                <View style={[
                  styles.inputContainer,
                  focusedField === 'email' && styles.inputContainerFocused
                ]}>
                  <View style={styles.inputIcon}>
                    <Mail size={20} color={focusedField === 'email' ? '#A855F7' : '#71717A'} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Password Input */}
                <View style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused
                ]}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={focusedField === 'password' ? '#A855F7' : '#71717A'} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#71717A"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color="#71717A" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#71717A" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={loading ? ['#71717A', '#71717A'] : ['#A855F7', '#7C3AED', '#6366F1']}
                    style={styles.loginGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <Text style={styles.loginButtonText}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                    {!loading && (
                      <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/auth/signup" style={styles.link}>
                    <Text style={styles.linkText}>Sign Up</Text>
                  </Link>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    position: 'relative',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#A855F7',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#7C3AED',
    bottom: 100,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#DDD6FE',
    top: height * 0.3,
    right: 50,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  logoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  stackieLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#A855F7',
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formGradient: {
    padding: 32,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 29, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(42, 42, 46, 0.8)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerFocused: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(26, 26, 29, 0.9)',
    shadowColor: '#A855F7',
    shadowOpacity: 0.2,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  loginGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 15,
    color: '#A1A1AA',
  },
  link: {
    marginLeft: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A855F7',
    textDecorationLine: 'underline',
  },
});