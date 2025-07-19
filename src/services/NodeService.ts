import { ExtensionManifest, PortInstance, SerializedNode } from '../types/extension';

// Browser-compatible UUID generation
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export class NodeService {
    /**
     * Create port instances for a node based on its extension manifest
     */
    static createPortsForNode(nodeId: string, manifest: ExtensionManifest): {
        inputPorts: PortInstance[],
        outputPorts: PortInstance[]
    } {
        const inputPorts: PortInstance[] = [];
        const outputPorts: PortInstance[] = [];

        // Create input ports
        if (manifest.ports?.inputs) {
            for (const portDef of manifest.ports.inputs) {
                inputPorts.push({
                    id: generateUUID(),
                    type: 'input',
                    category: portDef.category,
                    name: portDef.name,
                    nodeId: nodeId,
                    edges: [],
                    description: portDef.description
                });
            }
        }

        // Create output ports  
        if (manifest.ports?.outputs) {
            for (const portDef of manifest.ports.outputs) {
                outputPorts.push({
                    id: generateUUID(),
                    type: 'output',
                    category: portDef.category,
                    name: portDef.name,
                    nodeId: nodeId,
                    edges: [],
                    description: portDef.description
                });
            }
        }

        return { inputPorts, outputPorts };
    }

    /**
     * Create a complete node with all its ports
     */
    static createNodeWithPorts(
        name: string,
        extension: string,
        manifest: ExtensionManifest,
        position: { x: number; y: number }
    ): {
        node: SerializedNode,
        ports: PortInstance[]
    } {
        const nodeId = generateUUID();
        const { inputPorts, outputPorts } = this.createPortsForNode(nodeId, manifest); const node: SerializedNode = {
            id: nodeId,
            name,
            type: 'plugin',
            extension,
            position,
            plugin: manifest,
            inputPorts: inputPorts.map(p => p.id),
            outputPorts: outputPorts.map(p => p.id)
        };

        return {
            node,
            ports: [...inputPorts, ...outputPorts]
        };
    }

    /**
     * Get port color based on category
     */
    static getPortColor(category: string): string {
        const portColorMap: Record<string, string> = {
            string: '#3b82f6',    // Blue
            number: '#10b981',    // Green  
            boolean: '#f59e0b',   // Amber
            JSON: '#8b5cf6'       // Purple
        };
        return portColorMap[category] || '#6b7280'; // Default gray
    }
}
