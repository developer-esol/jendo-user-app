# Jendo Health App - React Native Application

## Overview
The Jendo Health App is a comprehensive React Native cardiovascular health management application using Expo Router. Its purpose is to provide users with tools for health monitoring, integration with Jendo device tests, medical record management, AI-powered wellness recommendations, a doctors' directory with appointment booking, and user profile management. The project aims to deliver a seamless and intuitive experience for managing cardiovascular health.

## User Preferences
- Clean, organized code structure
- Feature-based folder organization
- Dummy data in API files for easy backend swapping
- Purple/violet healthcare-focused color palette (from Figma)
- Figma design specifications as source of truth
- Centralized styles in component folders for maintainability

## System Architecture
The application is built with React Native and Expo, utilizing Expo Router for file-based navigation and Zustand for state management. Data fetching and caching are handled by Axios and TanStack React Query, respectively. UI components are built using React Native Paper, with local data storage managed by Expo SQLite (with AsyncStorage fallback for web). Form validation is implemented using Yup.

**UI/UX Design:** The application adheres to a Figma-based purple/violet theme.
- **Primary Color**: `#7B2D8E` (Purple/Violet)
- **Secondary Color**: `#C84B96` (Pink)
- **Accent Light**: `#F3E5F5`
- **Background**: `#F7F7F9`
- **Themed Components**: Consistent purple-themed elements are used across authentication flows, dashboard, wellness sections, doctors directory, and user profile. This includes circular backgrounds for active tab icons, heart logos, and specific color usage for risk levels (Low: green, Moderate: orange, High: red).

**Technical Implementations & Features:**
- **Authentication**: Includes Login, Sign Up, Forgot Password, OTP verification, and social login options.
- **Home Dashboard**: Features a personalized greeting, profile completion progress, Jendo Risk Level card, health statistics, and quick action reminders.
- **Jendo Test Reports**: Displays a list of test results with risk indicators and detailed views including ECG data, with filtering and search capabilities.
- **Medical Records**: Supports folder-based organization for various record types (Lab Results, Prescriptions, Imaging) with file upload and nested navigation (e.g., My Reports -> Diabetes -> Core Investigations -> HbA1c Records -> Add Record).
- **Wellness**: Offers categorized tips, learning materials, and an AI Health Assistant chatbot.
- **Doctors Directory**: Provides search, specialization filters, doctor profiles, and complete appointment booking flow (book -> confirm -> payment -> confirmation -> My Appointments).
- **My Appointments**: Displays upcoming and past appointments with doctor info, dates, consultation types, locations, booking IDs, and reschedule/cancel actions.
- **User Profile**: Manages personal info, health parameters, preferences, and account settings.
- **Notifications**: Displays a list of notifications with read/unread status.
- **Navigation**: Uses a 6-tab bottom navigation for core features: Home, Jendo, Reports, Wellness, Doctors, Profile.
- **Centralized Styles**: Styles are organized into dedicated files (`styles.ts`) within feature modules for maintainability.

**System Design Choices:**
- **Clean Architecture**: Organized into feature modules (`src/features/`) for clear separation of concerns.
- **API Integration Pattern**: Designed for easy switching between dummy data and real backend API calls using a consistent `httpClient` and `ENDPOINTS` configuration.
- **Expo Compatibility**: Specific configurations in `metro.config.js` and `babel.config.js` resolve `import.meta` issues for Zustand on Expo Web and ensure proper font loading for Replit previews.
- **Centralized Styling Architecture**: All feature modules follow a consistent pattern where styles are defined in `components/styles.ts` and exported via `components/index.ts`. Screen files import styles from `../components` keeping screen logic clean and focused. Styles are named exports (e.g., `authStyles`, `wellnessStyles`, `doctorsStyles`, `medicalRecordsStyles`, `jendoStyles`).

## External Dependencies
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **API Client**: Axios
- **Data Caching**: TanStack React Query
- **UI Components**: React Native Paper
- **Local Database**: Expo SQLite (with AsyncStorage fallback for web)
- **Validation**: Yup
- **Storage**: AsyncStorage
- **Figma**: Used for design specifications and color palette.