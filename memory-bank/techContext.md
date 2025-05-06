# Technical Context: BumpBuddy

_Version: 1.0_
_Created: 2024-06-09_
_Last Updated: 2024-06-09_

## Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Push Notifications**: Expo Notifications
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions

## Development Environment Setup

```bash
# Install Node.js (v16+) and npm

# Install Expo CLI
npm install -g expo-cli

# Create project
npx create-expo-app bumpbuddy --template blank-typescript

# Navigate to project directory
cd bumpbuddy

# Install dependencies
npm install @reduxjs/toolkit react-redux
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @supabase/supabase-js
npm install expo-notifications
npm install react-native-safe-area-context
npm install react-native-gesture-handler
npm install expo-barcode-scanner
npm install expo-image-picker
npm install react-native-reanimated
npm install react-native-svg

# Install dev dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

## Dependencies

- **@reduxjs/toolkit**: ^2.0.0 - State management
- **react-redux**: ^8.1.0 - React bindings for Redux
- **@react-navigation/native**: ^6.1.0 - Navigation container
- **@react-navigation/stack**: ^6.3.0 - Stack navigation
- **@react-navigation/bottom-tabs**: ^6.5.0 - Tab navigation
- **@supabase/supabase-js**: ^2.20.0 - Supabase client
- **expo-notifications**: ^0.18.0 - Push notifications
- **react-native-safe-area-context**: ^4.5.0 - Safe area utilities
- **react-native-gesture-handler**: ^2.9.0 - Gesture handling
- **expo-barcode-scanner**: ^12.3.0 - Barcode scanning for food items
- **expo-image-picker**: ^14.1.0 - Image picking for profiles
- **react-native-reanimated**: ^2.14.0 - Animation library
- **react-native-svg**: ^13.9.0 - SVG support for charts and illustrations

## Technical Constraints

- Must maintain offline functionality for core features
- Must ensure data privacy and security for user health information
- Must be compatible with iOS 14+ and Android 9+
- Must follow accessibility guidelines for pregnant users
- User data storage must comply with relevant health data regulations

## Build and Deployment

- **Build Process**: Expo EAS Build
- **Deployment Procedure**:
  1. Configure app.json for both platforms
  2. Set up EAS build configuration
  3. Test on beta testers group via TestFlight/Firebase App Distribution
  4. Submit to App Store/Google Play through respective consoles
- **CI/CD**: GitHub Actions workflow for automated testing and building

## Testing Approach

- **Unit Testing**: Jest for testing individual components and Redux slices
- **Integration Testing**: React Testing Library for component integration tests
- **E2E Testing**: Detox for end-to-end testing on real devices or emulators
- **Manual Testing**: Focus on usability testing with actual expectant mothers

## Database Schema (Initial)

```
Users
  - id (UUID)
  - email (String)
  - created_at (Timestamp)
  - due_date (Date)
  - pregnancy_week (Integer)

Foods
  - id (UUID)
  - name (String)
  - category (String)
  - safety_rating (Enum: safe, caution, avoid)
  - description (Text)
  - alternatives (Text)

Appointments
  - id (UUID)
  - user_id (UUID, FK)
  - title (String)
  - date_time (Timestamp)
  - notes (Text)
  - reminder (Boolean)

Symptoms
  - id (UUID)
  - user_id (UUID, FK)
  - symptom_type (String)
  - severity (Integer)
  - date (Date)
  - notes (Text)

KickCounts
  - id (UUID)
  - user_id (UUID, FK)
  - start_time (Timestamp)
  - end_time (Timestamp)
  - count (Integer)
```

---

_This document describes the technologies used in the project and how they're configured._
