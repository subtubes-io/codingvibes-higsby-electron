import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'host-app',
            shared: ['react', 'react-dom']
        })
    ],
    css: {
        postcss: './postcss.config.cjs',
    },
    server: {
        port: 5174
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: [],
            output: {
                minifyInternalExports: false
            }
        }
    }
})
