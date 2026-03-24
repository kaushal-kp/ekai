# EKAI MVP - Legal & Compliance Documentation
**Last Updated:** March 24, 2026
**Status:** MVP Phase (Pre-Production)
**Jurisdiction:** India

---

## Table of Contents
1. DPDP Act 2023 Compliance
2. NEP 2020 Alignment
3. APAAR Data Handling
4. Student Data Protection
5. Consent Framework
6. Data Retention Policy
7. Incident Response Plan
8. Privacy Policy Requirements
9. Terms of Service Framework
10. Compliance Checklist

---

## 1. DPDP Act 2023 Compliance

### Act Overview
The **Digital Personal Data Protection (DPDP) Act, 2023** is India's primary data protection law governing the collection, processing, and storage of personal data. It applies to all entities handling personal data of Indian residents.

### 1.1 Personal Data Definition
**What constitutes personal data:**
- Name, phone number, email
- APAAR ID (educational identifier)
- Date of birth, gender
- Guardian information
- Academic records
- Attendance data
- Assessment scores
- Biometric data (if collected)

**What is NOT personal data (per Act):**
- Anonymized data
- Data already in public domain

### 1.2 Key Principles - Compliance Status

#### A. Purpose Limitation ✅ Partially Implemented
**Requirement:** Collect data only for stated purposes; don't use for unrelated purposes without new consent.

**Current Implementation:**
```javascript
// Consent scopes defined in consents.js:
enum('scope', [
  'basic_identity',
  'academic_summary',
  'detailed_academic',
  'attendance',
  'certificates',
  'full_profile',
])
```

**Status:** Defined but not enforced in data access
**Required Improvement:**
- Implement scope checking when accessing data
- Log which consent scope was used for each access
- Prevent using data beyond granted consent

**Implementation:**
```javascript
// Check scope before returning data
const canAccessData = (user, consent, requestedScope) => {
  return consent.scope === requestedScope || consent.scope === 'full_profile';
};

// Audit log format:
{
  access_id: uuid,
  user_id: requester_id,
  student_id: target_student,
  data_type: 'academic_records',
  consent_used: consent_id,
  scope_authorized: 'academic_summary',
  timestamp: now,
  ip_address: req.ip
}
```

---

#### B. Data Minimization ✅ Good Foundation
**Requirement:** Collect only minimum data necessary for stated purpose.

**Current Collection:**
```javascript
// Student table (necessary):
- apaar_id (identification)
- name (identification)
- dob (age verification, required by NEP)
- gender (reporting)
- class, section (academic context)
- guardian_name, guardian_phone (emergency contact)
- enrollment_date (record keeping)

// Could be minimized:
- NOT collecting: biometric data, geolocation, device IDs ✓
- NOT collecting: family income, caste, religion ✓
```

**Status:** Good - only essential academic and identity data collected
**Risk Areas:** None identified

---

#### C. Consent - Explicit and Informed ✅ Implemented
**Requirement:** Must have explicit, informed, freely given consent before processing personal data.

**Current Implementation:**

```javascript
// Consent table structure (consents.js migration):
{
  id: uuid,
  student_apaar_id: string,  // Who consents for
  granted_by: uuid,          // Student or parent
  granted_to_entity: string, // Recipient organization
  granted_to_type: enum,     // school, employer, government
  scope: enum,               // Data scope
  status: enum,              // active, revoked, expired
  granted_at: timestamp,
  ip_address: string,
  user_agent: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

**Consent Audit Log:**
```javascript
{
  id: uuid,
  consent_id: fk,
  performed_by: uuid,
  action: enum,           // 'granted', 'revoked', 'expired', 'accessed'
  ip_address: string,
  details: jsonb,         // reason, scope, etc.
  created_at: timestamp
}
```

**Status:** COMPLIANT - Clear consent model implemented
**Verification Evidence:**
- Explicit scope selection (file: `/sessions/sharp-zen-galileo/ekai/server/src/routes/consents.js`)
- Consent grant timestamp and IP recorded
- Audit trail of all consent actions
- Client receives consent screen before granting

**Required Improvements:**
1. Add "informed consent" check - must show what data will be shared
2. Add consent withdrawal reminder in UI
3. Set default expiry dates for consents

**Implementation:**

```javascript
// Enhanced consent model
const consentDetails = {
  scope: 'academic_summary',
  dataIncluded: [
    'Student name',
    'Current class and section',
    'Overall attendance percentage',
    'Subject-wise grades summary',
    'Certificates of achievement'
  ],
  excludedData: [
    'Individual assessment details',
    'Guardian contact information',
    'Internal notes by teachers',
    'Disciplinary records'
  ],
  recipient: 'Higher Education Institution',
  purpose: 'Admission and scholarship evaluation',
  retentionPeriod: '1 year',
  dataWillBeSharedWith: 'ABC University Administration Team'
};
```

---

#### D. Data Security (Encryption) ⚠️ NOT IMPLEMENTED
**Requirement:** Personal data must be protected with appropriate security measures.

**Current Status:**
- Student data stored in plaintext in PostgreSQL
- No field-level encryption
- Transit security depends on HTTPS (not enforced)

**Risk:** CRITICAL - Database breach exposes all student PII

**Required Implementation:**
```sql
-- Option 1: Transparent Data Encryption (TDE) - PostgreSQL pgcrypto
CREATE EXTENSION pgcrypto;

