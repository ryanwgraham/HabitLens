export interface Template {
  id: string;
  name: string;
  goal?: string;
  fields: Field[];
  createdAt: string;
}

export interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'rating';
  options?: string[]; // For select fields
  required?: boolean;
}

export interface Entry {
  id: string;
  templateId: string;
  date: string;
  values: Record<string, any>;
  createdAt: string;
}

export interface ChatGPTAnalysis {
  query: string;
  response: string;
  timestamp: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  openai_api_key?: string;
  openai_model: string;
  created_at?: string;
  updated_at?: string;
}