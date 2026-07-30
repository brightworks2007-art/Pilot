"""
FastAPI entrypoint. Run locally with:
    uvicorn app.main:app --reload

On Render, the start command is:
    uvicorn app.main:app --host 0.0.0.0 --port $PORT

This app serves BOTH the API routes below AND the built React frontend
(from ../frontend/dist, copied in by the Dockerfile) as one combined
service -- see ../Dockerfile and the root README for why.
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import documents, execute, history
from app.core.config import settings

app = FastAPI(
    title="Pilot API",
    description="Backend for Pilot -- an AI agent that actually performs document CRUD instead of just explaining how to.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes are registered BEFORE the static file mount below, so they
# take priority over the frontend's catch-all -- /execute, /documents,
# etc. always hit these, never the React app.
app.include_router(documents.router)
app.include_router(execute.router)
app.include_router(history.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Serve the built React app (if present -- it won't exist yet in local dev
# unless you've run `npm run build` in ../frontend). html=True makes it
# fall back to index.html for any unmatched path, so React Router's
# client-side routes (e.g. /history) work on refresh.
_frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if _frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(_frontend_dist), html=True), name="frontend")