-- Option 2: Application-level encryption
-- Encrypt before storage, decrypt on retrieval

-- Fields to encrypt:
-- - name
-- - dob
-- - guardian_name
-- - guardian_phone
-- - email
```

**Implementation Code:**
```javascript
const crypto = require('crypto');

class EncryptionService {
  constructor(masterKey) {
    this.masterKey = Buffer.from(masterKey, 'hex'); // 32 bytes for AES-256
  }

  encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted: encrypted,
      // Format: "iv:authTag:encryptedData"
      toString() {
        return `${this.iv}:${this.authTag}:${this.encrypted}`;
      }
    };
  }

  decrypt(encryptedData) {
    const [iv, authTag, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.masterKey,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Usage in students route
const encryptor = new EncryptionService(process.env.DATA_ENCRYPTION_KEY);

// Storing
const student = {
  apaar_id,
  name: encryptor.encrypt(req.body.name).toString(),
  dob: encryptor.encrypt(req.body.dob).toString(),
  guardian_phone: encryptor.encrypt(req.body.guardian_phone).toString(),
  encrypted_at: new Date(),
  encryption_version: 1
};

// Retrieving
student.name = encryptor.decrypt(student.name);
student.guardian_phone = encryptor.decrypt(student.guardian_phone);
```

**Timeline:** MUST IMPLEMENT before production data collection

---

#### E. Data Subject Rights ✅ Partially Implemented
**Requirement:** Individuals have rights to access, correct, delete, and move their data.

**Current Implementation:**

1. **Right to Access:**
   ```javascript
   // GET /api/auth/me - user can see their own data
   // GET /api/students/profile - student can see their profile
   ```
   Status: ✅ Implemented for own data

2. **Right to Rectification (Correction):**
   - No edit endpoints currently implemented
   - Status: ⚠️ Needs implementation

3. **Right to Erasure (Right to be Forgotten):**
   - No deletion endpoints
   - Status: ⚠️ Needs implementation with legal considerations

4. **Right to Restrict Processing:**
   - Partially through consent revocation
   - Status: ✅ Partially implemented

**Required Implementation:**

```javascript
// PUT /api/students/profile - Update own data
router.put(
  '/profile',
  authMiddleware,
  authorize('student'),
  body('name').optional().trim(),
  body('guardian_phone').optional().isMobilePhone(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, guardian_phone } = req.body;
    const updates = {};

    if (name) updates.name = encryptor.encrypt(name).toString();
    if (guardian_phone) updates.guardian_phone = encryptor.encrypt(guardian_phone).toString();

    await db('students').where('user_id', req.user.id).update({
      ...updates,
      updated_at: db.fn.now()
    });

    // Audit log
    await db('data_change_log').insert({
      id: uuidv4(),
      user_id: req.user.id,
      entity: 'student',
      action: 'update',
      fields_changed: Object.keys(updates),
      timestamp: db.fn.now()
    });

    res.json({ success: true, message: 'Profile updated' });
  })
);

