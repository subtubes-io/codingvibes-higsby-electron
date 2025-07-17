import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import { ExtensionService } from '../services/extensionService.js';

// Extend Express Request type to include file property
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const router = Router();
const extensionService = new ExtensionService();

// Configure multer for file uploads (in-memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for ZIP files
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
            cb(null, true);
        } else {
            cb(new Error('Only ZIP files are allowed'));
        }
    }
});

// Handle preflight requests for CORS
router.options('*', (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
});

// Get list of available extensions
router.get('/', async (req: Request, res: Response) => {
    try {
        const extensions = await extensionService.getExtensionList();
        res.json({
            success: true,
            extensions,
            count: extensions.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch extension list'
        });
    }
});

// Get extensions directory path
router.get('/path', (req: Request, res: Response) => {
    try {
        const extensionsPath = extensionService.getExtensionsPath();
        res.json({
            success: true,
            path: extensionsPath,
            platform: process.platform,
            exists: fs.existsSync(extensionsPath)
        });
    } catch (error) {
        console.error('Error getting extensions path:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get extensions path',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Upload a new extension
router.post('/upload', upload.single('extension'), async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No extension file provided'
            });
        }

        const result = await extensionService.uploadExtension(req.file.buffer, req.file.originalname);

        if (result.success) {
            res.json({
                success: true,
                extensionId: result.extensionId,
                message: 'Extension uploaded successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error || 'Upload failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error during upload'
        });
    }
});

// Get specific extension JavaScript file by ID
router.get('/:extensionId', async (req: Request, res: Response) => {
    try {
        const { extensionId } = req.params;
        const extensionFile = await extensionService.getExtensionFile(extensionId);

        if (!extensionFile) {
            return res.status(404).json({
                success: false,
                error: `Extension '${extensionId}' not found`
            });
        }

        // Set appropriate headers for JavaScript module
        res.setHeader('Content-Type', 'application/javascript');

        // Set CORS headers explicitly
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');

        res.send(extensionFile);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch extension file'
        });
    }
});

// Get extension metadata
router.get('/:extensionId/metadata', async (req: Request, res: Response) => {
    try {
        const { extensionId } = req.params;
        const metadata = extensionService.getExtensionMetadata(extensionId);

        if (!metadata) {
            return res.status(404).json({
                success: false,
                error: `Extension '${extensionId}' not found`
            });
        }

        res.json({
            success: true,
            extension: metadata
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch extension metadata'
        });
    }
});

// Update extension status (enable/disable)
router.put('/:extensionId/status', async (req: Request, res: Response) => {
    try {
        const { extensionId } = req.params;
        const { status } = req.body;

        if (!status || !['enabled', 'disabled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be "enabled" or "disabled"'
            });
        }

        const result = await extensionService.updateExtensionStatus(extensionId, status);

        if (result.success) {
            res.json({
                success: true,
                message: `Extension ${status} successfully`
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error || 'Status update failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update extension status'
        });
    }
});

// Delete an extension
router.delete('/:extensionId', async (req: Request, res: Response) => {
    try {
        const { extensionId } = req.params;
        const result = await extensionService.deleteExtension(extensionId);

        if (result.success) {
            res.json({
                success: true,
                message: 'Extension deleted successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error || 'Deletion failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete extension'
        });
    }
});

export default router;
