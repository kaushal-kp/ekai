# EKAI Frontend Architecture

## Overview

Complete React 18 frontend for EKAI MVP with separate Student Hub and School Hub interfaces, built for production with offline support, PWA capabilities, and APAAR integration.

## Directory Structure

```
ekai/client/
├── index.html                 # Main HTML entry point
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # TailwindCSS theme configuration
├── postcss.config.js        # PostCSS configuration
├── .env.example             # Environment variables template
├── .eslintrc.cjs            # ESLint configuration
├── .gitignore               # Git ignore rules
├── README.md                # Frontend README
├── ARCHITECTURE.md          # This file
│
├── public/
│   └── manifest.json        # PWA manifest
│
└── src/
    ├── main.jsx             # React entry point
    ├── App.jsx              # Main app with routing
    ├── index.css            # Global styles with Tailwind
    │
    ├── components/shared/   # Reusable UI components
    │   ├── Header.jsx       # Top navigation bar
    │   ├── Sidebar.jsx      # School hub sidebar (desktop)
    │   ├── BottomNav.jsx    # Student hub nav (mobile)
    │   ├── Card.jsx         # Card container with variants
    │   ├── DataTable.jsx    # Table with sorting/pagination
    │   ├── Modal.jsx        # Modal dialog
    │   ├── StatusBadge.jsx  # Status indicator badge
    │   ├── EmptyState.jsx   # Empty state placeholder
    │   ├── LoadingSpinner.jsx # Loading indicator
    │   ├── ProtectedRoute.jsx # Auth route guard
    │   └── OfflineBanner.jsx # Offline status banner
    │
    ├── contexts/            # React contexts
    │   └── AuthContext.jsx  # Authentication state
    │
    ├── hooks/               # Custom React hooks
    │   ├── useAuth.js       # Auth context hook
    │   └── useOffline.js    # Online/offline detection
    │
    ├── pages/               # Page components
    │   ├── Landing.jsx      # Landing page
    │   ├── Login.jsx        # Login with OTP + APAAR
    │   │
    │   ├── student/         # Student Hub pages
    │   │   ├── StudentDashboard.jsx     # Home with stats
    │   │   ├── StudentAcademics.jsx     # Grades & assessments
    │   │   ├── StudentAttendance.jsx    # Attendance calendar
    │   │   ├── StudentDocuments.jsx     # Certificates & transcripts
    │   │   ├── StudentConsent.jsx       # APAAR consent mgmt
    │   │   ├── StudentProfile.jsx       # Profile editing
    │   │   └── StudentNotifications.jsx # Notifications list
    │   │
    │   └── school/          # School Hub pages
    │       ├── SchoolDashboard.jsx      # Overview & analytics
    │       ├── SchoolStudents.jsx       # Student roster
    │       ├── StudentDetail.jsx        # Student profile (admin)
    │       ├── SchoolTeachers.jsx       # Teacher management
    │       ├── SchoolAttendance.jsx     # Attendance marking (offline)
    │       ├── SchoolAssessments.jsx    # Assessment mgmt
    │       ├── GradeEntry.jsx           # Grade entry with auto-calc
    │       ├── SchoolCalendar.jsx       # Event calendar
    │       ├── SchoolReports.jsx        # Report generation
    │       └── SchoolSettings.jsx       # School configuration
    │
    ├── services/            # API & storage services
    │   ├── api.js           # Axios instance with interceptors
    │   └── offlineSync.js   # IndexedDB offline queue
    │
    └── utils/               # Utilities
        ├── constants.js     # App-wide constants
        ├── helpers.js       # Utility functions
```

## Architecture Patterns

### 1. Component Organization

**Shared Components**: Reusable UI building blocks (Card, Modal, Table)
```jsx
<Card variant="stat">
  <p>Statistics content</p>
</Card>
```

**Page Components**: Full-page features with layout
```jsx
export default function StudentDashboard() {
  return (
    <div>
      <Header title="Dashboard" />
      <BottomNav />
      {/* Content */}
    </div>
  )
}
```

**Layout Components**: Page structure
- Sidebar (school hub desktop)
- BottomNav (student hub mobile)
- Header (global top bar)

### 2. State Management

**Authentication**: React Context
- Persisted to localStorage
- Auto token refresh
- Role-based access

**Server State**: React Query
- Cache with stale time
- Automatic refetch
- Loading/error states

**Form State**: React Hook Form
- Validation rules
- Field registration
- Submission handling

**UI State**: Component-level (useState)
- Modals
- Filters
- Toggles

### 3. API Integration

**Axios Instance** (`services/api.js`):
- Base URL configuration
- Auth interceptor (Bearer token)
- Response interceptor (token refresh)
- Error handling

