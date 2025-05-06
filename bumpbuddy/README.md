# BumpBuddy

BumpBuddy is a comprehensive mobile application designed to support expectant mothers throughout their pregnancy journey. The app provides essential tools, information, and resources to help pregnant women navigate their pregnancy with confidence and ease.

## Features

- 🥗 **Food Safety Guide**: Comprehensive database of allowed and restricted foods during pregnancy
- 📅 **Pregnancy Timeline**: Week-by-week development tracker with milestones
- 🩺 **Health Tracker**: Monitor symptoms, kicks, and contractions
- 🏥 **Appointment Manager**: Schedule and manage prenatal visits
- 👤 **User Profiles**: Personalized experience based on due date and preferences

## Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Push Notifications**: Expo Notifications
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/bumpbuddy.git
   cd bumpbuddy
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server

   ```bash
   npm start
   ```

5. Follow the Expo CLI instructions to run on your device or emulator

## Project Structure

```
bumpbuddy/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── redux/            # Redux store, slices, and selectors
│   ├── services/         # API and service functions
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── config/           # App configuration
│   ├── assets/           # Images, fonts, etc.
│   └── types/            # TypeScript type definitions
├── assets/               # Static assets (Expo)
└── app.json              # Expo configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the healthcare professionals who provided guidance on pregnancy information
- Supabase for the backend infrastructure
- Expo team for making cross-platform development easier
