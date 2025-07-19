/**
 * Extension Service - HTTP Client
 * Manages extensions through HTTP API calls to the backend server
 */

import React from 'react';
import { ExtensionUploadResult, PortDefinition } from '../types/extension';

export interface ExtensionManifest {
    id: string;
    name: string;
    componentName: string;
    description: string;
    author: string;
    version: string;
    main: string;
    url: string;
    file: string;
    tags?: string[];
    minAppVersion?: string;
    icon?: string;
    installedAt: string;
    updatedAt: string;
    status: 'installed' | 'enabled' | 'disabled' | 'error';
    errorMessage?: string;
    /** Port configuration for the extension */
    ports?: {
        inputs?: PortDefinition[];
        outputs?: PortDefinition[];
    };
}

export class ExtensionService {
    private baseUrl: string;
    private cache: Map<string, ExtensionManifest> = new Map();
    private loadedComponents: Map<string, React.ComponentType<any>> = new Map();
    private extensionFunctions: Map<string, any> = new Map(); // Store static functions

    constructor(baseUrl: string = 'http://localhost:8888') {
        this.baseUrl = baseUrl;
    }

    /**
     * Get list of all available extensions
     */
    async getExtensions(): Promise<ExtensionManifest[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/extensions`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                // Update cache
                data.extensions.forEach((ext: ExtensionManifest) => {
                    this.cache.set(ext.id, ext);
                });
                return data.extensions;
            } else {
                throw new Error(data.error || 'Failed to fetch extensions');
            }
        } catch (error) {
            console.error('Failed to fetch extensions:', error);
            return [];
        }
    }

    /**
     * Upload a new extension from a ZIP file
     */
    async uploadExtension(file: File): Promise<ExtensionUploadResult> {
        try {
            const formData = new FormData();
            formData.append('extension', file);

            const response = await fetch(`${this.baseUrl}/api/extensions/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                // Clear cache to force refresh
                this.cache.clear();
                return {
                    success: true,
                    extensionId: data.extensionId,
                    message: data.message
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Upload failed'
                };
            }
        } catch (error) {
            console.error('Failed to upload extension:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown upload error'
            };
        }
    }

    /**
     * Get extension metadata by ID
     */
    async getExtensionMetadata(extensionId: string): Promise<ExtensionManifest | null> {
        try {
            // Check cache first
            if (this.cache.has(extensionId)) {
                return this.cache.get(extensionId)!;
            }

            const response = await fetch(`${this.baseUrl}/api/extensions/${extensionId}/metadata`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                this.cache.set(extensionId, data.extension);
                return data.extension;
            } else {
                throw new Error(data.error || 'Failed to fetch extension metadata');
            }
        } catch (error) {
            console.error(`Failed to get extension metadata for ${extensionId}:`, error);
            return null;
        }
    }

    /**
     * Load a React component from an extension
     */
    async loadExtensionComponent(extensionId: string): Promise<React.ComponentType<any> | null> {
        try {
            console.log('----> all the loaded extension components', this.loadedComponents.values());
            // Check if already loaded
            if (this.loadedComponents.has(extensionId)) {
                return this.loadedComponents.get(extensionId)!;
            }

            // Get extension metadata
            const metadata = await this.getExtensionMetadata(extensionId);
            if (!metadata || metadata.status === 'error' || metadata.status === 'disabled') {
                return null;
            }

            // For module federation extensions, load as ES modules
            const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
            let extensionPath: string;

            if (isElectron) {
                // Use the extension:// protocol for Electron
                extensionPath = `extension://${extensionId}/index.js`;
            } else {
                // For web development, use relative path
                extensionPath = `/extensions/${extensionId}/index.js`;
            }

            // Make React available globally for the extension
            if (typeof window !== 'undefined') {
                const ReactModule = await import('react');
                const ReactDOMModule = await import('react-dom');
                (window as any).React = ReactModule.default;
                (window as any).ReactDOM = ReactDOMModule;
            }

            // Load the federation module
            const federationModule = await import(/* @vite-ignore */ extensionPath);

            // Get the Component from the federation module
            if (federationModule.get && typeof federationModule.get === 'function') {
                try {
                    const componentFactory = await federationModule.get('./Component');
                    const Component = await componentFactory();

                    // Extract static nodeFunction if it exists
                    if (Component.nodeFunction && typeof Component.nodeFunction === 'function') {
                        this.extensionFunctions.set(extensionId, Component.nodeFunction);
                        console.log(`Registered nodeFunction for extension: ${extensionId}`);

                        // Call the nodeFunction to get extension info and register it
                        try {
                            const extensionInfo = Component.nodeFunction();
                            console.log(`Extension ${extensionId} info:`, extensionInfo);

                            // If the extension has an initialize function, call it
                            if (extensionInfo?.initialize && typeof extensionInfo.initialize === 'function') {
                                extensionInfo.initialize();
                            }
                        } catch (error) {
                            console.error(`Error calling nodeFunction for ${extensionId}:`, error);
                        }
                    }

                    this.loadedComponents.set(extensionId, Component);
                    return Component;
                } catch (error) {
                    console.error(`Failed to get component from federation module ${extensionId}:`, error);
                    return null;
                }
            } else {
                throw new Error('Extension module does not export federation get function');
            }
        } catch (error) {
            console.error(`Failed to load extension component ${extensionId}:`, error);
            return null;
        }
    }

    /**
     * Update extension status (enable/disable)
     */
    async updateExtensionStatus(extensionId: string, status: 'enabled' | 'disabled'): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/extensions/${extensionId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                // Update cache
                const cached = this.cache.get(extensionId);
                if (cached) {
                    cached.status = status;
                    cached.updatedAt = new Date().toISOString();
                }

                // Remove from loaded components if disabled
                if (status === 'disabled') {
                    this.loadedComponents.delete(extensionId);
                }

                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.error || 'Status update failed'
                };
            }
        } catch (error) {
            console.error(`Failed to update extension status for ${extensionId}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown status update error'
            };
        }
    }

    /**
     * Delete an extension
     */
    async deleteExtension(extensionId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/extensions/${extensionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                // Clean up cache and loaded components
                this.cache.delete(extensionId);
                this.loadedComponents.delete(extensionId);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.error || 'Deletion failed'
                };
            }
        } catch (error) {
            console.error(`Failed to delete extension ${extensionId}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown deletion error'
            };
        }
    }

    /**
     * Get the static nodeFunction for a specific extension
     */
    getExtensionFunction(extensionId: string): any | null {
        return this.extensionFunctions.get(extensionId) || null;
    }

    /**
     * Get all registered extension functions as an object
     */
    getAllExtensionFunctions(): Record<string, any> {
        const functions: Record<string, any> = {};
        this.extensionFunctions.forEach((func, extensionId) => {
            functions[extensionId] = func;
        });
        return functions;
    }

    /**
     * Call a specific extension's nodeFunction and return its result
     */
    callExtensionFunction(extensionId: string): any | null {
        const func = this.extensionFunctions.get(extensionId);
        if (func && typeof func === 'function') {
            try {
                return func();
            } catch (error) {
                console.error(`Error calling nodeFunction for ${extensionId}:`, error);
                return null;
            }
        }
        return null;
    }

    /**
     * Get extension capabilities and metadata from all loaded extensions
     */
    getExtensionCapabilities(): Record<string, any> {
        const capabilities: Record<string, any> = {};
        this.extensionFunctions.forEach((func, extensionId) => {
            try {
                const info = func();
                capabilities[extensionId] = {
                    name: info?.name || extensionId,
                    version: info?.version || 'unknown',
                    capabilities: info?.capabilities || [],
                    ...info
                };
            } catch (error) {
                console.error(`Error getting capabilities for ${extensionId}:`, error);
                capabilities[extensionId] = {
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
        return capabilities;
    }

    /**
     * Clear all cached data
     */
    clearCache(): void {
        this.cache.clear();
        this.loadedComponents.clear();
    }

    /**
     * Check if an extension is loaded
     */
    isExtensionLoaded(extensionId: string): boolean {
        return this.loadedComponents.has(extensionId);
    }
}

// Create a singleton instance for convenience
export const extensionService = new ExtensionService();
