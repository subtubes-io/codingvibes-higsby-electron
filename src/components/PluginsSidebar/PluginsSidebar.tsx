import React, { useState, useEffect } from 'react';
import { ExtensionManifest } from '../../types/extension';
import { extensionService } from '../../services/extensionService';
import './PluginsSidebar.css';

interface PluginsSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onAddToGraph: (plugin: ExtensionManifest) => void;
}

const PluginsSidebar: React.FC<PluginsSidebarProps> = ({
    isCollapsed,
    onToggle,
    onAddToGraph
}) => {
    const [plugins, setPlugins] = useState<ExtensionManifest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPlugins();
    }, []);

    const loadPlugins = async () => {
        try {
            setLoading(true);
            const pluginList = await extensionService.getExtensions();
            setPlugins(pluginList);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'enabled':
                return '✓';
            case 'installed':
                return '●';
            case 'disabled':
                return '○';
            case 'error':
                return '⚠';
            default:
                return '●';
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
                    onClick={onToggle}
                    title={isCollapsed ? 'Expand Plugins Panel' : 'Collapse Plugins Panel'}
                >
                    <span className="toggle-icon">
                        {isCollapsed ? '▶' : '◀'}
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
                        {plugins.length === 0 && !isCollapsed && (
                            <div className="no-plugins">
                                <span className="no-plugins-icon">📦</span>
                                <span>No plugins installed</span>
                            </div>
                        )}

                        {plugins.map((plugin) => {
                            const pluginId = getPluginId(plugin);
                            const pluginStatus = getPluginStatus(plugin);

                            return (
                                <div
                                    key={pluginId}
                                    className="plugin-item"
                                    onClick={() => onAddToGraph(plugin)}
                                    title={isCollapsed ? `${plugin.name} - ${pluginStatus}` : `Click to add ${plugin.name} to graph`}
                                >
                                    <div className="plugin-status-indicator">
                                        <span
                                            className="status-icon"
                                            style={{ color: getStatusColor(pluginStatus) }}
                                        >
                                            {getStatusIcon(pluginStatus)}
                                        </span>
                                    </div>

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
                                        </div>
                                    )}

                                    {isCollapsed && (
                                        <div className="plugin-tooltip">
                                            <div className="tooltip-content">
                                                <div className="tooltip-name">{plugin.name}</div>
                                                <div className="tooltip-version">v{plugin.version}</div>
                                                <div
                                                    className="tooltip-status"
                                                    style={{ color: getStatusColor(pluginStatus) }}
                                                >
                                                    {pluginStatus}
                                                </div>
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
                            {plugins.length} plugin{plugins.length !== 1 ? 's' : ''} installed
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default PluginsSidebar;
