# BumpBuddy Design System

This document outlines the design system used in the BumpBuddy app. It provides guidelines for consistent styling, theming, and typography.

## Color Palette

The BumpBuddy app uses a gender-neutral color palette with calming and nurturing colors:

### Primary Colors

- **Mint Green** (`#87D9C4`) - Primary color
  - Dark variant: `#5DBDA8`
- **Lavender Purple** (`#C2AADF`) - Secondary color
  - Dark variant: `#9B85C4`
- **Soft Coral** (`#FF8FAB`) - Accent color
  - Dark variant: `#FF7093`

### Neutral Colors

- **Background**
  - Light: `#FFFFFF`
  - Dark: `#121212`
- **Surface**
  - Light: `#F5F8FA`
  - Dark: `#222222`
- **Text**
  - Primary Light: `text-gray-800`
  - Primary Dark: `text-gray-50`
  - Secondary Light: `text-gray-600`
  - Secondary Dark: `text-gray-300`

## Typography

The app uses two font families:

1. **Poppins** - Primary font for most text
2. **Comfortaa** - Accent font for headings and special elements

### Type Scale

| Text Style | NativeWind Class  | Font Size | Line Height | Font Weight |
| ---------- | ----------------- | --------- | ----------- | ----------- |
| Heading 1  | `text-heading-1`  | 28px      | 34px        | Bold        |
| Heading 2  | `text-heading-2`  | 24px      | 30px        | SemiBold    |
| Heading 3  | `text-heading-3`  | 20px      | 28px        | SemiBold    |
| Heading 4  | `text-heading-4`  | 18px      | 24px        | Medium      |
| Body       | `text-body`       | 16px      | 24px        | Regular     |
| Body Small | `text-body-small` | 14px      | 20px        | Regular     |
| Caption    | `text-caption`    | 12px      | 16px        | Regular     |

## Theme Support

The app fully supports light and dark mode themes, adapting all colors to maintain proper contrast and readability.

## Core Components

### ThemedView

`ThemedView` is the foundation for all containers in the app. It automatically adjusts background colors based on the current theme.

```tsx
<ThemedView backgroundColor="surface" className="rounded-xl p-5">
  {/* Content */}
</ThemedView>
```

Props:

- `backgroundColor`: `"primary" | "secondary" | "accent" | "background" | "surface"`
- `className`: Additional Tailwind classes
- All standard View props

### FontedText

`FontedText` combines theming and typography into a unified component. It should be used for all text in the app.

```tsx
<FontedText
  variant="heading-3"
  fontFamily="comfortaa"
  colorVariant="primary"
  className="mb-4"
>
  Hello World
</FontedText>
```

Props:

- `variant`: One of the typography variants (`"heading-1"`, `"body"`, etc.)
- `fontFamily`: `"poppins" | "comfortaa"`
- `colorVariant`: `"primary" | "secondary" | "accent"`
- `textType`: `"primary" | "secondary"` (for default text colors)
- `className`: Additional Tailwind classes
- All standard Text props

## Design Patterns

### Cards

Cards should use the `surface` background color and have rounded corners with subtle shadows:

```tsx
<ThemedView backgroundColor="surface" className="rounded-xl p-5 mb-4 shadow-sm">
  <FontedText variant="heading-4" colorVariant="primary" className="mb-3">
    Card Title
  </FontedText>
  <FontedText variant="body">Card content goes here.</FontedText>
</ThemedView>
```

### Buttons

Primary buttons use the accent color with white text:

```tsx
<TouchableOpacity className="bg-accent dark:bg-accent-dark rounded-xl p-4 items-center">
  <FontedText className="text-white font-bold">Button Text</FontedText>
</TouchableOpacity>
```

### Lists

For lists, use FontedText with bullet points:

```tsx
{
  items.map((item, index) => (
    <FontedText key={index} variant="body-small" className="mb-2">
      • {item}
    </FontedText>
  ));
}
```

## Theme Extension

To extend the theme with new colors or styles, update the `tailwind.config.js` file:

```js
module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        // Add new colors here
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
2. **Accessibility** - Ensure proper contrast between text and backgrounds
3. **Responsiveness** - Use flexible layouts that adapt to different screen sizes
4. **Performance** - Prefer styled components over inline styles for better performance

## Implementation Notes

The design system is built on NativeWind (Tailwind CSS for React Native). It provides:

1. **Theme Context** - Manages theme state (light/dark)
2. **Font Provider** - Manages font loading
3. **Themed Components** - Provides theme-aware building blocks
4. **Typography System** - Enforces consistent text styling
