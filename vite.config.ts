import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // In production build, API_KEY should come from environment variable set by GitHub Actions
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    
    // Log for debugging (only in build, not in runtime)
    if (mode === 'production') {
      if (apiKey) {
        console.log('✅ API_KEY is set for production build (length: ' + apiKey.length + ')');
      } else {
        console.error('❌ ERROR: API_KEY is NOT set for production build!');
        console.error('This will cause the app to fail. Make sure API_KEY is set in GitHub Secrets.');
      }
    }
    
    return {
      base: mode === 'production' ? '/mental-imagery-app/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // These will be replaced at build time
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        '__API_KEY__': JSON.stringify(apiKey),
        // Also define it on window for client-side access
        'window.__API_KEY__': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