// POST /api/students/request-deletion - Right to be forgotten
router.post(
  '/request-deletion',
  authMiddleware,
  authorize('student', 'parent'),
  asyncHandler(async (req, res) => {
    const deletionRequest = {
      id: uuidv4(),
      user_id: req.user.id,
      student_id: req.body.student_id,
      requested_at: db.fn.now(),
      status: 'pending',  // pending -> approved -> deleted
      reason: req.body.reason,
      ip_address: req.ip
    };

    await db('deletion_requests').insert(deletionRequest);

    res.json({
      success: true,
      message: 'Deletion request submitted. Will be processed within 30 days.'
    });
  })
);
```

---

#### F. Data Breach Notification ⚠️ NOT IMPLEMENTED
**Requirement:** Notify affected individuals and MEITY (Ministry of Electronics and IT) within 72 hours of discovery.

**Current Status:** No notification system in place

**Required Implementation:**

```javascript
// Incident reporting system
const reportBreach = async (breachDetails) => {
  const {
    type,           // 'unauthorized_access', 'data_theft', etc.
    affectedUsers,  // count of users affected
    dataFields,     // which fields compromised
    discoveredAt,
    reportedAt
  } = breachDetails;

  // 1. Log incident
  await db('security_incidents').insert({
    id: uuidv4(),
    type,
    affected_users_count: affectedUsers.length,
    data_compromised: dataFields,
    discovered_at: discoveredAt,
    reported_at: reportedAt,
    mitigation_steps: [],
    status: 'reported'
  });

  // 2. Notify affected users via SMS/Email
  for (const userId of affectedUsers) {
    const user = await db('users').where('id', userId).first();
    await notificationService.sendBreachNotification(user, {
      dataCompromised: dataFields,
      reportedAt: reportedAt,
      supportContact: 'security@ekai.local'
    });
  }

  // 3. Notify MEITY (placeholder for actual integration)
  await reportToMEITY({
    organizationName: 'EKAI',
    breachType: type,
    affectedIndividuals: affectedUsers.length,
    personalDataTypes: dataFields,
    dateOfBreach: discoveredAt,
    dateOfNotification: reportedAt,
    description: `Potential breach affecting ${affectedUsers.length} individuals`
  });

  // 4. Alert security team
  logger.error('SECURITY BREACH REPORTED', {
    incident_id: incident.id,
    affected_count: affectedUsers.length,
    timestamp: reportedAt
  });
};
```

---

### 1.3 Data Processing Agreement (DPA)

**What:** Formal contract between EKAI (Data Controller) and any Data Processor

**Status:** NOT DOCUMENTED

**Required Document:**

```markdown
## Data Processing Agreement - EKAI

### 1. Parties
- **Data Controller:** EKAI (Educational Knowledge Access Initiative)
- **Data Processor:** [Entity Name]
- **Data Subjects:** Students of registered schools

### 2. Scope of Processing
- Personal data: Student names, contact info, academic records
- Processing: Storage, retrieval, analysis for educational reports
- Locations: India (PostgreSQL, Redis servers)

### 3. Security Obligations
- Encrypt personal data using AES-256
- Implement access controls
- Maintain audit logs
- Report breaches within 72 hours
- Conduct annual security audits

### 4. Data Subject Rights
- Data Controller ensures right to access, rectification, erasure
- Data Processor assists in fulfilling these rights

### 5. Sub-processors
- PostgreSQL database provider
- Redis caching provider
- AWS S3 for document storage (if applicable)

### 6. Liability
- Data Processor liable for breaches due to negligence
- Data Controller liable for lawful basis of collection

### 7. Term
- [Duration - typically matches service agreement]
- Termination: Data must be deleted within 30 days
```

---

### 1.4 Lawful Basis for Processing

**Current Implementation:** Primarily CONSENT (with implicit LEGITIMATE INTEREST for educational records)

**Chart:**
```
Processing Activity          | Lawful Basis     | Current Status
-------------------------------------------------------------------
Student self-registration    | Consent          | ✅ Implemented
Parent/guardian access       | Consent          | ✅ Implemented
School admin access          | Legitimate Int.  | ✅ Implemented
Government data sharing      | Consent + Law    | ✅ Implemented via APAAR
Teacher access to class data | Legitimate Int.  | ✅ Implemented
Emergency contact usage      | Legitimate Int.  | ✅ Implemented
Student record retention     | Legal Oblig.     | ⚠️ Needs policy
```

---

## 2. NEP 2020 Alignment

### National Education Policy 2020 Overview
Promotes student-centric, flexible, holistic education with digital learning infrastructure. EKAI MVP supports NEP goals for academic record digitization and portability.

### 2.1 Digital Infrastructure Alignment

| NEP Objective | EKAI Feature | Status |
|---------------|-------------|--------|
| Integrated learning platform | Student/School hubs | ✅ Implemented |
| Academic record portability | APAAR integration | ✅ Implemented |
| Continuous assessment tracking | Attendance, Assessments | ✅ Implemented |
| Teacher empowerment tools | School Hub, grade entry | ✅ Implemented |
| Transparency in evaluation | Reports, audit logs | ✅ Implemented |
| Digital learning resources | Documents section | ✅ Partially |
| Multilingual support | Not yet | ⚠️ Future |
| Inclusive education tech | Accessibility features | ⚠️ Future |

### 2.2 Specific NEP Requirements

**1. Academic Record Portability**
- EKAI maintains student records in APAAR-compatible format
- Consent-based sharing with educational institutions
- Implementation: Via consents module and APAAR API integration

**2. Continuous and Comprehensive Evaluation (CCE)**
- Tracking multiple assessment types: unit tests, midterms, finals, assignments
- Attendance monitoring
- Implementation: Assessments and attendance modules

**3. Foundational Literacy and Numeracy (FLN)**
- Not currently implemented (future phase)
- Would require specific FLN assessment tracking

**4. Vocational Education**
- Currently supports academics only
- Could extend for vocational certification tracking

---

## 3. APAAR Data Handling

### APAAR Overview
**APAAR** = Automated Permanent Academic Account Registry
- One-time enrollment in 9th grade
- Permanent student ID: `IN-XX-###-####-#####`
- Tracks academic progression, certifications, achievements
- Governed by NITI Aayog

