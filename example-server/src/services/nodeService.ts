import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface NodeManifest {
    id: string;
    component: string;
    name: string;
    description: string;
    category: string;
    version: string;
    url: string;
    file: string;
    defaultConfig: unknown;
}

export class NodeService {
    private nodesPath: string;
    private manifest: NodeManifest[] = [];
    private watcher: chokidar.FSWatcher | null = null;
    private serverUrl: string;

    constructor(serverUrl: string = 'http://localhost:8888') {
        this.nodesPath = path.resolve(__dirname, '../../../nodes');
        this.serverUrl = serverUrl;
        this.init();
    }

    private async init(): Promise<void> {
        await this.loadManifest();
        this.setupWatcher();
    }

    private async loadManifest(): Promise<void> {
        try {
            // Always scan for individual node projects
            await this.generateManifest();

        } catch (error) {

            this.manifest = [];
        }
    }

    private async generateManifest(): Promise<void> {
        try {
            // Check if nodes directory exists
            try {
                await fs.access(this.nodesPath);
            } catch {

                this.manifest = [];
                return;
            }

            const nodeProjects = await fs.readdir(this.nodesPath);

            this.manifest = [];

            for (const projectName of nodeProjects) {
                const projectPath = path.join(this.nodesPath, projectName);

                // Check if it's a directory
                try {
                    const stats = await fs.stat(projectPath);
                    if (!stats.isDirectory()) continue;
                } catch {
                    continue;
                }

                // Check for multiple possible dist file names
                const possibleDistFiles = [
                    path.join(projectPath, 'dist', 'index.js'),
                    path.join(projectPath, 'dist', 'index.umd.cjs')
                ];

                let distPath = null;
                let distFileName = 'index.js';
                for (const file of possibleDistFiles) {
                    try {
                        await fs.access(file);
                        distPath = file;
                        distFileName = path.basename(file);
                        break;
                    } catch {
                        // Continue to next file
                    }
                }

                try {
                    // Check if built file exists
                    if (!distPath) {
                        throw new Error('No dist file found');
                    }

                    // Always generate manifest from directory structure (consistent approach)
                    const componentName = projectName;

                    // Determine category based on project name
                    let category = 'Basic';
                    if (componentName.toLowerCase().includes('math') || componentName === 'Calculator') {
                        category = 'Math';
                    } else if (componentName.toLowerCase().includes('ai') || componentName === 'OpenAI') {
                        category = 'AI';
                    } else if (componentName.toLowerCase().includes('text')) {
                        category = 'Text';
                    }

                    // Try to extract defaultConfig from the built module
                    let defaultConfig = {};
                    try {
                        // Read and evaluate the module to extract defaultConfig
                        const moduleContent = await fs.readFile(distPath, 'utf-8');

                        // Look for defaultConfig pattern and extract the object
                        const configStart = moduleContent.indexOf('defaultConfig: {');
                        if (configStart !== -1) {
                            try {
                                // Find the matching closing brace for the defaultConfig object
                                let braceCount = 0;
                                let configEnd = configStart + 'defaultConfig: '.length;
                                let inConfig = false;

                                for (let i = configEnd; i < moduleContent.length; i++) {
                                    const char = moduleContent[i];
                                    if (char === '{') {
                                        if (!inConfig) inConfig = true;
                                        braceCount++;
                                    } else if (char === '}') {
                                        braceCount--;
                                        if (braceCount === 0 && inConfig) {
                                            configEnd = i + 1;
                                            break;
                                        }
                                    }
                                }

                                const configString = moduleContent.substring(configStart + 'defaultConfig: '.length, configEnd);

                                // Use eval to parse the JavaScript object
                                defaultConfig = eval(`(${configString})`);

                            } catch (parseError: unknown) {
                                const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);

                            }
                        } else {
                            //
                        }
                    } catch {
                        //
                    }

                    const nodeManifest = {
                        id: componentName,
                        component: componentName,  // Always set component field to the folder name
                        name: `${componentName} Node`,
                        description: `A ${componentName.toLowerCase()} node component`,
                        category: category,
                        version: '1.0.0',
                        author: 'CodingVibes',
                        main: 'dist/index.js',
                        defaultConfig: defaultConfig,
                        url: `${this.serverUrl}/api/nodes/${componentName}`,
                        file: `${projectName}/dist/${distFileName}`
                    };



                    // Add to our manifest
                    this.manifest.push(nodeManifest);

                } catch {
                    //
                }
            }

            //
        } catch (error) {
            //
            this.manifest = [];
        }
    }

    private setupWatcher(): void {
        // Watch for changes to any node project's dist directory
        const nodeProjectsPattern = [
            path.join(this.nodesPath, '*/dist/index.js'),
            path.join(this.nodesPath, '*/dist/index.umd.cjs')
        ];
        this.watcher = chokidar.watch(nodeProjectsPattern, {
            ignoreInitial: true,
            usePolling: false,
            interval: 1000
        });

        // Debounce the reload to prevent infinite loops
        let reloadTimeout: NodeJS.Timeout | null = null;

        this.watcher.on('change', (filePath) => {
            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }

            reloadTimeout = setTimeout(() => {
                //
                this.loadManifest();
                reloadTimeout = null;
            }, 500); // Wait 500ms before reloading
        });
    }

    async getNodeList(): Promise<NodeManifest[]> {
        return this.manifest;
    }

    async getNodeFile(nodeId: string): Promise<string | null> {
        try {
            const node = this.manifest.find(n => n.id === nodeId);
            if (!node) {
                //
                return null;
            }

            // Read the individual node's built file
            const nodePath = path.join(this.nodesPath, node.file);
            const nodeContent = await fs.readFile(nodePath, 'utf-8');

            //
            return nodeContent;
        } catch (error) {
            //
            return null;
        }
    }

    getNodeMetadata(nodeId: string): NodeManifest | null {
        return this.manifest.find(n => n.id === nodeId) || null;
    }
}
