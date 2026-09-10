from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rag.gemini import generate_answer
from app.rag.retriever import build_context, retrieve

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=8, ge=1, le=15)


@router.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    try:
        results = retrieve(request.message, limit=request.limit)
        if not results:
            return {
                "success": True,
                "answer": "I could not find verified matching opportunities in the Citizen Portal data.",
                "sources": [],
                "relatedOpportunities": [],
            }

        context = build_context(results)
        answer = generate_answer(request.message, context)

        # Related opportunities are always built from retrieved database records.
        # Gemini is never allowed to create or invent these cards.
        related_opportunities = []
        for item in results[:5]:
            if not item.get("opportunity_id") or not item.get("title"):
                continue
            related_opportunities.append({
                "id": item.get("opportunity_id"),
                "opportunity_id": item.get("opportunity_id"),
                "title": item.get("title"),
                "name": item.get("title"),
                "category": item.get("category", ""),
                "province": item.get("province", ""),
                "location": item.get("location", ""),
                "organization": item.get("organization", ""),
                "description": item.get("description", ""),
                "eligibility": item.get("eligibility", ""),
                "closing_date": item.get("closing_date", ""),
                "deadline": item.get("closing_date", ""),
                "apply_link": item.get("apply_link", ""),
                "source": item.get("source", ""),
                "score": round(float(item.get("score", 0)), 4),
            })

        sources = [
            {
                "id": item.get("opportunity_id"),
                "title": item.get("title", ""),
                "category": item.get("category", ""),
                "source": item.get("source", ""),
                "apply_link": item.get("apply_link", ""),
                "score": round(float(item.get("score", 0)), 4),
            }
            for item in results
            if item.get("opportunity_id") and item.get("title")
        ]

        return {
            "success": True,
            "answer": answer,
            "sources": sources,
            "relatedOpportunities": related_opportunities,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chatbot service error: {exc}")
