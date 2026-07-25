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
        rolldownOptions: {
            output: {
                // Séparation des librairies lourdes pour un build plus rapide (forme fonction obligatoire depuis Vite 8, l'objet n'est plus supporté)
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    // Attention à l'ordre : les libs les plus spécifiques en premier pour éviter qu'elles ne tombent dans "react"
                    if (id.includes('react-icons')) {
                        return 'icons';
                    }

                    if (id.includes('i18next')) {
                        return 'i18n'; // couvre i18next + react-i18next
                    }

                    if (id.includes('bootstrap')) {
                        return 'bootstrap'; // couvre bootstrap + react-bootstrap
                    }

                    if (id.includes('react-dom') || id.includes('/react/')) {
                        return 'react';
                    }
                }
            }
        }
    },
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version)
    }
});
