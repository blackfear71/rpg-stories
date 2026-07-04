import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'build',
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                // Séparation des librairies lourdes pour un build plus rapide
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    bootstrap: ['bootstrap', 'react-bootstrap'],
                    icons: ['react-icons'],
                    i18n: ['i18next', 'react-i18next']
                }
            }
        }
    },
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version)
    }
});
