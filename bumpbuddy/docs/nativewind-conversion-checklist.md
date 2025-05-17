# NativeWind Conversion Checklist

This document tracks the progress of converting React Native components from StyleSheet to NativeWind styling.

## Components

### Basic Components

- [x] WeightChart
- [x] DirectionalView
- [x] LanguageSwitcher
- [x] ThemedView
- [x] ThemedText
- [x] FontedText
- [x] ThemeToggle
- [x] ThemedStatusBar
- [x] TypographyShowcase

### Screens

- [x] HomeScreen
- [x] TimelineScreen
- [x] WeekDetailScreen
- [x] FoodGuideScreen
- [x] HealthTrackerScreen
- [ ] AppointmentsScreen
- [ ] ProfileScreen
- [ ] AuthScreen

### Navigation

- [ ] RootNavigator (navigation/index.tsx)

## Design Pattern

The app uses a comprehensive styling approach with three layers:

1. **NativeWind/Tailwind** - Base styling system using utility classes
2. **Theme System** - Light/dark mode with color tokens (primary, secondary, accent)
3. **Typography System** - Font families and text variants

### Component Usage

When building UI components:

1. Use `ThemedView` for containers with theme-aware backgrounds
2. Use `FontedText` for text elements (combines theming and typography)
3. Use standard NativeWind utility classes for layout and spacing
4. Include `ThemedStatusBar` for proper status bar styling

## How to Convert a Component

1. Remove StyleSheet imports and StyleSheet.create objects
2. Replace `style={styles.xyz}` with `className="..."` using appropriate Tailwind classes
3. For dynamic styles, use template literals: `className={`base-classes ${condition ? 'conditional-class' : ''}`}`
4. For styles that can't be represented with Tailwind classes, keep them as inline styles: `style={{ customProperty: value }}`
5. Replace basic `View` components with `ThemedView` when appropriate
6. Replace basic `Text` components with `FontedText` when appropriate
7. Use the corresponding theme color tokens instead of hardcoded colors

## Common Tailwind Equivalents for React Native Styles

| React Native Style         | Tailwind Class   |
| -------------------------- | ---------------- |
| `flex: 1`                  | `flex-1`         |
| `flexDirection: 'row'`     | `flex-row`       |
| `justifyContent: 'center'` | `justify-center` |
| `alignItems: 'center'`     | `items-center`   |
| `margin: 10`               | `m-2.5`          |
| `padding: 10`              | `p-2.5`          |
| `backgroundColor: '#fff'`  | `bg-white`       |
| `fontWeight: 'bold'`       | `font-bold`      |
| `fontSize: 16`             | `text-base`      |

## Text Style Reference

Use these predefined text styles:

| Text Style | NativeWind Class  | Font Size | Line Height | Font Weight |
| ---------- | ----------------- | --------- | ----------- | ----------- |
| Heading 1  | `text-heading-1`  | 28px      | 34px        | Bold        |
| Heading 2  | `text-heading-2`  | 24px      | 30px        | SemiBold    |
| Heading 3  | `text-heading-3`  | 20px      | 28px        | SemiBold    |
| Heading 4  | `text-heading-4`  | 18px      | 24px        | Medium      |
| Body       | `text-body`       | 16px      | 24px        | Regular     |
| Body Small | `text-body-small` | 14px      | 20px        | Regular     |
| Caption    | `text-caption`    | 12px      | 16px        | Regular     |

## Progress Tracking

- Components Converted: 14
- Components Remaining: 4
- Conversion Progress: 77.8%
