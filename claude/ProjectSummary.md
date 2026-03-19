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
| CI/CD | GitHub Actions | GitHub |

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
}

const SECOND_ROLE_MAP = {
  'Software Developer':       ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
  'QA Engineer':              ['Senior QA Engineer', 'QA Lead', 'Engineering Manager'],
  'Data Analyst':             ['Senior Analyst', 'Data Scientist', 'Analytics Manager'],
  'IT Support':               ['Systems Administrator', 'IT Manager', 'DevOps Engineer'],
  'Sales Associate':          ['Account Executive', 'Sales Manager', 'VP of Sales'],
  'Marketing Coordinator':    ['Marketing Manager', 'Brand Strategist', 'CMO'],
  'Operations Analyst':       ['Operations Manager', 'Director of Operations', 'COO'],
  'Financial Analyst':        ['Senior Financial Analyst', 'Finance Manager', 'CFO'],
  'HR Coordinator':           ['HR Manager', 'People Operations Lead', 'Chief People Officer'],
  'Case Manager':             ['Senior Case Manager', 'Program Director', 'Non-Profit Director'],
  'UX Researcher':            ['Senior UX Researcher', 'UX Lead', 'Head of Design'],
  'Research Assistant':       ['Research Scientist', 'Principal Investigator', 'Lab Director'],
  'Lab Technician':           ['Senior Lab Technician', 'Lab Manager', 'Research Director'],
  'Healthcare Coordinator':   ['Healthcare Manager', 'Director of Patient Services', 'COO'],
  'Junior Engineer':          ['Senior Engineer', 'Engineering Lead', 'Director of Engineering'],
  'Technical Sales':          ['Technical Sales Manager', 'VP of Sales', 'Business Development Director'],
  'Manufacturing Associate':  ['Production Supervisor', 'Plant Manager', 'VP of Operations'],
}
```
200 alumni. Weighted sampling produces 20-40+ per major→job transition. Pure Faker randomness breaks the Sankey.

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
| GET | `/api/health` | `{ status, timestamp }` — UptimeRobot target |
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
├── .github/workflows/
│   ├── backend.yml          → lint + jest + deploy hook (main only)
│   └── frontend.yml         → lint only (Vercel auto-deploys)
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
