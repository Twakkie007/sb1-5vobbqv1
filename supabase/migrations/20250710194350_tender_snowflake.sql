/*
  # Fix user signup database error

  1. Database Schema Updates
    - Ensure auth.users table can reference profiles properly
    - Fix foreign key constraints that may be causing issues
    - Update RLS policies to allow proper user creation

  2. Security Updates
    - Fix RLS policies for user signup flow
    - Ensure proper permissions for profile creation

  3. Trigger Functions
    - Add function to automatically create profile on user signup
    - Handle any constraint issues
*/

-- First, let's ensure we have the proper trigger function for creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update profiles table to ensure proper constraints
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the foreign key constraint properly
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to ensure signup works
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Create proper RLS policies
CREATE POLICY "Enable insert for users based on user_id" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;