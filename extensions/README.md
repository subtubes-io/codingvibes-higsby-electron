# Extensions Directory

This directory contains dynamically loaded React component extensions.

Each extension should be in its own subdirectory with the following structure:

```
extensions/
├── my-extension/
│   ├── manifest.json
│   ├── index.js (or index.tsx)
│   └── ... (other extension files)
```

## Extension Structure

### manifest.json
Required file that describes the extension:
```json
{
  "name": "My Extension",
  "version": "1.0.0",
  "description": "A sample extension",
  "author": "Your Name",
  "main": "index.js",
  "dependencies": [],
  "permissions": [],
  "minAppVersion": "1.0.0"
}
```

### Main File
The main file should export a React component as the default export:
```javascript
import React from 'react';

const MyExtension = () => {
  return (
    <div>
      <h1>My Extension</h1>
      <p>This is a dynamically loaded component!</p>
    </div>
  );
};

export default MyExtension;
```

## Security Note
Extensions are loaded dynamically and have access to the React context. Only install trusted extensions.
