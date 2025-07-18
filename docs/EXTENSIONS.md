# Higsby Extension System Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Extension Development](#extension-development)
- [Build System](#build-system)
- [Integration Guide](#integration-guide)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

---

## Overview

Higsby features a powerful, dynamic extension system that allows developers to create custom React components that can be loaded at runtime into graph nodes. The system is built on module federation technology, enabling seamless integration without hardcoded dependencies or unsafe eval usage.

### Key Features

- 🔌 **Dynamic Loading**: Extensions are loaded at runtime without application restart
- 📦 **Module Federation**: Built on Webpack's module federation for secure, efficient loading
- ⚛️ **React Integration**: Extensions are React components with full hook support
- 🔒 **Secure**: No eval() usage, no unsafe dynamic imports
- 📱 **Responsive**: Extensions inherit the application's responsive design system
- 🎨 **Themeable**: Automatic dark/light theme support
- 🔄 **Hot Reload**: Development mode supports hot reloading for rapid iteration

### Architecture Benefits

- **No Hardcoded Names**: Extensions are discovered dynamically by component name
- **Shared Dependencies**: React and ReactDOM are shared with the host application
- **Small Bundle Sizes**: Extensions exclude React (~140KB savings per extension)
- **Type Safety**: Full TypeScript support with proper type checking
- **Error Isolation**: Extension failures don't crash the host application

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────┐
│                Host Application                  │
│  ┌─────────────────────────────────────────────┐ │
│  │           Graph Editor                      │ │
│  │  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │    Node     │  │    Node     │         │ │
│  │  │ Extension A │  │ Extension B │   ...   │ │
│  │  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────────┐ │
│  │         Extension Manager                   │ │
│  │  • Upload Extensions                       │ │
│  │  • Manage Lifecycle                        │ │
│  │  • Federation Loading                      │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Module Federation Flow

1. **Extension Build**: Extension is built with federation configuration
2. **Package Upload**: Extension zip is uploaded to the application
3. **Extraction**: Application extracts extension to `extensions/ComponentName/`
4. **Registration**: Extension is registered in the system
5. **Dynamic Loading**: When a graph node requests the extension:
   - Host provides React via `window.React`
   - Federation container is loaded from `extension://ComponentName/index.js`
   - Component is retrieved and instantiated
   - Component renders within the graph node

### File Structure

```
extensions/
├── ComponentName/           # Extension directory (auto-generated from componentName)
│   ├── manifest.json       # Extension metadata
│   ├── index.js            # Federation entry point
│   └── __federation_*.js   # Federation dependency files
├── AnotherExtension/
│   ├── manifest.json
│   ├── index.js
│   └── __federation_*.js
└── ...
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Basic React and TypeScript knowledge
- Understanding of module federation concepts (helpful but not required)

### Quick Start

1. **Clone the Sample Extension**:
   ```bash
   cp -r sample-extension-ts my-new-extension
   cd my-new-extension
   npm install
   ```

2. **Customize the Extension**:
   ```typescript
   // src/index.tsx
   import React, { useState } from 'react';

   const MyExtension = () => {
     const [count, setCount] = useState(0);

     return (
       <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
         <h3>My Custom Extension</h3>
         <button onClick={() => setCount(count + 1)}>
           Count: {count}
         </button>
       </div>
     );
   };

   export default MyExtension;
   ```

3. **Update Manifest**:
   ```json
   {
     "name": "My Extension",
     "componentName": "MyExtension",
     "version": "1.0.0",
     "description": "A custom extension for Higsby"
   }
   ```

4. **Build and Package**:
   ```bash
   npm run package
   ```

5. **Upload to Higsby**:
   - Open Higsby application
   - Navigate to Extensions page
   - Upload the generated `my-new-extension.zip`
   - Create a graph node and assign your extension

---

## Extension Development

### Project Structure

```
my-extension/
├── src/
│   ├── index.tsx           # Main component (required)
│   ├── components/         # Additional components
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── scripts/
│   ├── build-and-package.js  # Build automation
│   └── bundle.js            # Legacy bundling
├── manifest.json           # Extension metadata
├── package.json           # NPM configuration
├── vite.config.ts         # Build configuration
├── tsconfig.json          # TypeScript configuration
└── BUILD.md              # Build documentation
```

### Component Requirements

#### 1. Global React Usage

Extensions must use the global React instance provided by the host:

```typescript
// ❌ Don't import React
// import React from 'react';

// ✅ Use global React
const React = (window as any).React;
const { useState, useEffect } = React;

const MyComponent = () => {
  const [state, setState] = useState(0);
  // Component logic
};
```

#### 2. TypeScript Configuration

The component must be the default export:

```typescript
// src/index.tsx
const MyExtension = () => {
  return <div>My Extension Content</div>;
};

export default MyExtension;
```

#### 3. Styling Guidelines

Use Tailwind classes for consistency with the host application:

```typescript
const MyExtension = () => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Extension Title
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        Extension content goes here
      </p>
    </div>
  );
};
```

### Advanced Features

#### State Management

Extensions can use local state and context:

```typescript
import React, { createContext, useContext, useState } from 'react';

