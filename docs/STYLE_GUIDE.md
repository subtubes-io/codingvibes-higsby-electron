# Higsby Design Style Guide

> A comprehensive guide to the design system and styling conventions used in the Higsby application.

## 🎨 Overview

This application uses a modern, professional design system built with vanilla CSS, featuring a clean interface optimized for desktop applications. The design emphasizes usability, accessibility, and visual hierarchy.

---

## 🌈 Color Palette

### Primary Colors
```css
/* Primary Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary Blue */
#667eea - Primary brand color (light blue)
#764ba2 - Secondary brand color (purple)
```

### Neutral Colors
```css
/* Text Colors */
#333333 - Primary text (headings)
#666666 - Secondary text (descriptions)
#999999 - Muted text (sidebar inactive)
#888888 - Tertiary text (read-the-docs)

/* Background Colors */
#ffffff - White (cards, content sections)
#fafafa - Light gray (main content background)
#f8fafc - Ultra light gray (cards, forms)
#1a1a1a - Dark (sidebar background)
#2a2a2a - Dark hover (sidebar hover states)

/* Border Colors */
#e5e7eb - Light border (cards, inputs)
#e2e8f0 - Subtle border (project cards)
#333333 - Dark border (sidebar)
rgba(255, 255, 255, 0.1) - Transparent white border
```

### Status Colors
```css
/* Success */
#dcfce7 - Success background
#166534 - Success text

/* Warning */
#fef3c7 - Warning background
#92400e - Warning text

/* Error */
#fecaca - Error background
#991b1b - Error text

/* Info */
#dbeafe - Info background
#1e40af - Info text
```

---

## 📝 Typography

### Font Stack
```css
font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
```

### Font Weights
```css
font-weight: 400; /* Regular text */
font-weight: 500; /* Medium (buttons, labels) */
font-weight: 600; /* Semi-bold (app title) */
font-weight: 700; /* Bold (headings) */
```

### Font Sizes
```css
/* Headings */
font-size: 3.2em;  /* Main display heading */
font-size: 2rem;   /* Page headers (h2) */
font-size: 1.5rem; /* Large headings */
font-size: 1.4rem; /* Section headings */
font-size: 1.2rem; /* Component headings */

/* Body Text */
font-size: 1.1rem; /* Large body text */
font-size: 1.05rem; /* Medium body text */
font-size: 1rem;   /* Standard body text */
font-size: 0.95rem; /* Small body text */
font-size: 0.9rem;  /* Smaller text */
font-size: 0.875rem; /* Extra small text */
font-size: 0.75rem; /* Micro text */
```

### Line Heights
```css
line-height: 1.5; /* Standard line height */
line-height: 1.6; /* Increased readability */
line-height: 1.1; /* Tight headings */
```

---

## 📐 Spacing System

### Margin & Padding Scale
```css
/* Standard spacing scale (based on 4px grid) */
4px   - 0.25rem
8px   - 0.5rem
12px  - 0.75rem
16px  - 1rem
20px  - 1.25rem
24px  - 1.5rem
30px  - 1.875rem
32px  - 2rem
40px  - 2.5rem
60px  - 3.75rem
```

### Component Spacing
```css
/* Navigation */
padding: 0 20px;     /* Top navigation horizontal */
gap: 15px;           /* Navigation items */
gap: 12px;           /* Icon and text spacing */

/* Sidebar */
padding: 12px 20px;  /* Menu items */
padding: 20px;       /* Section padding */

/* Content */
padding: 30px;       /* Main content */
margin-bottom: 30px; /* Page header */
gap: 20px;          /* Grid items */
```

---

## 🎯 Layout System

### Grid Layouts
```css
/* Dashboard Cards */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
gap: 20px;

/* Team Members */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 20px;
```

### Flexbox Patterns
```css
/* Navigation Layout */
display: flex;
align-items: center;
justify-content: space-between;

/* Centered Content */
display: flex;
align-items: center;
justify-content: center;
```

### Positioning
```css
/* Fixed Navigation */
position: fixed;
top: 0;
left: 0;
right: 0;
z-index: 1000;

/* Sidebar */
position: fixed;
top: 60px;
left: 0;
bottom: 0;
z-index: 900;
```

