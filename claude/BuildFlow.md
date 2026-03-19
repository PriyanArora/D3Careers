# PathFinder — Build Flow

A phase is done when the checkpoint passes, not when the code is written.

## Prerequisites
- Node.js v20 LTS, npm v10+, Git, VS Code (ESLint, Prettier, MongoDB for VS Code, Thunder Client)
- Docker Desktop is NOT installed until Phase 14

## Global Rules (All Phases)
- **Branching:** `feat/<scope>/<description>`, `fix/...`, `chore/...` — never commit to `main` directly
- **Commits:** `<type>(<scope>): <description>` — imperative, present tense, <72 chars
- **Secrets:** `.env` never in git. Env guard on every required var: `if (!x) throw new Error('X is not set.')`
- **Errors:** Every catch uses `{ cause: error }`. No silent swallowing.
- **Testing:** Every phase checkpoint requires its seam tests verified. Specify category: unit / integration / e2e.

---

## PHASE 1 — Repository Setup

**Goal:** GitHub repo exists with correct folder structure, `.gitignore`, and branch workflow via merged PR.

**Tasks:**
- `mkdir pathfinder && cd pathfinder && git init && git checkout -b chore/init`
- Create folder structure: `client/`, `server/` with `models/ routes/ controllers/ services/ middleware/ sockets/ __tests__/ scripts/`, `.github/workflows/`
- Create `.gitignore` BEFORE any other file: `node_modules/`, `.env`, `.env.*`, `*.local`, `dist/`, `.DS_Store`
- Commit, push, open PR, merge to main

**Checkpoint:**
- [ ] GitHub repo live with merged PR
- [ ] `.gitignore` committed, covers `.env` and `node_modules/`
- [ ] No direct commits to `main`

---

## PHASE 2 — Database Setup

**Goal:** Atlas connected, all three Mongoose schemas defined exactly as specified.

**Tasks:**
- Atlas free M0 cluster, whitelist IP, create db user
- `cd server && npm init -y && npm install mongoose dotenv`
- Store `MONGO_URI` in `.env`, write `db.js` with env guard
- Define `Alumni.js`, `Student.js`, `MentorSession.js` — match ProjectSummary data models exactly
- Include `isProfileComplete: Boolean` on Alumni, `depth: String` (not Number) on Student savedPaths
- Do NOT create `MentorRequest.js`

**Checkpoint:**
- [ ] `node -e "require('./db')"` connects to Atlas
- [ ] All three schemas match spec. `MentorRequest.js` absent.
- [ ] `.env` in `.gitignore`, not committed

---

## PHASE 3 — Seed Data

**Goal:** 200 alumni in Atlas with constrained weighted career paths producing meaningful Sankey flow.

**Tasks:**
- `npm install --save-dev @faker-js/faker`
- Write `seed.js` using `CAREER_PATHS` and complete `SECOND_ROLE_MAP` (all 17 first jobs covered)
- Each alumni: weighted major → weighted firstJob → SECOND_ROLE_MAP secondRole → 50% chance thirdRole
- 1-3 backgroundTags from `['firstGen', 'transfer', 'international']`
- `careerTimeline[]` array with title, company, industry, startYear, endYear, skillsGained, adviceForSelf
- Run `node scripts/seed.js`

**Checkpoint:**
- [ ] ~200 alumni in Atlas
- [ ] Group-by on `careerTimeline.0.title` shows 5+ titles with 15+ alumni each
- [ ] Every document has `careerTimeline` as an array

---

## PHASE 4 — Express Server Skeleton

**Goal:** Server starts, all route files return placeholders, health check returns 200.

**Tasks:**
- `npm install express dotenv cors nodemon && npm install --save-dev eslint`
- `npm install express-rate-limit express-validator` (security deps)
- Create `server.js` — Express, CORS locked to `CLIENT_ORIGIN`, MongoDB connect, env guards
- Apply `express-rate-limit` on `/api/auth` prefix: 20 req / 15 min / IP
- Create route stubs: `alumni.js`, `students.js`, `pathways.js`, `bookings.js`, `auth.js`
- `GET /api/health` → `{ status: 'ok', timestamp }`
- Structured logging from day one: `console.info({ route, ... }, 'message')`

**Checkpoint:**
- [ ] `npm run dev` starts. `GET /api/health` → 200
- [ ] All route stubs return placeholder responses in Thunder Client
- [ ] CORS locked to `CLIENT_ORIGIN`, rate limiter on auth routes

---

## PHASE 5 — Core REST API (CRUD)

**Goal:** All routes return real Atlas data. Every route tested in Thunder Client.

