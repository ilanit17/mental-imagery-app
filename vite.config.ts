import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || env.GEMINI_API_KEY || '';
    
    if (!apiKey && mode === 'production') {
      console.warn('⚠️ Warning: API_KEY is not set. The app will not work correctly.');
    }
    
    return {
      base: mode === 'production' ? '/mental-imagery-app/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        '__API_KEY__': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
