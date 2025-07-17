# CDV Electron

A modern Electron application built with Vite, React, and TypeScript.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 18 for the frontend
- 📝 TypeScript for type safety
- 🖥️ Electron for desktop application
- 🎨 Modern CSS with dark/light theme support

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
├── electron/           # Electron main process files
│   ├── main.ts         # Main process entry point
│   └── preload.ts      # Preload script
├── src/                # React application
│   ├── App.tsx         # Main React component
│   ├── main.tsx        # React entry point
│   └── assets/         # Static assets
├── public/             # Public assets
└── dist-electron/      # Built Electron files
```

## Building for Production

To build the app for production:

```bash
npm run dist
```

This will create distributable packages in the `release` directory.

## License

MIT
