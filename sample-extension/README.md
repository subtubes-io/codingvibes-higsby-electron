# Sample Counter Extension

This is a demonstration extension for the Higsby extension system.

## Features

- Interactive counter with increment, decrement, and reset functionality
- Multiple theme options (Primary, Ocean, Sunset)
- Responsive design that follows the app's design system
- Real-time click tracking

## Installation

1. Zip this folder into a file (e.g., `sample-counter-extension.zip`)
2. Open the Higsby app
3. Navigate to the Extensions page
4. Upload the zip file using the "Upload Extension" tab
5. Enable the extension in the "Manage Extensions" tab
6. View the extension in the "View Extensions" tab

## Files

- `manifest.json` - Extension metadata and configuration
- `index.js` - Main extension component (React component)
- `README.md` - This documentation file

## Development Notes

This extension demonstrates:
- Basic React component structure for extensions
- State management with React hooks
- Dynamic styling and theming
- Extension metadata display
- Proper export patterns for the extension system

The extension is written in vanilla JavaScript with React.createElement calls to ensure compatibility across different build systems.
