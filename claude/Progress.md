# PathFinder — Progress Tracker

Update this file as you complete each phase. Security fixes are integrated into the phase checkpoints below.

## Current Phase: 13

---

## Phase Checklist

### PHASE 1 — Repository Setup ✓
- [x] GitHub repo live with merged PR
- [x] Folder structure matches spec
- [x] `.gitignore` committed (covers .env, node_modules/, dist/)
- [x] No direct commits to main
- **Commit:** `chore(init): scaffold project structure and gitignore`

### PHASE 2 — Database Setup ✓
- [x] Atlas connected (`node -e "require('./db')"` succeeds)
- [x] Alumni.js defined (includes `isProfileComplete: Boolean`)
- [x] Student.js defined (savedPaths.filters.depth is `String`, not Number)
- [x] MentorSession.js defined
- [x] MentorRequest.js does NOT exist
- [x] `.env` not committed
- **Commit:** `feat(db): add atlas connection and schemas`

### PHASE 3 — Seed Data ✓
- [x] ~200 alumni in Atlas (800 total, 100 per major)
- [x] Group-by on careerTimeline.0.title: 28 titles, 24 with 15+ alumni each
- [x] Complete SECOND_ROLE_MAP covers all 28 first jobs (expanded from 17)
- [x] Every doc has careerTimeline as array
- **Commit:** `feat(seed): generate 200 alumni with constrained weighted career paths`
- **Notes:** Expanded to 8 majors. 800 alumni total. 400 have 3-entry careerTimeline (thirdRole), 400 have 2-entry. Data sourced from refined Kaggle dataset.

### PHASE 4 — Express Server Skeleton ✓
- [x] `npm run dev` starts server
- [x] `GET /api/health` → 200
- [x] All route stubs respond in Thunder Client
- [x] CORS locked to CLIENT_ORIGIN env var
- [x] Rate limiter on /api/auth (20 req / 15 min)
- [x] Env guards on all required vars
- **Commit:** `feat(server): add express skeleton with health check and route stubs`
- **Notes:** Express 4 pinned (avoided Express 5 breaking changes). Route mounts ordered before startServer(). CLIENT_ORIGIN added to .env for local dev.

### PHASE 5 — Core REST API ✓
- [x] Every route tested individually in Hopscotch
- [x] `GET /api/alumni` returns real Atlas data with pagination (?page=&limit=, default limit=20)
- [x] `GET /api/alumni/online` returns array (in-memory Set backed)
- [x] `GET /api/alumni/:id/sessions` returns [] placeholder
- [x] `GET /api/pathways/sankey` returns hardcoded `{ nodes: [], links: [] }`
- [x] No auth applied. No `/api/mentors` routes.
- **Commit:** `feat(api): implement crud routes for alumni and students`
- **Notes:** alumniController.js (getAlumni, getAlumniById, getOnlineAlumni, createAlumni). studentController.js (createStudent, getStudentDashboard). onlineAlumni in-memory Set in alumniController — populated in Phase 12.

### PHASE 6 — Aggregation Pipeline + Jest ✓
- [x] Jest + Supertest installed and configured
- [x] 3 buildSankeyShape tests written BEFORE implementation
- [x] 1 Supertest integration test for GET /api/pathways/sankey (200, no token, service mocked)
- [x] `npm test` passes (Red → Green verified)
- [x] `GET /api/pathways/sankey` returns real {nodes, links}
- [x] `?major=`, `?background=`, `?depth=` produce different outputs
- [x] `?depth=2` vs `?depth=full` produce different link counts
- [x] No token required for sankey route
- **Commit:** `feat(sankey): implement aggregation pipeline and buildSankeyShape with tests`
- **Notes:** jest --runInBand --forceExit configured. sankeyService.js has runAggregationPipeline (3-stage pipeline: $match, $project, $group + $unionWith for secondJob→thirdJob) and buildSankeyShape (pure transformation using Set for deduplication). depth=2 skips $unionWith. pathways.test.js mocks sankeyService with jest.fn().

