import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        legacy({
          targets: ['Chrome >= 70', 'Android >= 70', 'iOS >= 12', 'Safari >= 12'],
          modernTargets: ['Chrome >= 70', 'Android >= 70', 'iOS >= 12', 'Safari >= 12'],
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
          '@shared': path.resolve(__dirname, 'shared'),
        }
      }
    };
});
