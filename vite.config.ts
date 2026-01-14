import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-og-urls',
      transformIndexHtml(html) {
        // Get the domain from environment variable or use default
        const domain = process.env.VERCEL_URL 
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
  base: './', // Ensures relative paths work for simple deployments
  server: {
    port: 3000
  }
});