### PHASE 7 — React Frontend Skeleton ✓
- [x] React app runs at localhost:5173
- [x] All 7 pages reachable via React Router v7
- [x] Axios hits /api/health, logs 200
- [x] AuthContext reads localStorage on mount
- [x] api.js has JWT header injection + cold-start retry
- **Commit:** `feat(client): scaffold react app with router, axios, and auth context`
- **Notes:** React Router v7 library mode (createBrowserRouter + RouterProvider). AuthProvider wraps RouterProvider in main.jsx. api.js uses interceptor for JWT header injection, withRetry for 503 cold-start retry. Health check verified in browser console.

### PHASE 8 — D3.js Sankey Diagram ✓
- [x] Sankey renders with real Atlas data (not hardcoded)
- [x] Nodes clickable, highlight connected paths
- [x] Hover tooltips show alumni counts
- [x] Zero auth checks on PathwaysPage
- [x] ErrorBoundary wraps SankeyDiagram with fallback
- [x] Bookmark button: renders if logged in, null if guest, click = no-op
- **Commit:** `feat(sankey): render d3 sankey diagram with live atlas data`
- **Notes:** $unionWith silently failed in Mongoose — replaced with 3 separate Alumni.aggregate() calls merged in Node. sankeyService now runs majorToFirst + firstToSecond + secondToThird queries. Added .nodeId(node => node.name) to d3-sankey so string-based source/target resolves correctly. Added sankeyLeft alignment. Diagram shows 4-5 columns due to seed data having deep career paths.

### PHASE 9 — Filter Controls ✓
- [x] Every filter dropdown change updates diagram
- [x] depth=2 vs depth=full produce visibly different diagrams
- [x] Loading skeleton during fetch
- [x] Empty state for no-data filter combos
- [x] No auth logic in this feature
- **Commit:** `feat(pathways): add filter panel with major, background, and depth controls`
- **Notes:** FilterPanel.jsx has 3 controlled selects (major, background, depth). PathwaysPage owns filters state, passes to FilterPanel as props. useEffect depends on filters — re-fetches on every change. URLSearchParams builds query string. loading state controls skeleton vs diagram vs empty state rendering.

### PHASE 10A — Hard Authentication ✓
- [x] POST /api/auth/register/student → {token, user} (role server-side)
- [x] POST /api/auth/register/alumni → {token, user} (role server-side)
- [x] express-validator on registration routes
- [x] Protected route + token → 200. No token → 401.
- [x] IDOR: valid token for wrong user → 403
- [x] /dashboard as guest → redirect to /login
- [x] All public routes still work without token
- [x] Refresh while logged in → still logged in
- **Commit:** `feat(auth): implement jwt login, register, and protected routes`
- **Notes:** authController.js has registerStudent, registerAlumni, login. generateToken uses jwt.sign with id+role payload, 7d expiry. authMiddleware checks Bearer token, sets req.user. optionalAuth never blocks. ProtectedRoute uses loading state from AuthContext to avoid redirect flash on refresh. IDOR check on all parameterized protected routes.

### PHASE 10B — Optional Auth + Soft Gate ✓
- [x] Sankey returns 200 with no token (never 401)
- [x] GET /api/alumni returns 200 with no token
- [x] Schedule Chat as guest → modal, URL unchanged
- [x] Login via modal → authenticated, modal closes
- **Commit:** `feat(auth): add optional auth middleware and soft gate modal`
- **Notes:** optionalAuth named export added to authMiddleware.js, applied to GET /api/pathways/sankey, GET /api/alumni/, GET /api/alumni/:id. LoginPromptModal.jsx: overlay form, watches user via useEffect, closes on login. SoftAuthGate.jsx: renders children if user, else LoginPromptModal. Schedule Chat button on AlumniProfilePage wrapped in SoftAuthGate.