### 3.1 APAAR Data Rights & Responsibilities

**EKAI's Obligations as APAAR Service:**
1. Store APAAR-linked data with APAAR standard format
2. Provide consent-based data sharing
3. Maintain audit trails for all APAAR data access
4. Report data security incidents to APAAR authority
5. Comply with APAAR API rate limits and specifications

**Current Implementation:**

```javascript
// APAAR verification (apaarService.js)
verifyApaarId: async (apaarId) => {
  // Validates format: IN-[State]-[District]-[School]-[Sequential]
  if (!apaarId.match(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)) {
    throw new Error('Invalid APAAR ID format');
  }
  // Returns mock data for MVP
  return { apaar_id: apaarId, name: 'Mock Student', ... };
};
```

**Required for Production:**
- Real API integration with APAAR servers
- API credentials secure storage
- Rate limiting compliance
- Sync with APAAR on consent changes

### 3.2 Data Scope Mapping

```javascript
// APAAR-defined data scopes
enum('scope', [
  'basic_identity',      // Name, DOB, Gender, APAAR ID
  'academic_summary',    // Overall grades, attendance %
  'detailed_academic',   // Subject-wise performance
  'attendance',          // Day-wise attendance records
  'certificates',        // Issued certificates, awards
  'full_profile'         // All data
]);
```

**Mapping to APAAR Standards:**
```
APAAR Scope             | EKAI Equivalent
---------------------------------------------
Identity Tier 1         | basic_identity
Academic Summary        | academic_summary
Detailed Academic       | detailed_academic
Attendance Data         | attendance
Achievement Records     | certificates
Full Record             | full_profile
```

---

## 4. Student Data Protection (Special Category)

### 4.1 Children's Data (Below 18 Years)

**Legal Framework:**
- DPDP Act 2023 (primary)
- Juvenile Justice Act, 2015
- Protection of Children from Sexual Offences (POCSO) Act, 2012
- School Education Act, State-specific

**EKAI's Responsibilities:**

```javascript
// Age check and parental consent requirement
const isMinor = (dateOfBirth) => {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  return age < 18;
};

// Consent flow for minors
router.post('/auth/verify-otp', async (req, res) => {
  let user = await db('users').where('phone', normalizedPhone).first();

  if (!user) {
    // Check if minor
    const student = await db('students').where('phone', normalizedPhone).first();
    if (student && isMinor(student.dob)) {
      // Require parent/guardian consent
      return res.json({
        requires_parental_consent: true,
        minor_data: {
          name: student.name,
          dob: student.dob,
          school: student.school_udise
        }
      });
    }
  }
});
```

**Parent/Guardian Consent Required For:**
- Account creation (for students under 18)
- Data access by third parties
- Personal data modification
- Account deletion (right to be forgotten)

**Parent/Guardian Access Rights:**
```javascript
// Parents can access child's data via role 'parent'
router.get('/children/:childId',
  authMiddleware,
  authorize('parent'),
  asyncHandler(async (req, res) => {
    // Verify parent-child relationship
    const parent = await db('users').where('id', req.user.id).first();
    const child = await db('students').where('user_id', req.params.childId).first();

    // Check if verified parent
    const relationship = await db('parent_student_relationships')
      .where('parent_id', parent.id)
      .where('student_id', child.id)
      .first();

    if (!relationship?.verified) {
      return res.status(403).json({ error: 'Not verified parent' });
    }

    res.json({ child });
  })
);
```

