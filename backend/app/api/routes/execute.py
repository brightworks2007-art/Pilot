"""
POST /execute -- the "Direct Execution" endpoint. This is the whole point
of Problem #1: a prompt goes in, Pilot decides what CRUD action it means,
and actually performs it -- it does not just explain what you'd need to do.
"""
from fastapi import APIRouter, HTTPException

from app.models.document import FileType
from app.models.execute import ExecuteRequest, ExecuteResponse, IntentAction
from app.services import document_service, execution_service, intent_service
from app.services.file_handlers.registry import get_handler

router = APIRouter(tags=["execute"])

# Below this confidence, Pilot refuses to act automatically and instead
# reports back what it *thinks* you meant -- this is the seam where
# Problem #4 (Prompt & AI Quality Governance) plugs in more rigorous checks.
CONFIDENCE_THRESHOLD = 0.6


@router.post("/execute", response_model=ExecuteResponse)
def execute(payload: ExecuteRequest):
    existing_document = None
    existing_content = None

    if payload.document_id:
        existing_document = document_service.get_document(payload.document_id)
        existing_bytes = document_service.get_document_bytes(existing_document)
        handler = get_handler(existing_document.file_type)
        existing_content = handler.read_text(existing_bytes)

    intent = intent_service.parse_intent(payload.prompt, existing_document, existing_content)

    if intent.action == IntentAction.unknown or intent.confidence < CONFIDENCE_THRESHOLD:
        message = f"Pilot wasn't confident enough to act automatically: {intent.reasoning}"
        execution_service.log_execution(
            prompt=payload.prompt,
            action_taken=IntentAction.unknown,
            confidence=intent.confidence,
            message=message,
            document_id=existing_document.id if existing_document else None,
            document_title=existing_document.title if existing_document else None,
        )
        return ExecuteResponse(intent=intent, action_taken=IntentAction.unknown, document=None, message=message)

    if intent.action == IntentAction.create:
        file_type = payload.file_type or FileType.txt
        file_name = payload.file_name or f"untitled.{file_type.value}"
        document = document_service.create_document(
            title=intent.new_title or "Untitled",
            file_name=file_name,
            file_type=file_type,
            content_text=intent.content_instruction or "",
        )
        message = f"Created '{document.title}'."

    elif intent.action == IntentAction.read:
        if not existing_document:
            raise HTTPException(status_code=400, detail="No document specified to read")
        document = existing_document
        message = existing_content or "(document is empty)"

    elif intent.action == IntentAction.update:
        if not existing_document:
            raise HTTPException(status_code=400, detail="No document specified to update")
        document = document_service.update_document(
            document_id=existing_document.id,
            new_content_text=intent.content_instruction or "",
            new_title=intent.new_title,
        )
        message = f"Updated '{document.title}'."

    elif intent.action == IntentAction.delete:
        if not existing_document:
            raise HTTPException(status_code=400, detail="No document specified to delete")
        document_service.delete_document(existing_document.id)
        document = None
        message = f"Deleted '{existing_document.title}'."

    else:
        document = None
        message = "Could not determine an action to take."

    execution_service.log_execution(
        prompt=payload.prompt,
        action_taken=intent.action,
        confidence=intent.confidence,
        message=message,
        document_id=document.id if document else (existing_document.id if existing_document else None),
        document_title=document.title if document else (existing_document.title if existing_document else None),
    )

    return ExecuteResponse(intent=intent, action_taken=intent.action, document=document, message=message)
