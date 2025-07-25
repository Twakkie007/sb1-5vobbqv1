import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, Brain, Shield, Users, Phone, MessageCircle, Calendar, Clock, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Star, Headphones, Book, Activity, Zap, Sun, Moon, Coffee, Smile, Frown, Meh, X, Play, Pause, RotateCcw, Volume2, Send, Plus, Target, Award, Lightbulb, FileText, CircleHelp as HelpCircle, ExternalLink } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

interface MoodEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'low' | 'struggling';
  energy: number;
  stress: number;
  notes?: string;
}

interface Resource {
  id: string;
  type: 'article' | 'video' | 'audio' | 'tool' | 'contact';
  title: string;
  description: string;
  category: string;
  duration?: string;
  thumbnail?: string;
  isUrgent?: boolean;
  tags: string[];
}

interface SupportContact {
  id: string;
  name: string;
  type: 'crisis' | 'counseling' | 'eap' | 'medical';
  phone: string;
  hours: string;
  description: string;
  isEmergency?: boolean;
}

const MOOD_OPTIONS = [
  { key: 'great', label: 'Great', icon: Smile, color: '#10B981', emoji: '😊' },
  { key: 'good', label: 'Good', icon: Smile, color: '#3B82F6', emoji: '🙂' },
  { key: 'okay', label: 'Okay', icon: Meh, color: '#F59E0B', emoji: '😐' },
  { key: 'low', label: 'Low', icon: Frown, color: '#EF4444', emoji: '😔' },
  { key: 'struggling', label: 'Struggling', icon: Frown, color: '#DC2626', emoji: '😰' },
];

const CRISIS_CONTACTS: SupportContact[] = [
  {
    id: 'sadag',
    name: 'SADAG Crisis Line',
    type: 'crisis',
    phone: '0800 567 567',
    hours: '24/7',
    description: 'South African Depression and Anxiety Group - Free crisis support',
    isEmergency: true
  },
  {
    id: 'lifeline',
    name: 'Lifeline Southern Africa',
    type: 'crisis',
    phone: '0861 322 322',
    hours: '24/7',
    description: 'Crisis counseling and suicide prevention',
    isEmergency: true
  },
  {
    id: 'childline',
    name: 'Childline South Africa',
    type: 'crisis',
    phone: '116',
    hours: '24/7',
    description: 'Support for children and families in crisis',
    isEmergency: false
  },
  {
    id: 'eap',
    name: 'Employee Assistance Program',
    type: 'eap',
    phone: '0800 111 222',
    hours: 'Mon-Fri 8AM-6PM',
    description: 'Confidential workplace counseling and support services',
    isEmergency: false
  }
];

const WELLNESS_RESOURCES: Resource[] = [
  {
    id: 'stress-management',
    type: 'tool',
    title: 'Workplace Stress Assessment',
    description: 'Comprehensive tool to identify stress triggers and develop coping strategies',
    category: 'Stress Management',
    tags: ['assessment', 'stress', 'workplace']
  },
  {
    id: 'burnout-prevention',
    type: 'article',
    title: 'Preventing Employee Burnout: A Manager\'s Guide',
    description: 'Evidence-based strategies for recognizing and preventing workplace burnout',
    category: 'Burnout Prevention',
    tags: ['burnout', 'management', 'prevention']
  },
  {
    id: 'mindfulness-audio',
    type: 'audio',
    title: '10-Minute Workplace Mindfulness',
    description: 'Guided meditation designed for busy professionals',
    category: 'Mindfulness',
    duration: '10:00',
    tags: ['meditation', 'mindfulness', 'relaxation']
  },
  {
    id: 'mental-health-policy',
    type: 'tool',
    title: 'Mental Health Policy Template',
    description: 'Comprehensive workplace mental health policy template for SA companies',
    category: 'Policy Development',
    tags: ['policy', 'template', 'compliance']
  },
  {
    id: 'resilience-training',
    type: 'video',
    title: 'Building Team Resilience',
    description: 'Workshop on developing psychological resilience in the workplace',
    category: 'Resilience',
    duration: '45:00',
    tags: ['resilience', 'training', 'team building']
  },
  {
    id: 'return-to-work',
    type: 'tool',
    title: 'Mental Health Return-to-Work Program',
    description: 'Structured program for supporting employees returning after mental health leave',
    category: 'Return to Work',
    tags: ['return to work', 'support', 'reintegration']
  }
];