---

## 🔘 Component Styles

### Buttons
```css
/* Primary Button */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
border: none;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
transition: all 0.2s ease;

/* Secondary Button */
background: none;
border: none;
color: #999;
padding: 8px;
border-radius: 6px;
transition: background-color 0.2s ease;

/* Button Hover */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
```

### Cards
```css
/* Content Card */
background: white;
border-radius: 12px;
padding: 30px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
border: 1px solid #e5e7eb;

/* Dashboard Card */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 24px;
border-radius: 12px;
text-align: center;
```

### Forms
```css
/* Input Fields */
padding: 8px 12px;
border: 1px solid #d1d5db;
border-radius: 6px;
background: white;
color: #374151;

/* Labels */
display: block;
margin-bottom: 8px;
color: #374151;
font-weight: 500;
```

---

## 🎭 Animations & Transitions

### Standard Transitions
```css
/* Smooth transitions */
transition: all 0.2s ease;
transition: background-color 0.2s ease;
transition: filter 300ms;
transition: margin-left 0.3s ease;
```

### Hover Effects
```css
/* Logo hover effects */
filter: drop-shadow(0 0 2em #646cffaa);
filter: drop-shadow(0 0 2em #61dafbaa);
filter: drop-shadow(0 0 2em #9feaf9aa);

/* Button hover */
background: rgba(255, 255, 255, 0.1);
```

### Animations
```css
/* Logo spin animation */
@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Tooltip fade in */
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  /* Mobile-specific styles */
}

/* Tablet */
@media (max-width: 1024px) {
  /* Tablet-specific styles */
}
```

### Mobile Adaptations
```css
/* Sidebar becomes overlay on mobile */
.sidebar {
  transform: translateX(-100%);
}

/* Reduced padding on mobile */
padding: 20px 15px;
```

---

## 🔍 Shadows & Effects

### Box Shadows
```css
/* Subtle shadow for cards */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

/* Enhanced shadow for buttons */
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

/* Subtle elevation */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

### Backdrop Effects
```css
/* Glass effect */
backdrop-filter: blur(10px);

/* Electron drag region */
-webkit-app-region: drag;
-webkit-app-region: no-drag; /* For interactive elements */
```

---

## 🎨 Usage Guidelines

### Do's ✅
- Use the established color palette consistently
- Maintain the 4px spacing grid system
- Apply consistent border-radius (6px, 8px, 12px)
- Use the gradient for primary actions and branding
- Maintain proper contrast ratios for accessibility

### Don'ts ❌
- Don't introduce new colors without updating this guide
- Avoid inconsistent spacing that breaks the grid
- Don't use different border-radius values arbitrarily
- Avoid mixing different shadow styles
- Don't ignore mobile responsiveness

---

## 🛠 CSS Architecture

### File Structure
```
src/
├── index.css                     # Global styles and variables
├── App.css                       # App-specific styles
└── components/
    ├── TopNavigation.css         # Top navigation styles
    ├── Sidebar.css               # Sidebar navigation styles
    ├── MainContent.css           # Main content area styles
    └── DemoPage.css              # Demo page specific styles
```

### CSS Organization
1. **Global Styles** - Typography, colors, resets
2. **Layout Components** - Navigation, sidebar, main content
3. **UI Components** - Buttons, cards, forms
4. **Utility Classes** - Spacing, positioning helpers
5. **Responsive Styles** - Mobile and tablet adaptations

---

## 🎯 Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Focus states are clearly visible
- Interactive elements have sufficient contrast

### Interactive Elements
```css
/* Focus styles */
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

/* ARIA labels */
aria-label="Toggle sidebar"
title="Settings"
```

---

## 🚀 Future Enhancements

### Planned Improvements
- [ ] CSS custom properties for easier theming
- [ ] Dark mode support
- [ ] Animation performance optimizations
- [ ] Additional component variants
- [ ] Enhanced mobile experience

### Contributing
When adding new styles:
1. Follow the established patterns
2. Update this style guide
3. Test across different screen sizes
4. Ensure accessibility compliance
5. Maintain consistency with existing components

---

*This style guide is a living document. Update it whenever new design patterns or components are added to the application.*
