import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageVersion from 'vite-plugin-package-version';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
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
      plugins: [visualizer({ open: true })],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.split('node_modules/')[1].split('/')[0];
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
