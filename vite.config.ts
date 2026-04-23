import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: { position: 'tl', initialIsOpen: false },
    }),
  ],
  resolve: {
    alias: [
      // FSD layer aliases
      { find: '@app',      replacement: path.resolve(process.cwd(), 'src/app') },
      { find: '@pages',    replacement: path.resolve(process.cwd(), 'src/pages') },
      { find: '@widgets',  replacement: path.resolve(process.cwd(), 'src/widgets') },
      { find: '@features', replacement: path.resolve(process.cwd(), 'src/features') },
      { find: '@entities', replacement: path.resolve(process.cwd(), 'src/entities') },
      { find: '@shared',   replacement: path.resolve(process.cwd(), 'src/shared') },
      // Legacy alias — keep until Task 11 removes old directories
      { find: /^src(.+)/, replacement: path.resolve(process.cwd(), 'src/$1') },
    ],
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
});
