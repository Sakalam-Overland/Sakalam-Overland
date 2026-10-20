import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const shared = fileURLToPath(new URL('../shared', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@shared': shared } },
  server: {
    fs: { allow: ['..'] },
    proxy: { '/api': 'http://localhost:4000' },
  },
  // three.js ships in its own lazy chunk that only inner-page headers load.
  build: { chunkSizeWarningLimit: 600 },
});
