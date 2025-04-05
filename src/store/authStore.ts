import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      set({ user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    useAuthStore.setState({ user: session.user, loading: false });
  } else {
    useAuthStore.setState({ user: null, loading: false });
  }
});