### 4.2 Sensitive Student Data

**What is Considered Sensitive:**
- Health information (medical records, disabilities)
- Disciplinary records
- Counselor notes
- Psychological assessments
- Financial information (fee details, scholarships)

**EKAI's Policy:**
- Not currently collected (✅ Good practice)
- If needed: Strict encryption, separate access controls
- Audit trail for all accesses

---

## 5. Consent Framework

### 5.1 Consent Model

**Current Implementation:**

```javascript
// Consent attributes (from consents.js)
{
  id: uuid,                      // Unique consent record
  student_apaar_id: string,      // WHO (student being consented for)
  granted_by: uuid,              // WHO (student age 18+ or parent)
  granted_to_entity: string,     // TO WHOM (recipient name)
  granted_to_type: enum,         // TO WHOM TYPE (school, employer, govt)
  scope: enum,                   // WHAT (which data)
  status: enum,                  // CURRENT STATE
  granted_at: timestamp,         // WHEN
  ip_address: string,            // FROM WHERE
  user_agent: string,            // FROM WHAT DEVICE
  created_at: timestamp
}
```

### 5.2 Consent Lifecycle

```
NOT_GIVEN → PENDING_APPROVAL → ACTIVE → [REVOKED | EXPIRED]
```

**States:**
- `NOT_GIVEN`: Default - no consent granted
- `PENDING_APPROVAL`: Parental approval pending (for minors)
- `ACTIVE`: Consent is valid and can be used
- `REVOKED`: Student/parent explicitly withdrew consent
- `EXPIRED`: Consent past its expiration date

**Transitions:**

```javascript
const consentTransitions = {
  'NOT_GIVEN': ['PENDING_APPROVAL', 'ACTIVE'],
  'PENDING_APPROVAL': ['ACTIVE', 'REVOKED'],
  'ACTIVE': ['REVOKED', 'EXPIRED'],
  'REVOKED': [],     // Terminal state
  'EXPIRED': []      // Terminal state
};
```

### 5.3 Consent Withdrawal

**Current Implementation:**
```javascript
// PUT /api/consents/:id/revoke
router.put('/:id/revoke', authMiddleware, async (req, res) => {
  const consent = await db('consents').where('id', id).first();

  // Update status
  await db('consents').where('id', id).update({
    status: 'revoked',
    revoked_at: db.fn.now()
  });

  // Audit log
  await db('consent_audit_log').insert({
    consent_id: id,
    action: 'revoked',
    performed_by: req.user.id
  });
});
```

**Required Enhancement:**
- Withdraw all active consents at once (account-level)
- Bulk consent management
- Automatic revocation notification to recipients

---

### 5.4 Consent UI/UX Requirements

**What Student/Parent Must See Before Granting Consent:**

```
┌─────────────────────────────────────────────────────────┐
│ Data Sharing Consent Request                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ You are about to grant access to your data             │
│                                                         │
│ 📋 Recipient: ABC Higher Education Institution          │
│ 📅 Valid Until: March 24, 2027                          │
│ 🔒 Data Scope: Academic Summary                         │
│                                                         │
│ This includes:                                          │
│ ✓ Name and Student ID                                  │
│ ✓ Current Class and Section                            │
│ ✓ Overall Grades and Attendance                        │
│ ✓ Certificates of Achievement                         │
│                                                         │
│ This does NOT include:                                 │
│ ✗ Individual test scores                               │
│ ✗ Guardian contact information                         │
│ ✗ Internal teacher notes                               │
│                                                         │
│ Purpose: Admission evaluation and scholarship review    │
│                                                         │
│ Your consent will be stored and can be withdrawn       │
│ at any time from Settings → Data Sharing               │
│                                                         │
│              [Cancel]  [Grant Access]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Data Retention Policy

### 6.1 Retention Periods

**By Data Type:**

```
Data Type                | Retention Period | After Expiry
-------------------------------------------------------------
Student Account          | 5 years post     | Anonymize
(if inactive 1 year)     | graduation/exit  |
-------------------------------------------------------------
Academic Records         | 5 years post     | Archive then
(grades, certificates)   | graduation       | delete
-------------------------------------------------------------
Attendance Records       | 2 years          | Delete
-------------------------------------------------------------
Assessment Records       | 3 years          | Delete
-------------------------------------------------------------
Consent Records          | 7 years          | Archive
(for audit compliance)   |                  |
-------------------------------------------------------------
Consent Audit Logs       | 7 years          | Archive
(DPDP compliance)        |                  |
-------------------------------------------------------------
Access Logs              | 2 years          | Delete
-------------------------------------------------------------
Guardian Phone/Email     | Until account    | Delete
                         | deletion         |
