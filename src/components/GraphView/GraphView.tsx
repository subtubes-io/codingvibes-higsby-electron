import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ExtensionManifest } from '../../types/extension';
import PluginsSidebar from '../PluginsSidebar';
import './GraphView.css';

const GraphView: React.FC = () => {
    const [isPluginsSidebarCollapsed, setIsPluginsSidebarCollapsed] = useState(false);
    const [graphNodes, setGraphNodes] = useState<any[]>([]);

    // Debug: Log graph nodes changes
    useEffect(() => {
        console.log('GraphNodes updated:', graphNodes);
    }, [graphNodes]);
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

    // Refs for smooth animation
    const animationFrameRef = useRef<number | null>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const graphWorkspaceRef = useRef<HTMLDivElement>(null);

    const handleTogglePluginsSidebar = useCallback(() => {
        setIsPluginsSidebarCollapsed(prev => !prev);
    }, []);

    const handleAddToGraph = useCallback((plugin: ExtensionManifest) => {
        console.log('handleAddToGraph called with plugin:', plugin);
        addPluginToGraph(plugin);
    }, []);

    const addPluginToGraph = useCallback((plugin: ExtensionManifest) => {
        console.log('addPluginToGraph called with plugin:', plugin);

        setGraphNodes(prev => {
            console.log('Current graphNodes:', prev);

            const existingNodeCount = prev.length;
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

            console.log('Creating new node:', newNode);

            // Check if node already exists
            const exists = prev.some(node => node.id === newNode.id);
            if (exists) {
                console.log('Node already exists, not adding');
                return prev;
            }
            console.log('Adding new node to graph');
            return [...prev, newNode];
        });
    }, []);

    const removeNodeFromGraph = useCallback((nodeId: string) => {
        console.log('removeNodeFromGraph called with nodeId:', nodeId);
        setGraphNodes(prev => {
            console.log('Current graphNodes before removal:', prev);
            const filtered = prev.filter(node => node.id !== nodeId);
            console.log('Filtered nodes after removal:', filtered);
            return filtered;
        });
    }, []);

    // Update node position using requestAnimationFrame for smooth dragging
    const updateNodePosition = useCallback(() => {
        if (!dragState.isDragging || !dragState.nodeId) {
            return;
        }

        const graphWorkspace = graphWorkspaceRef.current;
        if (!graphWorkspace) return;

        const workspaceRect = graphWorkspace.getBoundingClientRect();
        const newX = mousePositionRef.current.x - dragState.offset.x;
        const newY = mousePositionRef.current.y - dragState.offset.y;

        // Constrain to workspace bounds
        const constrainedX = Math.max(0, Math.min(newX, workspaceRect.width - 200));
        const constrainedY = Math.max(0, Math.min(newY, workspaceRect.height - 150));

        setGraphNodes(prev =>
            prev.map(node =>
                node.id === dragState.nodeId
                    ? { ...node, position: { x: constrainedX, y: constrainedY } }
                    : node
            )
        );

        // Continue animation if still dragging
        if (dragState.isDragging && dragState.nodeId) {
            animationFrameRef.current = requestAnimationFrame(updateNodePosition);
        }
    }, [dragState.isDragging, dragState.nodeId, dragState.offset.x, dragState.offset.y]);

    const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const graphWorkspace = graphWorkspaceRef.current;
        if (!graphWorkspace) return;

        const workspaceRect = graphWorkspace.getBoundingClientRect();
        const mouseX = e.clientX - workspaceRect.left;
        const mouseY = e.clientY - workspaceRect.top;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        mousePositionRef.current = { x: mouseX, y: mouseY };

        setDragState({
            isDragging: true,
            nodeId,
            startPosition: { x: mouseX, y: mouseY },
            offset: { x: offsetX, y: offsetY }
        });
    }, []);

    // Start animation when dragging begins
    useEffect(() => {
        if (dragState.isDragging && dragState.nodeId && !animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(updateNodePosition);
        }
    }, [dragState.isDragging, dragState.nodeId, updateNodePosition]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragState.isDragging || !graphWorkspaceRef.current) return;

        const workspaceRect = graphWorkspaceRef.current.getBoundingClientRect();
        mousePositionRef.current = {
            x: e.clientX - workspaceRect.left,
            y: e.clientY - workspaceRect.top
        };
    }, [dragState.isDragging]);

    const handleMouseUp = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setDragState({
            isDragging: false,
            nodeId: null,
            startPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 }
        });
    }, []);

    // Set up global mouse event listeners and cleanup
    useEffect(() => {
        if (dragState.isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';

                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            };
        }
    }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                        <button className="graph-control-button" title="Center View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="m12 1 1.2 2.2L16 2l.8 1.6 2.2-1.2v2.4l2.2 1.2L20 8l1.6.8L20 11.2V16l-1.6.8L20 19.2l-2.2 1.2L16 22l-.8-1.6L12 23l-1.2-2.2L8 22l-.8-1.6L5 21.2V16l-2.2-1.2L4 12l-1.6-.8L4 8.8V4l2.2-1.2L8 2l.8 1.6z"></path>
                            </svg>
                        </button>
                        <button className="graph-control-button" title="Zoom to Fit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                                <path d="M11 6v10"></path>
                                <path d="M6 11h10"></path>
                            </svg>
                        </button>
                        <button className="graph-control-button" title="Export Graph">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7,10 12,15 17,10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="graph-workspace" ref={graphWorkspaceRef}>
                    {graphNodes.length === 0 ? (
                        <div className="empty-graph">
                            <div className="empty-graph-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                            </div>
                            <h3>Start Building Your Graph</h3>
                            <p>Select plugins from the sidebar to add them to your graph</p>
                            <div className="empty-graph-tips">
                                <div className="tip">
                                    <span className="tip-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="m9 12 2 2 4-4"></path>
                                        </svg>
                                    </span>
                                    <span>Drag plugins from the sidebar to create nodes</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="18" cy="5" r="3"></circle>
                                            <circle cx="6" cy="12" r="3"></circle>
                                            <circle cx="18" cy="19" r="3"></circle>
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                        </svg>
                                    </span>
                                    <span>Connect nodes to create workflows</span>
                                </div>
                                <div className="tip">
                                    <span className="tip-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M12 1v6m0 6v6"></path>
                                            <path d="m9 9 3-3 3 3"></path>
                                            <path d="m9 15 3 3 3-3"></path>
                                        </svg>
                                    </span>
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
                                                console.log('Remove button clicked for node:', node.id);
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

            </div>

            {/* Plugins Sidebar */}
            <PluginsSidebar
                isCollapsed={isPluginsSidebarCollapsed}
                onToggle={handleTogglePluginsSidebar}
                onAddToGraph={handleAddToGraph}
            />
        </div>
    );
};

export default GraphView;
