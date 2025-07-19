# ChatGPT Extension Development Scripts

This extension includes development scripts to streamline the development workflow.

## Development Install Script

The `dev-install` script automates the complete development workflow:

1. **Removes** the existing extension from the server (if installed)
2. **Builds** and packages the extension into a zip file
3. **Uploads** the new version via the local API server

### Usage

```bash
# Make sure the development server is running first
cd ../../example-server
npm start

# In another terminal, run the dev install script
cd extensions/chatgpt-extension-ts
npm run dev-install
```

### Prerequisites

- The development server must be running on port 8888
- Node.js dependencies must be installed (`npm install`)

### Script Flow

```
🔍 Checking server connection...
✅ Server is running and accessible

🗑️ Removing existing extension...
✅ Extension removed: Extension ChatGPTExtension removed successfully

🔨 Building and packaging extension...
✅ Extension built and packaged successfully

📤 Uploading extension...
✅ Extension uploaded successfully!
   Extension ID: ChatGPTExtension
   Message: Extension installed successfully

🎉 Development install completed successfully!
💡 The extension is now ready to use in the graph editor
```

### Error Handling

The script includes comprehensive error handling:

- **Server not running**: Clear message with instructions to start the server
- **Build failures**: Exits with error code and shows build output
- **Upload failures**: Shows detailed error messages from the API
- **Missing files**: Validates that the zip file exists before upload

### Manual Steps (if needed)

If you prefer to run the steps manually:

```bash
# Remove existing extension (optional)
curl -X DELETE http://localhost:8888/api/extensions/ChatGPTExtension

# Build and package
npm run package

# Upload
curl -X POST -F "extension=@../chatgpt-extension-ts.zip" http://localhost:8888/api/extensions/upload
```

## Other Available Scripts

- `npm run build` - Build the extension
- `npm run dev` - Build in watch mode
- `npm run package` - Build and create zip file
- `npm run clean` - Clean build artifacts

## Quick Development Workflow

For rapid development iterations:

```bash
# Terminal 1: Start the API server
cd ../../example-server
npm start

# Terminal 2: Make changes to your extension, then
cd ../../extensions/chatgpt-extension-ts
npm run dev-install

# The extension is now updated and ready to test in the graph editor
```

This workflow is especially useful when:
- Testing new features
- Debugging extension behavior
- Iterating on UI changes
- Updating extension configuration (manifest.json, ports, etc.)
