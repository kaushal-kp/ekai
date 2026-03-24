# EKAI MVP - Security Audit Report
**Audit Date:** March 24, 2026
**Status:** MVP Pre-Production Audit
**Focus Areas:** Authentication, Authorization, Data Protection, API Security, Compliance

---

## Executive Summary

The EKAI MVP codebase implements a solid foundation for student data management with OTP-based authentication, role-based access control, and APAAR integration. However, there are several critical and high-severity issues that must be addressed before production deployment, particularly around token storage, data encryption, and infrastructure security.

**Production Readiness:** 🔴 NOT READY (Critical issues must be fixed)

---

## Current Security Posture

### What's Well Implemented ✅

1. **Authentication Flow:**
   - OTP-based authentication with phone validation
   - JWT token generation with configurable expiry
   - Proper error handling and token verification
   - Rate limiting on OTP/auth endpoints (10 req/15 min)

2. **Authorization:**
   - Role-based access control (RBAC) middleware
   - School-level access control
   - Route protection with role verification
   - Proper role hierarchy (student, teacher, school_admin, parent, platform_admin)

3. **Input Validation:**
   - Express-validator on all endpoints
   - Phone number format validation
   - APAAR ID format validation (regex: `IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}`)
   - Request body validation for all POST/PUT endpoints
   - Integer and enum validation for sensitive fields

4. **Error Handling:**
   - Global error handler middleware
   - Proper HTTP status codes
   - Error messages don't expose stack traces in production
   - Structured error responses

5. **Logging & Monitoring:**
   - Winston logger with file rotation
   - Separate error and combined logs
   - Request logging via Morgan
   - Structured JSON logging with metadata

6. **API Security Basics:**
   - Helmet.js for security headers (X-Frame-Options, X-Content-Type-Options, etc.)
   - CORS configured with specific origin
   - Compression enabled
   - General rate limiting (100 req/15 min)

7. **Database:**
   - PostgreSQL with proper schema
   - UUID for primary keys (secure randomization)
   - Foreign key constraints
   - Proper indexes on frequently queried fields
   - Knex.js for parameterized queries (protects against SQL injection)

8. **Consent Management:**
   - Comprehensive consent framework with scope definitions
   - Consent audit logging
   - Audit trail captures IP, user agent, actions
   - Consent revocation capability

---

## Critical Issues 🔴 (Must Fix Before Production)

### 1. Token Storage in LocalStorage (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/client/src/contexts/AuthContext.jsx`, `api.js`
**Severity:** CRITICAL
**Issue:** JWT tokens and refresh tokens stored in browser localStorage - vulnerable to XSS attacks and accessible to any malicious script with DOM access.

**Risk:**
- XSS vulnerability could steal all user tokens
- No HTTPOnly flag protection
- Accessible via JavaScript: `localStorage.getItem()`

**Current Code:**
```javascript
localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token)
localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
```

**Required Fix:**
- Move tokens to HTTPOnly cookies (only sent in HTTP requests, not accessible to JS)
- Backend should set: `Set-Cookie: authToken=...; HttpOnly; Secure; SameSite=Strict`
- Implement CSRF tokens for state-changing requests
- Client should handle cookies automatically via axios

**Code Change:**
```javascript
// Backend (in auth.js routes)
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
})

// Frontend - remove localStorage tokens entirely
// Axios will automatically send cookies with credentials: true
```

---

### 2. No Password Hashing Implementation (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/routes/auth.js`
**Severity:** CRITICAL
**Issue:** OTP is the only auth method. If password feature is added later, code shows `password_hash` column but no hashing logic exists.

**Current Database Schema:**
- `password_hash` column exists in users table but is never used
- Bcrypt is imported but not utilized

**Risk:**
- If passwords are stored without hashing, all passwords are exposed in database breach
- Current code doesn't implement password authentication flow

**Required Fix:**
```javascript
// When adding password auth:
const bcrypt = require('bcryptjs');

// During registration/password change:
const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
await db('users').insert({ password_hash: hashedPassword, ... });

// During login:
const user = await db('users').where('email', email).first();
const isPasswordValid = await bcrypt.compare(inputPassword, user.password_hash);
if (!isPasswordValid) throw new Error('Invalid password');
```

