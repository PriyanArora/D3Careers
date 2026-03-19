# PathFinder — Architecture

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

Core constraint: **the Sankey diagram is the front door.** Every architecture decision flows from this — unauthenticated visitors must see the full diagram immediately.

---

## Frontend Architecture

### Pages & Auth

| Page | Route | Auth | Guard |
|---|---|---|---|
| HomePage | `/` | Public | None |
| PathwaysPage | `/pathways` | Public | None — zero auth logic |
| AlumniPage | `/alumni` | Public | None |
| AlumniProfilePage | `/alumni/:id` | Public | `SoftAuthGate` on Schedule Chat only |
| DashboardPage | `/dashboard` | Hard protected | `ProtectedRoute` → redirect `/login` |
| LoginPage | `/login` | Public | None |
| RegisterPage | `/register` | Public | None |

### Auth Guards (Two Distinct Patterns)

**`ProtectedRoute.jsx`** — Hard redirect to `/login` with `state: { from: location }`. Applied ONLY to DashboardPage.

**`SoftAuthGate.jsx`** — Opens `LoginPromptModal` over current page. No redirect, no URL change. Applied ONLY to Schedule Chat button.

### JWT Storage
- Key: `pf_token` in localStorage
- AuthContext reads on mount → refresh persistence
- Logout: remove from localStorage + set state null
- Why not cookies: cross-origin (Vercel↔Render), cold-start session loss
- XSS tradeoff acknowledged, documented in README

### Axios Instance (api.js)
- Base URL from `VITE_API_URL`
- Request interceptor: attaches `Authorization: Bearer <token>` if present
- Response interceptor: retries on network error / 503, up to 2x with 2s delay (Render cold starts)

### Booking Notification Polling (AuthContext)
- On login: start `setInterval` polling `GET /api/alumni/:id/sessions` every 30s
- Store previous session count in ref; show toast on count increase
- Stop interval on logout
- Guests have NO polling for this endpoint

---

## Backend Architecture

### Route Structure & Auth Levels

```
# PUBLIC — no middleware
GET  /api/health                    → UptimeRobot target
POST /api/auth/register/student     → role set server-side (not from body)
POST /api/auth/register/alumni      → role set server-side (not from body)
POST /api/auth/login                → returns { token, user }
POST /api/bookings/webhook          → Cal.com sig verified internally
GET  /api/alumni/online             → returns online alumni IDs (in-memory Set)

# PUBLIC — optionalAuth (attaches req.user if token present, never blocks)
GET  /api/pathways/sankey           → PERMANENTLY PUBLIC
GET  /api/alumni                    → filter isProfileComplete: true
GET  /api/alumni/:id                → full career timeline

# PROTECTED — authMiddleware (401 if no valid token)
POST /api/alumni                    → career profile submission
GET  /api/students/:id/dashboard    → + IDOR check: req.user.id === req.params.id
POST /api/students/:id/paths        → + IDOR check
DELETE /api/students/:id/paths/:pid → + IDOR check
GET  /api/bookings/:studentId       → + IDOR check: req.user.id === req.params.studentId
GET  /api/alumni/:id/sessions       → + IDOR check: alumni polls for new MentorSessions
```

### Middleware Stack

**`authMiddleware.js`** — Hard block. Decodes JWT, 401 if missing/invalid, attaches `req.user`.

**`optionalAuth`** (named export from `authMiddleware.js`) — Soft pass. Attempts decode, attaches `req.user` if valid, always calls `next()`. Not a separate file.

**`errorMiddleware.js`** — Global Express error handler, last in chain.

**Rate limiting** — `express-rate-limit` on `/api/auth` prefix: 20 requests per 15 minutes per IP.

**Input validation** — `express-validator` on registration routes: name (trim, max 100), email (isEmail, normalize), password (min 8).

**CORS** — Locked to `CLIENT_ORIGIN` env var. No bare `cors()`.
```javascript
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
```

### Service Layer

```
sankeyService.js
  ├── runAggregationPipeline(filters)  → MongoDB only. No cache, no transform, no auth.
  ├── buildSankeyShape(rawResults)     → Pure transform. No I/O. Testable in isolation.
  ├── buildCacheKey(filters)           → Pure. Returns 'sankey:{major}:{bg}:{depth}'.
  └── getSankeyData(filters)           → Orchestrates: cache check → pipeline → cache set.

cacheService.js
  ├── get(key)
  ├── set(key, value, ttl)
  └── flushSankeyCache()               → Deletes all sankey:* keys on new alumni registration.

emailService.js
  └── sendBookingNotification()        → SendGrid: student name + scheduled time → alumni.
```

**Key constraint:** sankeyService has ZERO auth dependency. Accepts filters as plain params. Does not read `req.user`.

### Error Handling Pattern
```javascript
} catch (error) {
  throw new Error('[sankeyService] Failed to build Sankey data', { cause: error })
}
```
Always `{ cause: error }`. Never string-only re-throw (loses original file/line).

---

## Database Architecture

