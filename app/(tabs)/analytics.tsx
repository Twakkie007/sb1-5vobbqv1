import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  MessageCircle, 
  Clock, 
  Target, 
  Users, 
  ThumbsUp, 
  Sparkles, 
  BookOpen,
  Award,
  Activity,
  Zap,
  Brain,
  Heart,
  Headphones,
  Video,
  Store,
  Smile,
  Frown,
  Meh,
  Shield,
  TrendingDown
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  description: string;
}

interface UsageData {
  date: string;
  aiQueries: number;
  effectiveness: number;
  communityPosts: number;
  userEngagement: number;
  moodScore: number;
  mediaViews: number;
  marketplaceViews: number;
}

interface MoodData {
  mood: 'great' | 'good' | 'okay' | 'low' | 'struggling';
  count: number;
  percentage: number;
  color: string;
}

const COMPREHENSIVE_METRICS: MetricCard[] = [
  {
    title: 'AI Queries Resolved',
    value: '2,847',
    change: '+34%',
    trend: 'up',
    icon: Sparkles,
    color: '#8B5CF6',
    description: 'Total questions answered by Stackie AI'
  },
  {
    title: 'Community Engagement',
    value: '96.8%',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: '#10B981',
    description: 'Active community participation rate'
  },
  {
    title: 'Wellness Score',
    value: '87.3%',
    change: '+12.1%',
    trend: 'up',
    icon: Heart,
    color: '#EF4444',
    description: 'Average HR wellbeing rating'
  },
  {
    title: 'Media Consumption',
    value: '4,567',
    change: '+28%',
    trend: 'up',
    icon: Headphones,
    color: '#3B82F6',
    description: 'Podcast & video views this month'
  },
  {
    title: 'Marketplace Activity',
    value: '1,234',
    change: '+45%',
    trend: 'up',
    icon: Store,
    color: '#F59E0B',
    description: 'HR service provider interactions'
  },
  {
    title: 'AI Response Time',
    value: '1.8s',
    change: '-0.5s',
    trend: 'up',
    icon: Zap,
    color: '#EC4899',
    description: 'Average Stackie AI response time'
  }
];

const USAGE_DATA: UsageData[] = [
  { date: 'Mon', aiQueries: 45, effectiveness: 92, communityPosts: 12, userEngagement: 78, moodScore: 85, mediaViews: 156, marketplaceViews: 89 },
  { date: 'Tue', aiQueries: 52, effectiveness: 89, communityPosts: 18, userEngagement: 82, moodScore: 82, mediaViews: 203, marketplaceViews: 134 },
  { date: 'Wed', aiQueries: 67, effectiveness: 94, communityPosts: 15, userEngagement: 85, moodScore: 88, mediaViews: 178, marketplaceViews: 167 },
  { date: 'Thu', aiQueries: 58, effectiveness: 96, communityPosts: 22, userEngagement: 88, moodScore: 91, mediaViews: 234, marketplaceViews: 198 },
  { date: 'Fri', aiQueries: 73, effectiveness: 91, communityPosts: 19, userEngagement: 92, moodScore: 87, mediaViews: 267, marketplaceViews: 156 },
  { date: 'Sat', aiQueries: 34, effectiveness: 88, communityPosts: 8, userEngagement: 65, moodScore: 79, mediaViews: 145, marketplaceViews: 78 },
  { date: 'Sun', aiQueries: 29, effectiveness: 93, communityPosts: 6, userEngagement: 58, moodScore: 83, mediaViews: 123, marketplaceViews: 67 },
];

const MOOD_DATA: MoodData[] = [
  { mood: 'great', count: 342, percentage: 38.2, color: '#10B981' },
  { mood: 'good', count: 298, percentage: 33.3, color: '#3B82F6' },
  { mood: 'okay', count: 156, percentage: 17.4, color: '#F59E0B' },
  { mood: 'low', count: 67, percentage: 7.5, color: '#EF4444' },
  { mood: 'struggling', count: 32, percentage: 3.6, color: '#DC2626' },
];

