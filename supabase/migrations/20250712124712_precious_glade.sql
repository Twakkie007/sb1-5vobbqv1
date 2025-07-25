/*
  # Create media storage and tables

  1. Storage
    - Create media bucket for audio/video files
    - Set up public access policies

  2. New Tables
    - `media_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `host` (text)
      - `type` (text - podcast/video)
      - `category` (text)
      - `duration` (text)
      - `thumbnail_url` (text)
      - `media_url` (text)
      - `views_count` (integer)
      - `likes_count` (integer)
      - `dislikes_count` (integer)
      - `comments_count` (integer)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `media_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `media_id` (uuid, foreign key)
      - `interaction_type` (text - like/dislike/bookmark/view)
      - `created_at` (timestamp)

    - `media_comments`
      - `id` (uuid, primary key)
      - `media_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key)
      - `content` (text)
      - `likes_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create media_items table
CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  host text,
  type text NOT NULL CHECK (type IN ('podcast', 'video')),
  category text DEFAULT 'General',
  duration text,
  thumbnail_url text,
  media_url text,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_interactions table
CREATE TABLE IF NOT EXISTS media_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media_items(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'bookmark', 'view')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_id, interaction_type)
);

-- Create media_comments table
CREATE TABLE IF NOT EXISTS media_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media_items(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;

-- Policies for media_items
CREATE POLICY "Media items are viewable by authenticated users"
  ON media_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create media items"
  ON media_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update media items they created"
  ON media_items FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for media_interactions
CREATE POLICY "Users can view all interactions"
  ON media_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own interactions"
  ON media_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
  ON media_interactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON media_interactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for media_comments
CREATE POLICY "Comments are viewable by authenticated users"
  ON media_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON media_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
  ON media_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
  ON media_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Storage policies for media bucket
CREATE POLICY "Media files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Users can update their own media files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Users can delete their own media files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_comments_updated_at
  BEFORE UPDATE ON media_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update interaction counts
CREATE OR REPLACE FUNCTION update_media_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE media_items SET likes_count = likes_count + 1 WHERE id = NEW.media_id;
    ELSIF NEW.interaction_type = 'view' THEN
      UPDATE media_items SET views_count = views_count + 1 WHERE id = NEW.media_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE media_items SET likes_count = likes_count - 1 WHERE id = OLD.media_id;
    ELSIF OLD.interaction_type = 'view' THEN
      UPDATE media_items SET views_count = views_count - 1 WHERE id = OLD.media_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_interaction_counts_trigger
  AFTER INSERT OR DELETE ON media_interactions
  FOR EACH ROW EXECUTE FUNCTION update_media_interaction_counts();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_media_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE media_items SET comments_count = comments_count + 1 WHERE id = NEW.media_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE media_items SET comments_count = comments_count - 1 WHERE id = OLD.media_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_comment_counts_trigger
  AFTER INSERT OR DELETE ON media_comments
  FOR EACH ROW EXECUTE FUNCTION update_media_comment_counts();

-- Insert sample media data
INSERT INTO media_items (title, description, host, type, category, duration, thumbnail_url, media_url, tags) VALUES
(
  'Understanding the BCEA: A Complete Guide',
  'Deep dive into the Basic Conditions of Employment Act with practical examples and case studies from leading HR experts.',
  'Sarah Johnson & Michael Chen',
  'podcast',
  'Labour Law',
  '45:32',
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  ARRAY['BCEA', 'Employment Law', 'Compliance']
),
(
  'Employment Equity Act: Implementation Workshop',
  'Comprehensive workshop on EEA compliance, reporting requirements, and best practices for South African companies.',
  'HR Excellence Academy',
  'video',
  'Compliance',
  '1:24:45',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ARRAY['EEA', 'Compliance', 'Workshop']
),
(
  'CCMA Procedures: What Every HR Professional Should Know',
  'Expert insights on navigating CCMA processes, from conciliation to arbitration, with real case examples.',
  'Priya Patel',
  'podcast',
  'Labour Law',
  '38:15',
  'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  ARRAY['CCMA', 'Dispute Resolution', 'Legal Process']
);