# CSS Architecture

This directory contains the organized CSS files for the Ground Truth Data Creator application.

## File Structure

### 📁 `index.css`
**Main entry point** - Imports all other CSS modules in the correct order.

### 📁 `base.css`
**Foundation styles:**
- HTML/body resets for full-screen layout
- Root element sizing
- Light/dark mode base classes
- Loading overlay styles

### 📁 `map.css`
**Map and Leaflet specific styles:**
- Leaflet container styling
- Map tiles and interactions
- Marker performance optimizations
- Dark mode map styling
- Leaflet control overrides

### 📁 `sidebar.css`
**Sidebar and layout styles:**
- Sidebar scrollbar customization
- Layout animations and transitions
- Point card highlighting effects
- Dark mode sidebar styling

### 📁 `components.css`
**Component-specific styles:**
- Settings panel styling
- Component hover effects
- Component-specific animations
- Dark mode component overrides

### 📁 `animations.css`
**Animation definitions:**
- Keyframe animations (point-added, pulse, slideDown)
- Marker animation classes
- Transition effects

### 📁 `antd-overrides.css`
**Ant Design component overrides:**
- Dark mode styling for Ant Design components
- Button, card, input, select customizations
- Typography and layout overrides

### 📁 `switches.css`
**Switch component styling:**
- Dark mode switch styling
- Circular handle fixes
- Color-specific switch classes (yellow, blue, green, purple)
- Switch state management

### 📁 `responsive.css`
**Responsive design:**
- Mobile breakpoints
- Tablet optimizations
- Responsive sidebar behavior

## Usage

Import the main stylesheet in your component:
```typescript
import './styles/index.css';
```

## CSS Class Naming Convention

- **Component classes:** `.component-name-element` (e.g., `.settings-panel`, `.point-card-highlighted`)
- **State classes:** `.state-name` (e.g., `.dark-mode`, `.loading-overlay`)
- **Animation classes:** `.animation-name` (e.g., `.marker-animation`)
- **Color-specific classes:** `.color-switch-color` (e.g., `.dark-switch-blue`)

## Dark Mode Implementation

Dark mode is implemented using the `.dark-mode` class applied to the root element. All dark mode styles use this class as a prefix:

```css
.dark-mode .component-name {
  /* Dark mode styles */
}
```

## Performance Considerations

- **Will-change properties** for animated elements
- **Backface-visibility** for 3D transforms
- **Transform-style** for hardware acceleration
- **Transition: none** during drag operations

## Maintenance

When adding new styles:
1. Choose the appropriate CSS file based on the style's purpose
2. Follow the existing naming conventions
3. Add dark mode variants when applicable
4. Consider responsive behavior
5. Update this README if adding new files
