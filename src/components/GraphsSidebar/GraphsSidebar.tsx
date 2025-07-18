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
                    <span className="icon">📊</span>
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
                        >
                            💾 Save Current
                        </button>
                        <button
                            className="refresh-graphs-btn"
                            onClick={loadSavedGraphs}
                            title="Refresh List"
                            disabled={loading}
                        >
                            🔄 {loading ? 'Loading...' : 'Refresh'}
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
                                                    ✓
                                                </button>
                                                <button
                                                    className="cancel-name-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelEditName();
                                                    }}
                                                    title="Cancel"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="edit-name-btn"
                                                    onClick={(e) => handleStartEditName(graph.id, graph.name, e)}
                                                    title="Edit Name"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-graph-btn"
                                                    onClick={(e) => handleDeleteGraph(graph.id, e)}
                                                    title="Delete Graph"
                                                >
                                                    🗑️
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
