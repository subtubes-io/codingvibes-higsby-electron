/**
 * ExtensionLoader Component
 * Manages dynamic loading and rendering of extension components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DynamicComponent } from './DynamicComponent';
import { ErrorBoundary } from './ErrorBoundary';
import { ExtensionService, ExtensionManifest } from '../../services/extensionService';
import './ExtensionLoader.css';

// Create service instance
const extensionService = new ExtensionService();

interface ExtensionLoaderProps {
    selectedExtensionId?: string;
    onExtensionChange?: (extension: ExtensionManifest | null) => void;
}

export const ExtensionLoader: React.FC<ExtensionLoaderProps> = ({
    selectedExtensionId,
    onExtensionChange
}) => {
    const [enabledExtensions, setEnabledExtensions] = useState<ExtensionManifest[]>([]);
    const [selectedExtension, setSelectedExtension] = useState<ExtensionManifest | null>(null);
    const [loading, setLoading] = useState(true);

    const loadEnabledExtensions = useCallback(async () => {
        try {
            setLoading(true);
            const allExtensions = await extensionService.getExtensions();
            const enabled = allExtensions.filter(ext => ext.status === 'enabled');
            setEnabledExtensions(enabled);

            // Auto-select extension if specified
            if (selectedExtensionId) {
                const extension = enabled.find((ext: ExtensionManifest) => ext.id === selectedExtensionId);
                setSelectedExtension(extension || null);
                onExtensionChange?.(extension || null);
            } else if (enabled.length > 0 && !selectedExtension) {
                // Auto-select first enabled extension
                setSelectedExtension(enabled[0]);
                onExtensionChange?.(enabled[0]);
            } else if (enabled.length === 0) {
                setSelectedExtension(null);
                onExtensionChange?.(null);
            }
        } catch (error) {
            console.error('Failed to load enabled extensions:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedExtensionId, selectedExtension, onExtensionChange]);

    useEffect(() => {
        loadEnabledExtensions();
    }, [loadEnabledExtensions]);

    const handleExtensionSelect = useCallback((extension: ExtensionManifest) => {
        setSelectedExtension(extension);
        onExtensionChange?.(extension);
    }, [onExtensionChange]);

    const handleRefresh = useCallback(() => {
        setLoading(true);
        loadEnabledExtensions();
    }, [loadEnabledExtensions]);

    if (loading) {
        return (
            <div className="extension-loader">
                <div className="extension-loader__loading">
                    <div className="loading-spinner" />
                    <p>Loading extensions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="extension-loader">
            <div className="extension-loader__header">
                <div className="extension-loader__title">
                    <h2>Extension Viewer</h2>
                    <p>View and interact with enabled extensions</p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={handleRefresh}
                    title="Refresh extensions"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                    </svg>
                    Refresh
                </button>
            </div>

            {enabledExtensions.length === 0 ? (
                <div className="extension-loader__empty">
                    <div className="empty-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" opacity="0.5" />
                            <path d="M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M11,17V15H13V17H11M11,13V7H13V13H11Z" />
                        </svg>
                    </div>
                    <h3>No enabled extensions</h3>
                    <p>Enable some extensions in the Extensions Manager to see them here</p>
                </div>
            ) : (
                <>
                    {/* Extension Selector */}
                    {enabledExtensions.length > 1 && (
                        <div className="extension-loader__selector">
                            <label htmlFor="extension-select">Select Extension:</label>
                            <select
                                id="extension-select"
                                value={selectedExtension?.id || ''}
                                onChange={(e) => {
                                    const extension = enabledExtensions.find(ext => ext.id === e.target.value);
                                    if (extension) {
                                        handleExtensionSelect(extension);
                                    }
                                }}
                                className="extension-select"
                            >
                                {enabledExtensions.map(extension => (
                                    <option key={extension.id} value={extension.id}>
                                        {extension.name} v{extension.version}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Extension Display Area */}
                    <div className="extension-loader__content">
                        {selectedExtension ? (
                            <ErrorBoundary
                                extensionId={selectedExtension.id}
                                extensionName={selectedExtension.name}
                            >
                                <DynamicComponent
                                    extension={selectedExtension}
                                    key={selectedExtension.id} // Force re-mount when extension changes
                                />
                            </ErrorBoundary>
                        ) : (
                            <div className="extension-loader__no-selection">
                                <p>Select an extension to view</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
