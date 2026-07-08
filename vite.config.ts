import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageVersion from 'vite-plugin-package-version';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';

// Base path for GitHub Pages project site (https://<user>.github.io/dots/).
// Override with BASE_PATH=/ for a custom domain or user/org root page.
const base = process.env.BASE_PATH ?? '/dots/';

export default defineConfig({
  base,
  plugins: [react(), packageVersion()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  build: {
    rollupOptions: {
      plugins: [visualizer({ open: !process.env.CI })],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const chunk = id.split('node_modules/')[1].split('/')[0];
            return chunk.replace(/^\.+/, '');
          }
        },
      },
      onwarn(warning, warn) {
        if (
          warning.code === 'MODULE_EXTERNALIZED' &&
          warning.message.includes('fs')
        ) {
          return;
        }
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
