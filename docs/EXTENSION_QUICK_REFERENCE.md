# Extension Development Quick Reference

> Fast reference for Higsby extension development

## 🚀 Quick Start Checklist

### ✅ Setup
- [ ] Copy `sample-extension-ts/` template
- [ ] Run `npm install`
- [ ] Update `manifest.json` with your extension details
- [ ] Rename component in `src/index.tsx`

### ✅ Development
- [ ] Use `const React = (window as any).React;` (never import React)
- [ ] Use Tailwind classes for styling
- [ ] Export component as default export
- [ ] Test with `npm run dev`

### ✅ Build & Deploy
- [ ] Run `npm run package`
- [ ] Upload generated `.zip` to Higsby
- [ ] Create graph node and assign extension
- [ ] Test in production environment

---

## 📋 Essential Commands

```bash
# Start development
npm run dev

# Build and package (recommended)
npm run package

# Build only
npm run build

# Create zip only
npm run zip

# Clean build artifacts
npm run clean
```

---

## 🔧 Component Template

```typescript
// src/index.tsx
const React = (window as any).React;
const { useState, useEffect } = React;

const MyExtension = ({ nodeId, nodeData, onUpdate, theme }) => {
  const [state, setState] = useState(null);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        My Extension
      </h3>
      {/* Your component content */}
    </div>
  );
};

export default MyExtension;
```

---

## 📝 Manifest Template

```json
{
  "name": "My Extension",
  "componentName": "MyExtension",
  "version": "1.0.0",
  "description": "Brief description of what this extension does",
  "author": "Your Name",
  "keywords": ["graph", "utility", "custom"]
}
```

---

## 🎨 Styling Guidelines

### Use Tailwind Classes
```typescript
// ✅ Good
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">

// ❌ Avoid custom CSS
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### Theme Support
```typescript
// Responsive design
<div className="text-gray-900 dark:text-white">

// Interactive elements
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
```

---

## ⚠️ Common Pitfalls

### React Import
```typescript
// ❌ Never do this
import React from 'react';

// ✅ Always do this
const React = (window as any).React;
```

### Export Pattern
```typescript
// ✅ Correct
export default MyComponent;

// ❌ Named export won't work
export { MyComponent };
```

### Build Process
```bash
# ✅ Use the comprehensive script
npm run package

# ❌ Don't use build alone (missing federation assets)
npm run build
```

---

## 🔍 Debugging Tips

### Check Console Logs
1. Open browser dev tools
2. Look for federation loading messages
3. Check for React context errors

### Common Error Messages

**"Cannot read properties of null"**
→ Using imported React instead of global React

**"Component not found"**
→ Missing default export or incorrect component name

**"Federation container not found"**
→ Build process didn't copy all federation assets

---

## 📊 Build Output

### Successful Build
```
✅ Extension built successfully
📦 Copied 8 federation assets
🎉 Extension packaging completed successfully!
📦 Package details:
   📄 File: my-extension.zip
   📏 Size: ~55KB
```

### Package Contents
- `manifest.json` - Extension metadata
- `index.js` - Federation entry point
- `__federation_*.js` - Federation dependencies
- No React bundle (uses host's React)

---

## 🚨 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Extension won't load | Check React global usage |
| Build fails | Run `npm run clean` then `npm run package` |
| Styling broken | Use Tailwind classes, check theme classes |
| Large bundle size | Ensure React is external (automatic) |
| Federation errors | Check all assets copied with `package` script |

---

## 📚 Resources

- **Full Documentation**: `docs/EXTENSIONS.md`
- **Build Documentation**: `sample-extension-ts/BUILD.md`
- **Sample Code**: `sample-extension-ts/src/`
- **Host Integration**: `src/components/GraphView/`

---

## 🏆 Best Practices

1. **Start Small**: Begin with simple components and add complexity gradually
2. **Use TypeScript**: Take advantage of type safety for better development experience  
3. **Test Thoroughly**: Test both light and dark themes, various screen sizes
4. **Handle Errors**: Implement proper error boundaries and loading states
5. **Document Usage**: Include clear descriptions and usage examples
6. **Optimize Performance**: Use React.memo for expensive components
7. **Follow Patterns**: Study existing extensions for established patterns

---

## 🤝 Need Help?

- Check the troubleshooting section in `docs/EXTENSIONS.md`
- Review sample extension code
- Look at browser console for detailed error messages
- Ensure you're using the latest build script (`npm run package`)
