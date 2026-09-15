import os
from typing import Any, Dict, List

from app.rag.gemini import embed_text
from app.rag.qdrant import search_opportunities


def retrieve(question: str, limit: int = 8) -> List[Dict[str, Any]]:
    vector = embed_text(question)
    results = search_opportunities(vector, limit=limit)

    # Similarity is checked after the embedding call. This prevents weakly
    # related opportunities from reaching Gemini's answer-generation step.
    threshold = float(os.getenv("RAG_SCORE_THRESHOLD", "0.45"))
    return [item for item in results if float(item.get("score", 0.0)) >= threshold]


def build_context(results: List[Dict[str, Any]]) -> str:
    chunks = []
    for index, item in enumerate(results, start=1):
        chunks.append(
            f"[{index}] {item.get('title', 'Untitled')}\n"
            f"Category: {item.get('category', '')}\n"
            f"Province: {item.get('province', '')}\n"
            f"Location: {item.get('location', '')}\n"
            f"Organization: {item.get('organization', '')}\n"
            f"Eligibility: {item.get('eligibility', '')}\n"
            f"Deadline: {item.get('closing_date', '')}\n"
            f"Description: {item.get('description', '')}\n"
            f"Apply link: {item.get('apply_link', '')}\n"
            f"Source: {item.get('source', '')}"
        )
    return "\n\n".join(chunks)