### Collections
- **alumni** — core model. `careerTimeline[]` is raw input to aggregation pipeline
- **students** — `savedPaths[]` with filter state snapshots
- **mentorsessions** — created by Cal.com webhook ONLY. `calEventUid` is dedup key

`MentorRequest` does NOT exist. Never create it.

### Aggregation Pipeline (sankeyService)

1. **`$match`** — filter by `major` and/or `backgroundTags`
2. **`$project`** — slice `careerTimeline` by `depth` (2, 3, or full)
3. **`$unwind`** — one doc per career stage
4. **`$group`** — count alumni per `(source, target)` transition pair
5. **`buildSankeyShape`** — JS transform: deduplicate nodes, format links

Output: `{ nodes: [{ name }], links: [{ source, target, value }] }` — exact shape D3 Sankey expects.

### Seed Strategy
200 alumni via constrained `CAREER_PATHS` weighted map (see ProjectSummary.md). Never `faker.person.jobTitle()`. Must produce 15-40+ alumni per major→job transition.

---

## Caching Architecture

**Provider:** Upstash Redis (REST API — no TCP needed on Render free tier)

### Key Structure
```
sankey:{major|'all'}:{background|'all'}:{depth|'full'}
Examples: sankey:all:all:full, sankey:Computer Science:firstGen:3
```

### Lifecycle
1. Request → `getSankeyData(filters)` → build cache key
2. Cache hit → return immediately (Atlas not queried)
3. Cache miss → run pipeline → store with 1hr TTL → return
4. New alumni registers → `flushSankeyCache()` deletes all `sankey:*` keys

---

## Real-Time Architecture

### Polling (All Real-Time Features)

Both real-time features use polling. No WebSocket infrastructure.

| Endpoint | Audience | Interval | Purpose |
|---|---|---|---|
| `GET /api/alumni/online` | All visitors | 30s | Online indicator green dots |
| `GET /api/alumni/:id/sessions` | Auth alumni only | 30s | Booking toast notification |

`GET /api/alumni/online` — no auth, returns array of online alumni IDs. Backed by in-memory Set on server (not Redis).

`GET /api/alumni/:id/sessions` — authMiddleware + IDOR. Alumni client compares returned count to previous poll; shows `ToastNotification` on increase.

Guests see green dots with no connection overhead. Alumni get booking notifications with the same consistent pattern already used for online indicators.

---

## Scheduling & Email Flow

```
Student clicks Schedule Chat
  → SoftAuthGate checks AuthContext
  → (guest) LoginPromptModal opens, page stays
  → (logged in) Cal.com embed renders inline
  → Student books on Cal.com
  → Cal.com POST /api/bookings/webhook
  → bookingController verifies webhook signature (CAL_WEBHOOK_SECRET)
  → MentorSession created (calEventUid as dedup)
  → emailService → SendGrid → alumni inbox
  → alumni's 30s polling interval detects new MentorSession → ToastNotification
```

### Webhook Signature Verification
Exported as pure function `verifyWebhookSignature(payload, sig, secret)` for testing:
```javascript
const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
return sig === expected
```

---

## Security Requirements (Integrated)

### IDOR Protection (High)
Every controller with `:studentId` or `:id` param:
```javascript
if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' })
```
Applied to: dashboard, save/delete bookmark, booking history.

### Role Not From Request Body (Medium)
Two separate registration routes: `/api/auth/register/student` and `/api/auth/register/alumni`. Role hardcoded server-side per route. Never from `req.body.role`.

### Alumni Two-Step Registration (Medium)
1. `POST /api/auth/register/alumni` → creates account, returns JWT
2. `POST /api/alumni` (protected) → submits career profile, sets `isProfileComplete: true`
`GET /api/alumni` filters by `isProfileComplete: true` to avoid empty cards.

### CORS Lock (High)
`cors({ origin: process.env.CLIENT_ORIGIN })` — never bare `cors()`.

### Rate Limiting (Medium)
`express-rate-limit` on `/api/auth`: 20 attempts / 15 min / IP.

### Input Validation (Medium)
`express-validator` on registration: name, email, password validated and sanitized.

---

## Local Dev & CI/CD

### Docker Compose (Phase 14)
```yaml
services:
  server:  → ./server/Dockerfile (node:20-alpine)
  mongo:   → mongo:7
  redis:   → redis:7-alpine
```
`.env` → Atlas/Upstash (prod). `.env.docker` → local containers.

### GitHub Actions
| Trigger | Jobs |
|---|---|
| Push to any branch | Lint + Jest |
| PR targeting main | Lint + Jest |
| Merge to main | Lint + Jest + Render deploy hook |

Frontend pipeline: lint only (Vercel auto-deploys on main push).

### Deployment
- Backend: Render free tier. UptimeRobot pings `/api/health` every 14 min.
- Frontend: Vercel. `VITE_API_URL` → live Render URL.
- Atlas: `0.0.0.0/0` for MVP (note in README: production would restrict to Render IP).
