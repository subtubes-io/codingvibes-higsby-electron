import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ExtensionManifest } from '../../types/extension';
import { ExtensionService } from '../../services/extensionService';
import PluginsSidebar from '../PluginsSidebar';
import GraphsSidebar from '../GraphsSidebar/GraphsSidebar';
import { GraphStorageService, SavedGraph } from '../../services/graphStorageService';
import GraphNode from './GraphNode';
import GraphControls from './GraphControls';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import './GraphView.css';

// Add interface for extension components
interface ExtensionComponent extends React.FC {
    nodeFunction?: (params: any) => any;
}

const GraphView: React.FC = () => {
    const [isPluginsSidebarCollapsed, setIsPluginsSidebarCollapsed] = useState(false);
    const [isGraphsSidebarCollapsed, setIsGraphsSidebarCollapsed] = useState(false);
    const [graphNodes, setGraphNodes] = useState<any[]>([]);
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [loadedExtensions, setLoadedExtensions] = useState<Record<string, ExtensionComponent>>({});
    const [extensionService] = useState(() => new ExtensionService());
    const [extensionFunctions, setExtensionFunctions] = useState<Record<string, any>>({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGraphId, setCurrentGraphId] = useState<string | undefined>();
    const [currentGraphName, setCurrentGraphName] = useState<string>('Untitled Graph');
    const [currentGraphDescription, setCurrentGraphDescription] = useState<string>('Visual plugin composition and workflow builder');
    const [graphStorageService] = useState(() => new GraphStorageService());
    const [editingNameValue, setEditingNameValue] = useState('');
    const [editingDescriptionValue, setEditingDescriptionValue] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    // Toast notifications
    const { toasts, addToast, removeToast } = useToast();

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

    const handleToggleGraphsSidebar = useCallback(() => {
        setIsGraphsSidebarCollapsed(prev => !prev);
    }, []);

    const handleUpdateGraphName = useCallback(async (newName: string) => {
        setCurrentGraphName(newName);

        // Update the graph title in the header
        if (currentGraphId) {
            try {
                await graphStorageService.updateGraphName(currentGraphId, newName);
            } catch (error) {
                console.error('Failed to update graph name in storage:', error);
            }
        }
    }, [currentGraphId, graphStorageService]);

    const handleStartEditingTitle = useCallback(() => {
        setIsEditingTitle(true);
        setEditingNameValue(currentGraphName);
    }, [currentGraphName]);

    const handleStartEditingDescription = useCallback(() => {
        setIsEditingDescription(true);
        setEditingDescriptionValue(currentGraphDescription);
    }, [currentGraphDescription]);

    const handleSaveTitleEdit = useCallback(async () => {
        if (!editingNameValue.trim()) {
            addToast('Graph name cannot be empty', 'error');
            return;
        }

        const newName = editingNameValue.trim();
        setCurrentGraphName(newName);
        setIsEditingTitle(false);
        setEditingNameValue('');

        // Save to storage
        try {
            if (currentGraphId) {
                await graphStorageService.updateGraphName(currentGraphId, newName);
                console.log('Graph title updated:', newName);
            }
        } catch (error) {
            console.error('Failed to save graph title:', error);
            addToast('Failed to save graph title', 'error');
        }
    }, [editingNameValue, currentGraphId, graphStorageService, addToast]);

    const handleSaveDescriptionEdit = useCallback(async () => {
        const newDescription = editingDescriptionValue.trim() || 'Visual plugin composition and workflow builder';
        setCurrentGraphDescription(newDescription);
        setIsEditingDescription(false);
        setEditingDescriptionValue('');

        // Save to storage
        try {
            if (currentGraphId) {
                await graphStorageService.updateGraphDescription(currentGraphId, newDescription);
                console.log('Graph description updated:', newDescription);
            }
        } catch (error) {
            console.error('Failed to save graph description:', error);
            addToast('Failed to save graph description', 'error');
        }
    }, [editingDescriptionValue, currentGraphId, graphStorageService, addToast]);

    const handleCancelTitleEdit = useCallback(() => {
        setIsEditingTitle(false);
        setEditingNameValue('');
    }, []);

    const handleCancelDescriptionEdit = useCallback(() => {
        setIsEditingDescription(false);
        setEditingDescriptionValue('');
    }, []);

    const handleTitleKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSaveTitleEdit();
        } else if (event.key === 'Escape') {
            handleCancelTitleEdit();
        }
    }, [handleSaveTitleEdit, handleCancelTitleEdit]);

    const handleDescriptionKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSaveDescriptionEdit();
        } else if (event.key === 'Escape') {
            handleCancelDescriptionEdit();
        }
        // Allow Shift+Enter for new lines in textarea
    }, [handleSaveDescriptionEdit, handleCancelDescriptionEdit]);

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
    }, [extensionFunctions, getAllExtensionFunctions]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleExportGraph = useCallback(async () => {
        try {
            const jsonString = await graphStorageService.exportCurrentGraph(
                graphNodes,
                zoom,
                panOffset,
                currentGraphName
            );

            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const sanitizedName = currentGraphName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            link.download = `${sanitizedName}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            addToast('Graph exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export graph:', error);
            addToast('Failed to export graph', 'error');
        }
    }, [graphNodes, zoom, panOffset, currentGraphName, graphStorageService, addToast]);

    // Load extensions when nodes are added
    useEffect(() => {
        graphNodes.forEach(async (node) => {
            if (node.plugin && node.plugin.componentName && !loadedExtensions[node.plugin.componentName]) {
                try {
                    const component = await extensionService.loadExtensionComponent(node.plugin.componentName);
                    if (component) {
                        setLoadedExtensions(prev => ({
                            ...prev,
                            [node.plugin.componentName]: component
                        }));
                    }
                } catch (error) {
                    console.error('Failed to load extension component:', node.plugin.componentName, error);
                }
            } else if (node.plugin && !node.plugin.componentName) {
                console.error('Node has plugin but missing componentName:', node.name, node.plugin);
            }
        });
    }, [graphNodes, loadedExtensions, extensionService]);

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
                                if (!node.plugin.componentName) {
                                    console.error('Imported plugin missing componentName:', node.plugin);
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
                            // Set graph name from imported metadata
                            if (jsonData.metadata.name) {
                                setCurrentGraphName(jsonData.metadata.name);
                            }
                        }

                        // Reset current graph ID since this is an import (new graph)
                        setCurrentGraphId(undefined);
                        setIsEditingTitle(false);
                        setEditingNameValue('');
                        setIsEditingDescription(false);
                        setEditingDescriptionValue('');

                        addToast('Graph imported successfully!', 'success');

                    } else {
                        console.error('Invalid graph file format');
                        addToast('Invalid graph file format. Please select a valid graph export file.', 'error');
                    }
                } catch (error) {
                    console.error('Error parsing graph file:', error);
                    addToast('Error reading graph file. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [addToast]);

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

    const handleClearGraph = useCallback(() => {
        setGraphNodes([]);
        setCurrentGraphId(undefined);
        setCurrentGraphName('Untitled Graph');
        setCurrentGraphDescription('Visual plugin composition and workflow builder');
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
        setIsEditingTitle(false);
        setEditingNameValue('');
        setIsEditingDescription(false);
        setEditingDescriptionValue('');
    }, []);

    // const handleNewGraph = useCallback(() => {
    //     if (graphNodes.length > 0) {
    //         const shouldClear = window.confirm('Are you sure you want to create a new graph? Unsaved changes will be lost.');
    //         if (!shouldClear) return;
    //     }
    //     handleClearGraph();
    // }, [graphNodes.length, handleClearGraph]);

    const handleSaveCurrentGraph = useCallback(async () => {
        let name = currentGraphName;
        let description = currentGraphDescription;

        // For new graphs, use current name directly (no prompt needed)
        if (!currentGraphId && !name.trim()) {
            name = 'Untitled Graph';
        }

        try {
            const nodesObject = graphNodes.reduce((acc, node) => {
                acc[node.id] = {
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    extension: node.extension,
                    position: node.position,
                    size: node.size,
                    plugin: node.plugin
                };
                return acc;
            }, {} as Record<string, any>);

            const graphData = {
                name,
                description,
                version: "1.0.0",
                metadata: {
                    zoom,
                    panOffset,
                    nodeCount: graphNodes.length,
                    createdAt: '', // Will be set by the service
                    updatedAt: ''  // Will be set by the service
                },
                nodes: nodesObject
            };

            if (currentGraphId) {
                await graphStorageService.updateGraph(currentGraphId, graphData);
                setCurrentGraphName(name);
                addToast('Graph updated successfully!', 'success');
            } else {
                const newId = await graphStorageService.saveGraph(graphData);
                setCurrentGraphId(newId);
                setCurrentGraphName(name);
                addToast('Graph saved successfully!', 'success');
            }

            // Trigger refresh of saved graphs list
            window.dispatchEvent(new CustomEvent('graphSaved'));
        } catch (error) {
            console.error('Failed to save graph:', error);
            addToast('Failed to save graph. Please try again.', 'error');
        }
    }, [graphNodes, zoom, panOffset, currentGraphId, currentGraphName, currentGraphDescription, graphStorageService, addToast]);

    const handleSaveAsGraph = useCallback(async () => {
        // Create a copy with a modified name
        const copyName = `${currentGraphName} (Copy)`;
        const description = currentGraphDescription;

        try {
            const nodesObject = graphNodes.reduce((acc, node) => {
                acc[node.id] = {
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    extension: node.extension,
                    position: node.position,
                    size: node.size,
                    plugin: node.plugin
                };
                return acc;
            }, {} as Record<string, any>);

            const graphData = {
                name: copyName,
                description,
                version: "1.0.0",
                metadata: {
                    zoom,
                    panOffset,
                    nodeCount: graphNodes.length,
                    createdAt: '', // Will be set by the service
                    updatedAt: ''  // Will be set by the service
                },
                nodes: nodesObject
            };

            // Always save as new regardless of current ID
            const newId = await graphStorageService.saveGraph(graphData);
            setCurrentGraphId(newId);
            setCurrentGraphName(copyName);
            addToast(`Graph saved as "${copyName}" successfully!`, 'success');

            // Trigger refresh of saved graphs list
            window.dispatchEvent(new CustomEvent('graphSaved'));
        } catch (error) {
            console.error('Failed to save graph as new:', error);
            addToast('Failed to save graph copy. Please try again.', 'error');
        }
    }, [graphNodes, zoom, panOffset, currentGraphName, currentGraphDescription, graphStorageService, addToast]);

    const handleNewGraph = useCallback(async () => {
        try {
            // Auto-save current graph if it has nodes and changes
            if (graphNodes.length > 0) {
                // Save current graph automatically
                await handleSaveCurrentGraph();
                addToast('Previous graph saved automatically', 'info');
            }

            // Create new blank graph
            setGraphNodes([]);
            setCurrentGraphId(undefined);
            setCurrentGraphName('Untitled Graph');
            setCurrentGraphDescription('Visual plugin composition and workflow builder');
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
            setIsEditingTitle(false);
            setEditingNameValue('');
            setIsEditingDescription(false);
            setEditingDescriptionValue('');

            addToast('New graph created', 'success');
        } catch (error) {
            console.error('Failed to create new graph:', error);
            addToast('Failed to save previous graph', 'error');
        }
    }, [graphNodes.length, handleSaveCurrentGraph, addToast]);

    const handleUpdateGraphDescription = useCallback(async (newDescription: string | undefined) => {
        try {
            if (!currentGraphId) return;
            await graphStorageService.updateGraphDescription(currentGraphId, newDescription || '');
        } catch (error) {
            console.error('Failed to update graph description:', error);
            addToast('Failed to update graph description', 'error');
        }
    }, [graphStorageService, currentGraphId, addToast]);

    // Load extension functions using ExtensionService
    const loadExtensionFunctions = useCallback(async (plugin: ExtensionManifest) => {
        try {
            // Use componentName as the extension identifier
            const extensionId = plugin.componentName;

            // Load the extension component to trigger function registration
            const component = await extensionService.loadExtensionComponent(extensionId);

            if (component) {
                // Get the registered function from ExtensionService
                let func = extensionService.getExtensionFunction(extensionId);

                // If no function in ExtensionService, try to extract from the component directly
                const componentWithFunction = component as any;
                if (!func && componentWithFunction.nodeFunction && typeof componentWithFunction.nodeFunction === 'function') {
                    func = componentWithFunction.nodeFunction;
                    // Also register it in the ExtensionService for consistency
                    try {
                        (extensionService as any).extensionFunctions.set(extensionId, func);
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
                        // todo:edgar this is where the node function is actually available 
                        return updated;
                    });
                    console.log(`Successfully loaded extension function for: ${plugin.name}`);
                } else {
                    console.warn(`No nodeFunction found for: ${plugin.name}`);
                }
            } else {
                console.warn(`Failed to load extension component for: ${plugin.name}`);
            }
        } catch (error) {
            console.error(`Failed to load extension function for ${plugin.name}:`, error);
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

    const handleLoadGraph = useCallback(async (savedGraph: SavedGraph) => {
        try {
            const nodesArray = Object.values(savedGraph.nodes).map((node: any) => ({
                ...node,
                size: node.size || { width: 200, height: 400 }
            }));

            setGraphNodes(nodesArray);
            setZoom(savedGraph.metadata.zoom);
            setPanOffset(savedGraph.metadata.panOffset);
            setCurrentGraphId(savedGraph.id);
            setCurrentGraphName(savedGraph.name);
            setCurrentGraphDescription(savedGraph.description || 'Visual plugin composition and workflow builder');

            // Reset editing states
            setIsEditingTitle(false);
            setEditingNameValue('');
            setIsEditingDescription(false);
            setEditingDescriptionValue('');

            // Load extension functions for all nodes
            for (const node of nodesArray) {
                if (node.plugin) {
                    await loadExtensionFunctions(node.plugin);
                }
            }
        } catch (error) {
            console.error('Failed to load graph:', error);
            addToast('Failed to load graph', 'error');
        }
    }, [loadExtensionFunctions, addToast]);

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
            {/* Toast notifications */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            {/* Graphs Sidebar */}
            <GraphsSidebar
                isCollapsed={isGraphsSidebarCollapsed}
                onToggle={handleToggleGraphsSidebar}
                onLoadGraph={handleLoadGraph}
                onUpdateGraphDescription={handleUpdateGraphDescription}
                currentGraphId={currentGraphId}
                onUpdateGraphName={handleUpdateGraphName}
            />

            {/* Main Graph Canvas */}
            <div className={`graph-canvas ${isPluginsSidebarCollapsed ? 'plugins-collapsed' : ''} ${isGraphsSidebarCollapsed ? 'graphs-collapsed' : ''}`}>
                <div className="graph-header">
                    <div className="graph-title-section">
                        <div className="graph-header-inline">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={editingNameValue}
                                    onChange={(e) => setEditingNameValue(e.target.value)}
                                    onKeyDown={handleTitleKeyPress}
                                    onBlur={handleSaveTitleEdit}
                                    className="graph-title-inline-input"
                                    placeholder="Enter graph name"
                                    autoFocus
                                />
                            ) : (
                                <h2
                                    className="graph-title-inline"
                                    onClick={handleStartEditingTitle}
                                    title="Click to edit"
                                >
                                    {currentGraphName}
                                </h2>
                            )}

                            {isEditingDescription ? (
                                <textarea
                                    value={editingDescriptionValue}
                                    onChange={(e) => setEditingDescriptionValue(e.target.value)}
                                    onKeyDown={handleDescriptionKeyPress}
                                    onBlur={handleSaveDescriptionEdit}
                                    className="graph-description-inline-input"
                                    placeholder="Enter description (optional)"
                                    rows={2}
                                    autoFocus
                                />
                            ) : (
                                <p
                                    className="graph-description-inline"
                                    onClick={handleStartEditingDescription}
                                    title="Click to edit"
                                >
                                    {currentGraphDescription}
                                </p>
                            )}
                        </div>
                    </div>

                    <GraphControls
                        isPlaying={isPlaying}
                        zoom={zoom}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onClearGraph={handleClearGraph}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onZoomToFit={handleZoomToFit}
                        onImportGraph={handleImportGraph}
                        onExportGraph={handleExportGraph}
                        onSaveCurrentGraph={handleSaveCurrentGraph}
                        onSaveAsGraph={handleSaveAsGraph}
                        onNewGraph={handleNewGraph}
                        currentGraphId={currentGraphId}
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