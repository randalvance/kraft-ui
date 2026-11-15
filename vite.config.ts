import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], build: {
  lib: { entry: 'src/entry.ts', formats: ['es'], fileName: 'kraft-ui', cssFileName: 'kraft-ui' },
  rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
}});
