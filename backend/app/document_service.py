"""
All actual CRUD against Supabase (Postgres table `documents` + Storage
bucket) lives here. Routes call these functions; nothing else touches
the Supabase client directly.

Note: written against supabase-py v2.5.x. Supabase's Python client APIs
do shift between versions -- if `upload`/`download`/`update` signatures
below don't match what's installed, check the installed version's docs
before assuming the logic itself is wrong.
"""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from app.core.config import settings
from app.core.supabase_client import get_supabase
from app.models.document import Document, DocumentSource, FileType
from app.services.file_handlers.registry import get_handler

TABLE = "documents"


def _bucket():
    return get_supabase().storage.from_(settings.supabase_bucket)


def list_documents() -> list[Document]:
    res = get_supabase().table(TABLE).select("*").order("created_at", desc=True).execute()
    return [Document(**row) for row in res.data]


def get_document(document_id: uuid.UUID) -> Document:
    res = get_supabase().table(TABLE).select("*").eq("id", str(document_id)).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return Document(**res.data)


def get_document_bytes(document: Document) -> bytes:
    return _bucket().download(document.storage_path)


def upload_document(file_name: str, file_type: FileType, raw_bytes: bytes, title: str | None = None) -> Document:
    """A user uploaded an existing file -- store it as-is."""
    doc_id = uuid.uuid4()
    storage_path = f"{doc_id}/{file_name}"

    _bucket().upload(storage_path, raw_bytes, {"content-type": "application/octet-stream"})

    now = datetime.now(timezone.utc).isoformat()
    row = {
        "id": str(doc_id),
        "title": title or file_name,
        "file_name": file_name,
        "file_type": file_type.value,
        "storage_path": storage_path,
        "source": DocumentSource.upload.value,
        "created_at": now,
        "updated_at": now,
    }
    get_supabase().table(TABLE).insert(row).execute()
    return Document(**row)


def create_document(title: str, file_name: str, file_type: FileType, content_text: str) -> Document:
    """Pilot creates a brand new document from scratch (the 'C' in CRUD)."""
    handler = get_handler(file_type)
    file_bytes = handler.create(content_text)

    doc_id = uuid.uuid4()
    storage_path = f"{doc_id}/{file_name}"
    _bucket().upload(storage_path, file_bytes, {"content-type": "application/octet-stream"})

    now = datetime.now(timezone.utc).isoformat()
    row = {
        "id": str(doc_id),
        "title": title,
        "file_name": file_name,
        "file_type": file_type.value,
        "storage_path": storage_path,
        "source": DocumentSource.created.value,
        "created_at": now,
        "updated_at": now,
    }
    get_supabase().table(TABLE).insert(row).execute()
    return Document(**row)


def update_document(document_id: uuid.UUID, new_content_text: str, new_title: str | None = None) -> Document:
    """Pilot edits an existing document in place (the 'U' in CRUD)."""
    document = get_document(document_id)
    handler = get_handler(document.file_type)

    existing_bytes = get_document_bytes(document)
    updated_bytes = handler.update(existing_bytes, new_content_text)

    _bucket().upload(document.storage_path, updated_bytes, {"content-type": "application/octet-stream", "upsert": "true"})

    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if new_title:
        updates["title"] = new_title
    get_supabase().table(TABLE).update(updates).eq("id", str(document_id)).execute()

    return get_document(document_id)


def delete_document(document_id: uuid.UUID) -> None:
    """The 'D' in CRUD -- actually deletes, doesn't just tell you how."""
    document = get_document(document_id)
    _bucket().remove([document.storage_path])
    get_supabase().table(TABLE).delete().eq("id", str(document_id)).execute()
