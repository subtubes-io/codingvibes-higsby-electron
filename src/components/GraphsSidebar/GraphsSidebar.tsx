import React, { useState, useEffect, useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { SavedGraph, GraphStorageService } from '../../services/graphStorageService';
import { sidebarStore, sidebarActions } from '../../stores/sidebarStore';
import './GraphsSidebar.css';

interface GraphsSidebarProps {
    onLoadGraph: (graph: SavedGraph) => void;
    currentGraphId?: string;
}

const GraphsSidebar: React.FC<GraphsSidebarProps> = ({
    onLoadGraph,
    currentGraphId
}) => {
    const sidebars = useSnapshot(sidebarStore);
    const isCollapsed = !sidebars.graphs;
    const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
                    onClick={() => sidebarActions.toggleSidebar('graphs')}
                    title={isCollapsed ? 'Expand Graphs' : 'Collapse Graphs'}
                >
                    <span className="toggle-icon">
                        {isCollapsed ? '▶' : '◀'}
                    </span>
                </button>

                {!isCollapsed && (
                    <div className="graphs-header-content">
                        <h3 className="graphs-title">Saved Graphs</h3>
                        <button
                            className="refresh-button"
                            onClick={loadSavedGraphs}
                            title="Refresh graphs list"
                            disabled={loading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="23,4 23,10 17,10"></polyline>
                                <polyline points="1,20 1,14 7,14"></polyline>
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4L18.36 18.36A9 9 0 0 1 3.51 15"></path>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {!isCollapsed && (
                <div className="graphs-sidebar-content">
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
                                onClick={() => onLoadGraph(graph)}
                            >
                                <div className="graph-item-header">
                                    <h4 className="graph-name">
                                        {graph.name}
                                    </h4>
                                    <div className="graph-item-actions">
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

                                <p className="graph-description">
                                    {graph.description || <em style={{ opacity: 0.6 }}>No description</em>}
                                </p>

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
