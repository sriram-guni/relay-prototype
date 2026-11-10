import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative asset paths so the same build works locally and at github.io/relay-prototype/
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: false },
  preview: { port: 4173 },
});
