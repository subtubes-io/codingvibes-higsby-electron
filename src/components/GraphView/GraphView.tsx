import React, { useState, useCallback } from 'react';
import { ExtensionManifest } from '../../types/extension';
import PluginsSidebar from '../PluginsSidebar';
import { ExtensionLoader } from '../ExtensionLoader';
import './GraphView.css';

const GraphView: React.FC = () => {
    const [isPluginsSidebarCollapsed, setIsPluginsSidebarCollapsed] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState<ExtensionManifest | null>(null);
    const [graphNodes, setGraphNodes] = useState<any[]>([]);
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        nodeId: string | null;
        startPosition: { x: number; y: number };
        offset: { x: number; y: number };
    }>({
        isDragging: false,
        nodeId: null,
        startPosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 }
    });

    const handleTogglePluginsSidebar = useCallback(() => {
        setIsPluginsSidebarCollapsed(prev => !prev);
    }, []);

    const handlePluginSelect = useCallback((plugin: ExtensionManifest) => {
        setSelectedPlugin(plugin);
        // Add plugin to graph as a node
        addPluginToGraph(plugin);
    }, []);

    const addPluginToGraph = (plugin: ExtensionManifest) => {
        const existingNodeCount = graphNodes.length;
        const gridSize = Math.ceil(Math.sqrt(existingNodeCount + 1));
        const spacing = 250; // Space between nodes
        const offsetX = 50; // Initial offset from left
        const offsetY = 50; // Initial offset from top
        
        const row = Math.floor(existingNodeCount / gridSize);
        const col = existingNodeCount % gridSize;
        
        const newNode = {
            id: plugin.name.toLowerCase().replace(/\s+/g, '-'),
            name: plugin.name,
            type: 'plugin',
            plugin: plugin,
            position: {
                x: offsetX + (col * spacing),
                y: offsetY + (row * spacing)
            }
        };

        setGraphNodes(prev => {
            // Check if node already exists
            const exists = prev.some(node => node.id === newNode.id);
            if (exists) return prev;
            return [...prev, newNode];
        });
    };

    const removeNodeFromGraph = (nodeId: string) => {
        setGraphNodes(prev => prev.filter(node => node.id !== nodeId));
    };

    const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setDragState({
            isDragging: true,
            nodeId,
            startPosition: { x: e.clientX, y: e.clientY },
            offset: { x: offsetX, y: offsetY }
        });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragState.isDragging || !dragState.nodeId) return;

        e.preventDefault();
        
        const graphWorkspace = document.querySelector('.graph-workspace') as HTMLElement;
        if (!graphWorkspace) return;

        const workspaceRect = graphWorkspace.getBoundingClientRect();
        const newX = e.clientX - workspaceRect.left - dragState.offset.x;
        const newY = e.clientY - workspaceRect.top - dragState.offset.y;

        // Constrain to workspace bounds
        const constrainedX = Math.max(0, Math.min(newX, workspaceRect.width - 200)); // 200px node width
        const constrainedY = Math.max(0, Math.min(newY, workspaceRect.height - 150)); // 150px node height

        setGraphNodes(prev => 
            prev.map(node => 
                node.id === dragState.nodeId 
                    ? { ...node, position: { x: constrainedX, y: constrainedY } }
                    : node
            )
        );
    }, [dragState]);

    const handleMouseUp = useCallback(() => {
        setDragState({
            isDragging: false,
            nodeId: null,
            startPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 }
        });
    }, []);

    // Add global event listeners for mouse move and up
    React.useEffect(() => {
        if (dragState.isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="graph-view">
            {/* Main Graph Canvas */}
            <div className={`graph-canvas ${isPluginsSidebarCollapsed ? 'plugins-collapsed' : ''}`}>
                <div className="graph-header">
                    <div className="graph-title-section">
                        <h2 className="graph-title">Graph View</h2>
                        <p className="graph-description">
                            Visual plugin composition and workflow builder
                        </p>
                    </div>

                    <div className="graph-controls">
                        <button 
                            className="graph-control-button" 
                            title="Clear Graph"
                            onClick={() => setGraphNodes([])}
                        >
                            🗑️
                        </button>
                        <button className="graph-control-button" title="Center View">
                            🎯
                        </button>
                        <button className="graph-control-button" title="Zoom to Fit">
                            🔍
                        </button>
                        <button className="graph-control-button" title="Export Graph">
                            📤
                        </button>
                    </div>
                </div>

                <div className="graph-workspace">
                    {graphNodes.length === 0 ? (
                        <div className="empty-graph">
                            <div className="empty-graph-icon">🔗</div>
                            <h3>Start Building Your Graph</h3>
                            <p>Select plugins from the sidebar to add them to your graph</p>
                            <div className="empty-graph-tips">
                                <div className="tip">
                                    <span className="tip-icon">💡</span>
                                    <span>Drag plugins from the sidebar to create nodes</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">🔗</span>
                                    <span>Connect nodes to create workflows</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">⚡</span>
                                    <span>Configure node properties and parameters</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="graph-nodes">
                            {graphNodes.map(node => (
                                <div
                                    key={node.id}
                                    className={`graph-node ${dragState.isDragging && dragState.nodeId === node.id ? 'dragging' : ''}`}
                                    style={{
                                        left: node.position.x,
                                        top: node.position.y,
                                        cursor: 'grab'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                                >
                                    <div className="node-header">
                                        <div className="node-icon">🧩</div>
                                        <div className="node-title">{node.name}</div>
                                        <button
                                            className="node-remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNodeFromGraph(node.id);
                                            }}
                                            title="Remove Node"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="node-content">
                                        {node.plugin && (
                                            <div className="node-plugin-info">
                                                <div className="plugin-version">v{node.plugin.version}</div>
                                                <div className="plugin-author">{node.plugin.author}</div>
                                                {node.plugin.description && (
                                                    <div className="plugin-description">
                                                        {node.plugin.description}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Plugin Preview */}
                {selectedPlugin && (
                    <div className="selected-plugin-preview">
                        <div className="preview-header">
                            <h4>Plugin Preview</h4>
                            <button
                                className="close-preview"
                                onClick={() => setSelectedPlugin(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="preview-content">
                            <ExtensionLoader selectedExtensionId={selectedPlugin.name.toLowerCase().replace(/\s+/g, '-')} />
                        </div>
                    </div>
                )}
            </div>

            {/* Plugins Sidebar */}
            <PluginsSidebar
                isCollapsed={isPluginsSidebarCollapsed}
                onToggle={handleTogglePluginsSidebar}
                onPluginSelect={handlePluginSelect}
                selectedPlugin={selectedPlugin}
            />
        </div>
    );
};

export default GraphView;
