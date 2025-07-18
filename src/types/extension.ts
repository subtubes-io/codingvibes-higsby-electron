/**
 * Extension System Types
 * Defines the interfaces and types for the dynamic extension system
 */

export interface ExtensionManifest {
    /** Unique name of the extension */
    name: string;
    /** Component name used for folder and loading */
    componentName: string;
    /** Semantic version of the extension */
    version: string;
    /** Short description of what the extension does */
    description: string;
    /** Extension author information */
    author: string;
    /** Main entry point file (relative to extension root) */
    main: string;
    /** Required dependencies (optional) */
    dependencies?: string[];
    /** Required permissions (optional) */
    permissions?: string[];
    /** Minimum app version required */
    minAppVersion?: string;
    /** Extension icon path (optional) */
    icon?: string;
    /** Extension tags/categories */
    tags?: string[];
}

export interface Extension {
    /** Unique identifier for the extension */
    id: string;
    /** Extension manifest data */
    manifest: ExtensionManifest;
    /** Whether the extension is currently enabled */
    isEnabled: boolean;
    /** Whether the extension component is loaded */
    isLoaded: boolean;
    /** File system path to the extension */
    path: string;
    /** Loaded React component (if loaded) */
    component?: React.ComponentType<any>;
    /** Installation timestamp */
    installedAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Extension status */
    status: ExtensionStatus;
    /** Error message if status is error */
    errorMessage?: string;
}

export enum ExtensionStatus {
    INSTALLED = 'installed',
    ENABLED = 'enabled',
    DISABLED = 'disabled',
    ERROR = 'error',
    LOADING = 'loading'
}

export interface ExtensionUploadResult {
    success: boolean;
    extension?: Extension;
    extensionId?: string;
    message?: string;
    error?: string;
}

export interface ExtensionRegistry {
    [extensionId: string]: Extension;
}

export interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'uploading' | 'extracting' | 'validating' | 'installing' | 'complete' | 'error';
    error?: string;
}
