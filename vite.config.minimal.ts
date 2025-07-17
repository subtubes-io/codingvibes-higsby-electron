import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal config for testing React app only
export default defineConfig({
    plugins: [
        react(),
    ],
    css: {
        postcss: './postcss.config.cjs',
    },
    server: {
        port: 5174
    }
})
