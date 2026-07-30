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

Both the frontend and backend live in this one Docker image now: a
multi-stage build (`Dockerfile` at the repo root) builds the React app with
Node, then hands the result to a Python/FastAPI image, which serves the
built frontend AND the API (`/execute`, `/documents`, `/executions`) from
one process. No separate frontend deploy, no CORS between them — same
origin, relative paths (`/execute` instead of a full URL).

```
 Browser              One Render Web Service (Docker)          Supabase / Claude
┌────────┐   HTTP    ┌───────────────────────────────┐  API   ┌─────────────────┐
│  User  │ ────────▶ │ FastAPI: serves React build     │ ─────▶│ Postgres+Storage │
└────────┘           │          + /execute etc. routes │       │     + Claude      │
                      └───────────────────────────────┘       └─────────────────┘
```

## Local development

For day-to-day frontend work, run the two halves separately like normal
(fast reload, no Docker rebuild needed):

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

To test the actual combined Docker build locally before deploying:

```bash
docker build -t pilot .
docker run -p 8000:8000 --env-file backend/.env pilot
# visit http://localhost:8000 — same process serves the UI and the API
```

## Deploying on Render (no credit card needed this way)

Render's **Blueprint** flow (multiple services from one `render.yaml`)
requires a card on file. Deploying this as **one Docker web service**
avoids that:

1. Push this repo to GitHub (`Dockerfile`, `frontend/`, `backend/` all at the root)
2. Render dashboard → **New** → **Web Service**
3. Connect the repo. When asked for the environment/runtime, choose **Docker**
   (Render will auto-detect the root `Dockerfile`)
4. Instance type: **Free**
5. Add environment variables (Environment tab): `SUPABASE_URL`,
   `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET=documents`, `ANTHROPIC_API_KEY`,
   `ANTHROPIC_MODEL=claude-sonnet-4-6`
6. Deploy. Once live, the single URL Render gives you serves everything —
   the app and the API.

`render.yaml` at the root still exists and describes this same single
service, in case you ever want to switch to Blueprint deployment instead
(that's the only scenario where you'd need it).

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
