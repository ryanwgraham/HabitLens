import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

function LensLogo() {
  return (
    <div className="relative w-16 h-16">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent-purple"></div>
      {/* Inner ring */}
      <div className="absolute inset-1 rounded-full bg-white/90"></div>
      {/* Lens elements */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent-purple">
        <div className="absolute inset-1 rounded-full bg-white/20"></div>
        {/* Lens reflection */}
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/80"></div>
      </div>
      {/* Focus rings */}
      <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
      <div className="absolute inset-[8px] rounded-full border border-white/20"></div>
    </div>
  );
}

export function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <LensLogo />
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