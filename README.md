# Pilot

Pilot is an AI agent that actually performs document CRUD — create, read,
update, delete — instead of just explaining how to do it. This is the build
for **Problem #1: Direct Execution** (the direct response to Microsoft
Copilot's reported inability to reliably execute simple document actions).

This is a monorepo:

```
pilot/
├── frontend/     React + Vite + Tailwind UI          → see frontend/README.md
├── backend/      FastAPI + Supabase + Claude          → see backend/README.md
└── render.yaml   Deploys both as separate Render services
```

## How the two halves relate

The frontend is a static site — it has no server logic of its own, and
never touches Supabase or Claude directly. Every real action goes through
`frontend/src/services/api.js`, which calls the FastAPI backend over HTTP.
The backend is the only thing that talks to Supabase (documents + their
actual files) and Claude (deciding what a prompt means and generating new
content).

```
 Browser                Frontend (static)         Backend (FastAPI)         Supabase / Claude
┌────────┐   click     ┌────────────────┐  fetch  ┌────────────────┐  SQL/  ┌─────────────────┐
│  User  │ ──────────▶ │  React UI       │ ──────▶ │  /execute etc.  │ ─────▶ │ Postgres+Storage │
└────────┘             └────────────────┘         └────────────────┘  API   │     + Claude      │
                                                                              └─────────────────┘
```

## Local development

```bash
# terminal 1 — backend
cd backend
cp .env.example .env    # fill in Supabase + Anthropic keys
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# terminal 2 — frontend
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Then open the Vite dev server URL (default `http://localhost:5173`).

## Deploying (Render)

`render.yaml` at the repo root defines both services as a Render Blueprint:
- **pilot-frontend** — Static Site, builds `frontend/`, serves `frontend/dist`
- **pilot-backend** — Web Service, runs `backend/` with `uvicorn`

Import this repo as a Blueprint on Render and it will provision both. You
still need to set the backend's environment variables (Supabase keys,
Anthropic key) in the Render dashboard, and set the frontend's
`VITE_API_URL` to the backend's Render URL once it's live.

## The problem list this is part of

Pilot is scoped around five problems; this build tackles the first:

1. **Direct Execution** ← this repo
2. Enterprise Data Hygiene
3. Cross-Ecosystem Context — this is *why* documents live in Pilot's own
   Supabase store rather than being manipulated in place: the plan is for
   Pilot to eventually pull documents in from wherever a company already
   keeps them (Microsoft 365, Google Workspace, Slack, Notion...) and
   normalize them into one place it can act on consistently.
4. Prompt & AI Quality Governance — the accuracy layer around the intent
   parsing in `backend/app/services/intent_service.py`; the confidence
   threshold in `backend/app/api/routes/execute.py` is the current
   placeholder for this.
5. Organizational Memory (Company Memory)

## Status / what's real vs. still a placeholder

**Real:** file upload to Supabase Storage, document metadata in Postgres,
prompt → LLM intent parsing → actual create/read/update/delete on real
`.docx`/`.xlsx`/`.pptx`/`.pdf`/`.txt`/`.csv` files, a real audit log
powering the History page.

**Still placeholder:** authentication/user accounts, the Settings page,
the Dashboard's stat cards (need an aggregate endpoint), fine-grained
document edits (current updates replace whole-document content rather
than targeting a specific paragraph/cell/slide).
