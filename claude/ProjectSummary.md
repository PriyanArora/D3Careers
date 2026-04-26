# PathFinder — Project Summary

**Visual Career Pathway Explorer with Alumni Mentor Matching**
"See the career paths of people who started exactly where you are."

First-gen college students lack informal career guidance. PathFinder visualizes real career trajectories as interactive D3.js Sankey diagrams and connects students with alumni mentors who walked similar paths.

## System Overview

```
         Vercel (Frontend)              Render (Backend)
         React 18 + Vite               Node.js 20 + Express
         React Router v7 (lib mode)
                │                              │
                │ HTTPS (Axios + JWT)          ├── MongoDB Atlas (M0)
                │ HTTPS (polling, 30s)         ├── Upstash Redis (REST)
                │                              ├── SendGrid (email)
                └──────────────────────────────┘
                                               ↑
                                     Cal.com webhook
```

Core constraint: **the Sankey diagram is the front door.** Guests must see the full diagram immediately.

Free-tier deployment constraint: **no keep-warm ping service.** Render cold starts are acceptable; the frontend must show a visible loading state, retry the request, and render once the backend wakes.

## Core Features

- Interactive Sankey diagram: majors → first jobs → career progressions (D3.js + d3-sankey)
- Alumni contribute career timelines: roles, skills, advice
- Students filter by major, background tags, path depth (2/3/full hops)
- Mentor matching via Cal.com scheduling + SendGrid email notifications
- Personal dashboard: saved bookmarks, booked sessions, Recharts industry chart

## Tech Stack

| Layer | Technology | Host |
|---|---|---|
| Frontend | React 18 + Vite | Vercel |
| Routing | React Router v7 (library mode) | Frontend |
| Visualization | D3.js + d3-sankey, Recharts | Frontend |
| Backend | Node.js 20 + Express | Render |
| Database | MongoDB + Mongoose | Atlas (M0) |
| Cache | Upstash Redis (REST) | Upstash |
| Auth | JWT + bcrypt | Backend |
| Scheduling | Cal.com embed + webhook | Cal.com |
| Email | SendGrid | SendGrid |
| Local Dev | Docker Compose | Local |

React Router v7 in **library mode** — same API as v6, no framework mode. Framework mode would couple routing to data fetching and obscure the Express backend architecture.

---

## Architecture Decisions

### D1 — One Alumni Collection, No `/api/mentors`
Single `Alumni` model. No `/api/mentors` routes. Alumni ARE mentors. The word "mentor" lives in UI copy only. `AlumniPage.jsx` fetches `GET /api/alumni`.

### D2 — JWT in localStorage (Not State, Not Cookies)
Token stored as `pf_token`. AuthContext reads on mount for refresh persistence.
**Why JWT over sessions:** Frontend (Vercel) and backend (Render) are different origins. Cookies require `SameSite=None` + `Secure` + CORS credentials — fragile on free-tier hosting. JWT in `Authorization` header sidesteps cross-origin cookie complexity. Also: Render cold starts kill in-memory sessions; Redis-backed sessions add complexity JWT gives for free.
**Tradeoff:** localStorage is XSS-vulnerable. For production with sensitive data, httpOnly cookies are correct. For this portfolio MVP, localStorage is acceptable. Document in README.

### D3 — Jest in Phase 6, Not Phase 18
TDD on `sankeyService.js` requires Jest before the implementation exists.

### D4 — Depth Filter Is a First-Class Aggregation Param
`depth=2` → major→firstJob only. `depth=3` → adds firstJob→secondRole. `depth=full` → all transitions. Must be wired UI → query param → aggregation pipeline.

### D5 — Cal.com Webhook Is Single Booking Source of Truth
No `MentorRequest` model. Full flow:
```
Student → Schedule Chat → SoftAuthGate
  → (guest) LoginPromptModal, page stays
  → (logged in) Cal.com embed renders
  → booking → Cal.com POST /api/bookings/webhook
  → verifyWebhookSignature: crypto.createHmac('sha256', secret).update(payload).digest('hex')
  → MentorSession created (calEventUid dedup)
  → SendGrid email → alumni inbox
  → alumni polling detects new session → toast
```