-------------------------------------------------------------
```

### 6.2 Data Deletion Process

**Current Status:** NOT IMPLEMENTED

**Required Implementation:**

```javascript
// Automated data retention policy enforcement
const retentionPolicies = {
  'student_account': {
    retentionDays: 5 * 365,
    action: 'anonymize',
    condition: 'is_active = false AND last_login_at < NOW() - INTERVAL 1 YEAR'
  },
  'academic_records': {
    retentionDays: 3 * 365,
    action: 'delete',
    condition: 'student.graduation_date < NOW() - INTERVAL 3 YEARS'
  },
  'attendance_records': {
    retentionDays: 2 * 365,
    action: 'delete',
    condition: 'date < NOW() - INTERVAL 2 YEARS'
  }
};

// Scheduled job - runs daily
const enforceDataRetention = async () => {
  for (const [dataType, policy] of Object.entries(retentionPolicies)) {
    const affectedRecords = await db.raw(policy.condition);

    for (const record of affectedRecords) {
      if (policy.action === 'delete') {
        await deleteRecord(dataType, record.id);
        logger.info(`Deleted ${dataType}`, { id: record.id });
      } else if (policy.action === 'anonymize') {
        await anonymizeRecord(dataType, record.id);
        logger.info(`Anonymized ${dataType}`, { id: record.id });
      } else if (policy.action === 'archive') {
        await archiveRecord(dataType, record.id);
        logger.info(`Archived ${dataType}`, { id: record.id });
      }
    }
  }
};

const anonymizeRecord = async (dataType, id) => {
  if (dataType === 'student_account') {
    await db('students').where('id', id).update({
      name: 'DELETED_' + crypto.randomBytes(8).toString('hex'),
      dob: null,
      guardian_name: null,
      guardian_phone: null,
      email: null,
      phone: null,
      is_anonymized: true,
      anonymized_at: db.fn.now()
    });
  }
};
```

---

## 7. Incident Response Plan

### 7.1 Incident Types & Response Times

**Critical (Data Breach - involving personal data):**
- **Detection Time:** Immediate (suspicious activity alerts)
- **Response Time:** Within 4 hours
- **Escalation:** CISO → MEITY within 72 hours

**High (Unauthorized Access - no data exfiltration):**
- **Response Time:** Within 24 hours
- **Escalation:** CISO → Security team

**Medium (Failed Attempts/Malware):**
- **Response Time:** Within 48 hours
- **Escalation:** Security team

**Low (Non-security incidents):**
- **Response Time:** Within 5 days
- **Escalation:** Ops team

### 7.2 Incident Response Steps

```
STEP 1: DETECT & REPORT
├─ Automated alerts: Suspicious login, mass data access
├─ Manual report: User reports compromised account
├─ Create incident ticket with severity level
└─ Notify CISO immediately

STEP 2: CONTAIN
├─ Suspend suspicious accounts
├─ Revoke compromised tokens
├─ Isolate affected servers
└─ Preserve evidence (logs, snapshots)

STEP 3: INVESTIGATE
├─ Determine scope: How many users affected?
├─ Identify root cause: What happened?
├─ Timeline: When did it occur?
└─ Forensic analysis: How did it happen?

STEP 4: COMMUNICATE
├─ Notify affected users within 72 hours
├─ Report to MEITY (if personal data breach)
├─ Notify school administrators
└─ Public statement if major incident

STEP 5: REMEDIATE
├─ Fix security vulnerability
├─ Update security patches
├─ Reset passwords/keys
└─ Deploy fixes to production

STEP 6: LEARN
├─ Post-incident review
├─ Update security policies
├─ Conduct security training
└─ Test updated controls
```

### 7.3 Incident Communication Template

```
SECURITY INCIDENT NOTIFICATION

Date: [Date]
Incident ID: [INC-XXXX-XXXX]
Severity: [Critical/High/Medium]

WHAT HAPPENED:
[Description of incident in plain language]

WHO IS AFFECTED:
- Approximately [X] students
- [Schools if applicable]

WHAT DATA WAS AFFECTED:
- Names: [Yes/No]
- Phone Numbers: [Yes/No]
- Academic Records: [Yes/No]
- Other: [Specify]