---

### 3. OTP Stored in Memory (CRITICAL for MVP)
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/services/otpService.js`
**Severity:** CRITICAL
**Issue:** OTPs are stored in Node.js in-memory map, not persisted. In production, server restart loses all OTPs.

**Current Code:**
```javascript
const otpStore = new Map(); // In-memory storage
// ... OTP is stored here and lost on restart
```

**Risk:**
- Server restart invalidates all pending OTPs
- No horizontal scaling possible (OTP in one server won't exist in another)
- Potential memory leak with accumulating OTP entries
- No audit trail of OTP attempts

**Required Fix:**
```javascript
// Use Redis (already in docker-compose) or database:
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const sendOTP = async (phone) => {
  const otp = generateOTP();
  const key = `otp:${phone}`;
  const expirySeconds = parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60;

  // Store with expiry
  await client.setex(key, expirySeconds, JSON.stringify({
    otp,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString()
  }));

  return { expiryMinutes: expirySeconds / 60 };
};
```

---

### 4. Missing HTTPS/SSL Configuration (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/server/knexfile.js`, `docker-compose.yml`, `.env.example`
**Severity:** CRITICAL
**Issue:** No HTTPS enforcement. All data transmitted in plain text. SSL config commented out in production.

**Current Code:**
```javascript
// knexfile.js production config
production: {
  ssl: {
    rejectUnauthorized: false,  // This is suspicious!
  },
}
```

**Risk:**
- Man-in-the-middle attacks possible
- Student PII captured in transit
- OTP codes visible on network
- JWT tokens exposed to eavesdropping

**Required Fix:**
```javascript
// knexfile.js
production: {
  ssl: {
    rejectUnauthorized: true,  // IMPORTANT: Verify server certificate
  },
}

// app.js - add HTTPS redirect middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Enable HSTS header
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
```

---

### 5. No Rate Limiting on Data Access Endpoints (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/app.js`
**Severity:** CRITICAL
**Issue:** Rate limiting only on auth endpoints. Data endpoints (students, assessments, attendance) have no rate limits.

**Current Limitation:**
```javascript
app.use('/api/auth/send-otp', authLimiter);    // Protected
app.use('/api/auth/verify-otp', authLimiter);  // Protected
// NO LIMITS on: /api/students, /api/assessments, /api/attendance, etc.
```

**Risk:**
- Enumeration attacks: Brute force to find valid student IDs
- Denial of service: Flood endpoints to take down service
- Data exfiltration: Mass download of student records

**Required Fix:**
```javascript
// app.js
const dataAccessLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute per IP
  keyGenerator: (req, res) => req.user?.id || req.ip, // Rate limit per user/IP
  message: 'Too many data access requests'
});

// Apply to data endpoints
app.use('/api/students', dataAccessLimiter);
app.use('/api/assessments', dataAccessLimiter);
app.use('/api/attendance', dataAccessLimiter);
app.use('/api/consents', dataAccessLimiter);
```

---

### 6. Weak CSP and Security Headers (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/docker/nginx.conf`
**Severity:** CRITICAL
**Issue:** CSP allows unsafe-inline and unsafe-eval for scripts and styles.

**Current Config:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
```

**Risk:**
- Unsafe-inline allows inline scripts (same as no CSP for XSS)
- Unsafe-eval allows eval() which can execute arbitrary code
- Weakens protections against XSS and script injection

**Required Fix:**
```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-{random}'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none'; upgrade-insecure-requests;" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

### 7. JWT Secret Hardcoded (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/.env.example`, `docker-compose.yml`
**Severity:** CRITICAL
**Issue:** Default JWT_SECRET in example and docker-compose files is placeholder "change-this-to-a-random-string-in-production"

**Current Config:**
```
JWT_SECRET=change-this-to-a-random-string-in-production
```

**Risk:**
- If used in production, anyone could forge JWT tokens
- All tokens become forgeable
- Complete authentication bypass