const ExtensionContext = createContext(null);

const MyExtension = () => {
  const [globalState, setGlobalState] = useState({});

  return (
    <ExtensionContext.Provider value={{ globalState, setGlobalState }}>
      <ExtensionContent />
    </ExtensionContext.Provider>
  );
};
```

#### External API Calls

Extensions can make HTTP requests:

```typescript
const DataExtension = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.example.com/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>External Data</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

#### Event Handling

Extensions can handle user interactions:

```typescript
const InteractiveExtension = () => {
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    setClicks(prev => prev + 1);
    // Could emit events to parent application if needed
  };

  return (
    <div className="p-4">
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Clicked {clicks} times
      </button>
    </div>
  );
};
```

---

## Build System

### Build Configuration

The build system uses Vite with module federation:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'HelloWorldExtension',
      filename: 'index.js',
      exposes: {
        './Component': './src/index.tsx'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

### Build Scripts

#### Development Build

```bash
npm run dev
```

Starts Vite in watch mode for rapid development.

#### Production Build

```bash
npm run build
```

Creates optimized production build.

#### Complete Package

```bash
npm run package
```

Comprehensive build script that:
1. Cleans previous builds
2. Builds with Vite and federation
3. Copies federation assets to root
4. Creates zip package
5. Validates output

### Package Structure

The generated extension package contains:

```
extension.zip
├── manifest.json                               # Extension metadata
├── index.js                                   # Federation entry point
├── __federation_expose_Component-*.js         # Exposed component
├── __federation_fn_import-*.js               # Federation import logic
├── __federation_shared_react-*.js            # Shared React module
├── __federation_shared_react-dom-*.js        # Shared ReactDOM module
└── preload-helper-*.js                       # Federation preload helper
```

---

## Integration Guide

### Host Application Setup

#### 1. Global React Provision

The host application provides React globally:

```typescript
// Before loading any extensions
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
```

#### 2. Extension Protocol

Extensions are served via a custom protocol:

```typescript
// electron/main.ts
import { protocol } from 'electron';
import path from 'path';
import fs from 'fs';

protocol.registerFileProtocol('extension', (request, callback) => {
  const url = request.url.substr(12); // Remove 'extension://'
  const filePath = path.join(extensionsDir, url);
  callback({ path: filePath });
});
```

#### 3. Federation Loading

Extensions are loaded using module federation:

```typescript
const loadExtension = async (componentName: string) => {
  try {
    // Load federation container
    const containerUrl = `extension://${componentName}/index.js`;
    await import(containerUrl);
    
    // Get the container from global scope
    const container = (window as any)[`HelloWorldExtension`];
    
    // Initialize and get component
    await container.init({});
    const factory = await container.get('./Component');
    const Component = factory();
    
    return Component.default || Component;
  } catch (error) {
    console.error('Failed to load extension:', error);
    throw error;
  }
};
```

### Graph Node Integration

Extensions are integrated into graph nodes:

```typescript
const GraphNode = ({ nodeData }) => {
  const [ExtensionComponent, setExtensionComponent] = useState(null);

  useEffect(() => {
    if (nodeData.extensionName) {
      loadExtension(nodeData.extensionName)
        .then(Component => {
          setExtensionComponent(() => Component);
        })
        .catch(error => {
          console.error('Failed to load extension:', error);
        });
    }
  }, [nodeData.extensionName]);

  return (
    <div className="graph-node">
      <div className="node-header">
        {nodeData.title}
      </div>
      <div className="node-content">
        {ExtensionComponent ? (
          <ExtensionComponent {...nodeData.props} />
        ) : (
          <div>Loading extension...</div>
        )}
      </div>
    </div>
  );
};
```

---

## API Reference

### Extension Manifest Schema

```typescript
interface ExtensionManifest {
  name: string;                    // Display name
  componentName: string;           // Unique component identifier
  version: string;                 // Semantic version
  description?: string;            // Extension description
  author?: string;                 // Author information
  keywords?: string[];             // Search keywords
  homepage?: string;               // Project homepage
  repository?: string;             // Source repository
  license?: string;                // License type
  dependencies?: Record<string, string>; // External dependencies
  peerDependencies?: Record<string, string>; // Peer dependencies
}
```

### Extension Component Props

Extensions receive props from the graph node:

```typescript
interface ExtensionProps {
  nodeId: string;                  // Unique node identifier
  nodeData: any;                   // Node configuration data
  onUpdate?: (data: any) => void;  // Update node data callback
  onError?: (error: Error) => void; // Error reporting callback
  theme: 'light' | 'dark';         // Current theme
  readonly?: boolean;              // Read-only mode flag
}
```

### Host Application APIs

#### Extension Manager

```typescript
interface ExtensionManager {
  // Load extension from zip file
  loadExtension(zipBuffer: Buffer): Promise<void>;
  