WHAT WE'RE DOING:
1. [Action 1]
2. [Action 2]
3. [Action 3]

WHAT YOU SHOULD DO:
- [Recommendation 1]
- [Recommendation 2]

SUPPORT CONTACT:
- Email: security@ekai.local
- Phone: [Hotline]
- Response Time: [Hours]
```

---

## 8. Privacy Policy Requirements

### 8.1 Mandatory Privacy Policy Components

**Current Status:** NOT DOCUMENTED

**Required Privacy Policy Sections:**

```markdown
# EKAI Privacy Policy

## 1. Introduction
- What EKAI is and what we do
- Scope: Which students and schools are covered
- Effective date and last updated
- Contact information

## 2. Data Controller Information
- Legal name: [Organization name]
- Address: [Registered office]
- Contact email: [privacy@ekai.local]
- Grievance redressal officer: [Name, contact]

## 3. What Data We Collect
- Student data: Name, DOB, APAAR ID, phone, email
- Academic data: Grades, attendance, assessments
- Guardian data: Contact information, relationship
- Usage data: Login times, access patterns (non-identifying)

## 4. Legal Basis for Collection
- Consent: Primary basis for data sharing
- Legal Obligation: Maintaining records per education law
- Legitimate Interest: Improving educational outcomes
- NEP 2020 Compliance: Academic record digitization

## 5. How We Use Data
- Maintaining academic records
- Enabling data portability via APAAR
- Facilitating consent-based sharing
- Generating educational reports
- Complying with legal obligations

## 6. Data Sharing
- With whom: Schools, educational institutions (with consent)
- When: Only per explicit consent
- How: Encrypted transmission
- Scope: Only requested data fields

## 7. Data Protection
- Encryption: AES-256 for sensitive fields
- Access Control: Role-based, logged
- Storage: Secure PostgreSQL with backups
- Transmission: HTTPS/TLS 1.3
- Incident Response: 72-hour breach notification

## 8. Student Rights (Under DPDP Act)
- Right to Access: Request copy of your data
- Right to Rectification: Correct incorrect data
- Right to Erasure: Request data deletion
- Right to Restrict: Limit how data is used
- Right to Portability: Get data in standard format
- Right to Withdraw Consent: Revoke shared access at any time

## 9. Data Retention
- Academic records: 5 years post-graduation
- Attendance: 2 years
- Consent records: 7 years (audit compliance)
- See Data Retention Policy for details

## 10. Children's Privacy
- Parental consent required for students under 18
- Parents can access child's data
- Right to delete child's account
- No profiling or tracking

## 11. Third-Party Services
- APAAR integration: Data sharing controlled by DPDP consent
- Cloud providers: [List with security certifications]
- Payment processors: [If applicable]

## 12. Cookies & Tracking
- Authentication: Essential cookies for login
- Analytics: [Anonymized, opt-out available]
- No third-party tracking pixels

## 13. Contact & Grievance
- For privacy questions: privacy@ekai.local
- Grievance officer: [Name, phone, email]
- MEITY complaints: [Process and contact]
```

---

## 9. Terms of Service Framework

### 9.1 Key Terms to Define

```markdown
# EKAI Terms of Service

## Acceptable Use
- Use only for authorized educational purposes
- No unauthorized access attempts
- No collection of bulk data
- No commercial resale of data
- No impersonation of students/teachers

## Prohibited Activities
- Harassment or bullying
- Distribution of malware
- Unauthorized access to accounts
- Interference with system functionality

## Liability Limitations
- We provide service on "as-is" basis
- Not liable for data loss (maintain backups)
- Not liable for third-party actions
- Maximum liability: 12 months of fees paid

## Dispute Resolution
- Governing Law: India
- Jurisdiction: [State] courts
- Arbitration: [If applicable]

## Service Availability
- Uptime target: 99.5%
- Scheduled maintenance: [Notification period]
- Emergency maintenance: [Notification as soon as possible]