const FEATURE_USAGE = [
  { name: 'Stackie AI', usage: 2847, percentage: 42.1, color: '#8B5CF6', icon: Sparkles },
  { name: 'Community', usage: 1456, percentage: 21.5, color: '#10B981', icon: Users },
  { name: 'Media Hub', usage: 1234, percentage: 18.2, color: '#3B82F6', icon: Headphones },
  { name: 'Marketplace', usage: 789, percentage: 11.7, color: '#F59E0B', icon: Store },
  { name: 'Wellness', usage: 445, percentage: 6.5, color: '#EF4444', icon: Heart },
];

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedChart, setSelectedChart] = useState('engagement');
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  useEffect(() => {
    // Animate the chart bars
    const timer = setTimeout(() => {
      if (selectedChart === 'engagement') {
        setAnimatedValues(USAGE_DATA.map(data => data.userEngagement));
      } else if (selectedChart === 'mood') {
        setAnimatedValues(USAGE_DATA.map(data => data.moodScore));
      } else {
        setAnimatedValues(USAGE_DATA.map(data => data.aiQueries));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedChart]);

  const renderMetricCard = (metric: MetricCard, index: number) => (
    <View key={index} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
          <metric.icon size={20} color={metric.color} strokeWidth={2} />
        </View>
        <View style={styles.trendIndicator}>
          {metric.trend === 'up' ? (
            <TrendingUp size={12} color={metric.color} strokeWidth={2} />
          ) : (
            <TrendingDown size={12} color={metric.color} strokeWidth={2} />
          )}
          <Text style={[styles.changeText, { color: metric.color }]}>
            {metric.change}
          </Text>
        </View>
      </View>
      
      <Text style={styles.metricValue}>{metric.value}</Text>
      <Text style={styles.metricTitle}>{metric.title}</Text>
      <Text style={styles.metricDescription}>{metric.description}</Text>
    </View>
  );

  const renderEngagementChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Weekly Platform Analytics</Text>
        <View style={styles.chartSelector}>
          {[
            { key: 'engagement', label: 'Engagement', color: '#10B981' },
            { key: 'mood', label: 'Mood', color: '#EF4444' },
            { key: 'ai', label: 'AI Usage', color: '#8B5CF6' }
          ].map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartOption,
                selectedChart === chart.key && { backgroundColor: chart.color + '20', borderColor: chart.color }
              ]}
              onPress={() => setSelectedChart(chart.key)}>
              <Text style={[
                styles.chartOptionText,
                selectedChart === chart.key && { color: chart.color }
              ]}>
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.chartArea}>
        {USAGE_DATA.map((data, index) => (
          <View key={index} style={styles.chartBar}>
            <Text style={styles.barValue}>
              {selectedChart === 'engagement' ? data.userEngagement + '%' :
               selectedChart === 'mood' ? data.moodScore + '%' :
               data.aiQueries}
            </Text>
            <View style={styles.barContainer}>
              <LinearGradient
                colors={
                  selectedChart === 'engagement' ? ['#10B981', '#34D399'] :
                  selectedChart === 'mood' ? ['#EF4444', '#F87171'] :
                  ['#8B5CF6', '#A855F7']
                }
                style={[
                  styles.bar,
                  { 
                    height: animatedValues[index] ? (animatedValues[index] / 80) * 100 : 0,
                    opacity: animatedValues[index] ? 1 : 0.3
                  }
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{data.date}</Text>
          </View>
        ))}
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: selectedChart === 'engagement' ? '#10B981' :
                           selectedChart === 'mood' ? '#EF4444' : '#8B5CF6'
          }]} />
          <Text style={styles.legendText}>
            {selectedChart === 'engagement' ? 'User Engagement' :
             selectedChart === 'mood' ? 'Wellness Score' : 'AI Queries'}
          </Text>
        </View>
        <Text style={styles.chartTotal}>
          {selectedChart === 'engagement' ? 'Avg: 78.9% engagement' :
           selectedChart === 'mood' ? 'Avg: 85.0% wellness' :
           'Total: 358 queries this week'}
        </Text>
      </View>
    </View>
  );

  const renderMoodBreakdown = () => (
    <View style={styles.moodContainer}>
      <Text style={styles.sectionTitle}>HR Mood Distribution</Text>
      <View style={styles.moodList}>
        {MOOD_DATA.map((mood, index) => (
          <View key={index} style={styles.moodItem}>
            <View style={styles.moodInfo}>
              <View style={[styles.moodIcon, { backgroundColor: mood.color + '20' }]}>
                {mood.mood === 'great' ? <Smile size={16} color={mood.color} strokeWidth={2} /> :
                 mood.mood === 'good' ? <Smile size={16} color={mood.color} strokeWidth={2} /> :
                 mood.mood === 'okay' ? <Meh size={16} color={mood.color} strokeWidth={2} /> :
                 <Frown size={16} color={mood.color} strokeWidth={2} />}
              </View>
              <Text style={styles.moodName}>{mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)}</Text>
            </View>
            <View style={styles.moodStats}>
              <Text style={styles.moodCount}>{mood.count}</Text>
              <Text style={styles.moodPercentage}>{mood.percentage}%</Text>
            </View>
            <View style={styles.moodBar}>
              <View style={[styles.moodBarFill, { 
                width: `${mood.percentage}%`, 
                backgroundColor: mood.color 
              }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFeatureUsage = () => (
    <View style={styles.featureContainer}>
      <Text style={styles.sectionTitle}>Feature Usage Breakdown</Text>
      <View style={styles.featureList}>
        {FEATURE_USAGE.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureInfo}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <feature.icon size={16} color={feature.color} strokeWidth={2} />
              </View>
              <Text style={styles.featureName}>{feature.name}</Text>
            </View>
            <View style={styles.featureStats}>
              <Text style={styles.featureUsage}>{feature.usage.toLocaleString()}</Text>
              <Text style={styles.featurePercentage}>{feature.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderWellnessInsights = () => (
    <View style={styles.insightsContainer}>
      <Text style={styles.sectionTitle}>Wellness & Platform Insights</Text>
      
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: '#FEE2E2' }]}>
            <Heart size={16} color="#EF4444" strokeWidth={2} />
          </View>
          <Text style={styles.insightTitle}>Mental Health Focus</Text>
        </View>
        <Text style={styles.insightText}>
          87.3% average wellness score with 71.5% of HR's reporting positive mood states. Mental health resources accessed 445 times this month.
        </Text>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: '#DBEAFE' }]}>
            <Headphones size={16} color="#3B82F6" strokeWidth={2} />
          </View>
          <Text style={styles.insightTitle}>Learning Engagement</Text>
        </View>
        <Text style={styles.insightText}>
          Media Hub shows 28% growth with 4,567 podcast and video views. HR professionals are actively consuming educational content.
        </Text>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: '#FEF3C7' }]}>
            <Store size={16} color="#F59E0B" strokeWidth={2} />
          </View>
          <Text style={styles.insightTitle}>Marketplace Growth</Text>
        </View>
        <Text style={styles.insightText}>
          HR Marketplace activity increased 45% with 1,234 service provider interactions. Professional network is expanding rapidly.
        </Text>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: '#F3E8FF' }]}>
            <Sparkles size={16} color="#8B5CF6" strokeWidth={2} />
          </View>
          <Text style={styles.insightTitle}>AI Excellence</Text>
        </View>
        <Text style={styles.insightText}>
          Stackie AI resolved 2,847 queries with 1.8s average response time. 96.8% user satisfaction rate demonstrates platform effectiveness.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1D']}
        style={styles.header}>
        <Text style={styles.headerTitle}>HR Platform Analytics</Text>
        <Text style={styles.headerSubtitle}>Comprehensive insights across all platform features</Text>
        
        <View style={styles.periodSelector}>
          {['week', 'month', 'quarter'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {COMPREHENSIVE_METRICS.map(renderMetricCard)}
        </View>

        {renderEngagementChart()}
        {renderMoodBreakdown()}
        {renderFeatureUsage()}
        {renderWellnessInsights()}

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            style={styles.summaryGradient}>
            <View style={styles.summaryContent}>
              <Sparkles size={32} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.summaryTitle}>Comprehensive Platform Impact</Text>
              <Text style={styles.summaryText}>
                This month, our platform facilitated 2,847 AI interactions, supported 895 community members, 
                delivered 4,567 learning experiences, and maintained an 87.3% HR wellness score.
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>2.8k</Text>
                  <Text style={styles.summaryStatLabel}>AI Queries</Text>
                </View>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>87%</Text>
                  <Text style={styles.summaryStatLabel}>Wellness</Text>
                </View>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>97%</Text>
                  <Text style={styles.summaryStatLabel}>Engagement</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2E',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#7C3AED',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 11,
    color: '#71717A',
    lineHeight: 14,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  chartOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2A2A2E',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chartOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 12,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    color: '#A1A1AA',
    marginBottom: 4,
    fontWeight: '600',
  },
  barContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#2A2A2E',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#A1A1AA',
    marginTop: 8,
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2E',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  chartTotal: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  moodContainer: {
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  moodList: {
    gap: 12,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  moodIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  moodStats: {
    alignItems: 'flex-end',
    width: 60,
  },
  moodCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moodPercentage: {
    fontSize: 12,
    color: '#71717A',
  },
  moodBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  featureContainer: {
    backgroundColor: '#1A1A1D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  featureStats: {
    alignItems: 'flex-end',
  },
  featureUsage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featurePercentage: {
    fontSize: 12,
    color: '#71717A',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightText: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  summaryCard: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#DDD6FE',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#DDD6FE',
  },
});