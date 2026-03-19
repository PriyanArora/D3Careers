# PathFinder — Progress Tracker

Update this file as you complete each phase. Security fixes are integrated into the phase checkpoints below.

## Current Phase: 2

---

## Phase Checklist

### PHASE 1 — Repository Setup ✓
- [x] GitHub repo live with merged PR
- [x] Folder structure matches spec
- [x] `.gitignore` committed (covers .env, node_modules/, dist/)
- [x] No direct commits to main
- **Commit:** `chore(init): scaffold project structure and gitignore`

### PHASE 2 — Database Setup
- [ ] Atlas connected (`node -e "require('./db')"` succeeds)
- [ ] Alumni.js defined (includes `isProfileComplete: Boolean`)
- [ ] Student.js defined (savedPaths.filters.depth is `String`, not Number)
- [ ] MentorSession.js defined
- [ ] MentorRequest.js does NOT exist
- [ ] `.env` not committed
- **Commit:** `feat(db): add atlas connection and schemas`
- **Notes:**

### PHASE 3 — Seed Data
- [ ] ~200 alumni in Atlas
- [ ] Group-by on careerTimeline.0.title: 5+ titles with 15+ alumni each
- [ ] Complete SECOND_ROLE_MAP covers all 17 first jobs
- [ ] Every doc has careerTimeline as array
- **Commit:** `feat(seed): generate 200 alumni with constrained weighted career paths`
- **Notes:**

### PHASE 4 — Express Server Skeleton
- [ ] `npm run dev` starts server
- [ ] `GET /api/health` → 200
- [ ] All route stubs respond in Thunder Client
- [ ] CORS locked to CLIENT_ORIGIN env var
- [ ] Rate limiter on /api/auth (20 req / 15 min)
- [ ] Env guards on all required vars
- **Commit:** `feat(server): add express skeleton with health check and route stubs`
- **Notes:**

### PHASE 5 — Core REST API
- [ ] Every route tested individually in Thunder Client
- [ ] `GET /api/alumni` returns real Atlas data with pagination (?page=&limit=, default limit=20)
- [ ] `GET /api/alumni/online` returns array (in-memory Set backed)
- [ ] `GET /api/alumni/:id/sessions` returns [] placeholder
- [ ] `GET /api/pathways/sankey` returns hardcoded `{ nodes: [], links: [] }`
- [ ] No auth applied. No `/api/mentors` routes.
- **Commit:** `feat(api): implement crud routes`
- **Notes:**

### PHASE 6 — Aggregation Pipeline + Jest
- [ ] Jest + Supertest installed and configured
- [ ] 3 buildSankeyShape tests written BEFORE implementation
- [ ] 1 Supertest integration test for GET /api/pathways/sankey (200, no token, service mocked)
- [ ] `npm test` passes (Red → Green verified)
- [ ] `GET /api/pathways/sankey` returns real {nodes, links}
- [ ] `?major=`, `?background=`, `?depth=` produce different outputs
- [ ] `?depth=2` vs `?depth=full` produce different link counts
- [ ] No token required for sankey route
- **Commit:** `feat(sankey): implement aggregation pipeline and buildSankeyShape with tests`
- **Notes:**

### PHASE 7 — React Frontend Skeleton
- [ ] React app runs at localhost:5173
- [ ] All 7 pages reachable via React Router v7
- [ ] Axios hits /api/health, logs 200
- [ ] AuthContext reads localStorage on mount
- [ ] api.js has JWT header injection + cold-start retry
- **Commit:** `feat(client): scaffold react app with router, axios, and auth context`
- **Notes:**

### PHASE 8 — D3.js Sankey Diagram
- [ ] Sankey renders with real Atlas data (not hardcoded)
- [ ] Nodes clickable, highlight connected paths
- [ ] Hover tooltips show alumni counts
- [ ] Zero auth checks on PathwaysPage
- [ ] ErrorBoundary wraps SankeyDiagram with fallback
- [ ] Bookmark button: renders if logged in, null if guest, click = no-op
- **Commit:** `feat(sankey): render d3 sankey diagram with live atlas data`
- **Notes:**

### PHASE 9 — Filter Controls
- [ ] Every filter dropdown change updates diagram
- [ ] depth=2 vs depth=full produce visibly different diagrams
- [ ] Loading skeleton during fetch
- [ ] Empty state for no-data filter combos
- [ ] No auth logic in this feature
- **Commit:** `feat(pathways): add filter panel with major, background, and depth controls`
- **Notes:**