**Required Fix:**
```bash
# Generate strong secret
openssl rand -base64 32

# Update .env for production (never commit)
JWT_SECRET=$(openssl rand -base64 32)

# Update docker-compose to require env var
docker-compose.yml should have:
JWT_SECRET: ${JWT_SECRET:?JWT_SECRET not set}
```

---

### 8. No Database Encryption at Rest (CRITICAL)
**File:** All migrations, database.js
**Severity:** CRITICAL
**Issue:** Student PII (name, DOB, guardian info) stored in plaintext in PostgreSQL.

**Current Schema:**
```javascript
table.string('name', 255).notNullable();  // Plaintext
table.date('dob').notNullable();          // Plaintext
table.string('guardian_phone', 20);       // Plaintext
```

**Risk:**
- Database breach exposes all student PII
- Violates DPDP Act requirement for data protection
- No recovery from database compromise

**Required Fix (Data Encryption):**
```javascript
// Create encryption service
const crypto = require('crypto');

const encryptField = (value, encryptionKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

const decryptField = (encrypted, encryptionKey) => {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(parts[2], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Use in model:
student.name = encryptField(data.name, process.env.ENCRYPTION_KEY);
```

---

### 9. Missing CORS Credentials Configuration (CRITICAL)
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/app.js`
**Severity:** HIGH
**Issue:** CORS allows credentials but cookies not properly secured.

**Current Config:**
```javascript
cors({
  credentials: true,  // Allows cookies to be sent
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
})
```

**Risk:**
- If origin is misconfigured, credentials leaked to wrong origin
- No validation of origin in production

**Required Fix:**
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
});
```

---

## High Severity Issues 🟠

### 10. No Refresh Token Rotation
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/routes/auth.js`
**Severity:** HIGH
**Issue:** Refresh tokens don't rotate after use. If refresh token is compromised, attacker can get infinite access.

**Current Code:**
```javascript
router.post('/refresh', authMiddleware, asyncHandler(async (req, res) => {
  // Issues new token but doesn't invalidate old refresh token
  const token = jwt.sign(...);
  res.json({ token }); // No new refresh token issued
}));
```

**Required Fix:**
```javascript
// Generate new refresh token on each use
const refreshToken = jwt.sign(
  { userId: user.id, type: 'refresh' },
  process.env.REFRESH_TOKEN_SECRET,
  { expiresIn: '30d' }
);

// Store in Redis blacklist to invalidate old token
await redis.setex(`refresh_token:${user.id}`, 30*24*60*60, refreshToken);

res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
res.json({ token });
```

---

### 11. No Token Blacklist/Revocation
**File:** All auth files
**Severity:** HIGH
**Issue:** Logout doesn't invalidate JWT tokens. Expired tokens can't be explicitly revoked.

**Risk:**
- User can't force logout (token still valid)
- Compromised tokens remain valid until expiry
- No way to revoke access immediately

**Required Fix:**
```javascript
// Token blacklist service
const addToBlacklist = async (token, expiresIn) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`blacklist:${token}`, ttl, 'true');
  }
};

// Middleware to check blacklist
const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  if (token && await redis.get(`blacklist:${token}`)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  next();
};

// Logout endpoint
router.post('/logout', authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.substring(7);
  await addToBlacklist(token, process.env.JWT_EXPIRY);
  res.clearCookie('authToken');
  res.json({ success: true });
});
```

---

### 12. No Input Sanitization (XSS Prevention)
**File:** All API routes
**Severity:** HIGH
**Issue:** While express-validator validates input, there's no sanitization for stored XSS.

**Risk:**
- Malicious HTML/scripts in text fields could be stored and executed
- Search queries not sanitized

**Required Fix:**
```javascript
const xss = require('xss');

// Sanitize text inputs
body('title')
  .isString()
  .trim()
  .escape() // Escape HTML
  .custom(value => {
    // Additional XSS sanitization
    const clean = xss(value);
    if (clean !== value) throw new Error('Invalid characters detected');
    return true;
  })
