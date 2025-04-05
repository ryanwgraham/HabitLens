import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Cpu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../types';

const OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'o3-mini', name: 'O3-Mini' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
];

const DEFAULT_SETTINGS: Partial<UserSettings> = {
  openai_model: 'gpt-4o',
  openai_api_key: '',
};

export function Settings() {
  const [settings, setSettings] = useState<Partial<UserSettings>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First try to get existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (error && error.message !== 'No rows returned') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // If no settings exist, create default settings
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...DEFAULT_SETTINGS,
          });

        if (insertError) throw insertError;
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          openai_api_key: settings.openai_api_key,
          openai_model: settings.openai_model,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border-2 border-secondary/20">
      <div className="flex items-center space-x-2 mb-6">
        <SettingsIcon className="h-6 w-6 text-secondary" />
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI Model
          </label>
          <div className="relative">
            <Cpu className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={settings.openai_model}
              onChange={(e) => setSettings({ ...settings, openai_model: e.target.value })}
              className="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary/20"
            >
              {OPENAI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              value={settings.openai_api_key || ''}
              onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
              placeholder="sk-..."
              className="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:border-secondary focus:ring focus:ring-secondary/20"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Your API key is stored securely and used only for your analysis requests.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl">
            Settings saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary to-accent-purple text-sm font-medium rounded-xl text-white hover:opacity-90 disabled:opacity-50 w-full justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}