  // Get list of installed extensions
  getExtensions(): ExtensionManifest[];
  
  // Remove extension
  removeExtension(componentName: string): Promise<void>;
  
  // Get extension component
  getComponent(componentName: string): Promise<React.ComponentType>;
}
```

#### Graph Integration

```typescript
interface GraphNode {
  id: string;
  type: string;
  extensionName?: string;
  props?: Record<string, any>;
  position: { x: number; y: number };
  data: any;
}
```

---

## Troubleshooting

### Common Issues

#### 1. React Context Errors

**Problem**: Extension throws "Cannot read properties of null (reading 'useState')"

**Solution**: Ensure extension uses global React:
```typescript
// ❌ Incorrect
import React, { useState } from 'react';

// ✅ Correct
const React = (window as any).React;
const { useState } = React;
```

#### 2. Federation Loading Failures

**Problem**: Extension fails to load with federation errors

**Solution**: Check federation configuration:
```typescript
// Ensure external React configuration
external: ['react', 'react-dom'],
output: {
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
```

#### 3. Missing Federation Assets

**Problem**: Extension builds but fails at runtime

**Solution**: Ensure all federation files are packaged:
```bash
npm run package  # Uses comprehensive build script
```

#### 4. Component Not Found

**Problem**: "Component not found" error when loading extension

**Solution**: Verify component export:
```typescript
// Must be default export
export default MyComponent;
```

### Debug Mode

Enable debug logging in development:

```typescript
// In extension component
console.log('Extension loaded:', componentName);
console.log('Props received:', props);
console.log('React version:', React.version);
```

### Performance Optimization

#### 1. Bundle Size

- Use external React/ReactDOM (automatic with build script)
- Import only needed utilities
- Use dynamic imports for large dependencies

#### 2. Loading Speed

- Minimize federation container size
- Use code splitting for complex components
- Implement loading states

#### 3. Memory Management

- Clean up event listeners in useEffect cleanup
- Avoid memory leaks with proper dependency arrays
- Use React.memo for expensive components

---

## Examples

### Basic Counter Extension

```typescript
// src/index.tsx
const React = (window as any).React;
const { useState } = React;

const CounterExtension = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Counter</h3>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCount(count - 1)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          -
        </button>
        <span className="text-xl font-mono">{count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CounterExtension;
```

### Data Visualization Extension

```typescript
const React = (window as any).React;
const { useState, useEffect } = React;

const ChartExtension = ({ nodeData }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate data loading
    const simulatedData = Array.from({ length: 10 }, (_, i) => ({
      x: i,
      y: Math.random() * 100
    }));
    setData(simulatedData);
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Data Chart</h3>
      <div className="grid grid-cols-5 gap-2 h-32">
        {data.map((point, index) => (
          <div
            key={index}
            className="bg-blue-500 rounded"
            style={{
              height: `${point.y}%`,
              alignSelf: 'flex-end'
            }}
            title={`Value: ${point.y.toFixed(1)}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ChartExtension;
```

### Form Extension

```typescript
const React = (window as any).React;
const { useState } = React;

const FormExtension = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate && onUpdate(formData);
    console.log('Form submitted:', formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Contact Form</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormExtension;
```

---

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run electron:dev`
4. Create test extensions in `sample-extension-ts/`

### Extension Guidelines

- Follow React best practices
- Use TypeScript for type safety
- Include comprehensive tests
- Document component props and usage
- Follow the established styling patterns

### Submitting Extensions

1. Test extension thoroughly
2. Include proper manifest.json
3. Document any external dependencies
4. Provide usage examples
5. Submit as a zip package

---

## License

This extension system is part of Higsby and is licensed under the MIT License.
