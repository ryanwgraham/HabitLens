/*
  # Add goal field to templates table

  1. Changes
    - Add `goal` column to templates table
*/

-- Add goal column to templates table
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS goal text;