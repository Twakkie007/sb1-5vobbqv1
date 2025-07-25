import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url' && supabaseAnonKey !== 'your-supabase-anon-key');

// Always create a client with valid URLs to prevent initialization errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3NzEyMDAsImV4cCI6MTk2NTM0NzIwMH0.placeholder',
  {
    auth: {
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: false,
    },
  }
);

// Types for our database
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  is_premium: boolean;
  subscription_tier: 'free' | 'professional' | 'enterprise';
  ai_queries_used: number;
  ai_queries_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'Labor Law' | 'People Strategy' | 'Compliance' | 'Analytics' | 'General';
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number;
  created_at: string;
}

export interface ServiceProvider {
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

export interface ServiceCategory {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  provider_count: number;
  created_at: string;
}

export interface ProviderMessage {
  id: string;
  provider_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface MarketplaceSubscription {
  id: string;
  user_id: string;
  tier: 'premium' | 'featured' | 'enterprise';
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  created_at: string;
}