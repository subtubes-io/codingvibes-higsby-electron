import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { ExtensionManifest } from '../../types/extension';
import { extensionService } from '../../services/extensionService';
import { sidebarStore, sidebarActions } from '../../stores/sidebarStore';
import './PluginsSidebar.css';

interface PluginsSidebarProps {
    onAddToGraph: (plugin: ExtensionManifest) => void;
}

const PluginsSidebar: React.FC<PluginsSidebarProps> = ({
    onAddToGraph
}) => {
    const sidebars = useSnapshot(sidebarStore);
    const isCollapsed = !sidebars.plugins;
    const [plugins, setPlugins] = useState<ExtensionManifest[]>([]);
    const [filteredPlugins, setFilteredPlugins] = useState<ExtensionManifest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPlugins();
    }, []);

    // Filter plugins based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPlugins(plugins);
        } else {
            const filtered = plugins.filter(plugin =>
                plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plugin.description && plugin.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredPlugins(filtered);
        }
    }, [plugins, searchQuery]);

    const loadPlugins = async () => {
        try {
            setLoading(true);
            const pluginList = await extensionService.getExtensions();
            setPlugins(pluginList);
            setFilteredPlugins(pluginList);
            setError(null);
        } catch (err) {
            setError('Failed to load plugins');
            console.error('Error loading plugins:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'enabled':
                return '#4ade80'; // green-400
            case 'installed':
                return '#60a5fa'; // blue-400  
            case 'disabled':
                return '#94a3b8'; // slate-400
            case 'error':
                return '#f87171'; // red-400
            default:
                return '#94a3b8';
        }
    };

    // Mock status for now since the service doesn't return it yet
    const getPluginStatus = (plugin: ExtensionManifest) => {
        return (plugin as any).status || 'installed';
    };

    const getPluginId = (plugin: ExtensionManifest) => {
        return (plugin as any).id || plugin.name.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <div className={`plugins-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="plugins-sidebar-header">
                <button
                    className="plugins-toggle-button"
                    onClick={() => sidebarActions.toggleSidebar('plugins')}
                    title={isCollapsed ? 'Expand Plugins Panel' : 'Collapse Plugins Panel'}
                >
                    <span className="toggle-icon">
                        {isCollapsed ? '◀' : '▶'}
                    </span>
                </button>

                {!isCollapsed && (
                    <div className="plugins-header-content">
                        <h3 className="plugins-title">Plugins</h3>
                        <button
                            className="refresh-button"
                            onClick={loadPlugins}
                            title="Refresh plugins list"
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

            <div className="plugins-content">
                {!isCollapsed && (
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search plugins..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                )}

                {loading && !isCollapsed && (
                    <div className="plugins-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading plugins...</span>
                    </div>
                )}

                {error && !isCollapsed && (
                    <div className="plugins-error">
                        <span className="error-icon">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="plugins-list">
                        {filteredPlugins.length === 0 && !isCollapsed && (
                            <div className="no-plugins">
                                <span className="no-plugins-icon">📦</span>
                                <span>{searchQuery ? 'No plugins found' : 'No plugins installed'}</span>
                            </div>
                        )}

                        {filteredPlugins.map((plugin) => {
                            const pluginId = getPluginId(plugin);
                            const pluginStatus = getPluginStatus(plugin);

                            return (
                                <div
                                    key={pluginId}
                                    className="plugin-item"
                                    title={isCollapsed ? `${plugin.name}` : undefined}
                                >
                                    {isCollapsed && (
                                        <div className="plugin-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="9" cy="9" r="2"></circle>
                                                <path d="M21 15.5c-.62-.33-1.3-.5-2-.5s-1.38.17-2 .5"></path>
                                                <path d="M3 15.5c.62-.33 1.3-.5 2-.5s1.38.17 2 .5"></path>
                                            </svg>
                                        </div>
                                    )}

                                    {!isCollapsed && (
                                        <div className="plugin-info">
                                            <div className="plugin-name">{plugin.name}</div>
                                            <div className="plugin-meta">
                                                <span className="plugin-version">v{plugin.version}</span>
                                                <span
                                                    className="plugin-status"
                                                    style={{ color: getStatusColor(pluginStatus) }}
                                                >
                                                    {pluginStatus}
                                                </span>
                                            </div>
                                            {plugin.description && (
                                                <div className="plugin-description">
                                                    {plugin.description}
                                                </div>
                                            )}
                                            <div className="plugin-actions">
                                                <button
                                                    className="add-plugin-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddToGraph(plugin);
                                                    }}
                                                    title={`Add ${plugin.name} to graph`}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    </svg>
                                                    <span>Add</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isCollapsed && (
                    <div className="plugins-footer">
                        <div className="plugins-count">
                            {searchQuery
                                ? `${filteredPlugins.length} of ${plugins.length} plugin${plugins.length !== 1 ? 's' : ''}`
                                : `${plugins.length} plugin${plugins.length !== 1 ? 's' : ''} installed`
                            }
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default PluginsSidebar;
