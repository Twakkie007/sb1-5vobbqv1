import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  CircleHelp as HelpCircle,
  LogOut,
  Crown,
  Star,
  ChevronRight,
  Sparkles,
  CreditCard as Edit,
  Save,
  X,
  Mail,
  Building,
  Briefcase,
  FileText,
  Camera,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface MenuItem {
  icon: any;
  title: string;
  subtitle?: string;
  action: string;
  showChevron?: boolean;
  isPremium?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(true);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditFullName(profile.full_name || '');
      setEditCompany(profile.company || '');
      setEditJobTitle(profile.job_title || '');
      setEditBio(profile.bio || '');
      setSelectedImage(null);
    }
  }, [profile]);

  const MENU_ITEMS: MenuItem[] = [
    {
      icon: User,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      action: 'edit_profile',
      showChevron: true,
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      action: 'notifications',
      hasSwitch: true,
      switchValue: isNotificationsEnabled,
      onSwitchChange: setIsNotificationsEnabled,
    },
    {
      icon: Settings,
      title: 'Dark Mode',
      subtitle: 'Toggle dark/light theme',
      action: 'dark_mode',
      hasSwitch: true,
      switchValue: isDarkModeEnabled,
      onSwitchChange: setIsDarkModeEnabled,
    },
    {
      icon: Sparkles,
      title: 'Auto Sync',
      subtitle: 'Automatically sync your data',
      action: 'auto_sync',
      hasSwitch: true,
      switchValue: isAutoSyncEnabled,
      onSwitchChange: setIsAutoSyncEnabled,
    },
    {
      icon: CreditCard,
      title: 'Subscription',
      subtitle: 'Manage your premium membership',
      action: 'subscription',
      showChevron: true,
      isPremium: true,
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Control your data and security settings',
      action: 'privacy',
      showChevron: true,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      action: 'help',
      showChevron: true,
    },
  ];

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'edit_profile':
        setShowEditModal(true);
        break;
      case 'subscription':
        setShowSubscriptionModal(true);
        break;
      case 'privacy':
        Alert.alert(
          'Privacy & Security',
          'Your data is protected with end-to-end encryption. All personal information is stored securely and never shared without your consent.',
          [{ text: 'OK' }]
        );
        break;
      case 'help':
        setShowHelpModal(true);
        break;
      default:
        break;
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Select Photo',
      'Choose how you want to select your profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImagePicker() },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    if (!isSupabaseConfigured || !user) return null;

    try {
      setUploadingImage(true);

      // Create a unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // For web, we need to convert the image to a blob
      let fileData;
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        fileData = await response.blob();
      } else {
        // For mobile, read the file as base64 and convert to blob
        const response = await fetch(imageUri);
        fileData = await response.blob();
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!isSupabaseConfigured || !user) {
      Alert.alert(
        'Error',
        'Unable to save profile. Please check your connection.'
      );
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new image if selected
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          Alert.alert('Warning', 'Profile updated but image upload failed.');
        }
      }

      const { error } = await updateProfile({
        full_name: editFullName,
        company: editCompany,
        job_title: editJobTitle,
        bio: editBio,
        avatar_url: avatarUrl,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
        setShowEditModal(false);
        setSelectedImage(null);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          } else {
            router.replace('/auth/login');
          }
        },
      },
    ]);
  };

  const openExternalLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  const renderSubscriptionBanner = () => {
    const isPremium = profile?.is_premium || false;

    return (
      <TouchableOpacity
        style={styles.subscriptionBanner}
        onPress={() => setShowSubscriptionModal(true)}
      >
        <LinearGradient
          colors={isPremium ? ['#10B981', '#34D399'] : ['#7C3AED', '#A855F7']}
          style={styles.subscriptionGradient}
        >
          <View style={styles.subscriptionContent}>
            <Crown size={24} color="#FFFFFF" strokeWidth={2} />
            <View style={styles.subscriptionText}>
              <Text style={styles.subscriptionTitle}>
                {isPremium ? 'Premium Member' : 'Upgrade to Premium'}
              </Text>
              <Text style={styles.subscriptionSubtitle}>
                {isPremium
                  ? 'Unlimited AI queries & analytics'
                  : 'Unlock unlimited AI queries & advanced analytics'}
              </Text>
            </View>
            {!isPremium && (
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderUsageStats = () => {
    const queriesUsed = profile?.ai_queries_used || 0;
    const queriesLimit = profile?.ai_queries_limit || 50;
    const usagePercentage = (queriesUsed / queriesLimit) * 100;

    return (
      <View style={styles.usageContainer}>
        <Text style={styles.sectionTitle}>This Month's Usage</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Sparkles size={20} color="#7C3AED" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{queriesUsed}</Text>
            <Text style={styles.statLabel}>AI Queries</Text>
            <Text style={styles.statLimit}>
              of {queriesLimit} {profile?.is_premium ? 'unlimited' : 'free'}
            </Text>
            <View style={styles.usageBar}>
              <View
                style={[
                  styles.usageBarFill,
                  {
                    width: `${Math.min(usagePercentage, 100)}%`,
                    backgroundColor:
                      usagePercentage > 80 ? '#EF4444' : '#7C3AED',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Star size={20} color="#F59E0B" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Posts Shared</Text>
            <Text style={styles.statLimit}>community engagement</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMenuItem = (item: MenuItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={() => handleMenuAction(item.action)}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuIcon,
            item.isPremium && { backgroundColor: '#EDE9FE' },
          ]}
        >
          <item.icon
            size={20}
            color={item.isPremium ? '#8B5CF6' : '#64748B'}
            strokeWidth={2}
          />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
            thumbColor={item.switchValue ? '#FFFFFF' : '#FFFFFF'}
          />
        ) : item.showChevron ? (
          <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.modalContent}>
          <View style={styles.avatarSection}>
            <Image
              source={{
                uri:
                  selectedImage ||
                  profile?.avatar_url ||
                  'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150',
              }}
              style={styles.editAvatar}
            />
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={pickImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <Text style={styles.uploadingText}>...</Text>
              ) : (
                <Camera size={16} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#64748B"
                value={editFullName}
                onChangeText={setEditFullName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company</Text>
            <View style={styles.inputContainer}>
              <Building size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.textInput}
                placeholder="Your company name"
                placeholderTextColor="#64748B"
                value={editCompany}
                onChangeText={setEditCompany}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Job Title</Text>
            <View style={styles.inputContainer}>
              <Briefcase size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.textInput}
                placeholder="Your job title"
                placeholderTextColor="#64748B"
                value={editJobTitle}
                onChangeText={setEditJobTitle}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <FileText size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#64748B"
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        <BlurView intensity={20} style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowEditModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading || uploadingImage}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Save size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );

  const renderSubscriptionModal = () => (
    <Modal
      visible={showSubscriptionModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Premium Subscription</Text>
          <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.modalContent}>
          <View style={styles.subscriptionInfo}>
            <Crown size={48} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.subscriptionInfoTitle}>
              Unlock Premium Features
            </Text>
            <Text style={styles.subscriptionInfoText}>
              Get unlimited access to Stackie AI, advanced analytics, and
              exclusive HR resources.
            </Text>
          </View>

          <View style={styles.featuresList}>
            {[
              'Unlimited AI queries with Stackie',
              'Advanced analytics and insights',
              'Priority customer support',
              'Exclusive HR templates and resources',
              'Early access to new features',
              'Custom branding options',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={16} color="#10B981" strokeWidth={2} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Premium Plan</Text>
            <Text style={styles.pricingPrice}>R299/month</Text>
            <Text style={styles.pricingDescription}>
              Cancel anytime. 30-day money-back guarantee.
            </Text>
          </View>
        </ScrollView>

        <BlurView intensity={20} style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowSubscriptionModal(false)}
          >
            <Text style={styles.cancelButtonText}>Maybe Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              Alert.alert(
                'Coming Soon',
                'Payment integration will be available soon!'
              );
              setShowSubscriptionModal(false);
            }}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.upgradeButtonGradient}
            >
              <Crown size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </Modal>
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelpModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Help & Support</Text>
          <TouchableOpacity onPress={() => setShowHelpModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView style={styles.modalContent}>
          <View style={styles.helpSection}>
            <Text style={styles.helpSectionTitle}>
              Frequently Asked Questions
            </Text>

            <TouchableOpacity style={styles.helpItem}>
              <Text style={styles.helpQuestion}>
                How do I reset my password?
              </Text>
              <Text style={styles.helpAnswer}>
                Go to the login screen and tap "Forgot Password" to receive a
                reset link.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpItem}>
              <Text style={styles.helpQuestion}>
                How do I upgrade to Premium?
              </Text>
              <Text style={styles.helpAnswer}>
                Tap on the subscription section in your profile to view premium
                plans.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpItem}>
              <Text style={styles.helpQuestion}>Is my data secure?</Text>
              <Text style={styles.helpAnswer}>
                Yes, all data is encrypted and stored securely. We never share
                your information.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.helpSectionTitle}>Contact Support</Text>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => openExternalLink('mailto:support@hrapp.com')}
            >
              <Mail size={20} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.contactText}>support@hrapp.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => openExternalLink('https://hrapp.com/help')}
            >
              <HelpCircle size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.contactText}>Visit Help Center</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                profile?.avatar_url ||
                'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150',
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.profileRole}>
              {profile?.job_title && profile?.company
                ? `${profile.job_title} at ${profile.company}`
                : profile?.job_title || profile?.company || 'HR Professional'}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {profile?.is_premium ? 'Premium Member' : 'Community Member'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setShowEditModal(true)}
          >
            <Edit size={16} color="#A855F7" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSubscriptionBanner()}
        {renderUsageStats()}

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {MENU_ITEMS.map(renderMenuItem)}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#EF4444" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>HR Community App v1.0</Text>
          <Text style={styles.footerText}>
            Made with ❤️ for HR professionals
          </Text>
        </View>
      </ScrollView>

      {renderEditModal()}
      {renderSubscriptionModal()}
      {renderHelpModal()}
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
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DDD6FE',
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subscriptionBanner: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  subscriptionText: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: '#DDD6FE',
  },
  usageContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
    marginBottom: 2,
  },
  statLimit: {
    fontSize: 10,
    color: '#71717A',
    marginBottom: 8,
  },
  usageBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#2A2A2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2A2A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#71717A',
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1D',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2A2A2E',
    gap: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subscriptionInfoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  subscriptionInfoText: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  pricingCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 8,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  upgradeButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpSection: {
    marginBottom: 32,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  helpItem: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  helpQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helpAnswer: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  uploadingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imagePreview: {
    borderColor: '#7C3AED',
  },
});
