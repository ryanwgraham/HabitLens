/*
  # Update default OpenAI model

  1. Changes
    - Update default value for openai_model to 'gpt-4'
    - Update existing rows to use 'gpt-4' if they're using the old default
*/

-- Update the default value for new rows
ALTER TABLE user_settings 
ALTER COLUMN openai_model 
SET DEFAULT 'gpt-4';

-- Update existing rows that use the old default
UPDATE user_settings 
SET openai_model = 'gpt-4', 
    updated_at = now() 
WHERE openai_model = 'gpt-3.5-turbo';