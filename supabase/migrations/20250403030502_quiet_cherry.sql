/*
  # Initial Schema Setup for Smart Tracker

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `fields` (jsonb)
      - `created_at` (timestamp)

    - `entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `template_id` (uuid, references templates)
      - `date` (date)
      - `values` (jsonb)
      - `created_at` (timestamp)

    - `analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `template_id` (uuid, references templates)
      - `query` (text)
      - `response` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Templates table
CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  fields jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
  ON templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Entries table
CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  template_id uuid REFERENCES templates NOT NULL,
  date date NOT NULL,
  values jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own entries"
  ON entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Analyses table
CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  template_id uuid REFERENCES templates NOT NULL,
  query text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analyses"
  ON analyses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);