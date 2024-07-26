import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageVersion from 'vite-plugin-package-version';
import { fileURLToPath } from 'node:url';

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
});
