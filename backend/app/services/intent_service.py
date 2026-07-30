"""
Turns a free-form prompt into a concrete CRUD intent using Gemini, and --
for create/update -- also generates the actual new content. This is the
"good prompt -> accurate action" piece that Problem #4 (Prompt & AI Quality
Governance) will later add guardrails/evaluation around.

Uses Google's current unified SDK (`google-genai`, `from google import genai`)
-- not the older, now-deprecated `google-generativeai` package.
"""
import json

from google import genai
from google.genai import types

from app.core.config import settings
from app.models.document import Document
from app.models.execute import IntentAction, ParsedIntent

_client = genai.Client(api_key=settings.gemini_api_key)

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

    response = _client.models.generate_content(
        model=settings.gemini_model,
        contents=f"Instruction: {prompt}{context}",
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            response_mime_type="application/json",
            max_output_tokens=2000,
        ),
    )

    raw_text = response.text or ""

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
