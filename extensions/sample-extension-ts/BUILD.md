# Extension Build and Packaging

This document describes the build process for the HelloWorld TypeScript extension.

## Scripts Overview

### `npm run package` 
**Recommended for production builds**

This is the comprehensive build script that handles the entire extension packaging process:

1. **Clean**: Removes previous build artifacts
2. **Build**: Compiles the extension with Vite and module federation
3. **Copy Assets**: Copies all federation dependencies to the root dist folder
4. **Package**: Creates the final zip package
5. **Validate**: Shows package details and confirms successful creation

```bash
npm run package
```

### Other Available Scripts

- `npm run build` - Builds the extension with Vite only
- `npm run dev` - Builds in watch mode for development
- `npm run bundle` - Legacy script (build + zip, doesn't copy assets)
- `npm run zip` - Creates zip package from existing dist folder
- `npm run clean` - Removes all build artifacts and zip files

## Build Process Details

### 1. Module Federation Setup
The extension uses Vite's module federation plugin to:
- Expose the main component as `./Component`
- Share React and ReactDOM with the host application
- Generate federation-specific files for proper loading

### 2. Asset Management
The build process generates several federation files:
- `index.js` - Main federation entry point
- `__federation_expose_Component-*.js` - Exposed component module
- `__federation_fn_import-*.js` - Federation import logic
- `__federation_shared_react-*.js` - Shared React module
- `__federation_shared_react-dom-*.js` - Shared ReactDOM module
- `preload-helper-*.js` - Federation preload helper

### 3. External Dependencies
React and ReactDOM are configured as external dependencies:
- Not bundled with the extension
- Accessed via `window.React` and `window.ReactDOM`
- Provided by the host application at runtime

### 4. Package Structure
The final zip package contains:
- `manifest.json` - Extension metadata
- `index.js` - Main federation entry
- All federation dependency files
- No bundled React (uses host's React instance)

## File Size Optimization

The extension package is optimized for size:
- React/ReactDOM excluded from bundle (~140KB saved)
- Federation sharing reduces duplication
- Typical package size: ~55KB

## Host Application Integration

The extension integrates with the host application through:
1. **Extension Protocol**: Loaded via `extension://ComponentName/index.js`
2. **Federation Loading**: Host loads federation container and gets exposed component
3. **Shared Context**: Uses host's React instance to avoid context conflicts
4. **Global Setup**: Host provides React via `window.React` before loading extension

## Development Workflow

1. **Make Changes**: Edit TypeScript/React code in `src/`
2. **Build & Package**: Run `npm run package`
3. **Upload**: Upload the generated zip file to the host application
4. **Test**: Create a new node in the graph and assign the extension

## Troubleshooting

### Common Issues

**Federation Loading Errors**
- Ensure all federation files are included in the package
- Check that the `package` script copies assets correctly

**React Context Errors**
- Verify React is marked as external in vite.config.ts
- Confirm extension uses `window.React` instead of importing

**Missing Files in Package**
- Run `npm run clean` then `npm run package`
- Check that the build-and-package.js script copies all assets

### Debugging

Enable verbose logging by checking the browser console when loading extensions:
- Federation container loading
- Asset copying status
- Component resolution
- React context setup

## Architecture Notes

This extension uses a hybrid approach:
- **Module Federation**: For proper component exposure and loading
- **Global React**: To ensure shared React context with host
- **External Dependencies**: To reduce bundle size and avoid conflicts

The build process ensures compatibility between the federation system and the global React approach, providing the best of both worlds.
