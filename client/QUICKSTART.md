# EKAI Frontend - Quick Start Guide

## Installation

```bash
cd /sessions/sharp-zen-galileo/ekai/client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## Configuration

Edit `.env` to point to your backend API:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_SYNC=true
```

## Development

```bash
# Start dev server (auto-opens at http://localhost:5173)
npm run dev

# The dev server proxies /api requests to http://localhost:5000
```

## Login Flow

1. **Landing Page** (`/`)
   - Click "Student Hub" or "School Hub"

2. **Login Page** (`/login`)
   - Student: Phone → OTP → APAAR Consent
   - School Admin: Phone → OTP → APAAR Consent

3. **Dashboard**
   - Student: `/student`
   - School: `/school`

## Student Hub Routes

- `/student` - Dashboard
- `/student/academics` - Grades & assessments
- `/student/attendance` - Attendance calendar
- `/student/documents` - Certificates & transcripts
- `/student/consents` - APAAR consent management
- `/student/profile` - Profile editing
- `/student/notifications` - Notifications

## School Hub Routes

- `/school` - Dashboard
- `/school/students` - Student roster
- `/school/students/:id` - Student detail
- `/school/teachers` - Teacher management
- `/school/attendance` - **Attendance marking (works offline)**
- `/school/assessments` - Assessment management
- `/school/assessments/:id/grades` - Grade entry
- `/school/calendar` - Event calendar
- `/school/reports` - Report generation
- `/school/settings` - School settings

## Offline Feature (Attendance)

The School Attendance page works completely offline:

1. Go to `/school/attendance`
2. Select class and date
3. Mark attendance (Present/Absent/Late)
4. Click "Save Offline" (when offline)
5. When back online, it syncs automatically
6. OfflineBanner shows pending sync count

**Tested Offline Workflow:**
```
Offline → Mark attendance → Save Offline
→ Back Online → Auto sync → Success
```

## Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview

# Output in dist/ directory - ready for deployment
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
# Follow prompts, set VITE_API_URL in environment
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

### Other Hosts
Deploy the `dist/` folder to:
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting
- Any static host

## Mock Data

All pages include mock data for development:
- Students, teachers, grades, attendance
- Assessments with grade calculations
- Calendar events
- Reports with statistics

Replace with real API calls as needed.

## API Integration

Replace mock data with real API calls:

```jsx
// Before (mock data)
const mockStudents = [...]

// After (real API)
const { data: students } = useQuery({
  queryKey: ['students'],
  queryFn: () => api.get('/school/students')
})
```

## Common Issues

**Port Already in Use**
```bash
# Use different port
npm run dev -- --port 3000
```

**API Connection Error**
- Check `VITE_API_URL` in `.env`
- Verify backend is running on port 5000
- Check CORS configuration on backend

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .vite dist
npm install
npm run build
```

**Offline Not Working**
- Check browser supports IndexedDB
- Check PWA registration in DevTools
- Verify service worker status

## Development Tips

1. **React Query DevTools** - Add to see cache state:
   ```bash
   npm install @tanstack/react-query-devtools
   ```

2. **Tailwind IntelliSense** - VSCode extension for class autocomplete

3. **Chrome DevTools** - Use Lighthouse for PWA audit

4. **Mock API** - Use MSW for better API mocking in dev

## Project Structure Reference

```
src/
├── components/shared/   # Reusable UI components
├── contexts/           # Auth state management
├── hooks/              # Custom hooks
├── pages/              # Full page components
│   ├── student/
│   └── school/
├── services/           # API & storage
├── utils/              # Constants & helpers
├── App.jsx             # Routing
└── main.jsx            # Entry point
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Environment Variables

```env
# Required
VITE_API_URL=http://localhost:5000/api

# Optional
VITE_APP_NAME=EKAI
VITE_ENV=development
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_SYNC=true
```

## File Size

- Source: ~10,000 LOC
- Bundle: ~250KB gzipped (before optimization)
- After production build: ~60-80KB gzipped

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android 11+

## Support Resources

- **README.md** - Detailed documentation
- **ARCHITECTURE.md** - Technical architecture
- **CHECKLIST.md** - Feature completion status
- **Code Comments** - Inline documentation

## Next Steps

1. Install & run: `npm install && npm run dev`
2. Test login flow with mock OTP
3. Explore Student Hub and School Hub
4. Test offline attendance marking
5. Build & deploy: `npm run build`
6. Connect to real backend API

Happy coding! 🚀
