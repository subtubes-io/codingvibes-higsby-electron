import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeRoutes } from './routes/nodes.js';
import extensionRoutes from './routes/extensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors({
    origin: '*',  // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
    exposedHeaders: ['Cache-Control', 'Pragma', 'Expires', 'ETag'],
    credentials: false // Set to false when using '*' origin
}));

// Add cache-busting headers for extensions and nodes
app.use(['/api/extensions', '/api/nodes'], (req, res, next) => {
    // Set CORS headers explicitly for these routes
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');

    // Set cache headers for dynamically loaded content
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': false
    });
    next();
});

app.use(express.json());

// API Routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/extensions', extensionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        server: 'Node Server',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Custom Nodes & Extensions Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            nodes: '/api/nodes',
            node: '/api/nodes/:nodeId',
            nodeMetadata: '/api/nodes/:nodeId/metadata',
            extensions: '/api/extensions',
            extensionUpload: '/api/extensions/upload',
            extension: '/api/extensions/:extensionId',
            extensionMetadata: '/api/extensions/:extensionId/metadata',
            extensionStatus: '/api/extensions/:extensionId/status'
        }
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Node & Extension Server running on http://localhost:${PORT}`);
    console.log(`📦 Serving custom nodes from: ${path.resolve(__dirname, '../../custom-nodes/dist')}`);
    console.log(`🧩 Serving extensions from: ${path.resolve(__dirname, '../../extensions')}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('📡 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📡 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});
