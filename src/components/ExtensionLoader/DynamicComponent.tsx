/**
 * DynamicComponent Component
 * Dynamically loads and renders extension components via HTTP
 */

import React, { useState, useEffect, Suspense } from 'react';
import { ExtensionService, ExtensionManifest } from '../../services/extensionService';
import { ErrorBoundary } from './ErrorBoundary';

// Create service instance
const extensionService = new ExtensionService();

interface DynamicComponentProps {
    extension: ExtensionManifest;
}

export const DynamicComponent: React.FC<DynamicComponentProps> = ({ extension }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadComponent();
    }, [extension.id]);

    const loadComponent = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load the component via HTTP from our extension server
            const LoadedComponent = await extensionService.loadExtensionComponent(extension.id);

            if (LoadedComponent) {
                setComponent(() => LoadedComponent);
            } else {
                setError('Component not found or failed to load');
            }
        } catch (err) {
            console.error(`Failed to load extension ${extension.id}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to load component');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dynamic-component-loading">
                <div className="spinner"></div>
                <span>Loading {extension.name}...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dynamic-component-error">
                <h3>Failed to Load Extension</h3>
                <p>{error}</p>
                <button onClick={loadComponent} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    if (!Component) {
        return (
            <div className="dynamic-component-empty">
                <h3>No Component Found</h3>
                <p>The extension "{extension.name}" doesn't have a valid component.</p>
            </div>
        );
    }

    return (
        <ErrorBoundary extensionId={extension.id} extensionName={extension.name}>
            <Suspense fallback={<div className="spinner">Loading component...</div>}>
                <Component />
            </Suspense>
        </ErrorBoundary>
    );
};
