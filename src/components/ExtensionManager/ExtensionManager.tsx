/**
 * ExtensionManager Component
 * Main interface for managing installed extensions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ExtensionGrid } from './ExtensionGrid';
import { ExtensionService, ExtensionManifest } from '../../services/extensionService';
import './ExtensionManager.css';

// Create service instance
const extensionService = new ExtensionService();

interface ExtensionManagerProps {
    onExtensionToggle?: (extensionId: string, enabled: boolean) => void;
    onExtensionDelete?: (extensionId: string) => void;
}

export const ExtensionManager: React.FC<ExtensionManagerProps> = ({
    onExtensionToggle,
    onExtensionDelete
}) => {
    const [extensions, setExtensions] = useState<ExtensionManifest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

    const loadExtensions = useCallback(async () => {
        try {
            setLoading(true);
            const allExtensions = await extensionService.getExtensions();
            setExtensions(allExtensions);
        } catch (error) {
            console.error('Failed to load extensions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExtensions();
    }, [loadExtensions]);

    const handleToggleExtension = useCallback(async (extension: ExtensionManifest) => {
        try {
            const newStatus = extension.status === 'enabled' ? 'disabled' : 'enabled';
            const result = await extensionService.updateExtensionStatus(extension.id, newStatus);

            if (result.success) {
                // Update local state
                setExtensions(prev => prev.map(ext =>
                    ext.id === extension.id
                        ? { ...ext, status: newStatus, updatedAt: new Date().toISOString() }
                        : ext
                ));

                onExtensionToggle?.(extension.id, newStatus === 'enabled');
            } else {
                console.error('Failed to toggle extension:', result.error);
                alert(`Failed to ${newStatus === 'enabled' ? 'enable' : 'disable'} extension: ${result.error}`);
            }
        } catch (error) {
            console.error('Error toggling extension:', error);
            alert('An error occurred while toggling the extension');
        }
    }, [onExtensionToggle]);

    const handleDeleteExtension = useCallback(async (extension: ExtensionManifest) => {
        if (!confirm(`Are you sure you want to delete "${extension.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await extensionService.deleteExtension(extension.id);

            if (result.success) {
                // Remove from local state
                setExtensions(prev => prev.filter(ext => ext.id !== extension.id));
                onExtensionDelete?.(extension.id);
            } else {
                console.error('Failed to delete extension:', result.error);
                alert(`Failed to delete extension: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting extension:', error);
            alert('An error occurred while deleting the extension');
        }
    }, [onExtensionDelete]);

    const getFilteredExtensions = () => {
        switch (filter) {
            case 'enabled':
                return extensions.filter(ext => ext.status === 'enabled');
            case 'disabled':
                return extensions.filter(ext => ext.status === 'disabled');
            default:
                return extensions;
        }
    };

    const getStats = () => {
        const total = extensions.length;
        const enabled = extensions.filter(ext => ext.status === 'enabled').length;
        const disabled = extensions.filter(ext => ext.status === 'disabled').length;
        const errors = extensions.filter(ext => ext.status === 'error').length;

        return { total, enabled, disabled, errors };
    };

    const stats = getStats();
    const filteredExtensions = getFilteredExtensions();

    if (loading) {
        return (
            <div className="extension-manager">
                <div className="extension-manager__loading">
                    <div className="loading-spinner" />
                    <p>Loading extensions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="extension-manager">
            <div className="extension-manager__header">
                <div className="extension-manager__title">
                    <h2>Installed Extensions</h2>
                    <p>Manage your installed React component extensions</p>
                </div>

                <div className="extension-manager__stats">
                    <div className="stats-card">
                        <span className="stats-number">{stats.total}</span>
                        <span className="stats-label">Total</span>
                    </div>
                    <div className="stats-card">
                        <span className="stats-number">{stats.enabled}</span>
                        <span className="stats-label">Enabled</span>
                    </div>
                    <div className="stats-card">
                        <span className="stats-number">{stats.errors}</span>
                        <span className="stats-label">Errors</span>
                    </div>
                </div>
            </div>

            <div className="extension-manager__controls">
                <div className="extension-manager__filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({extensions.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'enabled' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('enabled')}
                    >
                        Enabled ({stats.enabled})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'disabled' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('disabled')}
                    >
                        Disabled ({stats.disabled})
                    </button>
                </div>

                <button
                    className="refresh-btn"
                    onClick={loadExtensions}
                    title="Refresh extensions list"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="extension-manager__content">
                {filteredExtensions.length === 0 ? (
                    <div className="extension-manager__empty">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                            </svg>
                        </div>
                        <h3>No extensions found</h3>
                        <p>
                            {filter === 'all'
                                ? 'Upload your first extension to get started'
                                : `No ${filter} extensions found`
                            }
                        </p>
                    </div>
                ) : (
                    <ExtensionGrid
                        extensions={filteredExtensions}
                        onToggle={handleToggleExtension}
                        onDelete={handleDeleteExtension}
                    />
                )}
            </div>
        </div>
    );
};
