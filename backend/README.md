# Pilot — Backend (FastAPI)

The backend for Problem #1, **Direct Execution**: a client tells Pilot what
they want done to a document, and Pilot actually does it — create, read,
update, or delete — instead of explaining the steps.

## Stack

- FastAPI
- Supabase (Postgres for metadata + Storage for the actual files)
- Anthropic Claude (parses a prompt into a CRUD intent + generates new content)
- Real file-format handling: `python-docx`, `openpyxl`, `python-pptx`, `pypdf` + `reportlab`

## Setup

1. **Create the Supabase project** (if you haven't already), then in the SQL
   editor run `supabase/schema.sql` — it creates the `documents` and
   `executions` tables.
2. **Create a Storage bucket** named `documents` (Storage → New bucket,
   not public — the backend only ever accesses it with the service-role key).
3. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — from Supabase project settings → API
   - `ANTHROPIC_API_KEY` — from console.anthropic.com
   - `FRONTEND_ORIGINS` — comma-separated list of allowed origins (e.g. `http://localhost:5173`)
4. Install and run:
   ```bash
   python -m venv .venv
   source .venv/bin/activate    # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
5. Visit `http://localhost:8000/docs` for the interactive Swagger UI —
   the fastest way to try every endpoint by hand before wiring up the frontend.

## Folder structure

```
app/
├── main.py              FastAPI app, CORS, router registration
├── core/
│   ├── config.py         All settings, loaded from env vars
│   └── supabase_client.py  Single shared Supabase client
├── models/               Pydantic request/response schemas
│   ├── document.py        Document, DocumentCreate, DocumentUpdate...
│   ├── execute.py         ExecuteRequest/Response, ParsedIntent
│   └── execution.py       ExecutionLog (the audit trail / History page data)
├── api/routes/
│   ├── documents.py       Direct CRUD: GET/POST/PATCH/DELETE /documents
│   ├── execute.py         POST /execute — the natural-language layer on top of documents.py
│   └── history.py         GET /executions — audit log for the History page
├── services/
│   ├── document_service.py   All real Supabase reads/writes (DB rows + Storage files)
│   ├── execution_service.py  Logs every /execute call for the audit trail
│   ├── intent_service.py     Calls Claude to turn a prompt into a ParsedIntent
│   └── file_handlers/         One handler per file type (docx/xlsx/pptx/pdf/txt/csv),
│                               all implementing the same read/create/update interface
└── utils/                (reserved for shared helpers as they come up)

supabase/
└── schema.sql            Run once in the Supabase SQL editor
```

## How a request actually flows

1. Frontend calls `POST /documents/upload` with a file → it's stored in the
   Supabase bucket, and a row is inserted into `documents`.
2. Frontend calls `POST /execute` with `{ prompt, document_id }`.
3. `execute.py` fetches the document (if given) and its current text via the
   matching file handler, then calls `intent_service.parse_intent(...)`.
4. Claude returns a `ParsedIntent`: which action (create/read/update/delete),
   how confident it is, and — for create/update — the actual new content.
5. If confidence is high enough, `execute.py` calls the matching function in
   `document_service.py`, which does the real work: writes the real file
   format, uploads it back to Storage, updates the DB row.
6. The result (and every attempt, including low-confidence ones Pilot
   declined to act on) is logged to `executions` via `execution_service.py`.
7. The frontend gets back exactly what happened, and the History page reads
   straight from `executions`.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/documents/upload` | Upload an existing file |
| `GET` | `/documents` | List all documents |
| `GET` | `/documents/{id}` | Get one document's metadata |
| `GET` | `/documents/{id}/download` | Get the real file bytes (correct Content-Type + filename) — the round-trip integrity check |
| `POST` | `/documents` | Create a document from raw text directly (bypasses the LLM) |
| `PATCH` | `/documents/{id}` | Update a document directly (bypasses the LLM) |
| `DELETE` | `/documents/{id}` | Delete a document directly |
| `POST` | `/execute` | **The core endpoint** — prompt in, real CRUD action out |
| `GET` | `/executions` | Audit log of every `/execute` call |
| `GET` | `/health` | Liveness check |

## Deploying on Render

As a Render **Web Service** (not Static Site):
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add all the `.env.example` variables as environment variables in the Render dashboard.

## Known MVP limitations (by design, not oversight)

- **PDF editing** regenerates the file from scratch with `reportlab` rather
  than surgically editing the original PDF — pypdf can't easily rewrite
  arbitrary content, and a template-based approach is a reasonable Phase 3
  upgrade if precise PDF editing becomes important.
- **`.docx`/`.pptx` updates replace the whole body/deck** rather than
  targeting a specific paragraph/slide — good enough to prove "Pilot can
  actually edit a real file," finer-grained editing (e.g. "only change
  paragraph 3") is a natural next iteration.
- **No auth yet** — `owner_id` exists on the model but isn't enforced;
  Supabase Row Level Security is off for now since FastAPI uses the
  service-role key server-side. Turn RLS on once real user accounts exist.
- **Confidence threshold (`CONFIDENCE_THRESHOLD = 0.6` in `execute.py`) is a
  starting guess**, not a tuned value — this is exactly the kind of thing
  Problem #4 (Prompt & AI Quality Governance) should replace with real
  evaluation data.
