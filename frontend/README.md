# Pilot — Frontend

React/Vite/Tailwind frontend for Pilot. This is now connected to the real
FastAPI backend in `../backend` (see the root README for the monorepo
overview) — there is no more mock data standing in for the AI execution flow.

## Tech stack

- React 18, Vite, Tailwind CSS, React Router v6, lucide-react

## Getting started

```bash
cp .env.example .env     # set VITE_API_URL to your backend, e.g. http://localhost:8000
npm install
npm run dev
```

The backend (`../backend`) needs to be running for Upload, Dashboard,
and History to actually work — see `../backend/README.md`.

```bash
npm run build     # production build to /dist
npm run preview   # preview the production build locally
```

## Folder structure

```
src/
├── components/
│   ├── common/       Generic building blocks (Button, Card, Modal, Badge, EmptyState)
│   ├── layout/        Sidebar and TopBar
│   ├── dashboard/      Upload zone, prompt box, stats, recent history list
│   └── modals/        ProcessingModal (real request in flight) and ResultsModal (real response)
├── pages/             Dashboard, Upload, AITasks, History, Settings
├── layouts/           MainLayout — sidebar + top bar + <Outlet /> shell
├── routes/            AppRoutes.jsx — the single source of truth for all routes
├── hooks/             usePageHeader, useTaskRunner (drives the real Execute flow)
├── services/          api.js — the ONLY file that knows about the backend's HTTP endpoints
├── data/              mockData.js — now only genuinely UI-only copy (prompt suggestions,
│                       nav labels, template descriptions) — no fake tasks/results anymore
├── utils/             formatters.js — date/size formatting + actionStyles (Create/Read/Update/Delete badges)
└── styles/            (reserved — global styles live in src/index.css)
```

## `services/api.js` — the one seam that matters

Every function here maps 1:1 to a real backend endpoint:

| Function | Backend endpoint |
|---|---|
| `uploadDocument(file)` | `POST /documents/upload` |
| `listDocuments()` | `GET /documents` |
| `getDocument(id)` | `GET /documents/{id}` |
| `downloadDocument(id)` | `GET /documents/{id}/download` — returns real file bytes + filename |
| `saveBlobAsFile(blob, filename)` | (no endpoint — local helper that triggers a browser save-as) |
| `deleteDocument(id)` | `DELETE /documents/{id}` |
| `executeTask({ prompt, documentId })` | `POST /execute` |
| `listExecutions(limit)` | `GET /executions` |

No other file makes a `fetch` call. If the backend's base URL, auth scheme,
or transport ever changes, this is the only file that needs to change.

## The real Execute flow (Dashboard)

1. Upload a document (optional — only needed for read/update/delete, not create).
2. Type a prompt.
3. **Execute Task** calls `POST /execute` with the prompt and the uploaded
   document's id.
4. `ProcessingModal` shows an indeterminate "working" animation while the
   real request is in flight (there's no fixed duration to animate toward
   anymore — it's a real network + LLM call).
5. `ResultsModal` shows exactly what the backend decided (`action_taken`)
   and did (`message`) — including honestly reporting when Pilot wasn't
   confident enough to act, rather than guessing.

## Settings page

Still local-only state (profile fields, notification toggles) — no
corresponding backend endpoints exist yet. That's a reasonable next add
once user accounts exist.

## Extending this codebase

- **New page:** add `src/pages/NewPage.jsx`, call `usePageHeader(...)`, add
  a `<Route>` in `src/routes/AppRoutes.jsx`, add a nav entry in
  `src/components/layout/Sidebar.jsx`.
- **New backend call:** add a function to `src/services/api.js` — never call
  `fetch` from a component or page directly.