### D6 — Full Cache Flush on New Alumni Registration
Key format: `sankey:{major|'all'}:{background|'all'}:{depth|'full'}`. Lifecycle: request → cache check → hit returns / miss runs pipeline → cache set (1hr TTL) → return. New registration deletes all `sankey:*` keys.

### D7 — Polling for All Real-Time Features
Both online indicators and booking notifications use polling — no WebSocket infrastructure. `GET /api/alumni/online` (all visitors, 30s) for green dots. `GET /api/alumni/:id/sessions` (auth alumni, 30s) for booking toast — client compares count to previous poll, shows toast on increase. Interview answer: "Polling is appropriate at this traffic volume. Socket.IO would demonstrate authenticated connection patterns but adds infrastructure complexity without meaningful benefit here."

### D8 — HomePage Is a Landing Page
Not a redirect. Hero + value prop + CTAs. Makes it look like a product.

### D9 — Error Re-Throw Preserves Cause
```javascript
throw new Error('[sankeyService] Failed', { cause: error })
```
String-only re-throws lose the original file/line. `{ cause: error }` is Node 16+ standard.

---

## Data Models

### Alumni.js
```
name: String (required)           email: String (required, unique)
passwordHash: String (required)   role: 'alumni' (enum, default)
major: String (required)          currentRole: String
currentCompany: String            bio: String
backgroundTags: [String]          → ['firstGen', 'transfer', 'international']
isAvailableForMentorship: Boolean (default: true)
isProfileComplete: Boolean (default: false)  → set true when careerTimeline submitted
careerTimeline: [{
  title: String (required), company: String, industry: String,
  startYear: Number, endYear: Number (null if current),
  skillsGained: [String], adviceForSelf: String
}]
timestamps: true
```

### Student.js
```
name: String (required)           email: String (required, unique)
passwordHash: String (required)   role: 'student' (enum, default)
major: String                     backgroundTags: [String]
savedPaths: [{
  label: String,
  filters: { major: String, background: String, depth: String },  ← String, not Number ('full')
  savedAt: Date
}]
timestamps: true
```

### MentorSession.js
Created exclusively by Cal.com webhook handler.
```
alumniId: ObjectId (ref: Alumni, required)
studentId: ObjectId (ref: Student, required)
calEventUid: String (required, unique)  ← dedup key
scheduledAt: Date (required)
status: enum ['confirmed', 'cancelled', 'completed'] (default: 'confirmed')
timestamps: true
```

---

## Seed Data — Constrained Career Map

