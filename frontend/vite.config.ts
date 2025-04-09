import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [
      react(),
      // Add a plugin to handle HTML files
      {
        name: 'html-transform',
        transformIndexHtml(html, ctx) {
          // Make no transformation but ensure HTML files are processed
          return html;
        }
      }
    ],
    // Define global variables for use in the browser environment
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: command === 'build' ? 'production' : 'development',
        // Add any other environment variables needed here
      })
    },
    server: {
      host: true, // This allows connections from all network interfaces
      port: 3000, // Use a standard port that's likely not in use
      strictPort: false, // Try another port if this one is in use
      open: true, // Automatically open the browser
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          timeout: 60000 // Increase timeout to 60 seconds
        }
      },
      hmr: {
        overlay: false, // Disable error overlay
        protocol: 'ws',
        host: 'localhost',
        port: 3000
      }
    },
    // Only use the base path for production builds, not for development
    base: command === 'build' ? (process.env.VERCEL ? '/' : '/smart_grid_system/') : '/',
    
    // Configure to handle the HR overview page properly
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            vendor: [
              'react', 
              'react-dom',
              'react-router-dom'
            ]
          }
        }
      }
    },
    
    // Enable viewing of non-indexed files in dev mode
    publicDir: 'public'
  };
  
  return config;
}); 