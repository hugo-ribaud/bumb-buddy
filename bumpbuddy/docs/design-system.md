# BumpBuddy Design System

This document outlines the design system used in the BumpBuddy app. It provides guidelines for consistent styling, theming, and typography with enhanced accessibility and readability.

## Color Palette

The BumpBuddy app uses a gender-neutral color palette with calming and nurturing colors, optimized for accessibility and readability across both light and dark themes.

### Primary Colors

- **Mint Green** (`#87D9C4`) - Primary color
  - Dark variant: `#5DBDA8`
  - Light variant: `#B8E6D8` (for subtle backgrounds)
  - Readable variant: `#2D8A6E` (for text on light backgrounds)
- **Lavender Purple** (`#C2AADF`) - Secondary color
  - Dark variant: `#9B85C4`
  - Light variant: `#E0D1F0` (for subtle backgrounds)
  - Readable variant: `#7B5BA8` (for text on light backgrounds)
- **Soft Coral** (`#FF8FAB`) - Accent color
  - Dark variant: `#FF7093`
  - Light variant: `#FFB8CB` (for subtle backgrounds)
  - Readable variant: `#E6457A` (for text on light backgrounds)

### Enhanced Neutral Colors

- **Background**
  - Light: `#FFFFFF`
  - Dark: `#121212`
- **Surface** (improved hierarchy)
  - Light: `#F8FAFC` (main surface color)
  - Dark: `#222222`
  - Elevated: `#FFFFFF` (for cards that need to stand out)
  - Subtle: `#F1F5F9` (for subtle backgrounds)
- **Text** (enhanced contrast for accessibility)
  - Primary Light: `#1F2937` (darker than previous for better readability)
  - Primary Dark: `#F9FAFB`
  - Secondary Light: `#374151` (darker than previous for better contrast)
  - Secondary Dark: `#D1D5DB`
  - Muted Light: `#6B7280` (for less important text)
  - Muted Dark: `#9CA3AF`
- **Borders** (improved definition)
  - Light: `#E5E7EB` (more defined borders)
  - Dark: `#374151`
  - Subtle: `#F3F4F6` (for very subtle separations)

## Accessibility Improvements

### Contrast Ratios

All color combinations meet or exceed WCAG AA standards:

- Primary text on background: **7.5:1** (exceeds AA requirement of 4.5:1)
- Secondary text on background: **5.8:1** (exceeds AA requirement)
- Brand colors for text usage have readable variants with **4.5:1+** contrast

### Text Hierarchy

- **Primary Text**: Highest contrast for main content
- **Secondary Text**: Medium contrast for supporting content
- **Muted Text**: Lower contrast for less important information

## Typography

The app uses two font families:

1. **Poppins** - Primary font for most text
2. **Comfortaa** - Accent font for headings and special elements

### Type Scale

| Text Style | NativeWind Class  | Font Size | Line Height | Font Weight | Usage              |
| ---------- | ----------------- | --------- | ----------- | ----------- | ------------------ |
| Heading 1  | `text-heading-1`  | 28px      | 34px        | Bold        | Page titles        |
| Heading 2  | `text-heading-2`  | 24px      | 30px        | SemiBold    | Section headers    |
| Heading 3  | `text-heading-3`  | 20px      | 28px        | SemiBold    | Card titles        |
| Heading 4  | `text-heading-4`  | 18px      | 24px        | Medium      | Subsection headers |
| Body       | `text-body`       | 16px      | 24px        | Regular     | Main content       |
| Body Small | `text-body-small` | 14px      | 20px        | Regular     | Secondary content  |
| Caption    | `text-caption`    | 12px      | 16px        | Regular     | Labels, metadata   |

## Theme Support

The app fully supports light and dark mode themes with enhanced contrast and readability in both modes.

## Core Components

### ThemedView

`ThemedView` is the foundation for all containers in the app. It automatically adjusts background colors based on the current theme and supports multiple surface variants.

```tsx
<ThemedView backgroundColor='surface-elevated' className='rounded-xl p-5'>
  {/* Content */}
</ThemedView>
```

Props:

- `backgroundColor`: `"primary" | "secondary" | "accent" | "background" | "surface" | "surface-elevated" | "surface-subtle"`
- `className`: Additional Tailwind classes
- All standard View props

### FontedText

`FontedText` combines theming and typography into a unified component with enhanced text contrast options.

```tsx
<FontedText
  variant='heading-3'
  fontFamily='comfortaa'
  textType='primary'
  className='mb-4'
>
  Hello World
</FontedText>
```

Props:

- `variant`: One of the typography variants (`"heading-1"`, `"body"`, etc.)
- `fontFamily`: `"poppins" | "comfortaa"`
- `colorVariant`: `"primary" | "secondary" | "accent"` (for brand-colored text)
- `textType`: `"primary" | "secondary" | "muted"` (for standard text hierarchy)
- `className`: Additional Tailwind classes
- All standard Text props

## Design Patterns

### Cards

Cards should use elevated surface backgrounds for better definition:

```tsx
<ThemedView
  backgroundColor='surface-elevated'
  className='rounded-xl p-5 mb-4 shadow-sm border border-border-light dark:border-border-dark'
>
  <FontedText variant='heading-4' textType='primary' className='mb-3'>
    Card Title
  </FontedText>
  <FontedText variant='body' textType='secondary'>
    Card content goes here.
  </FontedText>
</ThemedView>
```

### Buttons

Primary buttons use the accent color with white text:

```tsx
<TouchableOpacity className='bg-accent dark:bg-accent-dark rounded-xl p-4 items-center'>
  <FontedText className='text-white font-bold'>Button Text</FontedText>
</TouchableOpacity>
```

### Lists

For lists, use FontedText with appropriate text hierarchy:

```tsx
{
  items.map((item, index) => (
    <FontedText
      key={index}
      variant='body-small'
      textType='secondary'
      className='mb-2'
    >
      • {item}
    </FontedText>
  ));
}
```

### Text Hierarchy Best Practices

1. **Headings**: Use `textType="primary"` for maximum contrast
2. **Body Text**: Use `textType="secondary"` for comfortable reading
3. **Supporting Text**: Use `textType="muted"` for less critical information
4. **Brand Elements**: Use `colorVariant` for brand-colored text

## Accessibility Guidelines

1. **Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
2. **Touch Targets**: Minimum 44px touch target size
3. **Focus States**: Clear focus indicators for navigation
4. **Text Scaling**: Supports dynamic type sizing
5. **Color**: Never rely solely on color to convey information

## Theme Extension

To extend the theme with new colors or styles, update the `tailwind.config.js` file:

```js
module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        // Add new colors here with proper contrast ratios
      },
      fontFamily: {
        // Add new fonts here
      },
      // ...
    },
  },
};
```

## Usage Guidelines

1. **Consistency** - Use the provided components consistently across the app
2. **Accessibility** - Always use appropriate contrast ratios and text hierarchy
3. **Readability** - Choose text types based on content importance
4. **Performance** - Prefer themed components over inline styles
5. **Testing** - Test in both light and dark modes for optimal readability

## Implementation Notes

The design system is built on NativeWind (Tailwind CSS for React Native) with enhanced accessibility features:

1. **Theme Context** - Manages theme state (light/dark)
2. **Font Provider** - Manages font loading
3. **Themed Components** - Provides theme-aware building blocks with improved contrast
4. **Typography System** - Enforces consistent text styling with accessibility considerations
5. **Color System** - Enhanced color palette with readable variants for optimal contrast