```

---

### 13. Missing APAAR Secret Storage
**File:** `/sessions/sharp-zen-galileo/ekai/.env.example`
**Severity:** HIGH
**Issue:** APAAR_API_KEY is "demo-key" in examples and hardcoded.

**Current:**
```
APAAR_API_KEY=demo-key
```

**Risk:**
- Production API key exposed in code
- Any APAAR API calls can be impersonated

**Required Fix:**
- Move to secure secrets management (HashiCorp Vault, AWS Secrets Manager, etc.)
- Rotate API keys regularly
- Never commit real keys

---

### 14. No Sensitive Data Redaction in Logs
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/config/logger.js`
**Severity:** HIGH
**Issue:** Logger logs phone numbers, user IDs, and potentially sensitive data.

**Current:**
```javascript
logger.info('Consent granted', {
  consentId,
  studentApaarId: student_apaar_id,  // APAAR ID logged
  grantedBy: req.user.id,             // User ID logged
  scope,
});
```

**Risk:**
- Logs contain PII if breached
- Phone numbers visible in log files
- APAAR IDs traceable in audit trails

**Required Fix:**
```javascript
const redactPII = (data) => {
  const redacted = { ...data };
  if (redacted.phone) redacted.phone = redacted.phone.slice(-4).padStart(10, '*');
  if (redacted.apaar_id) redacted.apaar_id = redacted.apaar_id.slice(-5).padStart(21, '*');
  if (redacted.email) redacted.email = redacted.email.replace(/.(?=.{4}@)/g, '*');
  return redacted;
};

logger.info('Consent granted', redactPII({...}));
```

---

### 15. No Request Validation on Query Parameters
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/routes/assessments.js`, `attendance.js`
**Severity:** HIGH
**Issue:** Query parameters like `limit` and date ranges not fully validated.

**Current:**
```javascript
const { limit = 30 } = req.query;  // No validation
const { from_date, to_date } = req.query;  // No format check
```

**Risk:**
- SQL injection via query parameters (though parameterized queries help)
- DoS via huge limit values
- Invalid date ranges

**Required Fix:**
```javascript
query('limit')
  .optional()
  .isInt({ min: 1, max: 1000 })
  .withMessage('Limit must be between 1 and 1000'),
query('from_date')
  .optional()
  .isISO8601()
  .withMessage('Invalid from_date format'),
query('to_date')
  .optional()
  .isISO8601()
  .withMessage('Invalid to_date format')
  .custom((value, { req }) => {
    if (value && req.query.from_date && new Date(value) <= new Date(req.query.from_date)) {
      throw new Error('to_date must be after from_date');
    }
    return true;
  }),
