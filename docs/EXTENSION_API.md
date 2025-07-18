# Extension API Documentation

> Technical API reference for Higsby extension system

## Table of Contents
- [Core APIs](#core-apis)
- [Extension Interface](#extension-interface)
- [Host Application APIs](#host-application-apis)
- [Build Configuration](#build-configuration)
- [Federation Protocol](#federation-protocol)
- [Error Handling](#error-handling)

---

## Core APIs

### Extension Component Interface

```typescript
interface ExtensionComponent {
  (props: ExtensionProps): React.ReactElement;
}

interface ExtensionProps {
  // Node identification
  nodeId: string;
  nodeData: NodeData;
  
  // Interaction callbacks
  onUpdate?: (data: Partial<NodeData>) => void;
  onError?: (error: Error) => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
  
  // Application context
  theme: 'light' | 'dark';
  readonly?: boolean;
  scale?: number;
  
  // Extension-specific props (passed from node configuration)
  [key: string]: any;
}

interface NodeData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  extensionName?: string;
  extensionProps?: Record<string, any>;
  metadata?: Record<string, any>;
}
```

### Extension Manifest Schema

```typescript
interface ExtensionManifest {
  // Required fields
  name: string;                           // Human-readable name
  componentName: string;                  // Unique identifier (used for federation)
  version: string;                        // Semantic version (e.g., "1.0.0")
  
  // Optional metadata
  description?: string;                   // Brief description
  author?: string;                        // Author name or organization
  homepage?: string;                      // Project URL
  repository?: string;                    // Source repository URL
  license?: string;                       // License identifier (e.g., "MIT")
  keywords?: string[];                    // Search keywords
  
  // Dependencies
  dependencies?: Record<string, string>;     // External npm dependencies
  peerDependencies?: Record<string, string>; // Required peer dependencies
  
  // Extension configuration
  category?: string;                      // Extension category for organization
  icon?: string;                          // Base64 encoded icon or URL
  screenshots?: string[];                 // Screenshot URLs or base64 images
  
  // Technical metadata
  minHostVersion?: string;                // Minimum required host version
  maxHostVersion?: string;                // Maximum supported host version
  features?: string[];                    // List of features this extension provides
  
  // Runtime configuration
  defaultProps?: Record<string, any>;     // Default props for the component
  configSchema?: JSONSchema;              // Schema for extension configuration
}

interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}
```

---

## Extension Interface

### Lifecycle Hooks

Extensions can implement these optional lifecycle methods:

```typescript
interface ExtensionLifecycle {
  onMount?: () => void | Promise<void>;
  onUnmount?: () => void | Promise<void>;
  onPropsChange?: (prevProps: ExtensionProps, newProps: ExtensionProps) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
}

// Implementation example
const MyExtension = (props: ExtensionProps) => {
  const React = (window as any).React;
  const { useEffect, useState } = React;

  useEffect(() => {
    // onMount logic
    console.log('Extension mounted');
    
    return () => {
      // onUnmount logic
      console.log('Extension unmounting');
    };
  }, []);

  useEffect(() => {
    // onPropsChange logic
    console.log('Props changed:', props);
  }, [props]);

  return <div>Extension content</div>;
};
```

### Data Persistence

Extensions can persist data through the host application:

```typescript
interface ExtensionStorage {
  // Save data to node
  saveToNode: (data: any) => void;
  
  // Get data from node
  getFromNode: () => any;
  
  // Save data globally (across all nodes of this extension type)
  saveGlobal: (key: string, data: any) => Promise<void>;
  
  // Get global data
  getGlobal: (key: string) => Promise<any>;
}

// Usage in extension
const MyExtension = ({ onUpdate, nodeData }: ExtensionProps) => {
  const [localData, setLocalData] = useState(nodeData.extensionProps?.savedData || {});

  const saveData = (newData: any) => {
    setLocalData(newData);
    onUpdate?.({
      extensionProps: {
        ...nodeData.extensionProps,
        savedData: newData
      }
    });
  };

  return (
    <div>
      <button onClick={() => saveData({ timestamp: Date.now() })}>
        Save Data
      </button>
    </div>
  );
};
```

### Inter-Extension Communication

Extensions can communicate through the host application:

```typescript
interface ExtensionMessaging {
  // Send message to another extension
  sendMessage: (targetExtension: string, message: any) => void;
  
  // Subscribe to messages
  onMessage: (callback: (message: any, sender: string) => void) => () => void;
  
  // Broadcast to all extensions
  broadcast: (message: any) => void;
}

// Usage example
const MyExtension = (props: ExtensionProps) => {
  const React = (window as any).React;
  const { useEffect } = React;

  useEffect(() => {
    // Listen for messages from other extensions
    const unsubscribe = props.onMessage?.((message, sender) => {
      console.log(`Received message from ${sender}:`, message);
    });

    return unsubscribe;
  }, []);

  const sendDataToOtherExtension = () => {
    props.sendMessage?.('OtherExtension', {
      type: 'DATA_UPDATE',
      payload: { value: 42 }
    });
  };

  return (
    <button onClick={sendDataToOtherExtension}>
      Send Message
    </button>
  );
};
```

---

## Host Application APIs

### Extension Manager

```typescript
interface ExtensionManager {
  // Extension lifecycle
  loadExtension(zipBuffer: Buffer): Promise<ExtensionManifest>;
  unloadExtension(componentName: string): Promise<void>;
  reloadExtension(componentName: string): Promise<void>;
  
  // Extension discovery
  getExtensions(): ExtensionManifest[];
  getExtension(componentName: string): ExtensionManifest | null;
  searchExtensions(query: string): ExtensionManifest[];
  
  // Component access
  getComponent(componentName: string): Promise<React.ComponentType<ExtensionProps>>;
  preloadComponent(componentName: string): Promise<void>;
  
  // Extension validation
  validateExtension(zipBuffer: Buffer): Promise<ValidationResult>;
  getExtensionHealth(componentName: string): ExtensionHealth;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: ExtensionManifest;
}

interface ExtensionHealth {
  status: 'healthy' | 'warning' | 'error';
  lastLoaded: Date;
  loadTime: number;
  errorCount: number;
  memoryUsage?: number;
}
```

### Graph Integration

```typescript
interface GraphNodeAPI {
  // Node management
  createNode(type: string, position: { x: number; y: number }): string;
  updateNode(nodeId: string, updates: Partial<NodeData>): void;
  deleteNode(nodeId: string): void;
  
  // Extension assignment
  assignExtension(nodeId: string, extensionName: string, props?: any): void;
  unassignExtension(nodeId: string): void;
  
  // Node queries
  getNode(nodeId: string): NodeData | null;
  getNodes(): NodeData[];
  getNodesByExtension(extensionName: string): NodeData[];
  
  // Events
  onNodeCreated(callback: (node: NodeData) => void): () => void;
  onNodeUpdated(callback: (node: NodeData, changes: Partial<NodeData>) => void): () => void;
  onNodeDeleted(callback: (nodeId: string) => void): () => void;
}
```

### Theme System

```typescript
interface ThemeAPI {
  // Current theme
  getCurrentTheme(): 'light' | 'dark';
  
  // Theme switching
  setTheme(theme: 'light' | 'dark'): void;
  toggleTheme(): void;
  
  // Theme variables
  getThemeVariables(): Record<string, string>;
  getCSSCustomProperties(): Record<string, string>;
  
  // Events
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
}
```

---

## Build Configuration

### Vite Configuration Template

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'YourExtensionName',
      filename: 'index.js',
      exposes: {
        './Component': './src/index.tsx'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0',
          strictVersion: false
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
          strictVersion: false
        }
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "package": "node scripts/build-and-package.js",
    "zip": "node scripts/bundle.js",
    "clean": "rm -rf dist *.zip",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## Federation Protocol

### Loading Sequence

1. **Global React Setup**
   ```javascript
   window.React = React;
   window.ReactDOM = ReactDOM;
   ```

2. **Container Loading**
   ```javascript
   const containerUrl = `extension://${componentName}/index.js`;
   await import(containerUrl);
   ```

3. **Container Initialization**
   ```javascript
   const container = window[federationName];
   await container.init({});
   ```

4. **Component Retrieval**
   ```javascript
   const factory = await container.get('./Component');
   const Component = factory();
   return Component.default || Component;
   ```

### Federation File Structure

Generated federation files:

```
dist/
├── index.js                                    # Main federation entry
├── __federation_expose_Component-[hash].js     # Exposed component
├── __federation_fn_import-[hash].js           # Import functionality
├── __federation_shared_react-[hash].js        # React sharing logic
├── __federation_shared_react-dom-[hash].js    # ReactDOM sharing logic
└── preload-helper-[hash].js                   # Preload helper
```

### Extension Protocol Handler

```typescript
// electron/main.ts
import { protocol } from 'electron';
import path from 'path';
import fs from 'fs';

const setupExtensionProtocol = (extensionsDir: string) => {
  protocol.registerFileProtocol('extension', (request, callback) => {
    try {
      const url = request.url.substr(12); // Remove 'extension://'
      const filePath = path.join(extensionsDir, url);
      
      if (fs.existsSync(filePath)) {
        callback({ path: filePath });
      } else {
        callback({ error: -6 }); // FILE_NOT_FOUND
      }
    } catch (error) {
      console.error('Extension protocol error:', error);
      callback({ error: -2 }); // FAILED
    }
  });
};
```

---

## Error Handling

### Extension Error Boundaries

```typescript
interface ExtensionErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
  render(): React.ReactNode;
}

class ExtensionErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Extension error:', error, errorInfo);
    
    // Report error to host application
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-semibold">Extension Error</h3>
          <p className="text-red-600 text-sm">
            {this.state.error?.message || 'Unknown error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Types

```typescript
enum ExtensionErrorType {
  LOAD_FAILED = 'LOAD_FAILED',
  FEDERATION_ERROR = 'FEDERATION_ERROR',
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  MANIFEST_INVALID = 'MANIFEST_INVALID',
  DEPENDENCY_MISSING = 'DEPENDENCY_MISSING',
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE'
}

interface ExtensionError extends Error {
  type: ExtensionErrorType;
  extensionName?: string;
  details?: any;
}
```

### Error Recovery

```typescript
interface ErrorRecovery {
  // Retry loading extension
  retryLoad(componentName: string): Promise<boolean>;
  
  // Fallback to safe mode
  enableSafeMode(componentName: string): void;
  
  // Reset extension state
  resetExtension(componentName: string): Promise<void>;
  
  // Get error logs
  getErrorLogs(componentName: string): ExtensionError[];
}
```

---

## Performance Considerations

### Bundle Optimization

```typescript
// Recommended external dependencies
const externals = [
  'react',
  'react-dom',
  'react-router-dom', // If used by host
  'lodash',          // If provided by host
  // Add other large dependencies provided by host
];

// Vite configuration for optimal bundles
export default defineConfig({
  build: {
    rollupOptions: {
      external: externals,
      output: {
        manualChunks: {
          // Split large dependencies
          vendor: ['large-dependency']
        }
      }
    }
  }
});
```

### Memory Management

```typescript
// Extension cleanup example
const MyExtension = () => {
  const React = (window as any).React;
  const { useEffect, useRef } = React;
  const intervalRef = useRef<number>();

  useEffect(() => {
    // Setup
    intervalRef.current = setInterval(() => {
      // Periodic work
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return <div>Extension content</div>;
};
```

### Loading Performance

```typescript
// Preload critical extensions
const preloadCriticalExtensions = async () => {
  const criticalExtensions = ['Dashboard', 'DataViewer', 'Controls'];
  
  await Promise.all(
    criticalExtensions.map(name => 
      extensionManager.preloadComponent(name)
    )
  );
};

// Lazy load on demand
const loadExtensionOnDemand = async (componentName: string) => {
  try {
    const component = await extensionManager.getComponent(componentName);
    return component;
  } catch (error) {
    console.error(`Failed to load ${componentName}:`, error);
    return null;
  }
};
```

---

## Security Considerations

### Content Security Policy

Extensions run in the same context as the host application and must comply with CSP:

```typescript
// Safe external resource loading
const loadExternalResource = async (url: string) => {
  // Validate URL against whitelist
  const allowedDomains = ['api.example.com', 'cdn.example.com'];
  const urlObj = new URL(url);
  
  if (!allowedDomains.includes(urlObj.hostname)) {
    throw new Error('Domain not allowed');
  }
  
  return fetch(url);
};
```

### Input Sanitization

```typescript
// Sanitize user input
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000);   // Limit length
};

// Validate props
const validateProps = (props: any): boolean => {
  if (typeof props !== 'object' || props === null) {
    return false;
  }
  
  // Check for dangerous properties
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  return !dangerousKeys.some(key => key in props);
};
```

---

This API documentation provides the technical foundation for developing robust, secure, and performant extensions for the Higsby platform.
