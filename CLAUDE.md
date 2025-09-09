# Anaesthesia Management System - CLAUDE Context

## Project Overview

**Name**: Anaesthesia Management System  
**Purpose**: A comprehensive management system for anaesthesiologists across Sri Lankan hospitals  
**Version**: 0.1.0  
**Current Phase**: Phase 1 (Admin-only access)

### Technology Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Key Features

### Current (Phase 1)
- **Admin-only access**: Only users with ADMIN role can access the system
- **Hospital Management**: Full CRUD operations for hospitals across Sri Lanka
- **People Management**: Manage anaesthesiologists with paginated views
- **Real-time data**: Firebase Firestore integration with contexts for data management

### Planned (Future Phases)
- Hospital leads with restricted access to their hospital data
- Member-level access for individual anaesthesiologists

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main application interface
│   │   ├── hospitals/     # Hospital management page
│   │   ├── people/        # People management page
│   │   └── reports/       # Reports page
│   ├── login/            # Authentication page
│   ├── register/         # Registration page (future)
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page (redirects to dashboard/login)
├── components/
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── tables/           # Table components
│   └── ui/               # Radix UI components
├── contexts/
│   ├── AuthContext.tsx   # Authentication state management
│   └── DataContext.tsx   # Data state management (hospitals, people)
├── hooks/                # Custom React hooks
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   └── validations/      # Zod validation schemas
└── types.ts              # TypeScript type definitions
```

## Data Models

### User
- `uid`: Firebase Auth UID
- `email`: User email
- `role`: 'ADMIN' | 'HOSPITAL_LEAD' | 'MEMBER' (Phase 1: ADMIN only)
- `hospitalId`: Associated hospital (for non-admin users)
- `isActive`: Account status

### Hospital
- `name`: Hospital name
- `province`: Sri Lankan province
- `district`: District within province
- `type`: Hospital type (21 different types defined)
- `allocation`: Government allocated positions
- `location`: Optional GPS coordinates
- CRUD timestamps

### Person (Anaesthesiologist)
- Personal info: names, SLMC number, contact details
- Career info: current hospital, grade (MO/REGISTRAR/SENIOR_REGISTRAR/CONSULTANT)
- `timeline`: Career history with hospital transfers
- `trainings`: Training records with credentials
- `documents`: File attachments
- CRUD timestamps

### Enums
- **Grade**: 'MO' | 'REGISTRAR' | 'SENIOR_REGISTRAR' | 'CONSULTANT'
- **HospitalType**: 21 types including teaching hospitals, base hospitals, etc.
- **Role**: 'ADMIN' | 'HOSPITAL_LEAD' | 'MEMBER'
- **Gender**: 'MALE' | 'FEMALE'

## Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

## Configuration

### Environment Variables (.env.local)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Services
- **Authentication**: Email/password with admin role verification
- **Firestore**: Collections for users, hospitals, people
- **Storage**: For document uploads (configured but not yet used)

## Authentication Flow

1. User visits home page (`/`)
2. Redirected to `/login` if not authenticated
3. Login validates against Firebase Auth
4. User document fetched from Firestore to verify ADMIN role
5. Only active ADMIN users can access the system
6. Successful login redirects to `/dashboard`

## State Management

### AuthContext
- Manages user authentication state
- Handles login/logout operations
- Verifies admin role and active status

### DataContext
- Manages hospitals and people data
- Provides CRUD operations for both entities
- Implements pagination for people (10 per page)
- Real-time updates to local state after operations

## Key Dependencies

### Core
- `next`: 15.5.2
- `react`: 19.1.0
- `typescript`: ^5
- `firebase`: ^12.2.1

### UI & Forms
- `@radix-ui/react-*`: Various UI primitives
- `react-hook-form`: ^7.62.0
- `@hookform/resolvers`: ^5.2.1
- `zod`: ^4.1.5
- `tailwindcss`: ^4
- `lucide-react`: ^0.542.0

### Utilities
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^3.3.1

## Development Notes

- Currently in Phase 1 with admin-only access
- Uses Firebase project: "coaisl-management-system"
- Middleware configured at `src/middleware.ts`
- All components use TypeScript with strict typing
- Tailwind CSS for styling with custom component variants
- ESLint configured with Next.js rules

## Important Files to Know

- `src/types.ts`: All TypeScript interfaces and types
- `src/contexts/AuthContext.tsx`: Authentication logic
- `src/contexts/DataContext.tsx`: Data operations and pagination
- `src/lib/firebase.ts`: Firebase configuration and initialization
- `src/app/layout.tsx`: Root layout with providers
- `package.json`: Dependencies and scripts

## Testing & Linting

- ESLint configured via `eslint.config.mjs`
- No test framework currently configured
- TypeScript strict mode enabled in `tsconfig.json`