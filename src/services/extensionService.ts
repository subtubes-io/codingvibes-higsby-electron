/**
 * Extension Service - HTTP Client
 * Manages extensions through HTTP API calls to the backend server
 */

import React from 'react';
import { ExtensionUploadResult } from '../types/extension';

export interface ExtensionManifest {
    id: string;
    name: string;
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
}

export class ExtensionService {
    private baseUrl: string;
    private cache: Map<string, ExtensionManifest> = new Map();
    private loadedComponents: Map<string, React.ComponentType<any>> = new Map();

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
            // Check if already loaded
            if (this.loadedComponents.has(extensionId)) {
                return this.loadedComponents.get(extensionId)!;
            }

            // Get extension metadata
            const metadata = await this.getExtensionMetadata(extensionId);
            if (!metadata || metadata.status === 'error' || metadata.status === 'disabled') {
                return null;
            }

            // Dynamically import the extension component
            const response = await fetch(`${this.baseUrl}/api/extensions/${extensionId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.status}`);
            }

            const extensionCode = await response.text();

            // Make sure React is available globally for UMD modules
            const ReactModule = React;
            const ReactDOMModule = await import('react-dom');

            if (typeof window !== 'undefined') {
                (window as any).react = ReactModule;
                (window as any).React = ReactModule;
                (window as any)['react-dom'] = ReactDOMModule;
                (window as any).ReactDOM = ReactDOMModule;
            }

            // Execute the UMD extension code directly in the global context
            // This ensures that the UMD wrapper can access the global dependencies
            const script = document.createElement('script');
            script.textContent = extensionCode;
            document.head.appendChild(script);

            // The UMD code should have set a global variable, let's try to get it
            const globalName = 'HelloWorldExtension'; // This should match the library name in webpack config
            const Component = (window as any)[globalName];

            // Clean up the script
            document.head.removeChild(script);

            if (Component) {
                this.loadedComponents.set(extensionId, Component);
                return Component;
            } else {
                throw new Error('Extension UMD module did not export the expected global variable');
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
