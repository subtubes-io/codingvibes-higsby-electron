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
        size?: { width: number; height: number };
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
    onNodeResize?: (nodeId: string, size: { width: number; height: number }) => void;
    zoom?: number;
}

const GraphNode: React.FC<GraphNodeProps> = ({
    node,
    dragState,
    loadedExtensions,
    onMouseDown,
    onRemoveNode,
    onNodeResize,
    zoom = 1,
}) => {
    const [isResizing, setIsResizing] = React.useState(false);
    const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, width: 0, height: 0 });

    // Default dimensions
    const defaultWidth = 200;
    const defaultHeight = 400;
    const nodeWidth = node.size?.width || defaultWidth;
    const nodeHeight = node.size?.height || defaultHeight;

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: nodeWidth,
            height: nodeHeight
        });
    };

    React.useEffect(() => {
        if (!isResizing) return;

        const handleResizeMove = (e: MouseEvent) => {
            // Transform mouse coordinates to account for zoom and pan
            const deltaX = (e.clientX - resizeStart.x) / zoom;
            const deltaY = (e.clientY - resizeStart.y) / zoom;

            const newWidth = Math.max(180, resizeStart.width + deltaX); // Minimum width of 180px
            const newHeight = Math.max(250, resizeStart.height + deltaY); // Minimum height of 250px

            if (onNodeResize) {
                onNodeResize(node.id, { width: newWidth, height: newHeight });
            }
        };

        const handleResizeEnd = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);

        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, resizeStart, node.id, onNodeResize, zoom]);
    return (
        <div
            key={node.id}
            className={`node-wrapper ${isResizing ? 'resizing' : ''}`}
            style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                width: nodeWidth,
                height: nodeHeight,
            }}
        >
            <div
                className={`graph-node ${dragState.isDragging && dragState.nodeId === node.id ? 'dragging' : ''}`}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <div
                    className="node-header"
                    style={{
                        cursor: 'grab'
                    }}
                    onMouseDown={(e) => onMouseDown(e, node.id)}
                >
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

                <div className="node-content" style={{ height: nodeHeight - 60 }}>
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

            {/* Resize Handle - Outside the node */}
            <div
                className="resize-handle"
                onMouseDown={handleResizeStart}
                title="Resize node"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21H3L21 3v18z" />
                    <path d="M15 9l6 6" />
                    <path d="M9 15l6 6" />
                </svg>
            </div>
        </div>
    );
};

export default GraphNode;
