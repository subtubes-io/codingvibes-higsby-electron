import { Router, Request, Response } from 'express';
import { NodeService } from '../services/nodeService.js';

const router = Router();
const nodeService = new NodeService();

// Handle preflight requests for CORS
router.options('*', (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
});

// Get list of available nodes with URLs
router.get('/', async (req: Request, res: Response) => {
    try {
        const nodes = await nodeService.getNodeList();
        res.json({
            success: true,
            nodes,
            count: nodes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch node list'
        });
    }
});

// Get specific node JavaScript file by ID
router.get('/:nodeId', async (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        const nodeFile = await nodeService.getNodeFile(nodeId);

        if (!nodeFile) {
            return res.status(404).json({
                success: false,
                error: `Node '${nodeId}' not found`
            });
        }

        // Set appropriate headers for JavaScript module
        res.setHeader('Content-Type', 'application/javascript');

        // Set CORS headers explicitly
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');

        // In development, prevent caching for hot reload
        if (process.env.NODE_ENV === 'development') {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache in production
        }

        res.send(nodeFile);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch node file'
        });
    }
});

// Get node metadata (without the JavaScript)
router.get('/:nodeId/metadata', async (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        const metadata = nodeService.getNodeMetadata(nodeId);

        if (!metadata) {
            return res.status(404).json({
                success: false,
                error: `Node '${nodeId}' not found`
            });
        }

        res.json({
            success: true,
            metadata
        });

    } catch (error) {
        console.error(`❌ Failed to serve metadata for ${req.params.nodeId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch node metadata'
        });
    }
});

export { router as nodeRoutes };
