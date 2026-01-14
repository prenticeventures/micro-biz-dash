import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-og-urls',
      transformIndexHtml(html) {
        // For production, always use the production domain
        // For preview deployments, use VERCEL_URL if available
        const isProduction = process.env.VERCEL_ENV === 'production';
        const domain = isProduction
          ? 'https://www.microbizdash.com'
          : process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}`
            : process.env.OG_DOMAIN 
              ? `https://${process.env.OG_DOMAIN}`
              : 'https://www.microbizdash.com';
        
        return html.replace(
          /https:\/\/www\.microbizdash\.com/g,
          domain
        );
      },
    },
  ],
  // Note: base setting doesn't affect public folder files
  // Files in public/ are always copied to the root of the output directory
  base: './', // Ensures relative paths work for simple deployments
  publicDir: 'public', // Explicitly set public directory (default, but explicit is clearer)
  server: {
    port: 3000
  }
});
