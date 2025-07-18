import React from 'react';
import { ExtensionManifest } from '../../../types/extension';
import NodeContent from './NodeContent';
import './GraphNode.css';

// Add interface for extension components
interface ExtensionComponent extends React.FC {
    nodeFunction?: (params: any) => any;
}

interface GraphNodeProps {
    node: {
        id: string;
        name: string;
        type: string;
        extension: string;
        plugin?: ExtensionManifest;
        position: { x: number; y: number };
    };
    dragState: {
        isDragging: boolean;
        nodeId: string | null;
        startPosition: { x: number; y: number };
        offset: { x: number; y: number };
    };
    loadedExtensions: Record<string, ExtensionComponent>;
    onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
    onRemoveNode: (nodeId: string) => void;
    onCallFunction: (nodeId: string, params: any) => any;
}

const GraphNode: React.FC<GraphNodeProps> = ({
    node,
    dragState,
    loadedExtensions,
    onMouseDown,
    onRemoveNode,
}) => {
    return (
        <div
            key={node.id}
            className={`graph-node ${dragState.isDragging && dragState.nodeId === node.id ? 'dragging' : ''}`}
            style={{
                left: node.position.x,
                top: node.position.y,
                cursor: 'grab'
            }}
            onMouseDown={(e) => onMouseDown(e, node.id)}
        >
            <div className="node-header">
                <div className="node-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                        <line x1="16" y1="8" x2="2" y2="22"></line>
                        <line x1="17.5" y1="15" x2="9" y2="15"></line>
                    </svg>
                </div>
                <div className="node-title">{node.name}</div>
                <button
                    className="node-remove"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveNode(node.id);
                    }}
                    title="Remove Node"
                >
                    ×
                </button>
            </div>

            <div className="node-content">
                <NodeContent
                    plugin={node.plugin}
                    loadedExtensions={loadedExtensions}
                />
            </div>

            <div className="node-ports">
                <div className="input-ports">
                    <div className="port input-port" title="Input"></div>
                </div>
                <div className="output-ports">
                    <div className="port output-port" title="Output"></div>
                </div>
            </div>
        </div>
    );
};

export default GraphNode;