### PHASE 11 — Alumni Profiles + Scheduling (Partial ✓)
- [x] Alumni profiles fully visible to guests
- [x] Schedule Chat as guest → modal (10B seam intact)
- [ ] Logged-in student completes Cal.com booking *(deferred to Phase 16 — needs live Render URL)*
- [ ] MentorSession in Atlas with calEventUid *(deferred to Phase 16)*
- [ ] Alumni receives SendGrid email *(deferred to Phase 16 — needs SendGrid account)*
- [x] verifyWebhookSignature: 3 Jest tests pass (written before implementation)
- [x] MentorRequest.js does NOT exist
- **Commit:** `feat(alumni): build profiles, calcom embed, booking webhook, sendgrid`
- **Notes:** AlumniPage.jsx fetches paginated alumni grid, links to /alumni/:id. AlumniProfilePage.jsx fetches full profile + careerTimeline, SoftAuthGate wraps Schedule Chat button. verifyWebhookSignature implemented in bookingController.js, uses HMAC-SHA256 with CAL_WEBHOOK_SECRET. Cal.com webhook URL and SendGrid deferred to Phase 16 when Render URL is available.

### PHASE 12 — Real-Time Features ✓
- [x] Green dot updates on AlumniPage (via polling GET /api/alumni/online)
- [x] No WebSocket connections anywhere (Network tab: zero WS entries)
- **Commit:** `feat(polling): add alumni online polling`
- **Notes:** onlineAlumni replaced from Set to Map<alumniId, lastSeenTimestamp>. Stamp fires in getAlumni and getAlumniById when req.user.role === 'alumni' (via optionalAuth). getOnlineAlumni filters stale entries >60s before returning. Client polls every 30s with cleanup. Verified: Online text appears next to alumni name in guest browser.

### PHASE 13 — Student Dashboard
- [ ] /dashboard as guest → redirect to /login
- [ ] Bookmark button saves path + success toast
- [ ] Saved path appears on dashboard
- [ ] Recharts chart renders with real data
- [ ] Bookmark button absent from DOM for guests
- **Commit:** `feat(dashboard): build protected dashboard with bookmarks and recharts`
- **Notes:**

### PHASE 13B — UI Polish
- [ ] Consistent layout and navbar across all pages
- [ ] AlumniPage grid styled (cards with name, role, company, major)
- [ ] AlumniProfilePage styled (timeline, tags, Schedule Chat button prominent)
- [ ] PathwaysPage styled (diagram + filter panel layout)
- [ ] LoginPage + RegisterPage styled (centered form)
- [ ] DashboardPage styled (sections clearly separated)
- [ ] LoginPromptModal styled (overlay with backdrop)
- [ ] Loading skeleton and empty state look intentional
- [ ] Mobile-friendly (no horizontal scroll on phone)
- **Commit:** `feat(ui): polish all pages and components`
- **Notes:**

### PHASE 14 — Deploy Backend (Render)
- [ ] Backend live on public Render URL
- [ ] GET /api/health → 200 on live URL
- [ ] Sankey returns real data on live URL
- [ ] UptimeRobot active and green
- [ ] CLIENT_ORIGIN set to Vercel URL in Render env
- [ ] Cal.com webhook URL updated to live Render URL
- **Commit:** `chore(deploy): configure render backend`
- **Notes:**

### PHASE 15 — Deploy Frontend (Vercel)
- [ ] E2E 1: Guest → Sankey loads immediately
- [ ] E2E 2: Guest → /alumni visible
- [ ] E2E 3: Guest → Schedule Chat → modal, URL stays
- [ ] E2E 4: Register → login → booking → MentorSession + email
- [ ] E2E 5: Login → /dashboard → bookmarks visible
- [ ] E2E 6: Refresh while logged in → still logged in
- [ ] Playwright automated test passes: guest loads /pathways, Sankey nodes visible
- **Commit:** `chore(deploy): configure vercel frontend`
- **Notes:**

### PHASE 16 — CI/CD
- [ ] Backend pipeline: lint + jest on every push
- [ ] Frontend pipeline: lint on every push
- [ ] Failing test blocks deploy hook (verified by testing)
- [ ] Pipeline green on main
- [ ] No test makes real DB/network calls
- **Commit:** `ci: add github actions pipelines`
- **Notes:**

