import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { Layout } from 'lucide-react';

export function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-lg p-3 animate-float">
              <Layout className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent mb-2">
            Habit Lens
          </h2>
          <p className="text-lg text-gray-600">
            Track and analyze your habits with AI
          </p>
        </div>
        
        <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-8 border-2 border-accent-yellow/20">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#FF4949',
                    brandAccent: '#FF2727',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '9999px',
                  padding: '12px 24px',
                },
                input: {
                  borderRadius: '12px',
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}