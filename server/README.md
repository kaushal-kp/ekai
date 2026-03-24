# EKAI MVP Backend

Complete Node.js + PostgreSQL backend for the EKAI MVP (Student Hub & School Hub).

## Features

- **Authentication**: JWT-based auth with OTP verification and APAAR integration
- **Role-Based Access Control**: Student, Teacher, School Admin, Parent, Platform Admin roles
- **Attendance Management**: Real-time attendance marking with offline sync support
- **Assessment & Grades**: Complete assessment lifecycle with bulk grading
- **Data Sharing Consents**: APAAR-compliant consent management with audit trails
- **Notifications**: Real-time user notifications with filtering
- **Academic Calendar**: School event management and scheduling
- **Production-Ready**: Error handling, logging, validation, rate limiting

## Tech Stack

- **Runtime**: Node.js 14+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 12+
- **Query Builder**: Knex.js
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 14.x or higher
- PostgreSQL 12 or higher
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://ekai:ekai_dev@localhost:5432/ekai_dev
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=7d
APAAR_API_URL=https://api.apaar.education.gov.in/v1
APAAR_API_KEY=your-apaar-api-key
OTP_EXPIRY_MINUTES=5
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

Create PostgreSQL database:

```bash
createdb ekai_dev
```

Run migrations:

```bash
npm run migrate
```

Seed demo data:

```bash
npm run seed
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### Production Mode

```bash
npm start
```

## Available Commands

```bash
# Development
npm run dev              # Start with nodemon

# Production
npm start               # Start server

# Database
npm run migrate         # Run pending migrations
npm run migrate:rollback # Rollback last migration
npm run migrate:make    # Create new migration
npm run seed            # Seed demo data
npm run seed:make       # Create new seed file

# Testing
npm test               # Run tests
npm run test:watch    # Watch mode

# Linting
npm run lint          # Lint code
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token
- `POST /api/auth/verify-apaar` - Verify with APAAR ID
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Student Endpoints

- `GET /api/students/profile` - Get student's own profile
- `GET /api/students/:apaarId` - Get student info (teacher/admin view)
- `GET /api/students/:apaarId/attendance` - Get attendance records
- `GET /api/students/:apaarId/grades` - Get grades and assessments
- `GET /api/students/:apaarId/documents` - Get document vault
- `PUT /api/students/:apaarId` - Update student profile

### School Endpoints

- `GET /api/schools/:udise/dashboard` - School dashboard overview
- `GET /api/schools/:udise/students` - Paginated student list
- `POST /api/schools/:udise/students` - Enroll new student
- `GET /api/schools/:udise/teachers` - Teacher list
- `POST /api/schools/:udise/teachers` - Add new teacher
- `PUT /api/schools/:udise/teachers/:id` - Update teacher
- `GET /api/schools/:udise/stats` - School statistics

### Attendance Endpoints

- `POST /api/attendance/mark` - Mark attendance (single/bulk)
- `POST /api/attendance/sync` - Sync offline attendance
- `GET /api/attendance/class/:udise/:class/:section/:date` - Class attendance
- `GET /api/attendance/student/:apaarId` - Student attendance history
- `GET /api/attendance/report/:udise` - School attendance report
- `PUT /api/attendance/:id` - Update attendance record

### Assessment Endpoints

- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:udise` - List assessments
- `GET /api/assessments/detail/:id` - Get assessment details
- `PUT /api/assessments/:id` - Update assessment
- `POST /api/assessments/:id/grades` - Bulk upload grades
- `PUT /api/assessments/:id/grades/:gradeId` - Update single grade
- `POST /api/assessments/:id/publish` - Publish grades
- `GET /api/assessments/:id/report` - Grade distribution report

### Consent Endpoints

- `GET /api/consents/student/:apaarId` - List student consents
- `POST /api/consents` - Grant data sharing consent
- `PUT /api/consents/:id/revoke` - Revoke consent
- `GET /api/consents/:id/audit` - Get consent audit log

### Notification Endpoints

- `GET /api/notifications` - Get user notifications (paginated)
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Calendar Endpoints

- `GET /api/calendar/:udise` - Get school calendar events
- `POST /api/calendar/:udise` - Create event (admin only)
- `PUT /api/calendar/:udise/:id` - Update event
- `DELETE /api/calendar/:udise/:id` - Delete event

## Database Schema

### Core Tables

- **schools** - School information with UDISE code
- **users** - User accounts with role-based access
- **students** - Student profiles linked to users
- **teachers** - Teacher information and assignments

### Academic Tables

- **assessments** - Assessment definitions
- **grades** - Student grades for assessments
- **attendance** - Attendance records with offline sync support
- **academic_events** - School calendar events

### Feature Tables

- **consents** - Data sharing consents (APAAR-compliant)
- **consent_audit_log** - Consent access audit trail
- **notifications** - User notifications

## Authentication Flow

### OTP-based Authentication (SMS)

1. User calls `POST /api/auth/send-otp` with phone number
2. OTP is generated and stored (in-memory for dev, Redis for production)
3. User calls `POST /api/auth/verify-otp` with phone and OTP
4. JWT token is issued
5. Token is included in `Authorization: Bearer <token>` header for all requests

### APAAR-based Authentication

1. User calls `POST /api/auth/verify-apaar` with APAAR ID
2. APAAR ID is verified with APAAR API
3. Student profile is fetched/created
4. JWT token is issued

## Role-Based Access Control

Roles and permissions:

- **student**: View own data, submit consents
- **teacher**: Manage attendance, grade students, view class data
- **school_admin**: Manage school users, view dashboards, enroll students
- **parent**: View child's data, manage consents
- **platform_admin**: Full system access

## Security Features

- JWT token expiry: 7 days (configurable)
- Rate limiting: 100 requests per 15 minutes globally, 10 auth attempts per 15 minutes
- CORS: Configurable origins
- Helmet: Security headers
- Input validation: Express-validator on all endpoints
- Password hashing: bcryptjs
- SQL injection prevention: Knex.js parameterized queries

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": "Additional error details (dev mode only)"
}
```

Common error codes:

- `VALIDATION_ERROR` - Input validation failed
- `NOT_AUTHENTICATED` - Missing/invalid JWT token
- `INSUFFICIENT_PERMISSIONS` - User lacks required role
- `ACCESS_DENIED` - School/resource access denied
- `RESOURCE_NOT_FOUND` - Record doesn't exist
- `DUPLICATE_ENTRY` - Unique constraint violation
- `INTERNAL_ERROR` - Server error

## Logging

Logs are written to:

- **Console** (development mode): Colored, human-readable format
- **logs/combined.log**: All logs
- **logs/error.log**: Errors only

Log levels: debug, info, warn, error

## Development Tips

### Using Demo Data

Run the seed command to create demo schools, users, students, and data:

```bash
npm run seed
```

Demo accounts:

- **School Admin (DPS)**: +91-9000000001 (OTP: any 6 digits in dev)
- **Teacher**: +91-9000000010 through +91-9000000019
- **Student**: +91-9100000000 through +91-9100000019

### Testing with cURL

```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91-9000000001"}'

# Verify OTP (in dev, any 6-digit number works)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91-9000000001", "otp": "123456"}'

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Deployment

### Environment-Specific Configuration

Development uses in-memory OTP storage. For production:

1. Update `.env` to use PostgreSQL connection pool
2. Enable Redis for OTP storage in otpService
3. Set secure JWT_SECRET
4. Update CORS_ORIGIN
5. Configure SSL for database connection

### Database Migrations in Production

```bash
NODE_ENV=production npm run migrate
```

## Troubleshooting

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solution: Ensure PostgreSQL is running and DATABASE_URL is correct.

```bash
# Test connection
psql $DATABASE_URL
```

### OTP Verification Failed

For development, OTP verification works with any 6-digit number. In production, integrate with SMS gateway.

### Migration Errors

Check migration file syntax and ensure migrations run in order:

```bash
npm run migrate:rollback  # Rollback last migration
npm run migrate           # Re-run migrations
```

## License

MIT

## Support

For issues and feature requests, contact the EKAI team.
