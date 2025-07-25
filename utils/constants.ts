// App Configuration
export const APP_CONFIG = {
  NAME: 'Stackie HR Community',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  DESCRIPTION: 'South Africa\'s premier HR community platform',
  SUPPORT_EMAIL: 'support@stackie.co.za',
  PRIVACY_URL: 'https://stackie.co.za/privacy',
  TERMS_URL: 'https://stackie.co.za/terms',
  WEBSITE_URL: 'https://stackie.co.za',
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Feature Flags
export const FEATURES = {
  AI_CHAT: true,
  MEDIA_PLAYBACK: true,
  MARKETPLACE: true,
  WELLNESS_HUB: true,
  ANALYTICS: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: false,
  BETA_FEATURES: false,
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Community',
    price: 0,
    aiQueriesLimit: 50,
    features: [
      'Basic community access',
      'Limited AI queries',
      'Standard support',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 299,
    aiQueriesLimit: 500,
    features: [
      'Full community access',
      'Extended AI queries',
      'Priority support',
      'Advanced analytics',
      'Template library',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 899,
    aiQueriesLimit: -1, // Unlimited
    features: [
      'Everything in Professional',
      'Unlimited AI queries',
      'Custom branding',
      'Dedicated support',
      'API access',
      'Advanced integrations',
    ],
  },
} as const;

// South African HR Categories
export const HR_CATEGORIES = [
  'Labour Law',
  'People Strategy',
  'Compliance',
  'Analytics',
  'Recruitment',
  'Training & Development',
  'Employee Relations',
  'Compensation & Benefits',
  'Performance Management',
  'Workplace Safety',
  'Employment Equity',
  'Skills Development',
] as const;

// South African Labour Law Acts
export const LABOUR_ACTS = [
  'Basic Conditions of Employment Act (BCEA)',
  'Labour Relations Act (LRA)',
  'Employment Equity Act (EEA)',
  'Skills Development Act (SDA)',
  'Occupational Health and Safety Act (OHSA)',
  'Compensation for Occupational Injuries and Diseases Act (COIDA)',
  'Unemployment Insurance Act (UIA)',
  'Protection of Personal Information Act (POPIA)',
] as const;

// Media Types
export const MEDIA_TYPES = {
  PODCAST: 'podcast',
  VIDEO: 'video',
  WEBINAR: 'webinar',
  DOCUMENT: 'document',
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
  AUDIO: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/m4a'],
  },
  VIDEO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

// Colors (matching app theme)
export const COLORS = {
  PRIMARY: '#7C3AED',
  SECONDARY: '#A855F7',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  BACKGROUND: '#0F0F10',
  SURFACE: '#1A1A1D',
  BORDER: '#2A2A2E',
  
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#A1A1AA',
  TEXT_MUTED: '#71717A',
  TEXT_DISABLED: '#52525B',
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME_MODE: 'theme_mode',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC: 'last_sync',
  OFFLINE_DATA: 'offline_data',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
} as const;