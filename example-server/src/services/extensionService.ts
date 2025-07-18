import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExtensionManifest {
    id: string;
    name: string;
    componentName: string;
    description: string;
    author: string;
    version: string;
    main: string;
    url: string;
    file: string;
    tags?: string[];
    minAppVersion?: string;
    icon?: string;
    installedAt: string;
    updatedAt: string;
    status: 'installed' | 'enabled' | 'disabled' | 'error';
    errorMessage?: string;
}

export class ExtensionService {
    private extensionsPath: string;
    private manifest: ExtensionManifest[] = [];
    private watcher: chokidar.FSWatcher | null = null;
    private serverUrl: string;

    constructor(serverUrl: string = 'http://localhost:8888') {
        this.extensionsPath = this.getAppDataPath();
        this.serverUrl = serverUrl;
        this.init();
    }

    /**
     * Get the appropriate app data directory for the current OS
     */
    private getAppDataPath(): string {
        const appName = 'cdv-electron';

        switch (os.platform()) {
            case 'darwin': // macOS
                return path.join(os.homedir(), 'Library', 'Application Support', appName, 'extensions');

            case 'win32': // Windows
                const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
                return path.join(appData, appName, 'extensions');

            case 'linux': // Linux
            default:
                const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
                return path.join(configHome, appName, 'extensions');
        }
    }

    private async init(): Promise<void> {
        await this.ensureExtensionsDirectory();
        await this.loadManifest();
        this.setupWatcher();
        console.log(`📁 Extensions directory: ${this.extensionsPath}`);
        console.log(`✅ Extension service initialized with ${this.manifest.length} extensions`);
    }

    private async ensureExtensionsDirectory(): Promise<void> {
        try {
            await fs.access(this.extensionsPath);
        } catch {
            await fs.mkdir(this.extensionsPath, { recursive: true });
        }
    }

    private async loadManifest(): Promise<void> {
        try {
            await this.generateManifest();
        } catch (error) {
            console.error('Failed to load extension manifest:', error);
            this.manifest = [];
        }
    }

