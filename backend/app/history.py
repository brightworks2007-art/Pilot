"""
Read-only endpoint for the audit log of past /execute calls -- what the
frontend's History page renders.
"""
from fastapi import APIRouter

from app.models.execution import ExecutionListResponse
from app.services import execution_service

router = APIRouter(tags=["history"])


@router.get("/executions", response_model=ExecutionListResponse)
def list_executions(limit: int = 50):
    executions = execution_service.list_executions(limit=limit)
    return ExecutionListResponse(executions=executions, count=len(executions))
