/*
  # Create AI conversations schema

  1. New Tables
    - `ai_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ai_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references ai_conversations)
      - `role` (text) - 'user' or 'assistant'
      - `content` (text)
      - `tokens_used` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own conversations
*/

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- AI conversations policies
CREATE POLICY "Users can view own conversations"
  ON ai_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON ai_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON ai_conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can view messages in own conversations"
  ON ai_messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON ai_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

-- Function to auto-generate conversation title
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS trigger AS $$
BEGIN
  IF NEW.title IS NULL AND NEW.role = 'user' THEN
    UPDATE ai_conversations 
    SET title = CASE 
      WHEN length(NEW.content) > 50 
      THEN left(NEW.content, 47) || '...'
      ELSE NEW.content
    END
    WHERE id = NEW.conversation_id AND title IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate title from first user message
CREATE TRIGGER auto_generate_conversation_title
  AFTER INSERT ON ai_messages
  FOR EACH ROW EXECUTE FUNCTION generate_conversation_title();

-- Trigger for updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();