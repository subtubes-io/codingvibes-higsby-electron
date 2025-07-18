import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'hello-world-extension',
            filename: 'index.js',
            exposes: {
                './Component': './src/index.tsx'
            },
            shared: ['react', 'react-dom']
        })
    ],
    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env': '{}',
        'global': 'globalThis',
    },
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                minifyInternalExports: false,
                format: 'es',
                globals: {
                    'react': 'window.React',
                    'react-dom': 'window.ReactDOM'
                }
            }
        }
    }
});
