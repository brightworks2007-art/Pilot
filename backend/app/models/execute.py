"""
Schemas for POST /execute -- the "Direct Execution" endpoint. A prompt goes
in, an LLM decides which CRUD action it maps to, and the actual result of
performing that action comes back (not a description of how to do it).
"""
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.document import Document, FileType


class IntentAction(str, Enum):
    create = "create"
    read = "read"
    update = "update"
    delete = "delete"
    unknown = "unknown"


class ExecuteRequest(BaseModel):
    prompt: str
    document_id: Optional[UUID] = None  # which document the prompt refers to, if any

    # Only used when the intent turns out to be "create" and there's no
    # existing document to infer a type/name from. Defaults to a .txt file
    # if omitted.
    file_name: Optional[str] = None
    file_type: Optional[FileType] = None


class ParsedIntent(BaseModel):
    """What the LLM decided the prompt means, before any action is taken."""

    action: IntentAction
    reasoning: str
    new_title: Optional[str] = None
    content_instruction: Optional[str] = None
    confidence: float = 0.0


class ExecuteResponse(BaseModel):
    intent: ParsedIntent
    action_taken: IntentAction
    document: Optional[Document] = None
    message: str
