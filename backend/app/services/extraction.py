"""
Extraction service — LLM-based entity extraction from documents.
Uses Groq API to extract structured entities from data center cooling documents.
"""

import json
import re
from pathlib import Path

from groq import Groq
from app.config import settings

# Load prompt template
_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
_EXTRACTION_PROMPT = (_PROMPT_DIR / "extraction.txt").read_text(encoding="utf-8")


def _get_client() -> Groq:
    """Return a Groq API client."""
    return Groq(api_key=settings.GROQ_API_KEY)


def extract_entities(document_text: str, model: str = "llama-3.3-70b-versatile") -> dict:
    """
    Send document text to Groq LLM for structured entity extraction.

    Args:
        document_text: Raw text content of the document.
        model: Groq model to use (default: llama-3.3-70b-versatile).

    Returns:
        Dict with 'entities', 'relationships', and 'document_summary'.
    """
    client = _get_client()

    # Format the prompt with document text
    prompt = _EXTRACTION_PROMPT.format(document_text=document_text)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a precise entity extraction system. Return ONLY valid JSON, no markdown formatting or extra text.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.1,  # Low temperature for consistent extraction
        max_tokens=4096,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content

    # Parse JSON response
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code block if present
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
        if match:
            result = json.loads(match.group(1))
        else:
            raise ValueError(f"Failed to parse extraction response as JSON: {raw[:200]}...")

    # Validate structure
    if "entities" not in result:
        result = {"entities": result, "relationships": [], "document_summary": ""}

    return result


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[dict]:
    """
    Split document text into overlapping chunks for embedding.

    Args:
        text: Full document text.
        chunk_size: Target characters per chunk.
        overlap: Overlap between consecutive chunks.

    Returns:
        List of dicts with 'content', 'chunk_index', 'char_start', 'char_end'.
    """
    chunks = []
    start = 0
    idx = 0

    while start < len(text):
        end = start + chunk_size

        # Try to break at a paragraph or sentence boundary
        if end < len(text):
            # Look for paragraph break first
            para_break = text.rfind("\n\n", start + chunk_size // 2, end + 100)
            if para_break > start:
                end = para_break + 2
            else:
                # Fall back to sentence boundary
                sent_break = text.rfind(". ", start + chunk_size // 2, end + 50)
                if sent_break > start:
                    end = sent_break + 2

        chunk_content = text[start:end].strip()
        if chunk_content:
            chunks.append({
                "content": chunk_content,
                "chunk_index": idx,
                "char_start": start,
                "char_end": end,
            })
            idx += 1

        start = end - overlap
        if start >= len(text):
            break

    return chunks
