export interface SavedGraph {
    id: string;
    name: string;
    description?: string;
    version: string;
    metadata: {
        zoom: number;
        panOffset: { x: number; y: number };
        createdAt: string;
        updatedAt: string;
        nodeCount: number;
    };
    nodes: Record<string, any>;
    serializedData?: string; // Optional serialized JSON representation
}

export class GraphStorageService {
    private dbName = 'cdv-graphs';
    private version = 1;
    private storeName = 'graphs';
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('createdAt', 'metadata.createdAt', { unique: false });
                }
            };
        });
    }

    async saveGraph(graph: Omit<SavedGraph, 'id' | 'metadata.createdAt' | 'metadata.updatedAt'>): Promise<string> {
        if (!this.db) await this.init();

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Create serialized representation for export/backup
        const serializedData = JSON.stringify({
            version: graph.version,
            metadata: {
                name: graph.name,
                description: graph.description || "Visual plugin composition and workflow",
                exportedAt: now,
                zoom: graph.metadata.zoom,
                panOffset: graph.metadata.panOffset
            },
            nodes: graph.nodes
        }, null, 2);

        const savedGraph: SavedGraph = {
            ...graph,
            id,
            metadata: {
                ...graph.metadata,
                createdAt: now,
                updatedAt: now
            },
            serializedData
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(savedGraph);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(id);
        });
    }

    async updateGraph(id: string, updates: Partial<SavedGraph>): Promise<void> {
        if (!this.db) await this.init();

        const existingGraph = await this.getGraph(id);
        if (!existingGraph) throw new Error('Graph not found');

        const updatedGraph: SavedGraph = {
            ...existingGraph,
            ...updates,
            id, // Ensure ID doesn't change
            metadata: {
                ...existingGraph.metadata,
                ...updates.metadata,
                createdAt: existingGraph.metadata.createdAt, // Preserve creation date
                updatedAt: new Date().toISOString()
            }
        };

        // Update serialized data if nodes or other data changed
        if (updates.nodes || updates.name || updates.description) {
            updatedGraph.serializedData = JSON.stringify({
                version: updatedGraph.version,
                metadata: {
                    name: updatedGraph.name, // Use the updated name
                    description: updatedGraph.description || "Visual plugin composition and workflow",
                    exportedAt: updatedGraph.metadata.updatedAt,
                    zoom: updatedGraph.metadata.zoom,
                    panOffset: updatedGraph.metadata.panOffset
                },
                nodes: updatedGraph.nodes
            }, null, 2);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(updatedGraph);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getGraph(id: string): Promise<SavedGraph | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async getAllGraphs(): Promise<SavedGraph[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const graphs = request.result || [];
                // Sort by most recently updated
                graphs.sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
                resolve(graphs);
            };
        });
    }

    async deleteGraph(id: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async searchGraphs(query: string): Promise<SavedGraph[]> {
        const allGraphs = await this.getAllGraphs();
        const lowercaseQuery = query.toLowerCase();

        return allGraphs.filter(graph =>
            graph.name.toLowerCase().includes(lowercaseQuery) ||
            (graph.description && graph.description.toLowerCase().includes(lowercaseQuery))
        );
    }

    async updateGraphName(id: string, newName: string): Promise<void> {
        if (!this.db) await this.init();

        const existingGraph = await this.getGraph(id);
        if (!existingGraph) throw new Error('Graph not found');

        return this.updateGraph(id, { name: newName });
    }

    async updateGraphDescription(id: string, newDescription: string): Promise<void> {
        if (!this.db) await this.init();

        const existingGraph = await this.getGraph(id);
        if (!existingGraph) throw new Error('Graph not found');

        return this.updateGraph(id, { description: newDescription });
    }

    async exportGraph(id: string): Promise<string> {
        const graph = await this.getGraph(id);
        if (!graph) throw new Error('Graph not found');

        return graph.serializedData || JSON.stringify({
            version: graph.version,
            metadata: {
                name: graph.name,
                description: graph.description || "Visual plugin composition and workflow",
                exportedAt: new Date().toISOString(),
                zoom: graph.metadata.zoom,
                panOffset: graph.metadata.panOffset
            },
            nodes: graph.nodes
        }, null, 2);
    }

    async exportCurrentGraph(graphNodes: any[], zoom: number, panOffset: { x: number; y: number }, currentGraphName: string): Promise<string> {
        const nodesObject = graphNodes.reduce((acc, node) => {
            acc[node.id] = {
                id: node.id,
                name: node.name,
                type: node.type,
                extension: node.extension,
                position: node.position,
                size: node.size,
                plugin: node.plugin ? {
                    id: node.plugin.id,
                    name: node.plugin.name,
                    componentName: node.plugin.componentName,
                    version: node.plugin.version,
                    author: node.plugin.author,
                    description: node.plugin.description,
                    main: node.plugin.main,
                    ...(node.plugin.dependencies && { dependencies: node.plugin.dependencies }),
                    ...(node.plugin.permissions && { permissions: node.plugin.permissions }),
                    ...(node.plugin.minAppVersion && { minAppVersion: node.plugin.minAppVersion }),
                    ...(node.plugin.icon && { icon: node.plugin.icon }),
                    ...(node.plugin.tags && { tags: node.plugin.tags })
                } : null
            };
            return acc;
        }, {} as Record<string, any>);

        return JSON.stringify({
            version: "1.0.0",
            metadata: {
                name: currentGraphName,
                description: "Visual plugin composition and workflow",
                exportedAt: new Date().toISOString(),
                zoom: zoom,
                panOffset: panOffset
            },
            nodes: nodesObject
        }, null, 2);
    }
}