### PHASE 10A — Hard Authentication
- [ ] POST /api/auth/register/student → {token, user} (role server-side)
- [ ] POST /api/auth/register/alumni → {token, user} (role server-side)
- [ ] express-validator on registration routes
- [ ] Protected route + token → 200. No token → 401.
- [ ] IDOR: valid token for wrong user → 403
- [ ] /dashboard as guest → redirect to /login
- [ ] All public routes still work without token
- [ ] Refresh while logged in → still logged in
- **Commit:** `feat(auth): implement jwt login, register, and protected routes`
- **Notes:**

### PHASE 10B — Optional Auth + Soft Gate
- [ ] Sankey returns 200 with no token (never 401)
- [ ] GET /api/alumni returns 200 with no token
- [ ] Schedule Chat as guest → modal, URL unchanged
- [ ] Login via modal → authenticated, modal closes
- **Commit:** `feat(auth): add optional auth middleware and soft gate modal`
- **Notes:**

### PHASE 11 — Alumni Profiles + Scheduling
- [ ] Alumni profiles fully visible to guests
- [ ] Schedule Chat as guest → modal (10B seam intact)
- [ ] Logged-in student completes Cal.com booking
- [ ] MentorSession in Atlas with calEventUid
- [ ] Alumni receives SendGrid email
- [ ] verifyWebhookSignature: 3 Jest tests pass (written before implementation)
- [ ] MentorRequest.js does NOT exist
- **Commit:** `feat(alumni): build profiles, calcom embed, booking webhook, sendgrid`
- **Notes:**

### PHASE 12 — Real-Time Features
- [ ] Green dot updates on AlumniPage (via polling GET /api/alumni/online)
- [ ] Alumni gets toast on booking (polling GET /api/alumni/:id/sessions)
- [ ] No WebSocket connections anywhere (Network tab: zero WS entries)
- [ ] Polling stops on logout
- **Commit:** `feat(polling): add alumni online polling and booking notification`
- **Notes:**

### PHASE 13 — Student Dashboard
- [ ] /dashboard as guest → redirect to /login
- [ ] Bookmark button saves path + success toast
- [ ] Saved path appears on dashboard
- [ ] Recharts chart renders with real data
- [ ] Bookmark button absent from DOM for guests
- **Commit:** `feat(dashboard): build protected dashboard with bookmarks and recharts`
- **Notes:**

### PHASE 14 — Docker
- [ ] Docker Desktop installed (not before this phase)
- [ ] `docker compose up` starts server + mongo + redis
- [ ] Health check 200 against containerized stack
- [ ] .env.docker in .gitignore
- **Commit:** `chore(docker): add dockerfile and compose config`
- **Notes:**

### PHASE 15 — Redis Caching *(cache pattern demo — not solving a perf problem)*
- [ ] buildCacheKey tests written FIRST, then pass
- [ ] Second sankey call returns from cache (noticeably faster)
- [ ] Cache key visible in Upstash dashboard
- [ ] New alumni registration clears all sankey:* keys
- **Commit:** `feat(cache): add upstash redis caching to sankey service`
- **Notes:**

### PHASE 16 — Deploy Backend (Render)
- [ ] Backend live on public Render URL
- [ ] GET /api/health → 200 on live URL
- [ ] Sankey returns real data on live URL
- [ ] UptimeRobot active and green
- [ ] CLIENT_ORIGIN set to Vercel URL in Render env
- [ ] Cal.com webhook URL updated to live Render URL
- **Commit:** `chore(deploy): configure render backend`
- **Notes:**

### PHASE 17 — Deploy Frontend (Vercel)
- [ ] E2E 1: Guest → Sankey loads immediately
- [ ] E2E 2: Guest → /alumni visible
- [ ] E2E 3: Guest → Schedule Chat → modal, URL stays
- [ ] E2E 4: Register → login → booking → MentorSession + email
- [ ] E2E 5: Login → /dashboard → bookmarks visible
- [ ] E2E 6: Refresh while logged in → still logged in
- [ ] Playwright automated test passes: guest loads /pathways, Sankey nodes visible
- **Commit:** `chore(deploy): configure vercel frontend`
- **Notes:**

### PHASE 18 — CI/CD
- [ ] Backend pipeline: lint + jest on every push
- [ ] Frontend pipeline: lint on every push
- [ ] Failing test blocks deploy hook (verified by testing)
- [ ] Pipeline green on main
- [ ] No test makes real DB/network calls
- **Commit:** `ci: add github actions pipelines`
- **Notes:**