const QUICK_ACTIONS = [
  {
    id: 'mood-check',
    title: 'Mood Check-in',
    description: 'Track your daily wellbeing',
    icon: Heart,
    color: '#EF4444',
    action: 'mood'
  },
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: '5-minute calming technique',
    icon: Activity,
    color: '#3B82F6',
    action: 'breathing'
  },
  {
    id: 'crisis-support',
    title: 'Crisis Support',
    description: 'Immediate help available',
    icon: Phone,
    color: '#DC2626',
    action: 'crisis'
  },
  {
    id: 'wellness-plan',
    title: 'Wellness Plan',
    description: 'Create your action plan',
    icon: Target,
    color: '#10B981',
    action: 'plan'
  }
];

export default function WellnessScreen() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const breathingAnimation = new Animated.Value(0.8);
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    // Pulse animation for crisis button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
    
    const breathingCycle = () => {
      // Inhale (4 seconds)
      setBreathingPhase('inhale');
      Animated.timing(breathingAnimation, {
        toValue: 1.2,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold (4 seconds)
        setBreathingPhase('hold');
        setTimeout(() => {
          // Exhale (4 seconds)
          setBreathingPhase('exhale');
          Animated.timing(breathingAnimation, {
            toValue: 0.8,
            duration: 4000,
            useNativeDriver: true,
          }).start(() => {
            setBreathingCount(prev => {
              const newCount = prev + 1;
              if (newCount < 5 && isBreathing) {
                setTimeout(breathingCycle, 1000);
              } else {
                setIsBreathing(false);
              }
              return newCount;
            });
          });
        }, 2000);
      });
    };
    
    breathingCycle();
  };

  const saveMoodEntry = () => {
    if (!selectedMood) return;
    
    // In a real app, this would save to database
    Alert.alert(
      'Mood Saved',
      'Your mood entry has been recorded. Remember, it\'s okay to have difficult days.',
      [{ text: 'OK', onPress: () => setShowMoodModal(false) }]
    );
    
    setSelectedMood(null);
    setMoodNotes('');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'mood':
        setShowMoodModal(true);
        break;
      case 'breathing':
        setShowBreathingModal(true);
        break;
      case 'crisis':
        setShowCrisisModal(true);
        break;
      case 'plan':
        Alert.alert('Wellness Plan', 'This feature will help you create a personalized wellness action plan.');
        break;
    }
  };

  const categories = ['All', 'Stress Management', 'Burnout Prevention', 'Mindfulness', 'Policy Development', 'Resilience', 'Return to Work'];

  const filteredResources = WELLNESS_RESOURCES.filter(resource =>
    selectedCategory === 'All' || resource.category === selectedCategory
  );

  const renderWellnessStats = () => (
    <View style={styles.statsContainer}>
      <LinearGradient colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']} style={styles.statsGradient}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Heart size={20} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>87%</Text>
            <Text style={styles.statLabel}>Wellbeing Score</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Users size={20} color="#3B82F6" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>2.4k</Text>
            <Text style={styles.statLabel}>Supported</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <TrendingUp size={20} color="#F59E0B" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Recovery Rate</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Support</Text>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action.action)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[`${action.color}20`, `${action.color}10`]}
              style={styles.quickActionGradient}>
              <Animated.View style={[
                styles.quickActionIcon,
                { backgroundColor: `${action.color}30` },
                action.id === 'crisis-support' && { transform: [{ scale: pulseAnimation }] }
              ]}>
                <action.icon size={24} color={action.color} strokeWidth={2} />
              </Animated.View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderResourceCard = (resource: Resource) => (
    <TouchableOpacity key={resource.id} style={styles.resourceCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.resourceGradient}>
        
        <View style={styles.resourceHeader}>
          <View style={styles.resourceTypeContainer}>
            <View style={[styles.resourceTypeIcon, { backgroundColor: getResourceColor(resource.type) + '20' }]}>
              {getResourceIcon(resource.type)}
            </View>
            <Text style={[styles.resourceType, { color: getResourceColor(resource.type) }]}>
              {resource.type.toUpperCase()}
            </Text>
          </View>
          {resource.duration && (
            <View style={styles.durationBadge}>
              <Clock size={12} color="#A1A1AA" strokeWidth={2} />
              <Text style={styles.durationText}>{resource.duration}</Text>
            </View>
          )}
        </View>

        <Text style={styles.resourceTitle}>{resource.title}</Text>
        <Text style={styles.resourceDescription}>{resource.description}</Text>
        
        <View style={styles.resourceTags}>
          {resource.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.resourceTag}>
              <Text style={styles.resourceTagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.resourceActions}>
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>Access Resource</Text>
            <ExternalLink size={16} color="#7C3AED" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText size={16} color="#3B82F6" strokeWidth={2} />;
      case 'video': return <Play size={16} color="#EF4444" strokeWidth={2} />;
      case 'audio': return <Headphones size={16} color="#10B981" strokeWidth={2} />;
      case 'tool': return <Target size={16} color="#F59E0B" strokeWidth={2} />;
      case 'contact': return <Phone size={16} color="#7C3AED" strokeWidth={2} />;
      default: return <Book size={16} color="#64748B" strokeWidth={2} />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'article': return '#3B82F6';
      case 'video': return '#EF4444';
      case 'audio': return '#10B981';
      case 'tool': return '#F59E0B';
      case 'contact': return '#7C3AED';
      default: return '#64748B';
    }
  };

  const renderMoodModal = () => (
    <Modal visible={showMoodModal} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.modalContainer}>
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>How are you feeling today?</Text>
          <TouchableOpacity onPress={() => setShowMoodModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.moodPrompt}>
            Your mental health matters. Take a moment to check in with yourself.
          </Text>

          <View style={styles.moodOptions}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[
                  styles.moodOption,
                  selectedMood === mood.key && styles.moodOptionSelected,
                  { borderColor: mood.color }
                ]}
                onPress={() => setSelectedMood(mood.key)}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>How can we support you? (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#64748B"
              value={moodNotes}
              onChangeText={setMoodNotes}
              multiline
            />
          </View>

          {selectedMood === 'struggling' || selectedMood === 'low' ? (
            <View style={styles.supportAlert}>
              <AlertTriangle size={20} color="#EF4444" strokeWidth={2} />
              <Text style={styles.supportAlertText}>
                We're here to help. Consider reaching out to our support resources below.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <BlurView intensity={20} style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowMoodModal(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !selectedMood && styles.saveButtonDisabled]}
            onPress={saveMoodEntry}
            disabled={!selectedMood}>
            <Text style={styles.saveButtonText}>Save Check-in</Text>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );

  const renderCrisisModal = () => (
    <Modal visible={showCrisisModal} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.modalContainer}>
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Crisis Support</Text>
          <TouchableOpacity onPress={() => setShowCrisisModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.modalContent}>
          <View style={styles.crisisAlert}>
            <Heart size={24} color="#EF4444" strokeWidth={2} />
            <Text style={styles.crisisAlertTitle}>You're Not Alone</Text>
            <Text style={styles.crisisAlertText}>
              If you're in crisis or need immediate support, please reach out. Help is available 24/7.
            </Text>
          </View>

          {CRISIS_CONTACTS.map((contact) => (
            <TouchableOpacity key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={[
                  styles.contactIcon,
                  { backgroundColor: contact.isEmergency ? '#FEE2E2' : '#DBEAFE' }
                ]}>
                  <Phone size={20} color={contact.isEmergency ? '#EF4444' : '#3B82F6'} strokeWidth={2} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                {contact.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <Text style={styles.emergencyText}>24/7</Text>
                  </View>
                )}
              </View>
              <Text style={styles.contactDescription}>{contact.description}</Text>
              <Text style={styles.contactHours}>Available: {contact.hours}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );

  const renderBreathingModal = () => (
    <Modal visible={showBreathingModal} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.modalContainer}>
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Breathing Exercise</Text>
          <TouchableOpacity onPress={() => setShowBreathingModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <View style={styles.breathingContainer}>
          <Text style={styles.breathingTitle}>4-4-4 Breathing Technique</Text>
          <Text style={styles.breathingSubtitle}>
            Follow the circle and breathe deeply to reduce stress and anxiety
          </Text>

          <View style={styles.breathingCircleContainer}>
            <Animated.View style={[
              styles.breathingCircle,
              { transform: [{ scale: breathingAnimation }] }
            ]}>
              <Text style={styles.breathingPhaseText}>
                {breathingPhase === 'inhale' ? 'Breathe In' : 
                 breathingPhase === 'hold' ? 'Hold' : 'Breathe Out'}
              </Text>
              <Text style={styles.breathingCountText}>
                {breathingCount}/5
              </Text>
            </Animated.View>
          </View>

          <View style={styles.breathingControls}>
            {!isBreathing ? (
              <TouchableOpacity
                style={styles.breathingButton}
                onPress={startBreathingExercise}>
                <Play size={24} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.breathingButtonText}>Start Exercise</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.breathingButton, styles.breathingButtonStop]}
                onPress={() => setIsBreathing(false)}>
                <Pause size={24} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.breathingButtonText}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.breathingInstructions}>
            • Inhale slowly for 4 seconds{'\n'}
            • Hold your breath for 4 seconds{'\n'}
            • Exhale slowly for 4 seconds{'\n'}
            • Repeat 5 times for best results
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Mental Health Hub</Text>
              <Text style={styles.headerSubtitle}>Supporting workplace wellbeing & resilience</Text>
            </View>
            <View style={styles.headerIcon}>
              <Heart size={24} color="#EF4444" strokeWidth={2} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderWellnessStats()}
        {renderQuickActions()}

        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Wellness Resources</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredResources.map(renderResourceCard)}
        </View>
      </ScrollView>

      {renderMoodModal()}
      {renderCrisisModal()}
      {renderBreathingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F10',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 16,
  },
  resourcesSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#2A2A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A855F7',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resourceCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  resourceGradient: {
    padding: 20,
    backgroundColor: '#1A1A1D',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resourceTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceType: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2A2A2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
    marginBottom: 16,
  },
  resourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  resourceTag: {
    backgroundColor: '#2A2A2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resourceTagText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  resourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A855F7',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  moodPrompt: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 32,
  },
  moodOption: {
    width: (width - 80) / 3,
    aspectRatio: 1,
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  moodOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  supportAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  supportAlertText: {
    flex: 1,
    fontSize: 14,
    color: '#FCA5A5',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#374151',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  crisisAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  crisisAlertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  crisisAlertText: {
    fontSize: 14,
    color: '#FCA5A5',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emergencyBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
    marginBottom: 4,
  },
  contactHours: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  breathingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  breathingSubtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  breathingCircleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingPhaseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  breathingCountText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  breathingControls: {
    marginBottom: 40,
  },
  breathingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  breathingButtonStop: {
    backgroundColor: '#EF4444',
  },
  breathingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breathingInstructions: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 24,
    textAlign: 'center',
  },
});