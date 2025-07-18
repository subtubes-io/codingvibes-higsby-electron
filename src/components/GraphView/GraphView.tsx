import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ExtensionManifest } from '../../types/extension';
import { ExtensionService } from '../../services/extensionService';
import PluginsSidebar from '../PluginsSidebar';
import GraphNode from './GraphNode';
import GraphControls from './GraphControls';
import './GraphView.css';

// Add interface for extension components
interface ExtensionComponent extends React.FC {
    nodeFunction?: (params: any) => any;
}

const GraphView: React.FC = () => {
    const [isPluginsSidebarCollapsed, setIsPluginsSidebarCollapsed] = useState(false);
    const [graphNodes, setGraphNodes] = useState<any[]>([]);
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [loadedExtensions, setLoadedExtensions] = useState<Record<string, ExtensionComponent>>({});
    const [extensionService] = useState(() => new ExtensionService());
    const [extensionFunctions, setExtensionFunctions] = useState<Record<string, any>>({});
    const [isPlaying, setIsPlaying] = useState(false);

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

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev * 1.2, 3)); // Max zoom 3x
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev / 1.2, 0.2)); // Min zoom 0.2x
    }, []);

    const handleZoomToFit = useCallback(() => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    }, []);

    // Get all available extension functions
    const getAllExtensionFunctions = useCallback(() => {
        return extensionService.getAllExtensionFunctions();
    }, [extensionService]);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);

        // Get all extension functions from the ExtensionService
        const allExtensionFunctions = getAllExtensionFunctions();
        const localExtensionFunctions = extensionFunctions;

        console.log('🎬 PLAY BUTTON CLICKED - Extension Functions Map:');
        console.log('=====================================');

        console.log('Local Extension Functions:', localExtensionFunctions);
        console.log('ExtensionService Functions:', allExtensionFunctions);

        // Call all available functions and log their results
        console.log('\n🔧 Calling all extension functions:');
        Object.entries(localExtensionFunctions).forEach(([extensionId, func]) => {
            if (typeof func === 'function') {
                try {
                    const result = func({ source: 'play-button', timestamp: new Date().toISOString() });
                    console.log(`✅ ${extensionId}:`, result);
                } catch (error) {
                    console.error(`❌ Error calling ${extensionId}:`, error);
                }
            }
        });

        console.log('=====================================');
    }, [extensionFunctions, getAllExtensionFunctions]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
        console.log('⏸️ PAUSE BUTTON CLICKED - Execution paused');
    }, []);

    const handleExportGraph = useCallback(() => {
        // Convert nodes array to object keyed by node IDs
        const nodesObject = graphNodes.reduce((acc, node) => {
            acc[node.id] = {
                id: node.id,
                name: node.name,
                type: node.type,
                extension: node.extension,
                position: node.position,
                size: node.size, // Include the size in the serialization
                plugin: node.plugin ? {
                    id: node.plugin.id,
                    name: node.plugin.name,
                    componentName: node.plugin.componentName, // Include componentName for proper extension loading
                    version: node.plugin.version,
                    author: node.plugin.author,
                    description: node.plugin.description,
                    main: node.plugin.main,
                    // Include optional properties if they exist
                    ...(node.plugin.dependencies && { dependencies: node.plugin.dependencies }),
                    ...(node.plugin.permissions && { permissions: node.plugin.permissions }),
                    ...(node.plugin.minAppVersion && { minAppVersion: node.plugin.minAppVersion }),
                    ...(node.plugin.icon && { icon: node.plugin.icon }),
                    ...(node.plugin.tags && { tags: node.plugin.tags })
                } : null
            };
            return acc;
        }, {} as Record<string, any>);

        const graphData = {
            version: "1.0.0",
            metadata: {
                name: "Graph Export",
                description: "Visual plugin composition and workflow",
                exportedAt: new Date().toISOString(),
                zoom: zoom,
                panOffset: panOffset
            },
            nodes: nodesObject
        };

        const jsonString = JSON.stringify(graphData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `graph-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    }, [graphNodes, zoom, panOffset]);

    // Dynamic extension loader
    const loadExtension = useCallback(async (plugin: ExtensionManifest) => {
        // Use componentName as the key
        const componentKey = plugin.componentName;

        // Debug logging to help track down the undefined issue
        if (!componentKey) {
            console.error('🚨 loadExtension called with undefined componentName:', plugin);
            return null;
        }

        if (loadedExtensions[componentKey]) {
            return loadedExtensions[componentKey];
        }

        // Cross-platform extension loading using componentName or id
        const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;

        let extensionPath: string;
        if (isElectron) {
            // Use componentKey for the folder path (componentName or id as fallback)
            extensionPath = `extension://${componentKey}/index.js`;
        } else {
            // Fallback for web development
            extensionPath = `/extensions/${componentKey}/index.js`;
        }


        // Try a simpler approach - load as ESM and provide React context
        try {
            // First, ensure React is available globally for the extension
            const React = (await import('react')).default;
            const ReactDOM = await import('react-dom');

            // Set up global React for the extension to use
            (window as any).React = React;
            (window as any).ReactDOM = ReactDOM;

            // Load the extension module
            const module = await import(/* @vite-ignore */ extensionPath);

            // Try different ways to get the component
            let ExtensionComponentClass;
            if (module.default) {
                ExtensionComponentClass = module.default;
            } else if (module.Component) {
                ExtensionComponentClass = module.Component;
            } else if (typeof module.get === 'function') {
                // This is a federation module
                const componentFactory = await module.get('./Component');
                ExtensionComponentClass = componentFactory();
            } else {
                throw new Error('Could not find component export in extension module');
            }

            if (!ExtensionComponentClass) {
                throw new Error(`Extension ${componentKey} does not export a valid component`);
            }


            setLoadedExtensions(prev => ({
                ...prev,
                [componentKey]: ExtensionComponentClass // Use componentKey as key
            }));

            return ExtensionComponentClass;
        } catch (error: any) {
            console.error(`Failed to load extension ${componentKey}:`, error);
            return null;
        }
    }, [loadedExtensions]);

    // Load extensions when nodes are added
    useEffect(() => {
        graphNodes.forEach(node => {
            if (node.plugin && node.plugin.componentName && !loadedExtensions[node.plugin.componentName]) {
                console.log('🔄 Loading extension for node:', node.name, 'componentName:', node.plugin.componentName);
                loadExtension(node.plugin);
            } else if (node.plugin && !node.plugin.componentName) {
                console.error('🚨 Node has plugin but missing componentName:', node.name, node.plugin);
            }
        });
    }, [graphNodes, loadedExtensions, loadExtension]);

    const handleImportGraph = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target?.result as string);

                    // Validate the imported data structure
                    if (jsonData.nodes && typeof jsonData.nodes === 'object') {
                        // Convert nodes object back to array format for state
                        const nodesArray = Object.values(jsonData.nodes).map((node: any) => {
                            // Debug logging for imported nodes
                            if (node.plugin) {
                                console.log('🔄 Importing node with plugin:', node.name, 'plugin:', node.plugin);
                                if (!node.plugin.componentName) {
                                    console.error('🚨 Imported plugin missing componentName:', node.plugin);
                                }
                            }

                            return {
                                ...node,
                                // Ensure backward compatibility by adding default size if missing
                                size: node.size || { width: 200, height: 400 }
                            };
                        });
                        setGraphNodes(nodesArray);

                        // Restore view state if available
                        if (jsonData.metadata) {
                            if (typeof jsonData.metadata.zoom === 'number') {
                                setZoom(jsonData.metadata.zoom);
                            }
                            if (jsonData.metadata.panOffset) {
                                setPanOffset(jsonData.metadata.panOffset);
                            }
                        }

                    } else {
                        console.error('Invalid graph file format');
                        alert('Invalid graph file format. Please select a valid graph export file.');
                    }
                } catch (error) {
                    console.error('Error parsing graph file:', error);
                    alert('Error reading graph file. Please check the file format.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Zoom with Ctrl/Cmd + scroll
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(prev => {
                const newZoom = prev * zoomFactor;
                return Math.max(0.2, Math.min(3, newZoom));
            });
        } else {
            // Pan with scroll
            setPanOffset(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    }, []);

    const handleAddToGraph = useCallback((plugin: ExtensionManifest) => {
        addPluginToGraph(plugin);
    }, []);

    // Load extension functions using ExtensionService
    const loadExtensionFunctions = useCallback(async (plugin: ExtensionManifest) => {
        try {
            // Use componentName as the extension identifier
            const extensionId = plugin.componentName;
            console.log("extension id ---->", extensionId);
            console.log("plugin object ---->", plugin);

            console.log(`🔄 Loading extension function for: ${plugin.name} (ID: ${extensionId})`);

            // Debug: Check what extensions are available
            const availableExtensions = await extensionService.getExtensions();
            console.log("Available extensions from API:", availableExtensions);

            // First check if ExtensionService can find the extension metadata
            const metadata = await extensionService.getExtensionMetadata(extensionId);
            console.log("extension metadata ---->", metadata);

            // Load the extension component to trigger function registration
            const component = await extensionService.loadExtensionComponent(extensionId);
            console.log('this is the component----->', component);

            // If ExtensionService fails, try our local loadExtension method as fallback
            let finalComponent = component;
            if (!component) {
                console.log('🔄 ExtensionService failed, trying local loadExtension method...');
                finalComponent = await loadExtension(plugin);
                console.log('Local loadExtension result:', finalComponent);
            }

            if (finalComponent) {
                // Get the registered function from ExtensionService first
                let func = extensionService.getExtensionFunction(extensionId);


                // If no function in ExtensionService, try to extract from the component directly
                const componentWithFunction = finalComponent as any;
                if (!func && componentWithFunction.nodeFunction && typeof componentWithFunction.nodeFunction === 'function') {
                    console.log('🔄 Extracting nodeFunction directly from component...');
                    func = componentWithFunction.nodeFunction;
                    // Also register it in the ExtensionService for consistency
                    try {
                        (extensionService as any).extensionFunctions.set(extensionId, func);
                        console.log(`✅ Manually registered function in ExtensionService for: ${extensionId}`);
                    } catch (error) {
                        console.warn('Failed to manually register function in ExtensionService:', error);
                    }
                }

                if (func) {
                    setExtensionFunctions(prev => {
                        const updated = {
                            ...prev,
                            [extensionId]: func
                        };
                        console.log("!!!!!!!!!!! --->", typeof func)
                        func();
                        console.log(`✅ Added function to map for: ${plugin.name}`);
                        console.log(`📊 Current function map:`, Object.keys(updated));
                        return updated;
                    });
                    console.log(`🎯 Successfully loaded extension function for: ${plugin.name}`);
                } else {
                    console.warn(`⚠️ No nodeFunction found for: ${plugin.name}`);
                }
            } else {
                console.warn(`⚠️ Failed to load extension component for: ${plugin.name}`);
            }
        } catch (error) {
            console.error(`❌ Failed to load extension function for ${plugin.name}:`, error);
        }
    }, [extensionService]);

    // Call extension function for a specific node
    const callNodeFunction = useCallback((nodeId: string, params: any = {}) => {
        const node = graphNodes.find(n => n.id === nodeId);
        if (!node || !node.plugin) {
            console.warn(`Node ${nodeId} not found or has no plugin`);
            return null;
        }

        const extensionId = node.plugin.componentName || node.plugin.name;
        const func = extensionFunctions[extensionId];
        if (func && typeof func === 'function') {
            try {
                const result = func(params);
                console.log(`Function result for node ${nodeId}:`, result);
                return result;
            } catch (error) {
                console.error(`Error calling function for node ${nodeId}:`, error);
                return null;
            }
        } else {
            console.warn(`No function available for node ${nodeId}`);
            return null;
        }
    }, [graphNodes, extensionFunctions]);

    const addPluginToGraph = useCallback((plugin: ExtensionManifest) => {
        setGraphNodes(prev => {

            const existingNodeCount = prev.length;
            const gridSize = Math.ceil(Math.sqrt(existingNodeCount + 1));
            const spacing = 250; // Space between nodes
            const offsetX = 50; // Initial offset from left
            const offsetY = 50; // Initial offset from top

            const row = Math.floor(existingNodeCount / gridSize);
            const col = existingNodeCount % gridSize;

            const newNode = {
                id: crypto.randomUUID(), // Generate unique UUID for each node
                name: plugin.name,
                type: 'plugin',
                extension: plugin.name.toLowerCase().replace(/\s+/g, '-'), // Extension identifier // todo:#edgar  this should be the component name
                plugin: {
                    ...plugin,
                    // Ensure componentName is set - fallback to generated name if missing
                    componentName: plugin.componentName || plugin.name.toLowerCase().replace(/\s+/g, '-')
                },
                position: {
                    x: offsetX + (col * spacing),
                    y: offsetY + (row * spacing)
                },
                size: {
                    width: 200,
                    height: 400
                }
            };

            return [...prev, newNode];
        });

        // Load extension functions when adding node to graph
        loadExtensionFunctions(plugin);
    }, [loadExtensionFunctions]);

    const removeNodeFromGraph = useCallback((nodeId: string) => {
        setGraphNodes(prev => {
            const filtered = prev.filter(node => node.id !== nodeId);
            return filtered;
        });
    }, []);

    const handleNodeResize = useCallback((nodeId: string, size: { width: number; height: number }) => {
        setGraphNodes(prev => prev.map(node =>
            node.id === nodeId
                ? { ...node, size }
                : node
        ));
    }, []);

    // Update node position using requestAnimationFrame for smooth dragging
    const updateNodePosition = useCallback(() => {
        if (!dragState.isDragging || !dragState.nodeId) {
            return;
        }

        const graphWorkspace = graphWorkspaceRef.current;
        if (!graphWorkspace) return;

        const workspaceRect = graphWorkspace.getBoundingClientRect();

        // Adjust mouse coordinates for zoom and pan
        const adjustedMouseX = (mousePositionRef.current.x - panOffset.x) / zoom;
        const adjustedMouseY = (mousePositionRef.current.y - panOffset.y) / zoom;

        const newX = adjustedMouseX - dragState.offset.x / zoom;
        const newY = adjustedMouseY - dragState.offset.y / zoom;

        // Constrain to workspace bounds (use large virtual canvas)
        const canvasWidth = Math.max(5000, workspaceRect.width / zoom);
        const canvasHeight = Math.max(5000, workspaceRect.height / zoom);
        const constrainedX = Math.max(0, Math.min(newX, canvasWidth - 200));
        const constrainedY = Math.max(0, Math.min(newY, canvasHeight - 150));

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
    }, [dragState.isDragging, dragState.nodeId, dragState.offset.x, dragState.offset.y, zoom, panOffset.x, panOffset.y]);

    const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const graphWorkspace = graphWorkspaceRef.current;
        if (!graphWorkspace) return;

        const workspaceRect = graphWorkspace.getBoundingClientRect();
        const mouseX = e.clientX - workspaceRect.left;
        const mouseY = e.clientY - workspaceRect.top;

        // Get the node's current position
        const node = graphNodes.find(n => n.id === nodeId);
        if (!node) return;

        // Calculate offset from mouse to node position (accounting for zoom and pan)
        const nodeScreenX = node.position.x * zoom + panOffset.x;
        const nodeScreenY = node.position.y * zoom + panOffset.y;

        const offsetX = mouseX - nodeScreenX;
        const offsetY = mouseY - nodeScreenY;

        mousePositionRef.current = { x: mouseX, y: mouseY };

        setDragState({
            isDragging: true,
            nodeId,
            startPosition: { x: mouseX, y: mouseY },
            offset: { x: offsetX, y: offsetY }
        });
    }, [graphNodes, zoom, panOffset.x, panOffset.y]);

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

    // Set up wheel event listener for zoom and pan
    useEffect(() => {
        const workspace = graphWorkspaceRef.current;
        if (workspace) {
            workspace.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                workspace.removeEventListener('wheel', handleWheel);
            };
        }
    }, [handleWheel]);

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

                    <GraphControls
                        isPlaying={isPlaying}
                        zoom={zoom}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onClearGraph={() => setGraphNodes([])}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onZoomToFit={handleZoomToFit}
                        onImportGraph={handleImportGraph}
                        onExportGraph={handleExportGraph}
                    />
                </div>

                <div className="graph-workspace" ref={graphWorkspaceRef}>
                    <div
                        className="graph-content"
                        style={{
                            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            transition: dragState.isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        <div className="graph-nodes">
                            {graphNodes.map(node => (
                                <GraphNode
                                    key={node.id}
                                    node={node}
                                    dragState={dragState}
                                    loadedExtensions={loadedExtensions}
                                    onMouseDown={handleMouseDown}
                                    onRemoveNode={removeNodeFromGraph}
                                    onCallFunction={callNodeFunction}
                                    onNodeResize={handleNodeResize}
                                    zoom={zoom}
                                />
                            ))}
                        </div>
                    </div>
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
