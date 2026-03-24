# EKAI Backend Setup Guide

Complete step-by-step guide to set up and run the EKAI MVP backend.

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** 14.x or higher
- **npm** 6.x or higher (comes with Node.js)
- **PostgreSQL** 12 or higher
- **Git** (for version control)

### Verify Installation

```bash
node --version      # Should be v14.x or higher
npm --version       # Should be 6.x or higher
psql --version      # Should be 12 or higher
```

## Step 1: Install Dependencies

```bash
cd /sessions/sharp-zen-galileo/ekai/server
npm install
```

This will install all required packages listed in `package.json`.

## Step 2: Create PostgreSQL Database

### Option A: Using psql (Linux/macOS)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ekai_dev;
CREATE USER ekai WITH PASSWORD 'ekai_dev';
ALTER ROLE ekai SET client_encoding TO 'utf8';
ALTER ROLE ekai SET default_transaction_isolation TO 'read committed';
ALTER ROLE ekai SET default_transaction_deferrable TO on;
ALTER ROLE ekai SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE ekai_dev TO ekai;
\q
```

### Option B: Using psql (Windows)

```bash
# Open Command Prompt and connect to PostgreSQL
psql -U postgres

# Then run the same commands as above
CREATE DATABASE ekai_dev;
CREATE USER ekai WITH PASSWORD 'ekai_dev';
ALTER ROLE ekai SET client_encoding TO 'utf8';
ALTER ROLE ekai SET default_transaction_isolation TO 'read committed';
ALTER ROLE ekai SET default_transaction_deferrable TO on;
ALTER ROLE ekai SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE ekai_dev TO ekai;
\q
```

### Option C: Using PostgreSQL GUI (pgAdmin)

1. Open pgAdmin
2. Right-click "Databases" > Create > Database
3. Name: `ekai_dev`
4. Right-click "Login/Group Roles" > Create > Login/Group Role
5. Name: `ekai`, Password: `ekai_dev`
6. In Privileges tab, enable all privileges
7. Assign the role to the database

### Verify Database Creation

```bash
psql -U ekai -d ekai_dev -c "SELECT 1;"
```

You should see output: `1`

## Step 3: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your settings
nano .env
# or
code .env
```

Typical development configuration:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://ekai:ekai_dev@localhost:5432/ekai_dev
JWT_SECRET=your-dev-secret-key-change-in-production
JWT_EXPIRY=7d
APAAR_API_URL=https://api.apaar.education.gov.in/v1
APAAR_API_KEY=your-apaar-api-key
OTP_EXPIRY_MINUTES=5
CORS_ORIGIN=http://localhost:3000
```

## Step 4: Create Required Directories

```bash
# Create logs directory
mkdir -p logs
```

## Step 5: Run Database Migrations

```bash
# Run all pending migrations
npm run migrate
```

You should see output indicating migrations were applied:
```
✓ Migration 001_create_schools.js
✓ Migration 002_create_users.js
✓ Migration 003_create_students.js
✓ Migration 004_create_teachers.js
✓ Migration 005_create_attendance.js
✓ Migration 006_create_assessments.js
✓ Migration 007_create_consents.js
✓ Migration 008_create_academic_calendar.js
✓ Migration 009_create_notifications.js
```

## Step 6: Seed Demo Data

```bash
# Populate database with sample data
npm run seed
```

This creates:
- 2 demo schools with realistic data
- School administrators
- Teachers and students
- Sample attendance records (last 30 days)
- Sample assessments and grades
- Sample consents

### Demo Credentials

After seeding, you can test with these accounts:

**School Admin (Delhi Public School)**
- Phone: +91-9000000001
- Role: school_admin
- School: UT-LD-001

**Teacher (DPS)**
- Phone: +91-9000000010
- Role: teacher
- School: UT-LD-001

**Student (DPS)**
- Phone: +91-9100000000
- APAAR ID: IN-DL-001-2024-00001
- Role: student
- School: UT-LD-001

## Step 7: Start the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

You should see:
```
✓ EKAI Backend server running on port 5000
✓ Environment: development
✓ Visit http://localhost:5000/health to check server status
```

### Production Mode

```bash
npm start
```

## Step 8: Verify Server is Running

Open browser or use curl:

```bash
# Check health endpoint
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "EKAI Backend is healthy",
  "timestamp": "2024-03-24T10:30:00.000Z"
}
```

## Step 9: Test Authentication

### Using cURL

```bash
# 1. Request OTP (any 6-digit number works in dev mode)
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91-9000000001"}'

