import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), cloudflare()],
    server: {
      port: 4001,
      strictPort: true, // Force the specified port
      proxy: {
        // Proxy API requests to wrangler dev server
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // Make environment variables available to client and server code
      'process.env.API_ENV': JSON.stringify(env.API_ENV || 'development'),
      'process.env.AUTH_API_URL': JSON.stringify(env.AUTH_API_URL || 'https://kush.observer/api'),
      'process.env.API_TOKEN': JSON.stringify(env.API_TOKEN),
      // Expose the env variables specifically for the worker context
      __API_ENV__: JSON.stringify(env.API_ENV || 'development'),
      __AUTH_API_URL__: JSON.stringify(env.AUTH_API_URL || 'https://kush.observer/api'),
      __API_TOKEN__: JSON.stringify(env.API_TOKEN),
    }
  }
});
