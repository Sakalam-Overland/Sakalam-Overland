import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const shared = fileURLToPath(new URL('../shared', import.meta.url));

/** In dev, send /admin to the CMS page instead of the React app (Netlify does this on its own). */
const cmsAdmin = (): Plugin => ({
  name: 'cms-admin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/admin') {
        res.writeHead(301, { Location: '/admin/' }).end();
        return;
      }
      if (req.url === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
});

export default defineConfig({
  plugins: [cmsAdmin(), react(), tailwindcss()],
  resolve: { alias: { '@shared': shared } },
  server: {
    fs: { allow: ['..'] },
    proxy: { '/api': 'http://localhost:4000' },
  },
  // three.js ships in its own lazy chunk that only inner-page headers load.
  build: { chunkSizeWarningLimit: 600 },
});
