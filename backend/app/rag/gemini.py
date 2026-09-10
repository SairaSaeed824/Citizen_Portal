import os
from functools import lru_cache
from typing import List

from google import genai
from google.genai import types


@lru_cache(maxsize=1)
def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)


EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.5-flash")


def embed_text(text: str) -> List[float]:
    if not text.strip():
        raise ValueError("Cannot embed empty text")
    response = get_client().models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    return list(response.embeddings[0].values)


def generate_answer(question: str, context: str) -> str:
    prompt = f"""You are Citizen Portal's AI assistant for Pakistani public opportunities.

Answer ONLY from the verified context below. Do not invent eligibility, deadlines, organizations, fees, links, or requirements.
If the context does not contain enough information, clearly say that verified information was not found in the available Citizen Portal data.
Keep the answer practical and concise. Mention opportunity titles and relevant details when available.

USER QUESTION:
{question}

VERIFIED CONTEXT:
{context}
"""
    response = get_client().models.generate_content(
        model=CHAT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.2),
    )
    return (response.text or "").strip()
