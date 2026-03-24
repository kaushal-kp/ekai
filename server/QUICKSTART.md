# Quick Start Guide - EKAI Backend

Get the EKAI backend running in 5 minutes.

## 1. Install Dependencies (1 minute)

```bash
npm install
```

## 2. Create Database (2 minutes)

```bash
# PostgreSQL (Linux/macOS)
psql -U postgres

# In psql prompt:
CREATE DATABASE ekai_dev;
CREATE USER ekai WITH PASSWORD 'ekai_dev';
GRANT ALL PRIVILEGES ON DATABASE ekai_dev TO ekai;
\q
```

Or use PostgreSQL GUI (pgAdmin) to create database and user with same credentials.

## 3. Setup Environment (30 seconds)

```bash
cp .env.example .env
# .env is ready to use for development
```

## 4. Setup Database (1 minute)

```bash
# Run migrations
npm run migrate

# Seed demo data
npm run seed
```

## 5. Start Server (30 seconds)

```bash
npm run dev
```

You should see: "EKAI Backend server running on port 5000"

## Test It

```bash
# Health check
curl http://localhost:5000/health

# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91-9000000001"}'

# Verify OTP (any 6 digits work in dev mode)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91-9000000001", "otp": "123456"}'
```

## Demo Accounts

After seeding:

- **School Admin**: +91-9000000001
- **Teacher**: +91-9000000010
- **Student**: +91-9100000000

## Demo Data Includes

- 2 schools with realistic data
- 48 users (admin, teachers, students)
- 30 days of attendance records
- Sample assessments and grades
- Sample consents

## Stopping Server

Press `Ctrl+C` in terminal

## Common Issues

### "connect ECONNREFUSED"
PostgreSQL not running. Start it:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
Check Services app
```

### "password authentication failed"
Check database credentials in `.env`:
```env
DATABASE_URL=postgresql://ekai:ekai_dev@localhost:5432/ekai_dev
```

### Migrations failed
Ensure database exists and is empty, then retry:
```bash
npm run migrate:rollback
npm run migrate
```

## Full Documentation

- **Setup Instructions**: See `SETUP.md`
- **API Documentation**: See `README.md`
- **Project Overview**: See `MANIFEST.md`

## Next Steps

1. Explore API endpoints in `README.md`
2. Review database schema in migrations
3. Check role-based routes in `src/routes/`
4. Integrate with frontend application

---

**Ready to develop!** Happy coding!
