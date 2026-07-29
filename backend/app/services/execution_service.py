"""
Persists and reads back the executions audit log (see models/execution.py).
"""
import uuid
from datetime import datetime, timezone

from app.core.supabase_client import get_supabase
from app.models.execute import IntentAction
from app.models.execution import ExecutionLog

TABLE = "executions"


def log_execution(
    prompt: str,
    action_taken: IntentAction,
    confidence: float,
    message: str,
    document_id: uuid.UUID | None,
    document_title: str | None,
) -> ExecutionLog:
    row = {
        "id": str(uuid.uuid4()),
        "document_id": str(document_id) if document_id else None,
        "document_title": document_title,
        "prompt": prompt,
        "action_taken": action_taken.value,
        "confidence": confidence,
        "message": message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    get_supabase().table(TABLE).insert(row).execute()
    return ExecutionLog(**row)


def list_executions(limit: int = 50) -> list[ExecutionLog]:
    res = (
        get_supabase()
        .table(TABLE)
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [ExecutionLog(**row) for row in res.data]
