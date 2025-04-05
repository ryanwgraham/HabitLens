import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: false, // Disable HTTPS for local development
    proxy: {
      // Proxy Supabase requests in development to handle CORS
      '/supabase-proxy': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-proxy/, ''),
        secure: false,
      },
    },
  },
});