    private async generateManifest(): Promise<void> {
        try {
            // Check if extensions directory exists
            try {
                await fs.access(this.extensionsPath);
            } catch {
                this.manifest = [];
                return;
            }

            const extensionProjects = await fs.readdir(this.extensionsPath);
            this.manifest = [];

            for (const projectName of extensionProjects) {
                if (projectName === 'README.md') continue;

                const projectPath = path.join(this.extensionsPath, projectName);

                // Check if it's a directory
                try {
                    const stats = await fs.stat(projectPath);
                    if (!stats.isDirectory()) continue;
                } catch {
                    continue;
                }

                try {
                    // Read manifest.json
                    const manifestPath = path.join(projectPath, 'manifest.json');
                    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent);

                    // Validate required fields
                    if (!manifest.name || !manifest.version || !manifest.author || !manifest.main || !manifest.componentName) {
                        throw new Error('Invalid manifest: missing required fields (name, version, author, main, componentName)');
                    }

                    // Check if main file exists
                    const mainFilePath = path.join(projectPath, manifest.main);
                    try {
                        await fs.access(mainFilePath);
                    } catch {
                        throw new Error(`Main file not found: ${manifest.main}`);
                    }

                    // Get file stats for timestamps
                    const manifestStats = await fs.stat(manifestPath);

                    const extensionManifest: ExtensionManifest = {
                        id: projectName,
                        name: manifest.name,
                        componentName: manifest.componentName,
                        description: manifest.description || 'No description provided',
                        author: manifest.author,
                        version: manifest.version,
                        main: manifest.main,
                        url: `${this.serverUrl}/api/extensions/${projectName}`,
                        file: `${projectName}/${manifest.main}`,
                        tags: manifest.tags || [],
                        minAppVersion: manifest.minAppVersion,
                        icon: manifest.icon,
                        installedAt: manifestStats.birthtime.toISOString(),
                        updatedAt: manifestStats.mtime.toISOString(),
                        status: 'installed'
                    };

                    // Add to our manifest
                    this.manifest.push(extensionManifest);

                } catch (error) {
                    // Create error entry for invalid extensions
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                    const errorManifest: ExtensionManifest = {
                        id: projectName,
                        name: `Invalid Extension (${projectName})`,
                        componentName: projectName,
                        description: 'Failed to load extension',
                        author: 'Unknown',
                        version: '0.0.0',
                        main: 'index.js',
                        url: '',
                        file: '',
                        installedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        status: 'error',
                        errorMessage
                    };

                    this.manifest.push(errorManifest);
                }
            }

        } catch (error) {
            console.error('Failed to generate extension manifest:', error);
            this.manifest = [];
        }
    }

    private setupWatcher(): void {
        // Watch for changes to extension directories
        const extensionPattern = [
            path.join(this.extensionsPath, '*/manifest.json'),
            path.join(this.extensionsPath, '*/index.js'),
            path.join(this.extensionsPath, '*/index.jsx'),
            path.join(this.extensionsPath, '*/index.ts'),
            path.join(this.extensionsPath, '*/index.tsx')
        ];

        this.watcher = chokidar.watch(extensionPattern, {
            ignoreInitial: true,
            usePolling: false,
            interval: 1000
        });

        // Debounce the reload to prevent infinite loops
        let reloadTimeout: NodeJS.Timeout | null = null;

        this.watcher.on('all', (event, filePath) => {
            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }

            reloadTimeout = setTimeout(() => {
                console.log(`Extension file ${event}: ${filePath}, reloading manifest...`);
                this.loadManifest();
                reloadTimeout = null;
            }, 500);
        });
    }

    async uploadExtension(zipBuffer: Buffer, fileName: string): Promise<{ success: boolean; extensionId?: string; error?: string }> {
        try {
            // Extract ZIP to read manifest first
            const zip = new AdmZip(zipBuffer);

            // Validate ZIP structure and find manifest
            const entries = zip.getEntries();
            const manifestEntry = entries.find(entry =>
                entry.entryName === 'manifest.json' ||
                entry.entryName.endsWith('/manifest.json')
            );

            if (!manifestEntry) {
                return { success: false, error: 'Missing manifest.json file' };
            }

            // Read and parse manifest from ZIP
            let manifest: any;
            try {
                const manifestContent = manifestEntry.getData().toString('utf8');
                manifest = JSON.parse(manifestContent);

                if (!manifest.name || !manifest.version || !manifest.author || !manifest.main || !manifest.componentName) {
                    throw new Error('Invalid manifest: missing required fields (name, version, author, main, componentName)');
                }
            } catch (error) {
                return {
                    success: false,
                    error: `Invalid manifest: ${error instanceof Error ? error.message : 'Could not parse manifest.json'}`
                };
            }

            // Use componentName as the folder name (single source of truth)
            const extensionId = manifest.componentName;
            const extractPath = path.join(this.extensionsPath, extensionId);

            // Check if extension already exists
            try {
                await fs.access(extractPath);
                return {
                    success: false,
                    error: `Component "${manifest.componentName}" already exists. Please uninstall the existing version first.`
                };
            } catch {
                // Extension doesn't exist, which is what we want
            }

            // Check file size limits (10MB per file)
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            for (const entry of entries) {
                if (entry.header.size > MAX_FILE_SIZE) {
                    return { success: false, error: `File ${entry.entryName} exceeds 10MB limit` };
                }
            }

            // Extract to extension directory
            await fs.mkdir(extractPath, { recursive: true });
            zip.extractAllTo(extractPath, true);

            // Validate that the main file was extracted correctly
            try {
                const mainFilePath = path.join(extractPath, manifest.main);
                await fs.access(mainFilePath);
            } catch (error) {
                // Cleanup on validation failure
                await fs.rm(extractPath, { recursive: true, force: true });
                return {
                    success: false,
                    error: `Main file ${manifest.main} not found in extracted extension`
                };
            }

            // Reload manifest to include new extension
            await this.loadManifest();

            return { success: true, extensionId };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown upload error'
            };
        }
    }

    async deleteExtension(extensionId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const extensionPath = path.join(this.extensionsPath, extensionId);

            // Check if extension exists
            try {
                await fs.access(extensionPath);
            } catch {
                return { success: false, error: 'Extension not found' };
            }

            // Remove extension directory
            await fs.rm(extensionPath, { recursive: true, force: true });

            // Reload manifest
            await this.loadManifest();

            return { success: true };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown deletion error'
            };
        }
    }

    async getExtensionList(): Promise<ExtensionManifest[]> {
        return this.manifest;
    }

    /**
     * Get the extensions directory path
     */
    getExtensionsPath(): string {
        return this.extensionsPath;
    }

    /**
     * Clear extensions cache and create fresh app data directory
     */
    async clearExtensionsCache(): Promise<void> {
        try {
            // Remove existing extensions directory
            await fs.rm(this.extensionsPath, { recursive: true, force: true });

            // Recreate the directory
            await fs.mkdir(this.extensionsPath, { recursive: true });

            // Regenerate manifest
            await this.loadManifest();

            console.log(`🧹 Extensions cache cleared: ${this.extensionsPath}`);
        } catch (error) {
            console.error('❌ Failed to clear extensions cache:', error);
        }
    }

    async getExtensionFile(extensionId: string): Promise<string | null> {
        try {
            const extension = this.manifest.find(ext => ext.id === extensionId);
            if (!extension || extension.status === 'error') {
                return null;
            }

            // Read the extension's main file
            const extensionPath = path.join(this.extensionsPath, extension.file);
            const extensionContent = await fs.readFile(extensionPath, 'utf-8');

            return extensionContent;
        } catch (error) {
            console.error(`Failed to read extension file ${extensionId}:`, error);
            return null;
        }
    }

    getExtensionMetadata(extensionId: string): ExtensionManifest | null {
        return this.manifest.find(ext => ext.id === extensionId) || null;
    }

    async updateExtensionStatus(extensionId: string, status: 'enabled' | 'disabled'): Promise<{ success: boolean; error?: string }> {
        try {
            const extension = this.manifest.find(ext => ext.id === extensionId);
            if (!extension) {
                return { success: false, error: 'Extension not found' };
            }

            extension.status = status;
            extension.updatedAt = new Date().toISOString();

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown status update error'
            };
        }
    }
}
