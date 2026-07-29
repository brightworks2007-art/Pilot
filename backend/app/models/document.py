"""
Pydantic schemas for the `documents` table + API request/response shapes.
These are the contracts between FastAPI and the frontend -- keep them in
sync with the Supabase table definition in supabase/schema.sql.
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FileType(str, Enum):
    docx = "docx"
    xlsx = "xlsx"
    pptx = "pptx"
    pdf = "pdf"
    txt = "txt"
    csv = "csv"


class DocumentSource(str, Enum):
    upload = "upload"
    gdrive = "gdrive"      # reserved for Phase 3 (#3 Cross-Ecosystem Context)
    slack = "slack"
    notion = "notion"
    created = "created"    # document Pilot itself created via /execute


class DocumentBase(BaseModel):
    title: str
    file_name: str
    file_type: FileType


class DocumentCreate(DocumentBase):
    """Used when Pilot (not the user) creates a brand new document via /execute."""

    content_text: Optional[str] = None  # for txt/csv; docx/xlsx/pptx/pdf are built from templates


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content_text: Optional[str] = None  # a natural-language instruction, e.g. "add a paragraph about X"


class Document(DocumentBase):
    id: UUID
    storage_path: str
    source: DocumentSource
    owner_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[Document]
    count: int
