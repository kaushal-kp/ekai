# EKAI MVP - React Frontend

Complete production-quality React frontend for EKAI MVP (Student Hub + School Hub).

## Features

### Student Hub
- Dashboard with overview stats and recent grades
- Academics page with GPA tracking and assessments
- Attendance calendar with monthly tracking
- Document management with DigiLocker integration
- APAAR consent management
- Profile management
- Notifications system

### School Hub
- Dashboard with attendance trends and quick actions
- Student roster management with filtering
- Student detail pages with academic summaries
- Teacher management
- **Offline-supported** attendance marking with IndexedDB sync
- Assessment creation and grade entry
- Calendar with event management
- Reports generation (attendance, academic performance)
- School settings and APAAR integration status

## Tech Stack

- **React 18** with Vite for fast development
- **React Router v6** for navigation
- **TailwindCSS** for responsive styling
- **Axios** for API calls
- **React Query** (@tanstack/react-query) for data fetching and caching
- **Zustand** for state management
- **React Hook Form** for form validation
- **Lucide React** for icons
- **date-fns** for date manipulation
- **Vite PWA Plugin** for offline support

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_SYNC=true
```

## Project Structure

```
src/
├── components/shared/       # Reusable components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── BottomNav.jsx
│   ├── Card.jsx
│   ├── DataTable.jsx
│   ├── Modal.jsx
│   ├── StatusBadge.jsx
│   ├── LoadingSpinner.jsx
│   ├── EmptyState.jsx
│   ├── ProtectedRoute.jsx
│   └── OfflineBanner.jsx
├── contexts/                # React contexts
│   └── AuthContext.jsx
├── hooks/                   # Custom hooks
│   ├── useAuth.js
│   └── useOffline.js
├── pages/                   # Page components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── student/
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentAcademics.jsx
│   │   ├── StudentAttendance.jsx
│   │   ├── StudentDocuments.jsx
│   │   ├── StudentConsent.jsx
│   │   ├── StudentProfile.jsx
│   │   └── StudentNotifications.jsx
│   └── school/
│       ├── SchoolDashboard.jsx
│       ├── SchoolStudents.jsx
│       ├── StudentDetail.jsx
│       ├── SchoolTeachers.jsx
│       ├── SchoolAttendance.jsx
│       ├── SchoolAssessments.jsx
│       ├── GradeEntry.jsx
│       ├── SchoolCalendar.jsx
│       ├── SchoolReports.jsx
│       └── SchoolSettings.jsx
├── services/                # API and storage services
│   ├── api.js              # Axios instance with interceptors
│   └── offlineSync.js      # IndexedDB offline queue
├── utils/                   # Utility functions
│   ├── constants.js        # App constants
│   └── helpers.js          # Helper functions
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## Key Features

### Offline Support
- Attendance marking works offline with automatic sync when back online
- Uses IndexedDB for local queue storage
- Conflict resolution: server wins for reads, queue for writes

### Responsive Design
- Mobile-first for Student Hub
- Desktop-first for School Hub
- Bottom navigation for mobile students
- Sidebar navigation for school admins

### Authentication
- OTP-based login with phone verification
- APAAR token verification
- Consent scope selection during signup
- Auto token refresh with localStorage persistence

### Data Management
- React Query for efficient caching and synchronization
- Smart refetch strategies
- Loading and error states on all pages

### PWA Support
- Installable as standalone app
- Service worker for offline support
- Install prompts for mobile browsers

## API Integration

All API calls use the configured `VITE_API_URL`. The Vite dev server proxies `/api` to the backend.

### Request Interceptor
- Automatically adds Authorization header with Bearer token

### Response Interceptor
- Handles 401 errors by refreshing token
- Redirects to login if refresh fails
- Logs errors to console

## Styling

Uses TailwindCSS with custom EKAI theme colors:
- **Primary**: Blue-800 (#1E40AF)
- **Secondary**: Teal-700 (#0F766E)
- **Accent**: Amber-500 (#F59E0B)
- **Success**: Green (#059669)
- **Danger**: Red (#DC2626)

## Components

### Layout Components
- **Header**: Top navigation with notifications and profile
- **Sidebar**: School hub navigation (desktop)
- **BottomNav**: Student hub navigation (mobile)
- **Layout**: App shell with responsive structure

### Utility Components
- **Card**: Flexible card container with variants
- **DataTable**: Searchable, sortable table with pagination
- **Modal**: Accessible modal dialog
- **StatusBadge**: Colored status indicators
- **EmptyState**: Placeholder for empty lists
- **LoadingSpinner**: Loading indicator
- **ProtectedRoute**: Auth guard for routes
- **OfflineBanner**: Offline status indicator

## Forms

All forms use React Hook Form with validation:
```jsx
const { register, handleSubmit, errors } = useForm()
```

## State Management

Uses Zustand for application state and React Query for server state:
- User profile cached via React Query
- Form state managed locally
- Global notifications via context (optional)

## Building for Production

```bash
npm run build
```

Outputs optimized bundle to `dist/` with:
- Code splitting for faster initial load
- CSS minification
- Asset optimization
- PWA manifest and service worker

## Deployment

The app can be deployed to any static hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Just ensure `VITE_API_URL` is configured for the production backend.

## Performance Optimizations

- Code splitting with dynamic imports
- Image optimization
- CSS purging with Tailwind
- Service worker caching strategies
- React Query stale time and cache time optimization

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+

## License

EKAI MVP © 2024
