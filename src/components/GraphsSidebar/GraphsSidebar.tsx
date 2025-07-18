import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SavedGraph, GraphStorageService } from '../../services/graphStorageService';
import './GraphsSidebar.css';

interface GraphsSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onLoadGraph: (graph: SavedGraph) => void;
    onSaveCurrentGraph: () => void;
    onSaveAsGraph?: () => void;
    onNewGraph?: () => void;
    currentGraphId?: string;
    onUpdateGraphName?: (newName: string) => void;
    onUpdateGraphDescription?: (description: string | undefined) => void;
}

const GraphsSidebar: React.FC<GraphsSidebarProps> = ({
    isCollapsed,
    onToggle,
    onLoadGraph,
    onSaveCurrentGraph,
    onSaveAsGraph,
    onNewGraph,
    currentGraphId,
    onUpdateGraphName,
    onUpdateGraphDescription
}) => {
    const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Consolidated edit state for both name and description
    const [editingGraphId, setEditingGraphId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingDescription, setEditingDescription] = useState('');
    const [graphStorageService] = useState(() => new GraphStorageService());

    const nameEditRef = useRef<HTMLInputElement>(null);
    const descriptionEditRef = useRef<HTMLTextAreaElement>(null);

    const loadSavedGraphs = useCallback(async () => {
        try {
            setLoading(true);
            const graphs = searchQuery
                ? await graphStorageService.searchGraphs(searchQuery)
                : await graphStorageService.getAllGraphs();
            setSavedGraphs(graphs);
        } catch (error) {
            console.error('Failed to load saved graphs:', error);
        } finally {
            setLoading(false);
        }
    }, [graphStorageService, searchQuery]);

    useEffect(() => {
        loadSavedGraphs();
    }, [loadSavedGraphs]);

    // Listen for graph save events to refresh the list
    useEffect(() => {
        const handleGraphSaved = () => {
            loadSavedGraphs();
        };

        window.addEventListener('graphSaved', handleGraphSaved);
        return () => {
            window.removeEventListener('graphSaved', handleGraphSaved);
        };
    }, [loadSavedGraphs]);

    const handleDeleteGraph = useCallback(async (graphId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (window.confirm('Are you sure you want to delete this graph?')) {
            try {
                await graphStorageService.deleteGraph(graphId);
                await loadSavedGraphs();
            } catch (error) {
                console.error('Failed to delete graph:', error);
                alert('Failed to delete graph');
            }
        }
    }, [graphStorageService, loadSavedGraphs]);

    const handleStartEdit = useCallback((graph: SavedGraph, event: React.MouseEvent) => {
        event.stopPropagation();
        setEditingGraphId(graph.id);
        setEditingName(graph.name);
        setEditingDescription(graph.description || '');
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingGraphId || !editingName.trim()) {
            alert('Graph name cannot be empty');
            return;
        }

        try {
            // Update both name and description
            await graphStorageService.updateGraphName(editingGraphId, editingName.trim());
            await graphStorageService.updateGraphDescription(editingGraphId, editingDescription.trim());
            await loadSavedGraphs();

            // If this is the current graph, update the parent component
            if (editingGraphId === currentGraphId && onUpdateGraphName) {
                onUpdateGraphName(editingName.trim());
            }
            if (editingGraphId === currentGraphId && onUpdateGraphDescription) {
                onUpdateGraphDescription(editingDescription.trim() || undefined);
            }

            setEditingGraphId(null);
            setEditingName('');
            setEditingDescription('');
        } catch (error) {
            console.error('Failed to update graph:', error);
            alert('Failed to update graph');
        }
    }, [editingGraphId, editingName, editingDescription, graphStorageService, loadSavedGraphs, currentGraphId, onUpdateGraphName, onUpdateGraphDescription]);

    const handleCancelEdit = useCallback(() => {
        setEditingGraphId(null);
        setEditingName('');
        setEditingDescription('');
    }, []);

    const handleInputKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSaveEdit();
        } else if (event.key === 'Escape') {
            handleCancelEdit();
        }
    }, [handleSaveEdit, handleCancelEdit]);

    const handleTextareaKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleCancelEdit();
        }
        // Allow Enter key to create new lines in textarea
    }, [handleCancelEdit]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`graphs-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="graphs-sidebar-header">
                <button
                    className="graphs-sidebar-toggle"
                    onClick={onToggle}
                    title={isCollapsed ? 'Expand Graphs' : 'Collapse Graphs'}
                >
                    <span className="icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </span>
                    {!isCollapsed && <span>Saved Graphs</span>}
                </button>
            </div>

            {!isCollapsed && (
                <div className="graphs-sidebar-content">
                    <div className="graphs-actions">
                        <button
                            className="save-graph-btn"
                            onClick={onSaveCurrentGraph}
                            title={currentGraphId ? "Save Changes" : "Save Graph"}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                                <polyline points="7,3 7,8 15,8"></polyline>
                            </svg>
                            {currentGraphId ? 'Save' : 'Save'}
                        </button>
                        {onSaveAsGraph && (
                            <button
                                className="save-as-graph-btn"
                                onClick={onSaveAsGraph}
                                title="Save As New Graph"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                                    <polyline points="7,3 7,8 15,8"></polyline>
                                    <line x1="12" y1="9" x2="12" y2="15"></line>
                                    <line x1="9" y1="12" x2="15" y2="12"></line>
                                </svg>
                                Save As
                            </button>
                        )}
                        {onNewGraph && (
                            <button
                                className="new-graph-btn"
                                onClick={onNewGraph}
                                title="Create New Graph (saves current graph automatically)"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14,2 14,8 20,8"></polyline>
                                    <line x1="12" y1="18" x2="12" y2="12"></line>
                                    <line x1="9" y1="15" x2="15" y2="15"></line>
                                </svg>
                                New
                            </button>
                        )}
                        <button
                            className="refresh-graphs-btn"
                            onClick={loadSavedGraphs}
                            title="Refresh List"
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="23,4 23,10 17,10"></polyline>
                                <polyline points="1,20 1,14 7,14"></polyline>
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                            </svg>
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search graphs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="graphs-list">
                        {loading && <div className="loading">Loading graphs...</div>}

                        {!loading && savedGraphs.length === 0 && (
                            <div className="empty-state">
                                {searchQuery ? 'No graphs found' : 'No saved graphs yet'}
                            </div>
                        )}

                        {savedGraphs.map(graph => (
                            <div
                                key={graph.id}
                                className={`graph-item ${currentGraphId === graph.id ? 'active' : ''}`}
                                onClick={() => editingGraphId !== graph.id && onLoadGraph(graph)}
                            >
                                {editingGraphId === graph.id ? (
                                    <div className="graph-edit-form">
                                        <div className="graph-name-edit">
                                            <label>Name:</label>
                                            <input
                                                ref={nameEditRef}
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={handleInputKeyPress}
                                                className="graph-name-input"
                                                placeholder="Enter graph name"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="graph-description-edit">
                                            <label>Description:</label>
                                            <textarea
                                                ref={descriptionEditRef}
                                                value={editingDescription}
                                                onChange={(e) => setEditingDescription(e.target.value)}
                                                onKeyDown={handleTextareaKeyPress}
                                                className="description-textarea"
                                                placeholder="Enter description (optional)"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="edit-actions">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveEdit();
                                                }}
                                                className="save-edit-btn"
                                                title="Save Changes"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <polyline points="20,6 9,17 4,12"></polyline>
                                                </svg>
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelEdit();
                                                }}
                                                className="cancel-edit-btn"
                                                title="Cancel"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="graph-item-header">
                                            <h4
                                                className="graph-name"
                                                onDoubleClick={(e) => handleStartEdit(graph, e)}
                                                title="Double-click to edit"
                                            >
                                                {graph.name}
                                            </h4>
                                            <div className="graph-item-actions">
                                                <button
                                                    className="edit-graph-btn"
                                                    onClick={(e) => handleStartEdit(graph, e)}
                                                    title="Edit Graph"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="delete-graph-btn"
                                                    onClick={(e) => handleDeleteGraph(graph.id, e)}
                                                    title="Delete Graph"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <polyline points="3,6 5,6 21,6"></polyline>
                                                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <p
                                            className="graph-description"
                                            onDoubleClick={(e) => handleStartEdit(graph, e)}
                                            title="Double-click to edit"
                                        >
                                            {graph.description || <em style={{ opacity: 0.6 }}>Click to add description</em>}
                                        </p>

                                        <div className="graph-meta">
                                            <span className="node-count">{graph.metadata.nodeCount} nodes</span>
                                            <span className="updated-date">
                                                {formatDate(graph.metadata.updatedAt)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphsSidebar;
