import React, { useState, useEffect } from 'react';
import { Send, Sparkles, History } from 'lucide-react';
import { useTrackingStore } from '../store/trackingStore';
import { supabase } from '../lib/supabase';
import OpenAI from 'openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function Analysis() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [previousAnalyses, setPreviousAnalyses] = useState<Array<{ query: string; response: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { activeTemplate } = useTrackingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<{ openai_api_key?: string; openai_model: string } | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('openai_api_key, openai_model')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserSettings(data);
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Failed to load settings. Please configure your OpenAI API key in settings.');
    }
  };

  const analyzeData = async () => {
    if (!activeTemplate || !query.trim() || !userSettings?.openai_api_key) {
      setError('Please configure your OpenAI API key in settings');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch entries for the active template
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .eq('template_id', activeTemplate.id)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;
      if (!entries || entries.length === 0) {
        throw new Error('No data available for analysis');
      }

      // Format data for analysis
      const formattedData = entries.map(entry => ({
        date: entry.date,
        values: Object.entries(entry.values).map(([fieldId, value]) => {
          const field = activeTemplate.fields.find(f => f.id === fieldId);
          return {
            field: field?.name,
            value: field?.type === 'rating'
              ? ['Poor', 'Below average', 'Average', 'Above average', 'Excellent'][Number(value) - 1]
              : value
          };
        })
      }));

      // Initialize OpenAI with user's API key
      const openai = new OpenAI({
        apiKey: userSettings.openai_api_key,
        dangerouslyAllowBrowser: true
      });

      // Create analysis prompt
      const dataContext = `
        Template: ${activeTemplate.name}
        Number of entries: ${entries.length}
        Date range: ${entries[entries.length - 1]?.date} to ${entries[0]?.date}
        
        Data:
        ${JSON.stringify(formattedData, null, 2)}
      `;

      // Prepare messages array with system message and data context
      const systemMessage: Message = {
        role: 'system',
        content: 'You are a data analysis assistant integrated within a personal tracking application. Users input diverse data through customized tracking templates, covering activities such as sleep patterns, exercise, diet, mood, and social interactions. Your primary function is to analyze this logged data, identify meaningful patterns, correlations, and trends, and provide insightful, actionable feedback and tailored recommendations. Always interpret user data thoughtfully, clearly explaining your insights and suggestions in an empathetic, encouraging, and supportive manner. When providing recommendations, consider the users historical data and context to ensure relevance and personalization.',
      };

      const contextMessage: Message = {
        role: 'system',
        content: dataContext,
      };

      // Combine all messages for the API call
      const apiMessages: Message[] = [
        systemMessage,
        contextMessage,
        ...messages,
        { role: 'user', content: query }
      ];

      const completion = await openai.chat.completions.create({
        model: userSettings.openai_model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const analysisResponse = completion.choices[0]?.message?.content;
      if (!analysisResponse) {
        throw new Error('No analysis generated');
      }

      // Update messages state with the new query and response
      const newMessages = [
        ...messages,
        { role: 'user', content: query },
        { role: 'assistant', content: analysisResponse }
      ];
      setMessages(newMessages);

      // Update previous analyses
      setPreviousAnalyses(prev => [{ query, response: analysisResponse }, ...prev]);

      // Save analysis to database
      await supabase
        .from('analyses')
        .insert({
          template_id: activeTemplate.id,
          user_id: user.id,
          query,
          response: analysisResponse,
        });

      setQuery('');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && query.trim() && !loading) {
      e.preventDefault();
      analyzeData();
    }
  };

  const loadPreviousAnalysis = (analysis: { query: string; response: string }) => {
    setQuery(analysis.query);
    setMessages([
      { role: 'user', content: analysis.query },
      { role: 'assistant', content: analysis.response }
    ]);
  };

  if (!userSettings?.openai_api_key) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">OpenAI API Key Required</h3>
        <p>Please configure your OpenAI API key in the settings to use the analysis feature.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your data..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              disabled={loading}
            />
            <button
              onClick={analyzeData}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-3 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-accent-purple hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-3 rounded-xl border-2 ${
            showHistory
              ? 'border-primary text-primary bg-primary/5'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          <History className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {showHistory ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Previous Analyses</h3>
          {previousAnalyses.length === 0 ? (
            <p className="text-gray-500">No previous analyses yet</p>
          ) : (
            previousAnalyses.map((analysis, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => loadPreviousAnalysis(analysis)}
              >
                <p className="font-medium text-gray-800 mb-2">{analysis.query}</p>
                <p className="text-gray-600 line-clamp-2">{analysis.response}</p>
              </div>
            ))
          )}
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.filter(m => m.role !== 'system').map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${
                message.role === 'user'
                  ? 'bg-primary/5 ml-12'
                  : 'bg-white shadow-sm border border-gray-100 mr-12'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold">Analysis</h3>
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}