```javascript
const CAREER_PATHS = {
  'Computer Science': [
    { firstJob: 'Software Developer', weight: 40 }, { firstJob: 'QA Engineer', weight: 15 },
    { firstJob: 'Data Analyst', weight: 20 },       { firstJob: 'IT Support', weight: 25 },
  ],
  'Business Administration': [
    { firstJob: 'Sales Associate', weight: 35 },       { firstJob: 'Marketing Coordinator', weight: 30 },
    { firstJob: 'Operations Analyst', weight: 20 },     { firstJob: 'Financial Analyst', weight: 15 },
  ],
  'Psychology': [
    { firstJob: 'HR Coordinator', weight: 40 },  { firstJob: 'Case Manager', weight: 30 },
    { firstJob: 'UX Researcher', weight: 15 },   { firstJob: 'Sales Associate', weight: 15 },
  ],
  'Biology': [
    { firstJob: 'Research Assistant', weight: 45 }, { firstJob: 'Lab Technician', weight: 30 },
    { firstJob: 'Healthcare Coordinator', weight: 25 },
  ],
  'Mechanical Engineering': [
    { firstJob: 'Junior Engineer', weight: 50 },        { firstJob: 'Technical Sales', weight: 25 },
    { firstJob: 'Manufacturing Associate', weight: 25 },
  ],
  'Electrical Engineering': [
    { firstJob: 'Electrical Engineer', weight: 45 },      { firstJob: 'Systems Engineer', weight: 25 },
    { firstJob: 'Field Service Engineer', weight: 20 },   { firstJob: 'Technical Sales Engineer', weight: 10 },
  ],
  'Nursing / Health Sciences': [
    { firstJob: 'Registered Nurse', weight: 50 },       { firstJob: 'Clinical Coordinator', weight: 25 },
    { firstJob: 'Health Educator', weight: 15 },         { firstJob: 'Medical Assistant', weight: 10 },
  ],
  'Accounting / Finance': [
    { firstJob: 'Junior Accountant', weight: 40 },  { firstJob: 'Financial Analyst', weight: 30 },
    { firstJob: 'Audit Associate', weight: 20 },    { firstJob: 'Tax Associate', weight: 10 },
  ],
}

const SECOND_ROLE_MAP = {
  // Computer Science
  'Software Developer':       ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
  'QA Engineer':              ['Senior QA Engineer', 'QA Lead', 'Engineering Manager'],
  'Data Analyst':             ['Senior Analyst', 'Data Scientist', 'Analytics Manager'],
  'IT Support':               ['Systems Administrator', 'IT Manager', 'DevOps Engineer'],
  // Business Administration
  'Sales Associate':          ['Account Executive', 'Sales Manager', 'VP of Sales'],
  'Marketing Coordinator':    ['Marketing Manager', 'Brand Strategist', 'CMO'],
  'Operations Analyst':       ['Operations Manager', 'Director of Operations', 'COO'],
  'Financial Analyst':        ['Senior Financial Analyst', 'Finance Manager', 'CFO'],
  // Psychology
  'HR Coordinator':           ['HR Manager', 'People Operations Lead', 'Chief People Officer'],
  'Case Manager':             ['Senior Case Manager', 'Program Director', 'Non-Profit Director'],
  'UX Researcher':            ['Senior UX Researcher', 'UX Lead', 'Head of Design'],
  // Biology
  'Research Assistant':       ['Research Scientist', 'Principal Investigator', 'Lab Director'],
  'Lab Technician':           ['Senior Lab Technician', 'Lab Manager', 'Research Director'],
  'Healthcare Coordinator':   ['Healthcare Manager', 'Director of Patient Services', 'COO'],
  // Mechanical Engineering
  'Junior Engineer':          ['Senior Engineer', 'Engineering Lead', 'Director of Engineering'],
  'Technical Sales':          ['Technical Sales Manager', 'VP of Sales', 'Business Development Director'],
  'Manufacturing Associate':  ['Production Supervisor', 'Plant Manager', 'VP of Operations'],
  // Electrical Engineering
  'Electrical Engineer':      ['Senior Electrical Engineer', 'Power Systems Engineer', 'Engineering Manager'],
  'Systems Engineer':         ['Senior Systems Engineer', 'Systems Architect', 'Engineering Manager'],
  'Field Service Engineer':   ['Senior Field Engineer', 'Field Operations Manager', 'Engineering Manager'],
  'Technical Sales Engineer': ['Sales Engineer Manager', 'VP of Sales', 'Business Development Director'],
  // Nursing / Health Sciences
  'Registered Nurse':         ['Senior Nurse', 'Nurse Practitioner', 'Nursing Manager'],
  'Clinical Coordinator':     ['Clinical Manager', 'Director of Clinical Operations', 'VP of Patient Services'],
  'Health Educator':          ['Senior Health Educator', 'Program Manager', 'Director of Public Health'],
  'Medical Assistant':        ['Senior Medical Assistant', 'Office Manager', 'Practice Administrator'],
  // Accounting / Finance
  'Junior Accountant':        ['Senior Accountant', 'Accounting Manager', 'Controller'],
  'Audit Associate':          ['Senior Auditor', 'Audit Manager', 'Partner'],
  'Tax Associate':            ['Senior Tax Associate', 'Tax Manager', 'Tax Director'],
}

const THIRD_ROLE_MAP = {
  // CS paths
  'Senior Developer':           ['Staff Engineer', 'VP of Engineering', 'CTO'],
  'Tech Lead':                  ['Staff Engineer', 'Director of Engineering', 'VP of Engineering'],
  'Engineering Manager':        ['Director of Engineering', 'VP of Engineering', 'CTO'],
  'Senior QA Engineer':         ['QA Director', 'Director of Engineering', 'VP of Quality'],
  'QA Lead':                    ['QA Director', 'Director of Engineering', 'VP of Quality'],
  'Senior Analyst':             ['Analytics Director', 'VP of Data', 'Chief Data Officer'],
  'Data Scientist':             ['Lead Data Scientist', 'VP of Data', 'Chief Data Officer'],
  'Analytics Manager':          ['Analytics Director', 'VP of Data', 'Chief Data Officer'],
  'Systems Administrator':      ['Infrastructure Lead', 'Director of IT', 'VP of Engineering'],
  'IT Manager':                 ['Director of IT', 'VP of Technology', 'CTO'],
  'DevOps Engineer':            ['Staff Engineer', 'Director of Platform', 'VP of Engineering'],
  // Business paths
  'Account Executive':          ['Sales Director', 'VP of Sales', 'Chief Revenue Officer'],
  'Sales Manager':              ['Sales Director', 'VP of Sales', 'Chief Revenue Officer'],
  'VP of Sales':                ['Chief Revenue Officer', 'General Manager', 'CEO'],
  'Marketing Manager':          ['Director of Marketing', 'VP of Marketing', 'CMO'],
  'Brand Strategist':           ['Director of Brand', 'VP of Marketing', 'CMO'],
  'CMO':                        ['President', 'CEO', 'Board Advisor'],
  'Operations Manager':         ['Director of Operations', 'VP of Operations', 'COO'],
  'Director of Operations':     ['VP of Operations', 'COO', 'CEO'],
  'COO':                        ['President', 'CEO', 'Board Advisor'],
  'Senior Financial Analyst':   ['Finance Director', 'VP of Finance', 'CFO'],
  'Finance Manager':            ['Finance Director', 'VP of Finance', 'CFO'],
  'CFO':                        ['President', 'CEO', 'Board Advisor'],
  // Psychology paths
  'HR Manager':                 ['Director of HR', 'VP of People', 'Chief People Officer'],
  'People Operations Lead':     ['Director of HR', 'VP of People', 'Chief People Officer'],
  'Chief People Officer':       ['President', 'CEO', 'Board Advisor'],
  'Senior Case Manager':        ['Program Director', 'Executive Director', 'Chief Program Officer'],
  'Program Director':           ['Executive Director', 'Chief Program Officer', 'CEO'],
  'Non-Profit Director':        ['Executive Director', 'CEO', 'Board Chair'],
  'Senior UX Researcher':       ['Director of Research', 'VP of Design', 'Chief Design Officer'],
  'UX Lead':                    ['Director of Design', 'VP of Design', 'Chief Design Officer'],
  'Head of Design':             ['VP of Design', 'Chief Design Officer', 'CPO'],
  // Biology paths
  'Research Scientist':         ['Lead Scientist', 'Director of Research', 'VP of R&D'],
  'Principal Investigator':     ['Director of Research', 'VP of R&D', 'Chief Science Officer'],
  'Lab Director':               ['VP of R&D', 'Chief Science Officer', 'CEO'],
  'Senior Lab Technician':      ['Lab Director', 'Director of Research', 'VP of R&D'],
  'Lab Manager':                ['Lab Director', 'Director of Research', 'VP of R&D'],
  'Research Director':          ['VP of R&D', 'Chief Science Officer', 'CEO'],
  'Healthcare Manager':         ['Director of Healthcare Operations', 'VP of Patient Services', 'COO'],
  'Director of Patient Services': ['VP of Patient Services', 'COO', 'CEO'],
  // Mechanical Engineering paths
  'Senior Engineer':            ['Staff Engineer', 'Director of Engineering', 'VP of Engineering'],
  'Engineering Lead':           ['Director of Engineering', 'VP of Engineering', 'CTO'],
  'Director of Engineering':    ['VP of Engineering', 'CTO', 'CEO'],
  'Technical Sales Manager':    ['Director of Sales', 'VP of Sales', 'Chief Revenue Officer'],
  'Business Development Director': ['VP of Business Development', 'Chief Revenue Officer', 'CEO'],
  'Production Supervisor':      ['Plant Manager', 'VP of Manufacturing', 'COO'],
  'Plant Manager':              ['VP of Manufacturing', 'VP of Operations', 'COO'],
  'VP of Operations':           ['COO', 'President', 'CEO'],
  // Electrical Engineering paths
  'Senior Electrical Engineer': ['Lead Engineer', 'Director of Engineering', 'VP of Engineering'],
  'Power Systems Engineer':     ['Lead Power Engineer', 'Director of Engineering', 'VP of Engineering'],
  'Senior Systems Engineer':    ['Staff Engineer', 'Director of Engineering', 'VP of Engineering'],
  'Systems Architect':          ['Director of Architecture', 'VP of Engineering', 'CTO'],
  'Senior Field Engineer':      ['Field Operations Manager', 'Director of Field Operations', 'VP of Operations'],
  'Field Operations Manager':   ['Director of Field Operations', 'VP of Operations', 'COO'],
  'Sales Engineer Manager':     ['Director of Sales Engineering', 'VP of Sales', 'Chief Revenue Officer'],
  // Nursing / Health Sciences paths
  'Senior Nurse':               ['Nurse Director', 'VP of Nursing', 'Chief Nursing Officer'],
  'Nurse Practitioner':         ['Lead Nurse Practitioner', 'Director of Clinical Services', 'Chief Nursing Officer'],
  'Nursing Manager':            ['Director of Nursing', 'VP of Nursing', 'Chief Nursing Officer'],
  'Clinical Manager':           ['Director of Clinical Operations', 'VP of Patient Services', 'COO'],
  'Director of Clinical Operations': ['VP of Patient Services', 'COO', 'CEO'],
  'VP of Patient Services':     ['COO', 'President', 'CEO'],
  'Senior Health Educator':     ['Director of Public Health', 'VP of Community Health', 'Chief Health Officer'],
  'Program Manager':            ['Director of Programs', 'VP of Programs', 'Executive Director'],
  'Director of Public Health':  ['VP of Public Health', 'Chief Health Officer', 'Commissioner of Health'],
  'Senior Medical Assistant':   ['Office Manager', 'Practice Administrator', 'Director of Operations'],
  'Office Manager':             ['Practice Administrator', 'Director of Operations', 'COO'],
  'Practice Administrator':     ['Regional Director', 'VP of Operations', 'COO'],
  // Accounting / Finance paths
  'Senior Accountant':          ['Accounting Director', 'Controller', 'CFO'],
  'Accounting Manager':         ['Controller', 'VP of Finance', 'CFO'],
  'Controller':                 ['VP of Finance', 'CFO', 'CEO'],
  'Senior Auditor':             ['Audit Director', 'Partner', 'Managing Partner'],
  'Audit Manager':              ['Audit Director', 'Partner', 'Managing Partner'],
  'Partner':                    ['Managing Partner', 'CEO', 'Board Chair'],
  'Senior Tax Associate':       ['Tax Director', 'Partner', 'Managing Partner'],
  'Tax Manager':                ['Tax Director', 'Partner', 'Managing Partner'],
  'Tax Director':               ['Partner', 'Managing Partner', 'CEO'],
}
```
800 alumni (100 per major). Weighted sampling on firstJob, random on secondRole/thirdRole. ~50% of alumni have a thirdRole (careerTimeline length 3), the rest have length 2. Data sourced from refined Kaggle dataset with career paths reassigned via maps above.

