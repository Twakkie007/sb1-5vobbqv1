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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  MessageCircle,
  Heart,
  Award,
  Briefcase,
  Users,
  DollarSign,
  Crown,
  Zap,
  CircleCheck as CheckCircle,
  X,
  Send,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase, Profile, isSupabaseConfigured } from '@/lib/supabase';

const SUBSCRIPTION_TIERS = [
  {
    tier: 'premium',
    name: 'Premium Listing',
    price: 299,
    features: [
      'Basic listing visibility',
      'Contact form access',
      'Basic analytics',
    ],
    color: '#8B5CF6',
  },
  {
    tier: 'featured',
    name: 'Featured Listing',
    price: 499,
    features: [
      'Priority placement',
      'Featured badge',
      'Advanced analytics',
      'Direct messaging',
    ],
    color: '#F59E0B',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise Package',
    price: 899,
    features: [
      'Top placement',
      'Verified badge',
      'Full analytics suite',
      'Lead generation tools',
      'Custom branding',
    ],
    color: '#10B981',
  },
];

interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  specialties: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  location?: string;
  experience_years: number;
  response_time_hours: number;
  completion_rate: number;
  total_projects: number;
  subscription_tier: 'none' | 'premium' | 'featured' | 'enterprise';
  is_featured: boolean;
  is_verified: boolean;
  views_count: number;
  likes_count: number;
  messages_count: number;
  engagement_score: number;
  last_active: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  isLiked?: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  provider_count: number;
}