```

---

## Medium Severity Issues 🟡

### 16. Incomplete Error Messages
**File:** `/sessions/sharp-zen-galileo/ekai/server/src/middleware/errorHandler.js`
**Severity:** MEDIUM
**Issue:** Error messages might reveal too much info to client.

**Current:**
```javascript
const details = environment === 'production' ? null : err.message;
```

**Risk:**
- Still some internal details exposed in production mode
- Stack traces could leak file paths

**Fix:** Use generic error messages for 5xx errors, specific messages only for 4xx.

---

### 17. No CORS Preflight Caching
**File:** Nginx config
**Severity:** MEDIUM
**Issue:** OPTIONS requests not cached, increases request overhead.

**Fix:** Add caching for OPTIONS responses.

---

### 18. Missing Dependency Audit
**File:** `server/package.json`, `client/package.json`
**Severity:** MEDIUM
**Issue:** No `npm audit` results shown. Some dependencies might have known vulnerabilities.

**Fix:**
```bash
npm audit
npm audit fix  # for production-ready versions
```

---

### 19. No Database Connection Pooling Limits
**File:** `knexfile.js`
**Severity:** MEDIUM
**Issue:** Pool size adequate but no timeout configurations.

**Required Fix:**
```javascript
pool: {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

---

### 20. Missing Role-Based Data Filtering
**File:** Various routes
**Severity:** MEDIUM
**Issue:** While access control prevents reading unauthorized data, no filtering of sensitive fields per role.

**Example:**
```javascript
// Student should not see teacher's contact list
// Currently protected by route, but no field-level filtering
res.json({ data: student }); // All fields exposed
```

**Fix:** Implement field-level authorization filters.

---

## Low Severity Issues 🟢

### 21. Logger Not Cleared on Startup
**Severity:** LOW
**Issue:** Log files grow without bound. Max 5MB per file but no auto-cleanup of old files.

### 22. No Deprecation Headers
**Severity:** LOW
**Issue:** No Deprecation headers for API versioning.

### 23. Console Logs in Development
**Severity:** LOW
**Issue:** `console.error()` in catch blocks - should use logger only.

---

## Compliance Gaps

### DPDP Act 2023 Issues

1. **Data Processing Agreement (DPA):** Not documented
2. **Purpose Limitation:** Consent scopes defined but not enforced in actual data access
3. **Data Minimization:** Some non-essential fields might be collected
4. **Retention Policy:** No automated data deletion after retention period
5. **Encryption Key Management:** No proper key rotation strategy
6. **Breach Notification:** No automated notification system

### APAAR Integration

1. **Consent Recording:** Implemented but not persistent across server restarts (OTP issue)
2. **Data Minimization:** Could be stricter on what data is requested
3. **Audit Trail:** Good, but not tamper-proof

---

## Security Fixes Priority Matrix

| Priority | Issue | Effort | Impact | Timeline |
|----------|-------|--------|--------|----------|
| P0 | HTTPOnly Cookies | Medium | Critical | Before MVP |
| P0 | HTTPS/SSL | Medium | Critical | Before MVP |
| P0 | OTP Redis Migration | Medium | Critical | Before MVP |
| P0 | JWT Secret Management | Low | Critical | Before MVP |
| P1 | Rate Limiting on Data | Low | High | Week 1 |
| P1 | Refresh Token Rotation | Medium | High | Week 1 |
| P1 | CSP Headers | Low | High | Week 1 |
| P1 | Database Encryption | High | High | Week 2 |
| P2 | Token Blacklist | Medium | Medium | Week 2 |
| P2 | Input Sanitization | Medium | Medium | Week 2 |

---

## Production Deployment Checklist

- [ ] All P0 issues resolved
- [ ] HTTPS certificate obtained and configured
- [ ] Redis deployed for OTP storage
- [ ] HTTPOnly cookies implemented
- [ ] Rate limiting on all endpoints
- [ ] Database encryption keys generated and secured
- [ ] Environment variables not hardcoded
- [ ] Security headers validated
- [ ] CORS origins configured correctly
- [ ] Database backups configured
- [ ] Logging configured with PII redaction
- [ ] SSL certificate pinning considered
- [ ] DDoS protection (WAF) configured
- [ ] Monitoring and alerting set up
- [ ] Incident response plan documented
- [ ] Security headers tested with securityheaders.com
- [ ] OWASP Top 10 verification completed
- [ ] Penetration testing completed
- [ ] Access controls verified with multiple user roles
- [ ] Consent audit log tested

---

## Recommendations

### Immediate (Before MVP Production)
1. Implement HTTPOnly cookie storage for JWT
2. Migrate OTP storage to Redis
3. Enable HTTPS with valid certificates
4. Generate strong JWT_SECRET and store in secure vault
5. Implement CORS origin whitelist validation

### Short-term (Week 1-2)
6. Add rate limiting to data access endpoints
7. Implement refresh token rotation
8. Strengthen CSP headers
9. Implement input sanitization
10. Set up PII redaction in logs

### Medium-term (Week 2-4)
11. Implement field-level encryption for PII
12. Set up token blacklist service
13. Implement data retention policies
14. Add automated security headers testing
15. Configure database connection pooling timeouts

### Long-term (Pre-Production Scale)
16. Implement end-to-end encryption option for sensitive data
17. Set up SIEM for security monitoring
18. Implement API key rotation for APAAR
19. Add Web Application Firewall (WAF)
20. Conduct penetration testing and security audit

---

## Conclusion

The EKAI MVP has a reasonable security foundation with proper authentication, validation, and logging. However, several critical vulnerabilities must be fixed before any production deployment with actual student data. The primary concerns are token storage, OTP persistence, HTTPS enforcement, and data encryption.

**Estimated Time to Fix Critical Issues:** 3-5 business days
**Estimated Time to Address All Issues:** 2-3 weeks

With these fixes implemented, the application will be suitable for limited production deployment with appropriate compliance certifications.
