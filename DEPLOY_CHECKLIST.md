# Deploy Checklist - Dokploy (Frontend + Backend)

## 1) Pre-deploy validation (local)

- [ ] Install dependencies at root:
  - pnpm install
- [ ] Build frontend artifact:
  - pnpm --filter frontend build
- [ ] Start backend and verify health endpoint:
  - pnpm --filter backend start
  - GET http://localhost:3001/health returns status 200 and payload with ok true
- [ ] Confirm secrets are NOT committed in tracked files.
- [ ] Confirm .env.example uses placeholders only.

Exit criteria:
- Frontend builds without errors.
- Backend starts without runtime errors.
- Health endpoint responds correctly.

---

## 2) Dokploy service setup strategy

Deploy as two independent services:

- Frontend service
  - Static site from frontend/dist
- Backend service
  - Node service from backend

Why:
- Independent restart and scaling
- Isolated environment variables
- Cleaner security boundaries

---

## 3) Frontend service (Dokploy)

Project configuration:
- [ ] Service type: Static / Build output
- [ ] Repository connected
- [ ] Working directory / context: frontend

Build settings:
- [ ] Install command: pnpm install --frozen-lockfile
- [ ] Build command: pnpm build
- [ ] Output directory: dist

Environment variables:
- [ ] VITE_API_BASE_URL set to backend public URL
  - Example: https://api.your-domain.com

Domain:
- [ ] Attach production domain or subdomain for frontend

Exit criteria:
- Frontend URL loads successfully
- Frontend network requests target backend domain (not localhost)

---

## 4) Backend service (Dokploy)

Project configuration:
- [ ] Service type: Node app
- [ ] Repository connected
- [ ] Working directory / context: backend

Runtime settings:
- [ ] Install command: pnpm install --frozen-lockfile
- [ ] Start command: pnpm start
- [ ] Health check path: /health

Required environment variables:
- [ ] OPENROUTER_API_KEY
- [ ] OPENROUTER_MODEL (recommended: openrouter/free or selected production model)
- [ ] OPENROUTER_TIMEOUT_MS (recommended: 45000)
- [ ] PORT (recommended: 3001)
- [ ] CORS_ORIGINS
  - Include only allowed frontend origins, comma-separated
  - Example: https://your-domain.com,https://www.your-domain.com

Security checks:
- [ ] Backend is not publicly returning stack traces
- [ ] CORS only allows expected frontend origins

Exit criteria:
- GET /health returns 200 in Dokploy environment
- Chat endpoint responds and streams correctly

---

## 5) DNS and routing

- [ ] Frontend domain points to frontend Dokploy service
- [ ] API subdomain points to backend Dokploy service
  - Example: api.your-domain.com
- [ ] TLS certificates are issued and active
- [ ] HTTP redirects to HTTPS

Exit criteria:
- Frontend and backend both accessible over HTTPS

---

## 6) Post-deploy smoke tests (production)

From browser:
- [ ] Open frontend URL and load landing page
- [ ] Submit a valid prompt and confirm streamed response appears progressively
- [ ] Retry button works
- [ ] Stop button cancels stream
- [ ] Friendly error appears if backend request fails

From API checks:
- [ ] GET backend /health returns 200
- [ ] Invalid chat payload returns 400 with validation message
- [ ] Response includes CORS header for allowed origin

Security sanity:
- [ ] No API keys visible in frontend source or network payloads
- [ ] Backend headers include hardening values (nosniff, frame deny, etc.)

Exit criteria:
- End-to-end chat flow works under real domain
- No secret exposure
- CORS behavior is correct

---

## 7) Rollback readiness

- [ ] Keep previous successful deployment version available in Dokploy
- [ ] Document last known-good frontend and backend image/revision
- [ ] If incident occurs:
  - Roll back backend first if API outage
  - Roll back frontend if UI regression

Exit criteria:
- Rollback can be executed in minutes with known target revision

---

## 8) Common failure quick checks

If frontend cannot connect to API:
- [ ] Verify VITE_API_BASE_URL points to production backend URL
- [ ] Verify backend domain is reachable and TLS valid

If CORS errors appear:
- [ ] Verify CORS_ORIGINS includes exact frontend origin (protocol + domain)
- [ ] Ensure there are no trailing spaces or typo in origin list

If backend fails to start:
- [ ] Verify OPENROUTER_API_KEY exists in Dokploy env vars
- [ ] Verify start command is pnpm start and context is backend
- [ ] Check runtime logs for missing env vars or startup exceptions

If streaming hangs:
- [ ] Confirm reverse proxy allows streaming/SSE behavior
- [ ] Check backend logs for timeout or provider-side errors
- [ ] Validate OPENROUTER_TIMEOUT_MS is not too low
