<!--
  Purpose: Project-specific guidance for AI coding agents working on the HMS-Backend repo.
  Keep this short and actionable. Avoid generic guidance; focus on discoverable patterns
  and concrete commands the developer environment expects.
-->

# Copilot instructions — Smart Healthcare System (MERN)

Big picture
- Two apps live side-by-side:
  - Backend: Express + Mongoose (CommonJS) in `HMS-Backend/`
  - Frontend: React + Vite + Tailwind (ESM) in `HMS-FrontEnd/`
- Data flow: Frontend calls `/api/*` → Vite dev proxy forwards to `http://localhost:5000` → Express handlers → MongoDB via Mongoose.

Backend essentials (HMS-Backend)
- Entry: `server.js` loads `dotenv`, enables CORS/JSON, calls `config/db.js` (expects `MONGO_URI`), and listens on `PORT || 5000`.
- Add routes by registering routers in `server.js`:
  const patientsRouter = require('./routes/patients');
  app.use('/api/patients', patientsRouter);
- Conventions: CommonJS modules; keep business logic in `controllers/`, schemas in `models/`, routes in `routes/`. These folders are currently empty — you must create files and wire them.
- CORS: globally enabled. If adding auth/cookies, revisit CORS options.

Frontend essentials (HMS-FrontEnd)
- Tooling: Vite + React. Dev proxy set in `vite.config.js` to forward `/api` to `http://localhost:5000`.
- Styling: TailwindCSS via PostCSS. Config files: `tailwind.config.cjs`, `postcss.config.cjs` using `@tailwindcss/postcss`. Directives live in `src/index.css`.
- API helper: `src/lib/api.js` exports an axios instance with base URL from `VITE_API_URL` or defaults to `http://localhost:5000`.
- App shell: `src/components/Layout.jsx` provides a top nav; routes defined in `src/App.jsx` for Home, Patients, Appointments, Records, Doctor, Lab.
- Example API usage: see `src/pages/Patients.jsx` using `api.get('/api/patients')` (works with proxy).

Dev workflow (Windows PowerShell)
- Backend:
  cd c:\Users\USER\Desktop\HMS\HMS-Backend; npm install; npm run dev
- Frontend:
  cd c:\Users\USER\Desktop\HMS\HMS-FrontEnd; npm install; npm run dev
- Env:
  - Backend `.env`: MONGO_URI=mongodb+srv://...  [and optionally PORT=5000]
  - Frontend `.env`: VITE_API_URL=http://localhost:5000  (optional; proxy handles `/api` in dev)

Project-specific patterns
- Keep backend endpoints under `/api/...` to benefit from the Vite proxy; prefer relative paths (`/api/...`) in frontend calls.
- Centralize HTTP in `src/lib/api.js` (avoid raw axios imports in pages/components).
- Tailwind: add utilities in JSX className; if adding custom styles/components, keep them in `src/components/ui/*`.
- Modules/pages live under `src/pages/*` (appointments, records, doctor, lab) with small, composable UI in `src/components/ui/*`.

When changing API surface
- Update router registration in `HMS-Backend/server.js` and create matching controller/model.
- Update frontend call-sites to use `api` with the same `/api/...` path; prefer not to hard-code host/port.

First files to open
- Backend: `server.js`, `config/db.js`, `package.json`
- Frontend: `vite.config.js`, `src/App.jsx`, `src/pages/Patients.jsx`, `src/lib/api.js`, `tailwind.config.cjs`

Known gaps
- No backend route/controller/model implementations are present yet; Patients page expects `/api/patients`.
- No tests/CI configured. Run backend and frontend locally and smoke-test endpoints/UI.
