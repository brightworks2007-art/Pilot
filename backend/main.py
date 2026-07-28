"""
FastAPI entrypoint. Run locally with:
    uvicorn app.main:app --reload

On Render, the start command is:
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.include_router(documents.router)
app.include_router(execute.router)
app.include_router(history.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
