import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // OK to keep
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
