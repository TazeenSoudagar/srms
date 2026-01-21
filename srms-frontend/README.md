# SRMS Frontend

React + TypeScript frontend for the Service Request Management System.

## Tech Stack

- **React 18+** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
VITE_API_BASE_URL=https://srms-backend.test/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Button, Input, Badge
│   ├── layout/      # Header, Sidebar, Layout
│   └── ui/          # Loading, Error, Success messages
├── features/        # Feature-based modules
│   ├── auth/        # Authentication
│   ├── serviceRequests/  # Service request management
│   ├── users/       # User management (Admin)
│   ├── comments/    # Comments feature
│   └── media/       # File attachments
├── services/        # API client layer
├── contexts/       # React Context (Auth)
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── routes/         # Route definitions
```

## Features

- ✅ OTP-based authentication
- ✅ Role-based access control (Admin, Support Engineer, Client)
- ✅ Service Request CRUD operations
- ✅ Comments on service requests
- ✅ File attachments
- ✅ User management (Admin only)
- ✅ Dashboard with statistics
- ✅ Responsive design

## Development Guidelines

- Follow React best practices and TypeScript strict mode
- Use Tailwind CSS for styling
- Components should be in PascalCase
- Use feature-based folder structure
- All API calls go through service layer
- Handle loading and error states properly
