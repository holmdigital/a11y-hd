import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
    plugins: [
        react(),
        crx({ manifest }),
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: 'src/popup/popup.html',
            },
            output: {
                // Use consistent names for content scripts
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'overlay.ts') {
                        return 'assets/overlay.js';
                    }
                    return 'assets/[name]-[hash].js';
                },
            },
        },
    },
    publicDir: 'public',
});
