"""
Turns a free-form prompt into a concrete CRUD intent using an LLM, and --
for create/update -- also generates the actual new content. This is the
"good prompt -> accurate action" piece that Problem #4 (Prompt & AI Quality
Governance) will later add guardrails/evaluation around.
"""
import json

import anthropic

from app.core.config import settings
from app.models.document import Document
from app.models.execute import IntentAction, ParsedIntent

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

_SYSTEM_PROMPT = """You are Pilot's intent parser. Given a user's instruction and \
(optionally) the document they're referring to, decide which single CRUD action \
they want performed: create, read, update, or delete.

Respond ONLY with JSON matching this exact shape, no other text:
{
  "action": "create" | "read" | "update" | "delete" | "unknown",
  "reasoning": "one sentence explaining the decision",
  "new_title": "string or null - a title, only for create/update",
  "content_instruction": "string or null - for create: the full content to write. for update: the full NEW content that should replace the document's content, written out completely (not a diff/instruction)",
  "confidence": 0.0 to 1.0
}

Rules:
- If the user's intent is ambiguous or you cannot confidently pick one action, use "unknown" and explain why in reasoning.
- For "update", content_instruction must be the complete new content to write, not a description of the change.
- Never invent facts about the document you haven't been shown."""


def parse_intent(prompt: str, existing_document: Document | None, existing_content: str | None) -> ParsedIntent:
    context = ""
    if existing_document:
        context = (
            f"\n\nThe user is referring to this existing document:\n"
            f"Title: {existing_document.title}\n"
            f"Type: {existing_document.file_type.value}\n"
            f"Current content:\n{existing_content or '(empty)'}"
        )

    response = _client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2000,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Instruction: {prompt}{context}"}],
    )

    raw_text = "".join(block.text for block in response.content if block.type == "text")

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Intent parser returned non-JSON output: {raw_text}") from exc

    return ParsedIntent(
        action=IntentAction(parsed.get("action", "unknown")),
        reasoning=parsed.get("reasoning", ""),
        new_title=parsed.get("new_title"),
        content_instruction=parsed.get("content_instruction"),
        confidence=float(parsed.get("confidence", 0.0)),
    )
