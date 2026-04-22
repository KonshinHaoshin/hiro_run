import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    clearScreen: false,
    base: './',
    plugins: [
        react(),
    ],
    envPrefix: ['VITE_'],
    server: {
        port: 5173,
        strictPort: true,
    },
    build: {
        target: 'es2020',
        minify: 'esbuild',
        sourcemap: false,
    },
});
