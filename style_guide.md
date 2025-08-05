# Runner App Style Guide

This document defines the universal styling standards for the Runner community app to ensure consistency across all pages and components.

## Design Principles

### Simplicity First
- Use clean, minimal designs with plenty of white space
- Avoid excessive animations and color variations
- Focus on functionality over flashy visuals
- Maintain consistent spacing and alignment

### Mobile-First Approach
- Design for mobile devices first
- Ensure 44px minimum touch targets
- Use responsive layouts that work on all screen sizes
- Consider thumb-reach zones for navigation

## Color Palette

### Primary Colors
- **Blue Primary**: `bg-blue-600` / `text-blue-600` - Main brand color for buttons and highlights
- **Blue Hover**: `bg-blue-700` / `text-blue-700` - Hover states for primary elements
- **Blue Light**: `bg-blue-50` / `text-blue-50` - Light backgrounds and text on dark surfaces

### Neutral Colors
- **Gray Dark**: `text-gray-900` - Primary text content
- **Gray Medium**: `text-gray-700` - Secondary text, labels
- **Gray Light**: `text-gray-600` - Tertiary text, descriptions
- **Gray Lighter**: `text-gray-500` - Placeholder text, disabled states
- **Background Light**: `bg-gray-50` - Light background sections
- **Border**: `border-gray-200` - Standard borders

### Status Colors
- **Success**: `bg-green-600` / `text-green-600` - Success states, completed actions
- **Warning**: `bg-yellow-600` / `text-yellow-600` - Warnings, pending states
- **Error**: `bg-red-600` / `text-red-600` - Errors, failed actions

## Typography

### Font Sizes and Weights
- **Page Title**: `text-2xl font-bold` - Main page headings
- **Section Title**: `text-xl font-semibold` - Section headings
- **Subsection**: `text-lg font-medium` - Subsection headings
- **Body Text**: `text-base` - Default body text
- **Small Text**: `text-sm` - Supporting text, descriptions
- **Tiny Text**: `text-xs` - Labels, captions

### Text Colors
- Use `text-gray-900` for primary content
- Use `text-gray-700` for labels and secondary content
- Use `text-gray-600` for descriptions and tertiary content
- Use `text-gray-500` for placeholder text and hints

## Components

### Buttons

#### Primary Button
```jsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
  Primary Action
</Button>
```

#### Secondary Button
```jsx
<Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
  Secondary Action
</Button>
```

#### Disabled State
```jsx
<Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
  Disabled
</Button>
```

### Form Elements

#### Input Fields
```jsx
<Input className="focus:border-blue-500" placeholder="Enter text..." />
```

#### Labels
```jsx
<Label className="text-gray-700 font-medium">Field Label</Label>
```

#### Help Text
```jsx
<p className="text-xs text-gray-500 mt-1">Helpful description</p>
```

### Cards

#### Standard Card
```jsx
<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  Card content
</div>
```

#### Info Card
```jsx
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  Informational content
</div>
```

### Status Indicators

#### Success State
```jsx
<div className="bg-green-50 border border-green-200 rounded-lg p-3">
  <div className="flex items-center space-x-2">
    <CheckCircle className="h-5 w-5 text-green-600" />
    <p className="text-sm font-medium text-green-800">Success message</p>
  </div>
</div>
```

#### Error State
```jsx
<div className="bg-red-50 border border-red-200 rounded-lg p-3">
  <p className="text-sm text-red-600">Error message</p>
</div>
```

#### Loading State
```jsx
<div className="text-center py-4">
  <Loader2 className="h-6 w-6 text-blue-600 mx-auto animate-spin" />
  <p className="text-sm text-gray-600">Loading...</p>
</div>
```

## Layout and Spacing

### Container Widths
- Use consistent max-width containers for mobile-first design
- Standard padding: `p-4` or `p-6` for main content areas
- Card padding: `p-4` for most cards, `p-6` for forms

### Spacing Scale
- **Tiny**: `space-y-1` / `gap-1` - Very tight spacing
- **Small**: `space-y-2` / `gap-2` - Form field spacing
- **Medium**: `space-y-4` / `gap-4` - Section spacing
- **Large**: `space-y-6` / `gap-6` - Page section spacing
- **Extra Large**: `space-y-8` / `gap-8` - Major section breaks

### Grid and Flexbox
- Use `flex` and `grid` for responsive layouts
- Standard item spacing: `space-x-2` or `space-x-3`
- Grid gaps: `gap-3` or `gap-4`

## Icons

### Usage Guidelines
- Use Lucide React icons consistently
- Standard sizes: `h-4 w-4`, `h-5 w-5`, `h-6 w-6`
- Color icons to match text color: `text-gray-600`, `text-blue-600`, etc.
- Use semantic icons (CheckCircle for success, AlertCircle for warnings)

### Common Icons
- **Actions**: Plus, Edit, Trash2, MoreHorizontal
- **Status**: CheckCircle, AlertCircle, X, Loader2
- **Navigation**: ChevronLeft, ChevronRight, ArrowLeft
- **UI**: MapPin, Clock, DollarSign, User

## Animations

### Keep It Simple
- Use subtle transitions only where they enhance UX
- Prefer CSS transitions over complex animations
- Standard duration: `transition-all duration-200`
- Loading states: Use `animate-spin` for spinners

### Motion Guidelines
- Fade in: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
- Slide up: `initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`
- Keep transition duration under 0.3s for responsiveness

## Mobile Considerations

### Touch Targets
- Minimum 44px height for buttons and interactive elements
- Use `py-3` for buttons to ensure adequate touch area
- Provide enough spacing between interactive elements

### Safe Areas
- Account for device notches and rounded corners
- Use appropriate padding on screen edges
- Test on various device sizes

### Performance
- Minimize heavy animations on mobile
- Use CSS transforms over JavaScript animations
- Optimize images and icons for mobile bandwidth

## Dark Mode (Future Consideration)

While not currently implemented, the color system should support dark mode:
- Use CSS variables for colors
- Maintain contrast ratios for accessibility
- Test all status colors in dark mode

## Accessibility

### Color Contrast
- Ensure WCAG AA compliance for all text/background combinations
- Don't rely solely on color to convey information
- Use proper semantic HTML elements

### Focus States
- Maintain visible focus indicators
- Use `focus:border-blue-500` for form elements
- Ensure keyboard navigation works throughout the app

## Common Patterns

### Page Headers
```jsx
<div className="rounded-lg bg-blue-600 p-6 text-white">
  <div className="flex items-center justify-center mb-3">
    <div className="bg-white/20 rounded-full p-3 mr-3">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h1 className="text-2xl font-bold">Page Title</h1>
      <p className="text-blue-100">Description</p>
    </div>
  </div>
</div>
```

### Form Sections
```jsx
<div className="space-y-2">
  <Label className="text-gray-700 font-medium">Field Label</Label>
  <Input className="focus:border-blue-500" />
  <p className="text-xs text-gray-500">Help text</p>
</div>
```

### Lists
```jsx
<div className="space-y-3">
  {items.map(item => (
    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
      List item content
    </div>
  ))}
</div>
```

## Implementation Notes

- Always use Tailwind CSS classes over custom CSS
- Maintain consistent component structure across pages
- Test all changes on mobile devices
- Follow the established patterns for new features
- Update this guide when introducing new patterns

## Review Process

- All new designs should reference this guide
- Updates to the style guide require team review
- Regular audits to ensure consistency across the app
- Document any deviations and their justifications

---

*Last updated: Current implementation (Post-task page redesign)*
*Next review: When implementing new major features*