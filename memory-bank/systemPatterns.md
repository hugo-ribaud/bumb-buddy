# System Patterns: BumpBuddy

_Version: 1.0_
_Created: 2024-06-09_
_Last Updated: 2024-06-09_

## Architecture Overview

BumpBuddy follows a modern client-server architecture using React Native for the mobile client and Supabase as the backend service. The application implements a hybrid offline-first approach, allowing core functionality to work without an internet connection while syncing data when connectivity is restored. Supabase Realtime is enabled and implemented for live updates, providing immediate feedback when data changes.

## Key Components

### Frontend Components

- **Auth Module**: Handles user authentication, registration, and profile management
- **Food Safety Module**: Manages the food database, search, and filtering capabilities
- **Pregnancy Tracker**: Tracks pregnancy progress, fetal development, and provides weekly updates
- **Health Module**: Contains symptom tracker, kick counter, and contraction timer
- **Appointment Manager**: Handles scheduling, reminders, and medical visit tracking
- **Settings & Preferences**: Manages user preferences and app configuration

### Backend Components

- **Supabase Auth**: Handles user authentication and session management
- **PostgreSQL Database**: Stores all application data with proper relations
- **Supabase Storage**: Manages user-uploaded images and media
- **Supabase Functions**: Handles server-side logic and scheduled tasks
- **Supabase Realtime**: Provides real-time updates for collaborative features and live data synchronization

## Design Patterns in Use

- **Redux Pattern**: Centralized state management using Redux Toolkit
- **Repository Pattern**: Abstraction layer over data sources (API, localStorage)
- **Provider Pattern**: Context providers for theme, authentication, and configurations
- **Container/Presentational Pattern**: Separation of logic and UI components
- **Observer Pattern**: For real-time updates and notifications via Supabase Realtime subscriptions
- **Strategy Pattern**: For flexible feature implementations based on user preferences
- **Adapter Pattern**: For handling offline/online mode transitions seamlessly
- **Service Pattern**: Used for Realtime subscriptions, abstracted in `realtimeService.ts`

## Data Models and Relationships

### Core Data Models

1. **User Model**

   - Central entity representing the pregnant user
   - Connected to all personal data (health logs, appointments, etc.)
   - Stores pregnancy details (due date, week) and app preferences

2. **Food Safety System**

   - Two-tiered structure with categories and individual foods
   - Enumerated safety ratings (safe, caution, avoid)
   - Rich text descriptions and nutritional data in JSON format

3. **Health Tracking Models**

   - Multiple specialized trackers (symptoms, kicks, contractions, weight)
   - Consistent user linking and timestamp patterns
   - Severity scales for comparative analysis

4. **Appointment System**

   - Date-time based events with reminder capabilities
   - Location and notes for comprehensive planning
   - Integration with device calendar planned

5. **Pregnancy Journey**
   - Reference data for fetal development by week
   - Curated content for each stage of pregnancy
   - Personal journal entries linked to pregnancy weeks

### Database Relationships

```mermaid
flowchart TD
    User[User] --- Profile[Profile Info]
    User --- Settings[App Settings]
    User --> Health[Health Data]
    User --> Calendar[Calendar Events]
    User --> Journal[Personal Journal]

    Health --> Symptoms[Symptom Tracker]
    Health --> Kicks[Kick Counter]
    Health --> Contractions[Contraction Timer]
    Health --> Weight[Weight Tracker]

    Calendar --> Appointments[Medical Appointments]
    Calendar --> Reminders[Health Reminders]

    FoodDB[Food Database] --> Categories[Food Categories]
    Categories --> Foods[Food Items]
    Foods --> SafetyInfo[Safety Ratings]

    PregnancyData[Pregnancy Data] --> WeeklyInfo[Weekly Development]
    WeeklyInfo --> FetalDev[Fetal Development]
    WeeklyInfo --> MaternalChanges[Maternal Changes]
    WeeklyInfo --> Tips[Health Tips]
```

## Data Flow

```mermaid
flowchart TD
    User[User Interaction] --> UI[UI Components]
    UI --> Actions[Redux Actions]
    Actions --> Thunks[Thunk Middleware]

    Thunks --> Online{Online?}
    Online -->|Yes| API[API Service]
    Online -->|No| LocalCache[Local Cache]

    API --> Supabase[Supabase]
    Supabase --> Database[(PostgreSQL)]

    Supabase -->|Realtime| RealtimeService[Realtime Service]
    RealtimeService --> Actions

    API --> Reducer[Redux Reducer]
    LocalCache --> Reducer

    Reducer --> Store[Redux Store]
    Store --> UI

    LocalCache -.-> SyncQueue[Sync Queue]
    SyncQueue -.-> API
```

## Data Access Patterns

1. **Authentication-Based Isolation**

   - Row-Level Security (RLS) enforces data ownership
   - All user-specific tables include RLS policies that check `auth.uid() = user_id`
   - Prevents unauthorized access to sensitive health information

2. **Reference Data Access**

   - Food database and pregnancy information are read-only for all users
   - No user-specific preferences or modifications stored in reference tables
   - Common data shared across all users to reduce duplication

3. **Offline Data Persistence**

   - Local-first operations with optimistic UI updates
   - Data changes stored in AsyncStorage during offline periods
   - Background synchronization when connectivity resumes

4. **Real-time Data Updates**
   - Realtime subscriptions for personal data changes
   - Immediate UI reflection of database changes
   - Subscription management abstracted behind realtimeService

## Key Technical Decisions

- **Cross-Platform Framework**: React Native + Expo chosen for faster development across iOS and Android
- **Backend as a Service**: Supabase selected for its PostgreSQL foundation, real-time capabilities, and open-source nature
- **Offline Support**: Implementation of local storage with IndexedDB through AsyncStorage and custom sync mechanisms
- **State Management**: Redux Toolkit for predictable state management and easier debugging
- **Navigation**: React Navigation for intuitive user flow and deep linking support
- **Testing Strategy**: Jest and React Testing Library for comprehensive test coverage
- **Realtime Implementation**: Supabase Realtime enabled with Metro bundler workarounds for Expo compatibility
- **Database Schema**: Structured with a focus on security, flexibility, and future extensibility

## Component Relationships

### Authentication Flow

1. User enters credentials in Auth screen
2. Auth actions dispatch to Redux
3. Supabase client attempts authentication
4. On success, JWT stored securely and user profile loaded
5. App state updated to reflect authenticated status

### Data Synchronization Flow

1. Data changes stored in local Redux store immediately
2. Changes also written to AsyncStorage for offline persistence
3. If online, changes sent to Supabase immediately
4. If offline, changes queued for synchronization
5. When connection restored, queued changes sent to server
6. Conflict resolution strategy applied if server has newer data

### Realtime Update Flow

1. Component mounts and subscribes to relevant channel/table
2. Supabase Realtime listens for PostgreSQL changes
3. When database change occurs, Realtime notifies subscribed clients
4. React component receives update and dispatches Redux action
5. Redux store updates with new data
6. UI automatically re-renders with latest data

### Feature Module Relationships

- **Auth Module** provides user context to all other modules
- **Pregnancy Tracker** informs content in Health Module
- **Food Safety** and **Health Module** share nutrition-related data
- **Appointment Manager** integrates with device calendar and notifications
- **Settings & Preferences** affects behavior across all modules

## Security Considerations

- Sensitive health data encrypted at rest
- Authentication using JWT with secure storage
- Row-level security in Supabase for data isolation
- Regular security audits and vulnerability testing
- Compliance with health data regulations

---

_This document captures the system architecture and design patterns used in the project._