**Tasks — build one route fully working before the next:**
- `GET /api/alumni` — query params: major, background, available, page, limit. Filter `isProfileComplete: true`. Default: limit=20, page=1.
- `GET /api/alumni/:id` — single alumni with full careerTimeline
- `GET /api/alumni/online` — returns online alumni IDs from in-memory Set (no auth)
- `POST /api/alumni` — creates alumni doc. No auth yet.
- `POST /api/students` — creates student. No auth yet.
- `GET /api/students/:id/dashboard` — returns student with savedPaths. No auth yet.
- `GET /api/pathways/sankey` — returns hardcoded `{ nodes: [], links: [] }` (real aggregation is Phase 6)
- `POST /api/bookings/webhook` — returns `{ received: true }` placeholder
- `GET /api/bookings/:studentId` — returns `[]` placeholder
- `GET /api/alumni/:id/sessions` — returns `[]` placeholder
- No `/api/mentors` routes. Alumni ARE mentors (Decision 1).

**Checkpoint:**
- [ ] Every route tested in Thunder Client with real data
- [ ] `GET /api/alumni` returns real array from Atlas with pagination
- [ ] `GET /api/pathways/sankey` returns hardcoded empty shape
- [ ] No auth applied yet

---

## PHASE 6 — Aggregation Pipeline + Jest

**Goal:** Sankey returns real `{ nodes, links }`, all three filters work, Jest passes.

**Part A — Install Jest + Supertest:**
- `npm install --save-dev jest supertest` → `"test": "jest --runInBand"`

**Part B — Write tests FIRST (TDD, non-negotiable):**
- `__tests__/sankeyService.test.js`: 3 tests for `buildSankeyShape`
  - returns nodes and links arrays
  - links have source, target, value
  - deduplicates nodes across sources and targets
- `npm test` → Red (expected)

**Part C — Implement:**
- `sankeyService.js`: `runAggregationPipeline(filters)`, `buildSankeyShape(rawResults)` — three functions, single responsibility each
- `npm test` → Green
- Wire to `GET /api/pathways/sankey` in pathways.js

**Part D — Add Supertest integration test:**
- `__tests__/pathways.test.js`: 1 integration test — `GET /api/pathways/sankey` returns 200 with no token
- Mock `sankeyService` with `jest.mock()` (no real DB calls in CI). Test the HTTP layer: route exists, optionalAuth never blocks, response shape is `{ nodes, links }`.
- This test is more valuable than the full unit suite — it tests the seam that breaks in production.

**Checkpoint:**
- [ ] `npm test` passes (3 buildSankeyShape tests + 1 Supertest integration test)
- [ ] `GET /api/pathways/sankey` returns real nodes/links
- [ ] `?major=`, `?background=`, `?depth=2` vs `?depth=full` produce different outputs
- [ ] No token required

---

## PHASE 7 — React Frontend Skeleton

**Goal:** React app runs, all pages render, Axios hits health check.

**Tasks:**
- `cd client && npm create vite@latest . -- --template react`
- `npm install axios react-router-dom@7 recharts d3 d3-sankey`
- Create `api.js` with JWT header injection + cold-start retry (2x, 2s delay)
- Create `AuthContext.jsx` — reads localStorage on mount
- Set up React Router v7 (library mode) with all 7 pages
- Build `Navbar` — Login link when no token, name + Logout when token exists
- `.env.local`: `VITE_API_URL=http://localhost:5000`

**Checkpoint:**
- [ ] App runs at localhost:5173, all pages reachable
- [ ] Axios hits `/api/health`, logs 200 in console
- [ ] AuthContext reads localStorage on mount (test by manually setting `pf_token` in DevTools)

---

## PHASE 8 — D3.js Sankey Diagram

**Goal:** Sankey renders with real data, nodes clickable, tooltips show counts. Zero auth on this page.

**Tasks — build in stages:**
1. `SankeyDiagram.jsx` with useRef + useEffect — render with HARDCODED data first
2. Node rectangles → link paths → labels → color coding → click-to-highlight → hover tooltips
3. Swap hardcoded data for live fetch: `GET /api/pathways/sankey` (no token)
4. Wrap `SankeyDiagram.jsx` in `<ErrorBoundary>` with a "couldn't load diagram" fallback
5. Bookmark button: renders icon if logged in, `null` if guest. Click does nothing yet.

**Checkpoint:**
- [ ] Sankey renders with real Atlas data
- [ ] Nodes clickable, tooltips show alumni counts
- [ ] Zero auth checks, zero login prompts on this page
- [ ] ErrorBoundary wraps SankeyDiagram (test: temporarily throw in component, confirm fallback shows)
- [ ] Bookmark button inert (no API call)

