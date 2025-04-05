import { create } from 'zustand';
import { Template, Entry, ChatGPTAnalysis } from '../types';
import { supabase } from '../lib/supabase';

interface TrackingState {
  templates: Template[];
  entries: Entry[];
  analyses: ChatGPTAnalysis[];
  activeTemplate: Template | null;
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchEntries: (templateId: string) => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addAnalysis: (analysis: Omit<ChatGPTAnalysis, 'timestamp'>) => Promise<void>;
  setActiveTemplate: (template: Template | null) => void;
  getEntriesByTemplate: (templateId: string) => Entry[];
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  templates: [],
  entries: [],
  analyses: [],
  activeTemplate: null,
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ templates: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchEntries: async (templateId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('template_id', templateId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ entries: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addTemplate: async (template) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ templates: [...state.templates, data] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateTemplate: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? data : t)),
        activeTemplate: state.activeTemplate?.id === id ? data : state.activeTemplate,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        activeTemplate: state.activeTemplate?.id === id ? null : state.activeTemplate,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addEntry: async (entry) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ entries: [...state.entries, data] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateEntry: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? data : e)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteEntry: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addAnalysis: async (analysis) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('analyses')
        .insert([{
          ...analysis,
          template_id: get().activeTemplate?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ analyses: [...state.analyses, data] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setActiveTemplate: (template) => {
    set({ activeTemplate: template });
    if (template) {
      get().fetchEntries(template.id);
    }
  },

  getEntriesByTemplate: (templateId) =>
    get().entries.filter((entry) => entry.templateId === templateId),
}));