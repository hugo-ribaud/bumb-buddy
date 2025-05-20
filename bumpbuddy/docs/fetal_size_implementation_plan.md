# Fetal Size Comparison Feature - Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the fetal size comparison feature that enhances the pregnancy timeline with visual fruit comparisons.

## Implementation Steps

### 1. Database Setup (Done)

- [x] Create `fetal_size_comparisons.sql` migration file
- [x] Define table schema with size measurements and fruit references
- [x] Create RLS policies for secure access
- [x] Populate table with initial data (weeks 5-40)
- [x] Create migration to link `pregnancy_weeks` table to `fetal_size_comparisons`

### 2. Types and Service Layer (Done)

- [x] Create TypeScript interface for the fetal size data
- [x] Implement service for fetching and caching data
- [x] Add proper error handling and offline support

### 3. Redux Integration (Done)

- [x] Create `fetalSizeSlice.ts` with actions and reducers
- [x] Implement async thunks for data fetching
- [x] Add selectors for accessing state
- [x] Update Redux store to include the new slice

### 4. UI Components (Done)

- [x] Create reusable `FetalSizeComparison` component
- [x] Support both compact view (timeline cards) and detailed view (week detail)
- [x] Implement unit toggle component for switching between metric and imperial
- [x] Add proper accessibility attributes

### 5. Internationalization (Done)

- [x] Add translation keys for English
- [x] Add translation keys for other supported languages (later)

### 6. Image Generation and Storage (TODO)

- [ ] Use DALL-E to generate fruit comparison images
- [ ] Process images for consistency and transparency
- [ ] Create appropriate folder structure in Supabase Storage
- [ ] Upload images and organize by week number
- [ ] Update database with image URLs

### 7. Integration with Existing Screens (TODO)

- [ ] Update TimelineScreen to include fruit comparisons in week cards
- [ ] Enhance WeekDetailScreen with detailed size comparison component
- [ ] Add unit toggle to relevant settings screens

### 8. Testing (TODO)

- [ ] Write unit tests for service and Redux slice
- [ ] Test UI components across different device sizes
- [ ] Verify correct handling of offline mode
- [ ] Test unit switching functionality
- [ ] Ensure proper dark mode support

## DALL-E Image Generation Process

1. **Preparation**

   - Review `fetal_size_comparison_prompts.md` for prompt templates
   - Prepare folder structure for organizing generated images

2. **Generation Workflow**

   - Generate images in batches with consistent styling
   - Start with early weeks (5-10) and evaluate style
   - Adjust prompts if needed to maintain consistency
   - Continue with remaining weeks (11-40)

3. **Post-Processing**

   - Verify transparent backgrounds on all images
   - Ensure consistent sizing and style
   - Optimize for mobile display (file size, dimensions)
   - Create thumbnails for timeline cards

4. **Upload Process**
   - Create 'fetal_size' bucket in Supabase Storage
   - Organize in folders by week number
   - Use consistent naming: 'week_XX_fruit_name.png'
   - Update database with correct URLs

## Database URLs Structure

After uploading, the URLs in the database should follow this pattern:

```
https://[project-ref].supabase.co/storage/v1/object/public/fetal_size/week_05_sesame_seed.png
```

## Timeline Integration Details

1. **TimelineScreen.tsx**

   - Add `FetalSizeComparison` inside week item cards
   - Load with compact mode enabled
   - Position between week header and week description
   - Handle loading state appropriately

2. **WeekDetailScreen.tsx**
   - Add detailed `FetalSizeComparison` component at top of content
   - Include unit toggle option
   - Ensure responsive layout works in both orientations

## Usage Examples

### Basic Component Usage

```jsx
// Compact version for timeline
<FetalSizeComparison
  sizeData={weekData.fetalSize}
  loading={loading}
  compact
/>

// Detailed version for week detail
<FetalSizeComparison
  sizeData={weekData.fetalSize}
  loading={loading}
/>
```

### With Unit Toggle

```jsx
<View>
  <FetalSizeComparison sizeData={weekData.fetalSize} loading={loading} />
  <UnitToggle />
</View>
```

## Resources

- Prompts: `bumpbuddy/docs/fetal_size_comparison_prompts.md`
- Database schema: `bumpbuddy/docs/fetal_size_comparison_database.md`
- Redux implementation: `bumpbuddy/docs/fetal_size_redux_implementation.md`
- UI components: `bumpbuddy/docs/fetal_size_ui_components.md`