---

## PHASE 9 — Filter Controls

**Goal:** FilterPanel dropdowns trigger re-fetches that produce visibly different diagrams.

**Tasks:**
- `FilterPanel.jsx`: Major (matches seed data), Background (firstGen/transfer/international), Depth (2/3/full)
- Filter changes trigger re-fetch: `?major=X&background=Y&depth=Z`
- `LoadingSkeleton.jsx` during fetch, `EmptyState.jsx` for empty results
- All filters public — no auth

**Checkpoint:**
- [ ] Every filter change updates the diagram
- [ ] `depth=2` vs `depth=full` produce visibly different node/link counts
- [ ] Loading skeleton and empty state work

---

## PHASE 10A — Hard Authentication

**Goal:** JWT login/register work, DashboardPage redirects guests, public routes unaffected.

**Tasks:**
- `npm install jsonwebtoken bcryptjs`
- Split registration: `POST /api/auth/register/student`, `POST /api/auth/register/alumni` — role server-side
- `express-validator` validation middleware on both registration routes
- `authMiddleware.js` — 401 if no valid token
- Apply to: `POST /api/alumni`, `GET /api/students/:id/dashboard`, `POST/DELETE /api/students/:id/paths/*`
- **IDOR check** on every parameterized route: `req.user.id !== req.params.id → 403`
- Frontend: LoginPage, RegisterPage, ProtectedRoute (DashboardPage ONLY)
- On login success: store token → update AuthContext → navigate back to previous page

**Checkpoint:**
- [ ] Login returns valid JWT. Protected route with token → 200, without → 401
- [ ] IDOR test: valid token for wrong user → 403
- [ ] `/dashboard` as guest → redirect. All public routes still work without token.
- [ ] Refresh while logged in → still logged in

---

## PHASE 10B — Optional Auth + Soft Gate

**Goal:** Public routes attach req.user when present but never block. Schedule Chat opens modal for guests.

**Tasks:**
- `optionalAuth` as named export from `authMiddleware.js` — decode if present, always `next()` (not a separate file)
- Apply to: sankey, alumni browse, alumni profile routes
- `LoginPromptModal.jsx` — modal over current page, no redirect
- `SoftAuthGate.jsx` — opens modal if no user, renders children if user exists

**Checkpoint:**
- [ ] Sankey returns 200 with no token (never 401)
- [ ] Schedule Chat as guest → modal, URL unchanged
- [ ] Login via modal → authenticated, modal closes

---

## PHASE 11 — Alumni Profiles + Scheduling

**Goal:** Profiles visible to guests. Booking creates MentorSession. Alumni gets email.

**Tasks:**
- `AlumniPage.jsx` — public grid. `AlumniProfilePage.jsx` — full timeline, public.
- Cal.com: free account, 30-min event, webhook → `POST /api/bookings/webhook`
- Schedule Chat wrapped in SoftAuthGate. Logged in → Cal.com embed renders.
- `bookingController.js`: verify webhook sig (pure function `verifyWebhookSignature`), create MentorSession, trigger email
- `emailService.js`: `@sendgrid/mail` notification to alumni
- Write 3 Jest tests for `verifyWebhookSignature` BEFORE implementing

**Checkpoint:**
- [ ] Profiles fully visible to guests
- [ ] Cal.com booking → MentorSession in Atlas + email received
- [ ] `verifyWebhookSignature` tests pass

---

## PHASE 12 — Real-Time Features

**Goal:** Online indicators update for all visitors. Alumni get booking toast. Both via polling.

**Tasks:**
- Online indicators: `GET /api/alumni/online` every 30s in AlumniPage (stub already exists from Phase 5)
- Implement `GET /api/alumni/:id/sessions` (authMiddleware + IDOR): return all MentorSessions where `alumniId === req.params.id`
- AuthContext: on login, start `setInterval` polling `GET /api/alumni/:id/sessions` every 30s. Store previous count in `useRef`. On count increase, trigger toast.
- `ToastNotification.jsx`: renders on new booking
- Clear interval on logout

**Checkpoint:**
- [ ] Green dot updates on AlumniPage (polling)
- [ ] Alumni gets toast on booking (polling, not socket)
- [ ] No WebSocket connections anywhere (Network tab: zero WS entries)

---

## PHASE 13 — Student Dashboard

**Goal:** Dashboard protected. Bookmarks save and display. Recharts renders.

**Tasks:**
- DashboardPage wrapped in ProtectedRoute. Three sections: saved paths, booked sessions, Recharts bar chart.
- Wire bookmark button in SankeyDiagram → `POST /api/students/:id/paths`
- Bookmark button renders only when AuthContext has user. Not hidden — absent from DOM.

