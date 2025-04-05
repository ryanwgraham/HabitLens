/*
  # Create user settings table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references auth.users)
      - `openai_api_key` (text, nullable)
      - `openai_model` (text, default: 'gpt-3.5-turbo')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policy for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key text,
  openai_model text DEFAULT 'gpt-3.5-turbo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);