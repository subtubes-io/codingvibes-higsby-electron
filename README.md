# Higsby

A modern Electron application built with Vite, React, and TypeScript featuring a dynamic extension system for graph-based workflows.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 18 for the frontend
- 📝 TypeScript for type safety
- 🖥️ Electron for desktop application
- 🎨 Modern CSS with dark/light theme support
- 🔌 Dynamic extension system with module federation
- 📊 Interactive graph editor with draggable nodes
- 📦 Extension upload and management

## Extension System

### Overview

Higsby features a powerful extension system that allows you to create custom React components that can be dynamically loaded into graph nodes. Extensions are built using module federation and can be uploaded as zip packages.

### Creating Extensions

1. **Use the Sample Extension Template**
   ```bash
   cd sample-extension-ts
   npm install
   ```

2. **Build and Package Extension**
   ```bash
   npm run package
   ```
   This comprehensive script will:
   - Clean previous builds
   - Build with Vite and module federation
   - Copy all federation assets
   - Create a zip package ready for upload

3. **Upload to Higsby**
   - Open Higsby application
   - Go to Extensions page
   - Upload the generated zip file
   - Create a graph node and assign the extension

### Extension Development

Extensions are React components with these requirements:
- Must use `window.React` instead of importing React
- Built with module federation
- Packaged with all federation dependencies
- Include a `manifest.json` with metadata

See `sample-extension-ts/BUILD.md` for detailed documentation.

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron app.

### Scripts

- `npm run dev` - Start Vite dev server only
- `npm run electron:dev` - Start both Vite dev server and Electron app
- `npm run build` - Build for production
- `npm run electron:preview` - Preview production build in Electron
- `npm run dist` - Build and package the app for distribution

## Project Structure

```
cdv-electron/
├── electron/              # Electron main process files
│   ├── main.ts            # Main process entry point
│   └── preload.ts         # Preload script
├── src/                   # React application
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   ├── components/        # React components
│   │   ├── GraphView/     # Graph editor with extension loading
│   │   ├── ExtensionManager/ # Extension upload and management
│   │   └── ExtensionLoader/  # Dynamic component loading
│   ├── services/          # Extension and utility services
│   └── assets/            # Static assets
├── sample-extension-ts/   # TypeScript extension template
│   ├── src/               # Extension source code
│   ├── scripts/           # Build and packaging scripts
│   ├── BUILD.md           # Extension build documentation
│   └── vite.config.ts     # Federation build configuration
├── extensions/            # Installed extensions directory
├── public/                # Public assets
└── dist-electron/         # Built Electron files
```

## Building for Production

To build the app for production:

```bash
npm run dist
```

This will create distributable packages in the `release` directory.

## License

MIT