**Checkpoint:**
- [ ] `/dashboard` as guest → redirect
- [ ] Bookmark saves, appears on dashboard
- [ ] Recharts chart renders. Bookmark absent from DOM for guests.

---

## PHASE 14 — Docker

**Goal:** `docker compose up` starts server + mongo + redis.

**Tasks:**
- Install Docker Desktop NOW (not before)
- `server/Dockerfile`: node:20-alpine
- `docker-compose.yml`: server + mongo:7 + redis:7-alpine
- `.env.docker` overrides MONGO_URI for local container

**Checkpoint:**
- [ ] `docker compose up` → all 3 services. Health check 200.

---

## PHASE 15 — Redis Caching

**Goal:** Second sankey call returns from cache. New alumni flushes cache. This phase demonstrates cache invalidation patterns for portfolio value — the MongoDB aggregation on 200 records is already under 50ms without it.

**Tasks:**
- `npm install @upstash/redis`
- Write cache key test FIRST: `buildCacheKey({ major, bg, depth })` → `sankey:X:Y:Z`
- `cacheService.js`: get, set (1hr TTL), flushSankeyCache
- `getSankeyData`: cache check → pipeline → cache set
- `flushSankeyCache()` called after new alumni registration

**Checkpoint:**
- [ ] Cache key tests pass
- [ ] Second call noticeably faster. Key visible in Upstash dashboard.
- [ ] New alumni registration clears all sankey:* keys

---

## PHASE 16 — Deploy Backend (Render)

**Goal:** Backend live, health check 200, UptimeRobot active.

**Tasks:**
- Render web service pointing to `/server`. Add all env vars.
- Atlas: allow `0.0.0.0/0` (note in README)
- UptimeRobot: ping `/api/health` every 14 min
- Update Cal.com webhook URL to live Render URL
- Add `CLIENT_ORIGIN` in Render env → your Vercel URL

**Checkpoint:**
- [ ] `GET /api/health` → 200 on live URL
- [ ] Sankey returns real data. UptimeRobot green.

---

## PHASE 17 — Deploy Frontend (Vercel)

**Goal:** Full app live. All 6 e2e scenarios pass.

**Tasks:**
- Vercel: connect repo, root dir `client`, env `VITE_API_URL` → Render URL

**E2E Verification (all must pass manually):**
1. Guest → Sankey loads immediately
2. Guest → browse /alumni, all visible
3. Guest → /alumni/:id → Schedule Chat → modal, URL stays
4. Register → login → Cal.com booking → MentorSession + email
5. Login → /dashboard → bookmarks visible
6. Refresh while logged in → still logged in

**Automated E2E (Playwright):**
- `npm install --save-dev @playwright/test && npx playwright install chromium`
- Write one test: guest visits `/pathways`, Sankey SVG renders with at least one node visible
- `npx playwright test`

**Checkpoint:**
- [ ] All 6 manual scenarios pass on live Vercel URL
- [ ] Playwright automated test passes: guest Sankey flow

---

## PHASE 18 — CI/CD

**Goal:** Every push runs lint + tests. Failing test blocks deploy.

**Tasks:**
- `.github/workflows/backend.yml`: checkout → Node 20 → npm ci → lint → jest → (main only) curl Render deploy hook
- `.github/workflows/frontend.yml`: checkout → Node 20 → npm ci → lint
- Add `RENDER_DEPLOY_HOOK` to GitHub secrets

**Checkpoint:**
- [ ] Pipeline green on main
- [ ] Deliberately failing test blocks deploy hook (verified)
- [ ] No test makes real DB/network calls in CI

---

## Common Problems

| Problem | Fix |
|---|---|
| MONGO_URI error on start | `.env` missing or dotenv not loaded first |
| Sankey returns empty | No seed data (run seed.js) or case-sensitive major mismatch |
| D3 renders nothing, no error | Data shape mismatch — log payload, verify link source/target match node names exactly |
| JWT 401 on protected route | Missing `Authorization` header, wrong `Bearer ` prefix, or JWT_SECRET mismatch |
| Docker: server can't reach mongo | Mongo not ready yet — add healthcheck or restart |
| Depth filter does nothing | Break in chain: FilterPanel → query string → req.query.depth → pipeline. Check each link. |
| Cold start fails | Verify Axios retry logic handles 503 + network errors. Verify UptimeRobot pings. |
| Cal.com webhook not firing | Webhook URL points to localhost, not live Render URL |
| CI passes locally, fails in Actions | Test has hidden dependency on local state — mock with jest.mock() |