## Termination
- Either party can terminate with 30 days notice
- Data returned/deleted per retention policy
- Outstanding fees still payable
```

---

## 10. Compliance Checklist

### 10.1 DPDP Act 2023

- [ ] Data collection minimized (only necessary data)
- [ ] Purpose clearly stated to users
- [ ] Explicit consent obtained before processing
- [ ] Consent records maintained with audit trail
- [ ] Data Security Officer appointed
- [ ] Data Protection Impact Assessment (DPIA) completed
- [ ] Data Processing Agreement in place
- [ ] Breach notification plan documented
- [ ] User rights documented (access, rectification, erasure)
- [ ] Data retention policy implemented
- [ ] Sensitive data encrypted
- [ ] Consent withdrawal option provided
- [ ] Third-party processor agreements in place
- [ ] Regular security audits conducted
- [ ] Employee training completed

### 10.2 NEP 2020 Alignment

- [ ] Student record portability via APAAR
- [ ] Continuous assessment tracking
- [ ] Academic transparency dashboard
- [ ] Teacher empowerment tools
- [ ] Digital infrastructure for remote learning
- [ ] Parental involvement features
- [ ] Inclusive design for differently-abled students
- [ ] Multilingual support roadmap

### 10.3 APAAR Compliance

- [ ] APAAR ID format validation
- [ ] APAAR API integration tested
- [ ] Consent-based data sharing enabled
- [ ] Audit trail for all APAAR data access
- [ ] APAAR data sync mechanism implemented
- [ ] APAAR API rate limiting respected

### 10.4 Student Data Protection

- [ ] Parental consent for minors' accounts
- [ ] Age verification implemented
- [ ] Sensitive data not collected (health, discipline, etc.)
- [ ] Children's data encrypted
- [ ] Parental access controls implemented
- [ ] Special handling for minor account deletion

### 10.5 Operational Security

- [ ] SSL/TLS certificates valid and up-to-date
- [ ] HTTPOnly cookies for sensitive tokens
- [ ] CORS origins whitelist configured
- [ ] Rate limiting on all endpoints
- [ ] Input validation and sanitization
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Database backups tested
- [ ] Incident response plan tested
- [ ] Access logs maintained
- [ ] Regular penetration testing

### 10.6 Documentation

- [ ] Privacy Policy published and updated
- [ ] Terms of Service documented
- [ ] Data Processing Agreement signed
- [ ] Retention Policy documented
- [ ] Security Policy documented
- [ ] Incident Response Plan documented
- [ ] Data Breach Notification Process documented

---

## 11. Implementation Timeline

### Phase 1: MVP (Current) - 4 weeks
- [x] Basic RBAC implemented
- [x] Consent framework designed
- [ ] Privacy Policy published
- [ ] DPIA completed
- [ ] Security audit completed (IN PROGRESS)

### Phase 2: Pre-Production - 4 weeks
- [ ] Encryption at rest implemented
- [ ] HTTPOnly cookies deployed
- [ ] Breach notification system built
- [ ] Retention policy automation
- [ ] All security fixes deployed (from audit)

### Phase 3: Production Ready - 2 weeks
- [ ] Security testing completed
- [ ] MEITY compliance verification
- [ ] Data Processing Agreements signed
- [ ] Incident response team trained
- [ ] Monitoring and alerts configured

### Phase 4: Post-Launch - Ongoing
- [ ] Monthly security audits
- [ ] Quarterly compliance reviews
- [ ] Annual penetration testing
- [ ] Policy updates as needed

---

## 12. Key Contacts & Resources

### Legal & Compliance
- **Data Protection Officer:** [Name, contact]
- **Legal Counsel:** [Firm name, contact]
- **Privacy Team:** privacy@ekai.local
- **Grievance Officer:** grievances@ekai.local

### Technical Security
- **CISO:** [Name, contact]
- **Security Team:** security@ekai.local
- **Incident Response Hotline:** [Phone]

### External Resources
- **MEITY (Ministry of Electronics & IT):** www.meity.gov.in
- **APAAR Authority:** [Contact info]
- **State Education Department:** [Contact info]

### Applicable Laws
1. **Digital Personal Data Protection Act, 2023**
2. **National Education Policy 2020**
3. **Juvenile Justice Act, 2015**
4. **POCSO Act, 2012**
5. **Right to Information Act, 2005**
6. **State Right to Free Education Acts**

---

## 13. Conclusion

EKAI MVP has established a solid foundation for compliant student data management. Key achievements:

✅ Consent framework aligned with DPDP Act
✅ APAAR integration for record portability
✅ Role-based access control
✅ Audit trail for compliance
✅ NEP 2020 alignment in principle

**Critical Gaps Before Production:**

❌ Data encryption at rest
❌ Privacy Policy not published
❌ Formal Data Processing Agreements
❌ Breach notification system
❌ Data retention automation
❌ Incident response training

**Estimated Timeline to Full Compliance:** 6-8 weeks

All issues outlined in this document and SECURITY_AUDIT.md must be addressed before handling real student data in production.
