"""
Direct CRUD endpoints. These are the "manual" controls -- a user (or the
frontend) can call these directly without going through the LLM at all.
POST /execute (execute.py) is the natural-language layer built on top of
these same functions.
"""
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.models.document import Document, DocumentCreate, DocumentListResponse, DocumentUpdate, FileType
from app.services import document_service

router = APIRouter(prefix="/documents", tags=["documents"])

# Maps our FileType enum to the MIME type browsers need to open/save the
# file correctly -- this is what makes "round-trip file integrity" actually
# checkable: download this, and it should open cleanly in Word/Excel/etc.
_CONTENT_TYPES = {
    FileType.docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    FileType.xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    FileType.pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    FileType.pdf: "application/pdf",
    FileType.txt: "text/plain",
    FileType.csv: "text/csv",
}


@router.get("", response_model=DocumentListResponse)
def list_documents():
    docs = document_service.list_documents()
    return DocumentListResponse(documents=docs, count=len(docs))


@router.get("/{document_id}", response_model=Document)
def read_document(document_id: uuid.UUID):
    return document_service.get_document(document_id)


@router.get("/{document_id}/download")
def download_document(document_id: uuid.UUID):
    """
    Returns the actual file bytes -- the "does the file go and come back
    intact" test. Whatever Pilot created/updated, this is what proves it's
    a real, openable file rather than just a text description of one.
    """
    document = document_service.get_document(document_id)
    file_bytes = document_service.get_document_bytes(document)
    content_type = _CONTENT_TYPES.get(document.file_type, "application/octet-stream")
    return Response(
        content=file_bytes,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{document.file_name}"'},
    )


@router.post("", response_model=Document)
def create_document(payload: DocumentCreate):
    if payload.content_text is None:
        raise HTTPException(status_code=400, detail="content_text is required to create a document")
    return document_service.create_document(
        title=payload.title,
        file_name=payload.file_name,
        file_type=payload.file_type,
        content_text=payload.content_text,
    )


@router.post("/upload", response_model=Document)
async def upload_document(file: UploadFile = File(...)):
    extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    try:
        file_type = FileType(extension)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{extension}")

    raw_bytes = await file.read()
    return document_service.upload_document(file_name=file.filename, file_type=file_type, raw_bytes=raw_bytes)


@router.patch("/{document_id}", response_model=Document)
def update_document(document_id: uuid.UUID, payload: DocumentUpdate):
    if payload.content_text is None and payload.title is None:
        raise HTTPException(status_code=400, detail="Provide at least a new title or new content")
    return document_service.update_document(
        document_id=document_id,
        new_content_text=payload.content_text or "",
        new_title=payload.title,
    )


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: uuid.UUID):
    document_service.delete_document(document_id)