export default function MarketplaceScreen() {
  const { user, profile } = useAuth();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('engagement');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [useMockData, setUseMockData] = useState(false);

  // Create provider form state
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [hourlyRateMin, setHourlyRateMin] = useState('');
  const [hourlyRateMax, setHourlyRateMax] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      loadData();
    } else {
      // Use mock data when Supabase isn't configured
      setCategories(MOCK_CATEGORIES);
      setProviders(MOCK_PROVIDERS);
      setLoading(false);
    }
  }, [user, selectedCategory, sortBy]);

  const loadData = async () => {
    try {
      if (isSupabaseConfigured) {
        await Promise.all([loadProviders(), loadCategories()]);
      } else {
        // Show empty state when not connected
        setProviders([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      setProviders([]);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            company,
            job_title
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      const providersWithLikes = await Promise.all(
        (data || []).map(async (provider) => {
          const { data: likeData } = await supabase
            .from('provider_likes')
            .select('id')
            .eq('provider_id', provider.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...provider,
            isLiked: !!likeData,
          };
        })
      );

      setProviders(providersWithLikes);
    } catch (error) {
      console.error('Error loading providers:', error);
      setProviders([]);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const createProvider = async () => {
    if (!businessName.trim() || !description.trim() || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Error',
        'Please connect to Supabase to create a provider profile'
      );
      return;
    }

    try {
      const { error } = await supabase.from('service_providers').insert({
        user_id: user.id,
        business_name: businessName,
        description: description,
        specialties: specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        hourly_rate_min: parseInt(hourlyRateMin) || 0,
        hourly_rate_max: parseInt(hourlyRateMax) || 0,
        location: location,
        experience_years: parseInt(experienceYears) || 0,
      });

      if (error) throw error;

      Alert.alert('Success', 'Service provider profile created successfully!');
      setShowCreateModal(false);
      loadProviders();
      // Reset form
      setBusinessName('');
      setDescription('');
      setSpecialties('');
      setHourlyRateMin('');
      setHourlyRateMax('');
      setLocation('');
      setExperienceYears('');
    } catch (error) {
      console.error('Error creating provider:', error);
      Alert.alert('Error', 'Failed to create service provider profile');
    }
  };

  const toggleLike = async (providerId: string) => {
    if (!user) return;

    if (!isSupabaseConfigured) return;

    try {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;

      if (provider.isLiked) {
        const { error } = await supabase
          .from('provider_likes')
          .delete()
          .eq('provider_id', providerId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('provider_likes').insert({
          provider_id: providerId,
          user_id: user.id,
        });

        if (error) throw error;
      }

      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes_count: p.isLiked ? p.likes_count - 1 : p.likes_count + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const trackView = async (providerId: string) => {
    if (!user) return;
    // In production, this would track views in the database
    console.log('View tracked for provider:', providerId);
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedProvider || !user) return;

    if (!isSupabaseConfigured) {
      Alert.alert('Error', 'Please connect to Supabase to send messages');
      return;
    }

    try {
      const { error } = await supabase.from('provider_messages').insert({
        provider_id: selectedProvider.id,
        sender_id: user.id,
        content: messageContent,
      });

      if (error) throw error;

      Alert.alert('Success', 'Message sent successfully!');
      setMessageContent('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleContactProvider = (provider: ServiceProvider) => {
    trackView(provider.id);
    setSelectedProvider(provider);
    setShowMessageModal(true);
  };

  const handleViewProfile = (provider: ServiceProvider) => {
    trackView(provider.id);
    Alert.alert(
      provider.business_name,
      `${provider.description}\n\nExperience: ${provider.experience_years} years\nCompletion Rate: ${provider.completion_rate}%\nTotal Projects: ${provider.total_projects}`,
      [{ text: 'OK' }]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredProviders = providers.filter(
    (provider) =>
      provider.business_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      provider.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          selectedCategory === 'all' && styles.categoryChipActive,
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text
          style={[
            styles.categoryText,
            selectedCategory === 'all' && styles.categoryTextActive,
          ]}
        >
          All Services
        </Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.name && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(category.name)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.name && styles.categoryTextActive,
            ]}
          >
            {category.name} ({category.provider_count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSortOptions = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sortScroll}
    >
      {[
        { key: 'engagement', label: 'Most Popular', icon: TrendingUp },
        { key: 'rating', label: 'Highest Rated', icon: Star },
        { key: 'recent', label: 'Recently Active', icon: Clock },
      ].map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.sortChip,
            sortBy === option.key && styles.sortChipActive,
          ]}
          onPress={() => setSortBy(option.key)}
        >
          <option.icon
            size={14}
            color={sortBy === option.key ? '#7C3AED' : '#71717A'}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.sortText,
              sortBy === option.key && styles.sortTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProviderCard = (provider: ServiceProvider) => (
    <TouchableOpacity key={provider.id} style={styles.providerCard}>
      {provider.is_featured && (
        <View style={styles.featuredBadge}>
          <Crown size={12} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}

      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <Image
            source={{
              uri:
                provider.profiles?.avatar_url ||
                'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
            }}
            style={styles.providerAvatar}
          />
          <View style={styles.providerDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>
                {provider.profiles?.full_name || 'Anonymous'}
              </Text>
              {provider.is_verified && (
                <CheckCircle size={16} color="#10B981" strokeWidth={2} />
              )}
              {provider.subscription_tier !== 'none' && (
                <Crown size={14} color="#F59E0B" strokeWidth={2} />
              )}
            </View>
            <Text style={styles.providerTitle}>{provider.business_name}</Text>
            {provider.profiles?.company && (
              <Text style={styles.providerCompany}>
                {provider.profiles.company}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.ratingContainer}>
          <Star size={16} color="#F59E0B" strokeWidth={2} fill="#F59E0B" />
          <Text style={styles.rating}>
            {(provider.completion_rate / 20).toFixed(1)}
          </Text>
          <Text style={styles.reviewCount}>({provider.total_projects})</Text>
        </View>
      </View>

      <Text style={styles.providerDescription}>{provider.description}</Text>

      <View style={styles.specialtiesContainer}>
        {provider.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <View style={styles.providerStats}>
        <View style={styles.statItem}>
          <MapPin size={14} color="#71717A" strokeWidth={2} />
          <Text style={styles.statText}>{provider.location || 'Remote'}</Text>
        </View>
        <View style={styles.statItem}>
          <DollarSign size={14} color="#71717A" strokeWidth={2} />
          <Text style={styles.statText}>
            R{provider.hourly_rate_min}-{provider.hourly_rate_max}/hour
          </Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color="#71717A" strokeWidth={2} />
          <Text style={styles.statText}>
            {provider.response_time_hours}h response
          </Text>
        </View>
      </View>

      <View style={styles.engagementStats}>
        <TouchableOpacity
          style={styles.engagementItem}
          onPress={() => toggleLike(provider.id)}
        >
          <Heart
            size={14}
            color={provider.isLiked ? '#EF4444' : '#64748B'}
            strokeWidth={2}
            fill={provider.isLiked ? '#EF4444' : 'none'}
          />
          <Text
            style={[
              styles.engagementText,
              provider.isLiked && { color: '#EF4444' },
            ]}
          >
            {provider.likes_count}
          </Text>
        </TouchableOpacity>
        <View style={styles.engagementItem}>
          <Eye size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.engagementText}>{provider.views_count}</Text>
        </View>
        <View style={styles.engagementItem}>
          <MessageCircle size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.engagementText}>{provider.messages_count}</Text>
        </View>
        <View style={styles.popularityScore}>
          <TrendingUp size={12} color="#7C3AED" strokeWidth={2} />
          <Text style={styles.popularityText}>
            {provider.engagement_score}% popular
          </Text>
        </View>
      </View>

      <View style={styles.providerActions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactProvider(provider)}
        >
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={() => handleViewProfile(provider)}
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCreateProviderModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Service Provider Profile</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Your business or service name"
              placeholderTextColor="#64748B"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your services and expertise"
              placeholderTextColor="#64748B"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specialties (comma separated)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Labor Law, CCMA, Employment Contracts"
              placeholderTextColor="#64748B"
              value={specialties}
              onChangeText={setSpecialties}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Min Rate (R/hour)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="500"
                placeholderTextColor="#64748B"
                value={hourlyRateMin}
                onChangeText={setHourlyRateMin}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Max Rate (R/hour)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1000"
                placeholderTextColor="#64748B"
                value={hourlyRateMax}
                onChangeText={setHourlyRateMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Cape Town, WC"
              placeholderTextColor="#64748B"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Years of Experience</Text>
            <TextInput
              style={styles.textInput}
              placeholder="5"
              placeholderTextColor="#64748B"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCreateModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={createProvider}
          >
            <Text style={styles.createButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderMessageModal = () => (
    <Modal
      visible={showMessageModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Contact {selectedProvider?.business_name}
          </Text>
          <TouchableOpacity onPress={() => setShowMessageModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Message</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your project or inquiry..."
              placeholderTextColor="#64748B"
              value={messageContent}
              onChangeText={setMessageContent}
              multiline
            />
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowMessageModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={sendMessage}>
            <Text style={styles.createButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSubscriptionModal = () => (
    <Modal
      visible={showSubscriptionModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose Your Plan</Text>
          <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
            <X size={24} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {SUBSCRIPTION_TIERS.map((tier, index) => (
            <TouchableOpacity key={tier.tier} style={styles.subscriptionTier}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierPrice}>R{tier.price}/month</Text>
              </View>
              <View style={styles.tierFeatures}>
                {tier.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <CheckCircle size={16} color={tier.color} strokeWidth={2} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  { backgroundColor: tier.color },
                ]}
                onPress={() => {
                  Alert.alert(
                    'Coming Soon',
                    'Payment integration will be available soon!'
                  );
                  setShowSubscriptionModal(false);
                }}
              >
                <Text style={styles.subscribeButtonText}>Choose Plan</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
          <Text style={styles.headerTitle}>HR Marketplace</Text>
          <Text style={styles.headerSubtitle}>
            Connect to Supabase to access the marketplace
          </Text>
        </LinearGradient>
        <View style={styles.notConnectedContainer}>
          <Text style={styles.notConnectedText}>
            Please connect to Supabase to access marketplace features
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0B', '#1A1A1D']} style={styles.header}>
        <Text style={styles.headerTitle}>HR Marketplace</Text>
        <Text style={styles.headerSubtitle}>
          {useMockData ? 'Demo Mode - ' : ''}Connect with top HR professionals
        </Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#64748B" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search HR services..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#A1A1AA" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{providers.length}</Text>
            <Text style={styles.statLabel}>Active Professionals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {providers.reduce((sum, p) => sum + p.total_projects, 0)}
            </Text>
            <Text style={styles.statLabel}>Projects Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {providers.length > 0
                ? (
                    providers.reduce((sum, p) => sum + p.completion_rate, 0) /
                    providers.length /
                    20
                  ).toFixed(1)
                : '0'}
              ★
            </Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        {renderCategoryFilter()}
        {renderSortOptions()}

        <View style={styles.providersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredProviders.length} Professional
              {filteredProviders.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.postServiceButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.postServiceText}>Post Service</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading professionals...</Text>
            </View>
          ) : filteredProviders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No HR professionals found</Text>
              <Text style={styles.emptySubtext}>
                {isSupabaseConfigured
                  ? 'Be the first to offer your services!'
                  : 'Connect to Supabase to view professionals'}
              </Text>
            </View>
          ) : (
            filteredProviders.map(renderProviderCard)
          )}
        </View>

        <View style={styles.pricingInfo}>
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            style={styles.pricingGradient}
          >
            <Crown size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.pricingTitle}>List Your HR Services</Text>
            <Text style={styles.pricingDescription}>
              Join our network of HR professionals
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => setShowSubscriptionModal(true)}
            >
              <Text style={styles.upgradeButtonText}>View Pricing Plans</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {renderCreateProviderModal()}
      {renderMessageModal()}
      {renderSubscriptionModal()}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterButton: {
    backgroundColor: '#2A2A2E',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notConnectedText: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#7C3AED',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sortScroll: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  sortChipActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#1A1A1D',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717A',
  },
  sortTextActive: {
    color: '#7C3AED',
  },
  providersSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  postServiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#A1A1AA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  providerCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  providerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
    marginBottom: 2,
  },
  providerCompany: {
    fontSize: 13,
    color: '#71717A',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: 14,
    color: '#71717A',
  },
  providerDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A855F7',
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#71717A',
  },
  engagementStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2E',
    marginBottom: 16,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  popularityScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularityText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  providerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewProfileButton: {
    flex: 1,
    backgroundColor: '#2A2A2E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  pricingInfo: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pricingGradient: {
    padding: 24,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#DDD6FE',
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F10',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2E',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2E',
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
  createButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionTier: {
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
  },
  tierFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  subscribeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
