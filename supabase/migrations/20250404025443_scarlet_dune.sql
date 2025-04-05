/*
  # Update default OpenAI model to GPT-4o

  1. Changes
    - Update default value for openai_model to 'gpt-4o'
    - Update existing rows to use 'gpt-4o'
*/

-- Update the default value for new rows
ALTER TABLE user_settings 
ALTER COLUMN openai_model 
SET DEFAULT 'gpt-4o';

-- Update existing rows to use the new default
UPDATE user_settings 
SET openai_model = 'gpt-4o', 
    updated_at = now() 
WHERE openai_model IN ('gpt-3.5-turbo', 'gpt-4');