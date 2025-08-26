import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const API_URL = env.VITE_API_URL || 'http://localhost:3001/api';
  const API_BASE = API_URL.replace('/api', ''); // Remove /api suffix for proxy

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: API_BASE,
          changeOrigin: true,
        },
      },
    },
  };
});