```jsx
const { data } = useQuery({
  queryKey: ['resource', filter],
  queryFn: () => api.get('/endpoint', { params: filter })
})
```

### 4. Offline Support

**IndexedDB Queue** (`services/offlineSync.js`):
- Queue actions when offline
- Persist to IndexedDB
- Sync when back online
- Conflict resolution

```jsx
// Offline attendance marking
await queueAction({
  type: 'attendance_mark',
  endpoint: '/school/attendance/mark',
  data: { /* payload */ }
})
```

**Offline Hook** (`hooks/useOffline.js`):
- Detect online/offline status
- Show OfflineBanner
- Enable/disable actions

### 5. Routing

**Public Routes**:
- `/` - Landing page
- `/login` - OTP + APAAR flow

**Protected Routes**:
- `/student/*` - Student Hub (student role)
- `/school/*` - School Hub (admin/teacher role)

**Route Guards**: ProtectedRoute component
```jsx
<Route path="/student" element={
  <ProtectedRoute>
    <StudentDashboard />
  </ProtectedRoute>
} />
```

## Data Flow

### Authentication Flow
1. User enters phone number
2. Send OTP (SMS simulated)
3. Verify OTP → Get JWT tokens
4. Verify APAAR token + consent scopes
5. Redirect based on role
6. Token persisted to localStorage

### API Request Flow
1. Component uses useQuery
2. Axios adds Authorization header
3. Request sent to backend
4. Response cached by React Query
5. On error, refresh token if 401
6. Redirect to login if refresh fails

### Offline Action Flow
1. User marks attendance offline
2. Action queued to IndexedDB
3. OfflineBanner shows pending count
4. When online, sync queue
5. Update cache with new data

## Styling System

### TailwindCSS Theme
```js
// EKAI Brand Colors
primary: '#1E40AF'     // Blue-800
secondary: '#0F766E'   // Teal-700
accent: '#F59E0B'      // Amber-500
success: '#059669'     // Green
danger: '#DC2626'      // Red
```

### Component Classes
```css
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.btn-outline      /* Outline button */
.input-base       /* Form input */
.card-base        /* Card container */
.table-header     /* Table header cell */
.table-cell       /* Table data cell */
.badge-*          /* Status badges */
```

## Performance Optimizations

### Build-time
- Code splitting (React, Router, Query, Form)
- CSS purging with Tailwind
- Asset optimization
- Minification

### Runtime
- React Query caching (5min stale time)
- Lazy component loading
- Image optimization
- Service worker caching

### Network
- API response caching
- Gzip compression (server)
- Offline IndexedDB
- Progressive image loading

## Security

### Authentication
- Phone-based OTP (not password)
- JWT tokens with refresh
- Token stored securely in localStorage
- Auto logout on token expiry

### Data Privacy
- APAAR consent management
- Granular scope selection
- Consent revocation
- Audit logging (school)

### API Security
- CORS headers (configured server-side)
- CSRF tokens (if using cookies)
- Rate limiting (server-side)
- Input validation (client & server)

## Testing Strategy

### Unit Tests
- Utils: `calculatePercentage`, `getGradeLetter`, etc.
- Helpers: `formatDate`, `formatPhone`, etc.

### Component Tests
- Shared components (Card, Modal, Table)
- Form components with validation

### Integration Tests
- Authentication flow
- Page navigation
- Data fetching

### E2E Tests
- Student workflows
- School admin workflows
- Offline sync flow

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deployment Targets
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Configuration
```env
VITE_API_URL=https://api.ekai.production
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_SYNC=true
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Browser 90+

## Future Enhancements

1. **Advanced Charts**: Grade trends, attendance graphs
2. **Real-time Notifications**: WebSocket integration
3. **File Upload**: Document submissions
4. **Dark Mode**: Theme switching
5. **Internationalization**: Multi-language support
6. **Advanced Filtering**: Complex search/filter UI
7. **Bulk Operations**: CSV import/export
8. **Analytics**: User behavior tracking
9. **Mobile App**: React Native version
10. **API Mocking**: MSW for development

## Troubleshooting

### Common Issues

**API Connection Error**
- Verify `VITE_API_URL` in `.env`
- Check backend is running
- Check CORS configuration

**Offline Not Working**
- Check browser IndexedDB support
- Verify PWA registration
- Check service worker status

**Build Errors**
- Clear `node_modules` and reinstall
- Clear `.vite` cache
- Check Node.js version (18+)

**Performance Issues**
- Profile with Chrome DevTools
- Check React Query cache settings
- Optimize images
- Disable PWA for testing