---

## Aggregation Pipeline (sankeyService)

1. **$match** — filter by `major` and/or `backgroundTags`
2. **$project** — slice `careerTimeline` by `depth` (2, 3, or full)
3. **$unwind** — one doc per career stage
4. **$group** — count alumni per (source, target) transition pair
5. **buildSankeyShape** — deduplicate nodes, format links

Output: `{ nodes: [{ name }], links: [{ source, target, value }] }`

---

## Frontend Pages

| Page | Route | Auth | Guard |
|---|---|---|---|
| HomePage | `/` | Public | None |
| PathwaysPage | `/pathways` | Public | None |
| AlumniPage | `/alumni` | Public | None |
| AlumniProfilePage | `/alumni/:id` | Public | SoftAuthGate on Schedule Chat |
| DashboardPage | `/dashboard` | Protected | ProtectedRoute → /login |
| LoginPage | `/login` | Public | None |
| RegisterPage | `/register` | Public | None |

---

## API Reference

### Public (No Auth)
| Method | Route | Notes |
|---|---|---|
| GET | `/api/health` | `{ status, timestamp }` — deploy health check and cold-start probe |
| GET | `/api/pathways/sankey` | `?major=&background=&depth=` — optionalAuth, **ALWAYS public** |
| GET | `/api/alumni` | optionalAuth — browse grid, filter `isProfileComplete: true`, `?page=&limit=` (default limit=20) |
| GET | `/api/alumni/:id` | optionalAuth — full career timeline |
| GET | `/api/alumni/online` | No auth — returns online alumni IDs (polling) |
| POST | `/api/bookings/webhook` | Cal.com only, signature verified internally |

