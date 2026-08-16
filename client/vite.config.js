import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || env.CLIENT_PORT || '7070', 10);
  const target = env.VITE_API_URL || env.API_BASE_URL || 'http://localhost:7071';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: port,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true
        }
      }
    }
  };
});
