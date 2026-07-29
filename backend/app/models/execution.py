"""
A persisted record of every /execute call -- what was asked, what Pilot
decided, and what happened. This is what powers a *real* History page
(instead of mock data), and doubles as the raw material Problem #4
(governance) will eventually score for accuracy.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.execute import IntentAction


class ExecutionLog(BaseModel):
    id: UUID
    document_id: Optional[UUID] = None
    document_title: Optional[str] = None
    prompt: str
    action_taken: IntentAction
    confidence: float
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ExecutionListResponse(BaseModel):
    executions: list[ExecutionLog]
    count: int
