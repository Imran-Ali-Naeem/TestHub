# AetherTest Frontend

Standalone frontend application for AetherTest - Automated Testing Platform.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the frontend folder:
```bash
cd AetherTest-Frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Frontend

To start the development server on localhost:5000:

```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Features

- User authentication (Login/Sign Up)
- Admin Dashboard with user management
- Tester Dashboard for test execution
- Test suite creation and management
- Test execution monitoring
- Reports and analytics
- User profile management
- Search and filter capabilities

## Current Functionality

All features work independently with mock data:
- Login functionality with mock user data
- Dashboard navigation (Admin/Tester roles)
- Test suite listing and search
- User work history
- Search within tester's work
- All UI components and interactions

## Project Structure

```
AetherTest-Frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities and context
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── attached_assets/     # Generated images and assets
├── shared/              # Shared utilities and types
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Notes

- The frontend currently uses mock data for all API calls
- When connecting to a backend, update the API endpoints in components that make HTTP requests
- All data persists in localStorage for user profiles and settings
- Dark mode is available and automatically saved

## Connecting to Backend

To connect this frontend to your backend:

1. Identify API endpoints in the frontend code (look for fetch/axios calls)
2. Update the base URL to point to your backend server
3. Ensure CORS is properly configured on your backend
4. Test API integration with your backend server running

Enjoy building! 🚀
