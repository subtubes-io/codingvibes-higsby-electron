# Extension Development Guide

This document provides comprehensive instructions for creating new extensions for the Electron application using Module Federation with TypeScript and React.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step-by-Step Creation Guide](#step-by-step-creation-guide)
5. [Configuration Files](#configuration-files)
6. [Component Development](#component-development)
7. [Node Function Integration](#node-function-integration)
8. [Build and Package Process](#build-and-package-process)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Examples](#examples)

## Overview

Extensions are dynamically loadable React components that integrate with the main application using Module Federation. Each extension:

- Is built as an ES module with federation support
- Exposes a React component via `./Component` entry point
- Can include a `nodeFunction` for server-side operations
- Has secure access to environment variables and APIs
- Follows a standardized structure and build process

## Prerequisites

### Required Tools
- Node.js (v16 or higher)
- npm or yarn
- TypeScript knowledge
- React knowledge
- Basic understanding of Module Federation

### Required Dependencies
```json
{
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.0.0",
    "@originjs/vite-plugin-federation": "^1.3.5",
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "archiver": "^6.0.1",
    "rimraf": "^5.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## Project Structure

Each extension should follow this exact structure:

```
your-extension-name/
├── src/
│   └── index.tsx              # Main component file
├── scripts/
│   ├── build-and-package.js   # Build automation script
│   └── bundle.js              # Zip packaging script
├── dist/                      # Build output (generated)
│   ├── index.js              # Main federation entry
│   ├── __federation_expose_Component-*.js
│   ├── __federation_fn_import-*.js
│   ├── __federation_shared_react-*.js
│   ├── __federation_shared_react-dom-*.js
│   └── preload-helper-*.js
├── node_modules/             # Dependencies (generated)
├── index.html               # Development test file
├── manifest.json            # Extension metadata
├── package.json             # NPM configuration
├── package-lock.json        # Dependency lock file (generated)
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Build configuration
├── README.md               # Extension documentation
└── your-extension-name.zip  # Final package (generated)
```

## Step-by-Step Creation Guide

### 1. Create Extension Directory

```bash
cd /path/to/your-app/extensions
mkdir your-extension-name
cd your-extension-name
```

### 2. Initialize Package

Create `package.json`:

```json
{
    "name": "your-extension-name",
    "version": "1.0.0",
    "description": "Description of your extension",
    "main": "dist/index.js",
    "scripts": {
        "build": "vite build",
        "dev": "vite build --watch",
        "bundle": "npm run build && npm run zip",
        "package": "node scripts/build-and-package.js",
        "zip": "node scripts/bundle.js",
        "clean": "rimraf dist && rimraf *.zip"
    },
    "keywords": [
        "extension",
        "react",
        "typescript"
    ],
    "author": "Your Name",
    "license": "MIT",
    "devDependencies": {
        "@types/react": "^18.2.43",
        "@types/react-dom": "^18.2.17",
        "@vitejs/plugin-react": "^4.0.0",
        "@originjs/vite-plugin-federation": "^1.3.5",
        "typescript": "^5.0.0",
        "vite": "^4.0.0",
        "archiver": "^6.0.1",
        "rimraf": "^5.0.0"
    },
    "peerDependencies": {
        "react": "^18.0.0",
        "react-dom": "^18.0.0"
    }
}
```

### 3. Install Dependencies

```bash
npm install
```

## Configuration Files

### manifest.json

This file contains metadata about your extension:

```json
{
    "name": "Your Extension Display Name",
    "version": "1.0.0",
    "componentName": "YourExtensionComponent",
    "description": "Detailed description of what your extension does",
    "author": "Your Name",
    "main": "index.js",
    "permissions": [
        "network",
        "environment"
    ],
    "keywords": [
        "keyword1",
        "keyword2"
    ],
    "category": "utility",
    "language": "typescript",
    "framework": "react",
    "minAppVersion": "1.0.0"
}
```

**Important Fields:**
- `componentName`: Must match your React component export name
- `permissions`: List permissions needed (`network`, `environment`, etc.)
- `category`: Helps with organization (`ai`, `utility`, `data`, etc.)

### tsconfig.json

TypeScript configuration that matches the main application:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "outDir": "./dist",
    "jsx": "react-jsx"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "scripts"
  ]
}
```

### vite.config.ts

**Critical**: This configuration must be exact for proper federation:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'your-extension-name',
            filename: 'index.js',
            exposes: {
                './Component': './src/index.tsx'
            },
            shared: ['react', 'react-dom']
        })
    ],
    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env': '{}',
        'global': 'globalThis',
    },
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                minifyInternalExports: false,
                format: 'es',
                globals: {
                    'react': 'window.React',
                    'react-dom': 'window.ReactDOM'
                }
            }
        }
    }
});
```

**Critical Notes:**
- Do NOT add `input` to `rollupOptions` - this breaks federation
- The `name` field should match your extension directory name
- Always expose as `'./Component': './src/index.tsx'`

### index.html

Simple file for development testing:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Extension</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
</body>
</html>
```