### Auth Routes
| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register/student` | Returns `{ token, user }` — role set server-side |
| POST | `/api/auth/register/alumni` | Returns `{ token, user }` — role set server-side |
| POST | `/api/auth/login` | Returns `{ token, user }` |

### Protected (authMiddleware + IDOR check)
| Method | Route | Notes |
|---|---|---|
| POST | `/api/alumni` | Step 2 of alumni registration (step 1: `/auth/register/alumni`). Submits career profile, sets `isProfileComplete: true` |
| GET | `/api/students/:id/dashboard` | `req.user.id === req.params.id` or 403 |
| POST | `/api/students/:id/paths` | Save bookmark — IDOR check |
| DELETE | `/api/students/:id/paths/:pathId` | Remove bookmark — IDOR check |
| GET | `/api/bookings/:studentId` | Session history — IDOR check |
| GET | `/api/alumni/:id/sessions` | Booking notification poll — IDOR check |

---

## File Structure

```
pathfinder/
├── client/src/
│   ├── api.js               → Axios + JWT header + cold-start retry
│   ├── context/AuthContext.jsx → localStorage JWT, booking notification polling
│   ├── guards/
│   │   ├── ProtectedRoute.jsx  → Hard redirect, DashboardPage ONLY
│   │   └── SoftAuthGate.jsx    → Modal on guest action, Schedule Chat ONLY
│   ├── components/          → Navbar, LoadingSkeleton, EmptyState, Toast, LoginPromptModal, ErrorBoundary
│   └── features/
│       ├── home/HomePage.jsx
│       ├── pathways/        → PathwaysPage, SankeyDiagram, FilterPanel
│       ├── alumni/          → AlumniPage, AlumniProfilePage
│       ├── dashboard/       → DashboardPage, SavedPathCard, StatsChart
│       └── auth/            → LoginPage, RegisterPage
├── server/
│   ├── models/              → Alumni.js, Student.js, MentorSession.js
│   ├── routes/              → alumni, students, pathways, bookings, auth
│   ├── controllers/         → alumniController, studentController, pathwaysController, authController, bookingController
│   ├── services/
│   │   ├── sankeyService.js → runAggregationPipeline, buildSankeyShape, buildCacheKey, getSankeyData
│   │   ├── cacheService.js  → get, set, flushSankeyCache
│   │   └── emailService.js  → sendBookingNotification
│   ├── middleware/           → authMiddleware (+ optionalAuth named export), errorMiddleware
│   ├── scripts/seed.js
│   └── __tests__/           → sankeyService.test.js, pathways.test.js, bookingController.test.js
├── docker-compose.yml       → server + mongo:7 + redis:7-alpine
└── .gitignore               → .env, node_modules/, dist/
```

---

## Environment Variables (server/.env)

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=<long-random-string>
CLIENT_ORIGIN=http://localhost:5173       ← CORS lock
SENDGRID_API_KEY=SG.xxx
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=<token>
CAL_WEBHOOK_SECRET=<secret>
PORT=5000
```
Every variable gets an env guard: `if (!x) throw new Error('X is not set.')`.