# Response:
# {"success": true, "message": "OTP sent successfully", "phone": "+91-9000000001"}

# 2. Verify OTP (in dev mode, any 6 digits work)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91-9000000001", "otp": "123456"}'

# Response includes JWT token:
# {"success": true, "token": "eyJhbGc...", "user": {...}}

# 3. Use token to access authenticated endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### Using Postman

1. Import the following request in Postman:

**Request 1: Send OTP**
- Method: POST
- URL: `http://localhost:5000/api/auth/send-otp`
- Body (raw JSON):
```json
{
  "phone": "+91-9000000001"
}
```

**Request 2: Verify OTP**
- Method: POST
- URL: `http://localhost:5000/api/auth/verify-otp`
- Body (raw JSON):
```json
{
  "phone": "+91-9000000001",
  "otp": "123456"
}
```

2. Copy the `token` from Response 2

**Request 3: Get Current User**
- Method: GET
- URL: `http://localhost:5000/api/auth/me`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer <paste-token-here>`

## Troubleshooting

### Issue: "connect ECONNREFUSED"

PostgreSQL is not running or connection details are wrong.

**Solution:**
```bash
# Check if PostgreSQL is running
psql --version

# If not installed, install PostgreSQL:
# macOS: brew install postgresql
# Windows: Download from postgresql.org
# Linux: sudo apt-get install postgresql

# Start PostgreSQL service:
# macOS: brew services start postgresql
# Windows: Check Services app
# Linux: sudo systemctl start postgresql
```

### Issue: "password authentication failed"

Wrong database username/password.

**Solution:**
```bash
# Verify credentials in .env
# Default: ekai / ekai_dev

# Reset PostgreSQL user password:
psql -U postgres
ALTER USER ekai WITH PASSWORD 'ekai_dev';
```

### Issue: "relation does not exist"

Migrations haven't run.

**Solution:**
```bash
# Check migration status
npm run migrate:status

# Run migrations
npm run migrate

# If migrations fail, rollback and retry
npm run migrate:rollback
npm run migrate
```

### Issue: Server doesn't start / Port already in use

Port 5000 is already in use.

**Solution:**
```bash
# Use different port:
PORT=5001 npm run dev

# Or find and kill process on port 5000:
# Linux/macOS:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "OTP verification failed" with OTP_NOT_FOUND

OTP storage is not working.

**Solution:**
In development mode, OTP is stored in memory. This should work fine. If not:
```bash
# Restart the server
# Make sure NODE_ENV=development in .env
```

## Common Commands Reference

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Seed demo data
npm run seed

# Run tests
npm test

# View logs
tail -f logs/combined.log
tail -f logs/error.log
```

## Database Backup & Restore

### Backup

```bash
pg_dump -U ekai ekai_dev > ekai_backup.sql
```

### Restore

```bash
psql -U ekai ekai_dev < ekai_backup.sql
```

## Reset Database

If you need to start fresh:

```bash
# Drop database
psql -U postgres -c "DROP DATABASE ekai_dev;"

# Recreate database
psql -U postgres -c "CREATE DATABASE ekai_dev;"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ekai_dev TO ekai;"

# Run migrations
npm run migrate

# Seed new data
npm run seed
```

## Next Steps

1. **Read the API Documentation**: See `README.md` for all available endpoints
2. **Set Up Frontend**: Use the backend URLs for your frontend application
3. **Configure CORS**: Update `CORS_ORIGIN` in `.env` when deploying frontend
4. **Production Deployment**: See README.md Deployment section

## Support

If you encounter issues:

1. Check the logs: `tail -f logs/combined.log`
2. Verify all prerequisites are installed
3. Ensure DATABASE_URL is correct
4. Check .env file has all required variables

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Knex.js Query Builder](https://knexjs.org/)
- [JWT Auth Best Practices](https://tools.ietf.org/html/rfc7519)
