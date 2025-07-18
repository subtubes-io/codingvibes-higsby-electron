import React, { useState, useEffect, useCallback } from 'react';
import { GraphStorageService, SavedGraph } from '../../services/graphStorageService';
import './GraphsSidebar.css';

interface GraphsSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onLoadGraph: (graph: SavedGraph) => void;
    onSaveCurrentGraph: () => Promise<void>;
    currentGraphId?: string;
    currentGraphName?: string;
    onUpdateGraphName?: (name: string) => void;
}

const GraphsSidebar: React.FC<GraphsSidebarProps> = ({
    isCollapsed,
    onToggle,
    onLoadGraph,
    onSaveCurrentGraph,
    currentGraphId,
    currentGraphName,
    onUpdateGraphName
}) => {
    const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [graphStorageService] = useState(() => new GraphStorageService());

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

    const handleStartEditName = useCallback((graphId: string, currentName: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setEditingNameId(graphId);
        setEditingName(currentName);
    }, []);

    const handleSaveEditName = useCallback(async (graphId: string) => {
        if (!editingName.trim()) {
            alert('Graph name cannot be empty');
            return;
        }

        try {
            await graphStorageService.updateGraphName(graphId, editingName.trim());
            await loadSavedGraphs();

            // If this is the current graph, update the parent component
            if (graphId === currentGraphId && onUpdateGraphName) {
                onUpdateGraphName(editingName.trim());
            }

            setEditingNameId(null);
            setEditingName('');
        } catch (error) {
            console.error('Failed to update graph name:', error);
            alert('Failed to update graph name');
        }
    }, [editingName, graphStorageService, loadSavedGraphs, currentGraphId, onUpdateGraphName]);

    const handleCancelEditName = useCallback(() => {
        setEditingNameId(null);
        setEditingName('');
    }, []);

    const handleKeyPress = useCallback((event: React.KeyboardEvent, graphId: string) => {
        if (event.key === 'Enter') {
            handleSaveEditName(graphId);
        } else if (event.key === 'Escape') {
            handleCancelEditName();
        }
    }, [handleSaveEditName, handleCancelEditName]);

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
                            title="Save Current Graph"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                                <polyline points="7,3 7,8 15,8"></polyline>
                            </svg>
                            Save Current
                        </button>
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
                                onClick={() => editingNameId !== graph.id && onLoadGraph(graph)}
                            >
                                <div className="graph-item-header">
                                    {editingNameId === graph.id ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => handleKeyPress(e, graph.id)}
                                            onBlur={() => handleSaveEditName(graph.id)}
                                            className="graph-name-input"
                                            autoFocus
                                        />
                                    ) : (
                                        <h4
                                            className="graph-name"
                                            onDoubleClick={(e) => handleStartEditName(graph.id, graph.name, e)}
                                            title="Double-click to edit"
                                        >
                                            {graph.name}
                                        </h4>
                                    )}

                                    <div className="graph-item-actions">
                                        {editingNameId === graph.id ? (
                                            <>
                                                <button
                                                    className="save-name-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSaveEditName(graph.id);
                                                    }}
                                                    title="Save Name"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <polyline points="20,6 9,17 4,12"></polyline>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="cancel-name-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelEditName();
                                                    }}
                                                    title="Cancel"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="edit-name-btn"
                                                    onClick={(e) => handleStartEditName(graph.id, graph.name, e)}
                                                    title="Edit Name"
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                {graph.description && (
                                    <p className="graph-description">{graph.description}</p>
                                )}

                                <div className="graph-meta">
                                    <span className="node-count">{graph.metadata.nodeCount} nodes</span>
                                    <span className="updated-date">
                                        {formatDate(graph.metadata.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphsSidebar;