## Component Development

### Basic Component Structure

Create `src/index.tsx`:

```typescript
// Get React from global scope (provided by host app)
declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

// Use React from host app instead of importing
const React = window.React || (globalThis as any).React;
const { useState, useEffect } = React;

// Define your configuration interface
interface YourExtensionConfig {
    // Define your config properties
    setting1: string;
    setting2: number;
}

// Define response interface
interface YourExtensionResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// Define the component interface with nodeFunction
interface YourExtensionComponent extends React.FC {
    nodeFunction?: (config: YourExtensionConfig) => Promise<YourExtensionResponse>;
}

const YourExtensionComponent: YourExtensionComponent = () => {
    const [config, setConfig] = (useState as any)({
        setting1: '',
        setting2: 0
    });

    const [response, setResponse] = (useState as any)(null);
    const [isLoading, setIsLoading] = (useState as any)(false);

    // Your component logic here
    const handleSubmit = async () => {
        if (YourExtensionComponent.nodeFunction) {
            setIsLoading(true);
            try {
                const result = await YourExtensionComponent.nodeFunction(config);
                setResponse(result);
            } catch (error) {
                setResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={{ /* your styles */ }}>
            {/* Your component JSX */}
            <h1>Your Extension</h1>
            {/* Form elements, buttons, etc. */}
        </div>
    );
};

// Export the component as default
export default YourExtensionComponent;
```

### Important React Patterns

1. **Use Global React**: Always use `window.React` instead of importing
2. **Type useState**: Use `(useState as any)` to avoid TypeScript issues
3. **Component Interface**: Extend `React.FC` and include `nodeFunction?`
4. **Default Export**: Always export your component as default

## Node Function Integration

### Adding Server-Side Functionality

If your extension needs server-side operations (API calls, file system access, etc.), add a `nodeFunction`:

```typescript
// Add this after your component definition, before export
YourExtensionComponent.nodeFunction = async (config: YourExtensionConfig): Promise<YourExtensionResponse> => {
    console.log("YourExtensionComponent nodeFunction called with config:", config);
    
    try {
        // Access environment variables
        const apiKey = process.env.YOUR_API_KEY;
        
        if (!apiKey) {
            return {
                success: false,
                error: 'YOUR_API_KEY environment variable is not set'
            };
        }

        // Make API calls, file operations, etc.
        const response = await fetch('https://api.example.com/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            return {
                success: false,
                error: `API Error: ${response.statusText}`
            };
        }

        const data = await response.json();
        
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error("Error in nodeFunction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
```

### Environment Variables

Your nodeFunction can access environment variables:

```typescript
// Common environment variables
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;
const customSetting = process.env.CUSTOM_SETTING;
```

## Build and Package Process

### Scripts Directory

Create `scripts/build-and-package.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting extension build and packaging process...\n');

try {
    // Step 1: Clean previous build
    console.log('🧹 Cleaning previous build...');
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    console.log('✅ Build directory cleaned\n');

    // Step 2: Build the extension
    console.log('🔨 Building extension with Vite...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Extension built successfully\n');

    // Step 3: Copy federation assets to root
    console.log('📦 Copying federation assets to root...');
    const assetsDir = path.join(__dirname, '../dist/assets');
    const distDir = path.join(__dirname, '../dist');
    
    if (fs.existsSync(assetsDir)) {
        const assets = fs.readdirSync(assetsDir);
        let copiedCount = 0;
        
        assets.forEach(asset => {
            const assetPath = path.join(assetsDir, asset);
            const targetPath = path.join(distDir, asset);
            
            if (fs.statSync(assetPath).isFile()) {
                fs.copyFileSync(assetPath, targetPath);
                console.log(`  📄 Copied: ${asset}`);
                copiedCount++;
            }
        });
        
        console.log(`✅ Copied ${copiedCount} federation assets\n`);
    }

    // Step 4: Create the zip package
    console.log('📦 Creating extension package...');
    execSync('npm run zip', { stdio: 'inherit' });
    
    // Step 5: Display results
    const zipPath = path.join(__dirname, '../your-extension-name.zip');
    if (fs.existsSync(zipPath)) {
        const stats = fs.statSync(zipPath);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        
        console.log('\n🎉 Extension packaging completed successfully!');
        console.log('📦 Package details:');
        console.log(`   📄 File: your-extension-name.zip`);
        console.log(`   📏 Size: ${sizeInKB} KB`);
        console.log(`   📁 Location: ${zipPath}`);
        console.log('\n✨ Ready to upload and test!');
    }

} catch (error) {
    console.error('\n❌ Build and packaging failed:');
    console.error(error.message);
    process.exit(1);
}
```

Create `scripts/bundle.js`:

```javascript
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function createExtensionZip() {
  const outputPath = path.join(__dirname, '../your-extension-name.zip');
  const distPath = path.join(__dirname, '../dist');
  const manifestPath = path.join(__dirname, '../manifest.json');

  // Check required files
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found.');
    process.exit(1);
  }

  // Remove existing zip
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInKB = (archive.pointer() / 1024).toFixed(2);
      console.log(`✅ Extension bundled successfully!`);
      console.log(`📦 File: ${path.basename(outputPath)}`);
      console.log(`📏 Size: ${sizeInKB} KB`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Add manifest
    archive.file(manifestPath, { name: 'manifest.json' });

    // Add all dist files
    const distFiles = fs.readdirSync(distPath);
    for (const file of distFiles) {
      const filePath = path.join(distPath, file);
      if (fs.statSync(filePath).isFile()) {
        archive.file(filePath, { name: file });
        console.log(`📄 Adding: ${file}`);
      }
    }

    archive.finalize();
  });
}

createExtensionZip().catch(console.error);
```

### Build Commands

```bash
# Development build with watch
npm run dev

# Production build
npm run build

# Clean build artifacts
npm run clean

# Build and package
npm run package
```

## Deployment

### 1. Set Environment Variables

If your extension uses environment variables:

```bash
export YOUR_API_KEY="your-api-key-here"
export ANOTHER_VAR="another-value"
```

### 2. Build and Package

```bash
npm run package
```

### 3. Upload Extension

1. Locate the generated `.zip` file
2. Upload it through your application's extension management interface
3. The extension will be available as the `componentName` specified in manifest.json

### 4. Verify Federation Files

The zip should contain these essential files:
- `manifest.json`
- `index.js` (main federation entry)
- `__federation_expose_Component-*.js` (your component)
- `__federation_fn_import-*.js` (federation runtime)
- `__federation_shared_react-*.js` (shared React)
- `__federation_shared_react-dom-*.js` (shared ReactDOM)
- `preload-helper-*.js` (federation preloader)

## Troubleshooting

### Common Build Issues

1. **"Failed to resolve module specifier" Error**
   - Usually caused by incorrect vite.config.ts
   - Ensure you don't have `input` in rollupOptions
   - Check that federation plugin version is 1.3.5

2. **Missing `__federation_expose_Component-*.js`**
   - Component not being exposed properly
   - Check vite.config.ts exposes configuration
   - Ensure proper default export in index.tsx

3. **React Hook Errors**
   - Using imported React instead of global
   - Use `window.React` and cast useState as `any`

4. **TypeScript Errors**
   - Check tsconfig.json matches sample
   - Ensure proper interface definitions

### Debugging Steps

1. Check build output in `dist/assets/`
2. Verify `index.js` has correct federation import path
3. Ensure all federation files are generated
4. Test component export with simple console.log

### Performance Optimization

1. **Bundle Size**: Keep dependencies minimal
2. **Code Splitting**: Let federation handle chunking
3. **Shared Dependencies**: Use peerDependencies for React
4. **Lazy Loading**: Federation handles this automatically

## Best Practices

### Code Organization

1. **Single Component**: One main component per extension
2. **Clear Interfaces**: Define config and response types
3. **Error Handling**: Always handle async operations
4. **Logging**: Use console.log for debugging

### Security

1. **Environment Variables**: Never hardcode secrets
2. **Input Validation**: Validate all user inputs
3. **API Keys**: Use server-side nodeFunction for API calls
4. **Permissions**: Only request needed permissions

### User Experience

1. **Loading States**: Show loading indicators
2. **Error Messages**: Provide clear error feedback
3. **Validation**: Real-time form validation
4. **Responsive Design**: Support different screen sizes

### Documentation

1. **README.md**: Document your extension thoroughly
2. **Code Comments**: Explain complex logic
3. **Examples**: Provide usage examples
4. **Changelog**: Track version changes

## Examples

### Simple Form Extension

```typescript
const SimpleFormExtension: SimpleFormExtensionComponent = () => {
    const [formData, setFormData] = (useState as any)({ name: '', email: '' });
    
    return (
        <div style={{ padding: '20px' }}>
            <h2>Simple Form</h2>
            <input 
                type="text" 
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input 
                type="email" 
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <button onClick={() => console.log(formData)}>
                Submit
            </button>
        </div>
    );
};
```

### API Integration Extension

```typescript
const APIExtension: APIExtensionComponent = () => {
    const [data, setData] = (useState as any)(null);
    const [loading, setLoading] = (useState as any)(false);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await APIExtension.nodeFunction({ endpoint: '/api/data' });
            setData(result.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <button onClick={fetchData} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Data'}
            </button>
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};

APIExtension.nodeFunction = async (config) => {
    const response = await fetch(`https://api.example.com${config.endpoint}`);
    const data = await response.json();
    return { success: true, data };
};
```

## Conclusion

Following this guide ensures your extensions will integrate seamlessly with the main application. The key is maintaining consistency with the federation setup and following the established patterns.

For additional help, refer to the working examples in the `/extensions` directory or consult the main application documentation.

---

**Last Updated**: July 18, 2025  
**Extension API Version**: 1.0.0
