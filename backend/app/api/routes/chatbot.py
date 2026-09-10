import re
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.rag.gemini import generate_answer
from app.rag.retriever import build_context, retrieve

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

CATEGORY_ALIASES = {
    "job": {"job", "jobs", "employment", "vacancies", "vacancy"},
    "scholarship": {"scholarship", "scholarships"},
    "loan": {"loan", "loans"},
    "training": {"training", "trainings", "courses", "course"},
    "internship": {"internship", "internships"},
    "project": {"project", "projects"},
}


def _detect_category(message: str) -> Optional[str]:
    words = set(re.sub(r"[^a-z\s]", " ", message.lower()).split())
    for category, aliases in CATEGORY_ALIASES.items():
        if words & aliases:
            return category
    return None


def _db_record(row: Dict[str, Any]) -> Dict[str, Any]:
    extra = row.get("extra_data") or {}
    return {
        "opportunity_id": row.get("id"),
        "title": row.get("title") or extra.get("title") or "",
        "category": row.get("category") or "",
        "province": extra.get("province") or "",
        "location": extra.get("location") or "",
        "organization": extra.get("organization") or extra.get("department") or extra.get("company") or "",
        "description": row.get("description") or extra.get("description") or "",
        "eligibility": extra.get("eligibility") or "",
        "closing_date": extra.get("closing_date") or extra.get("deadline") or "",
        "apply_link": extra.get("apply_link") or extra.get("link") or extra.get("url") or "",
        "source": extra.get("source") or "",
        "score": 0.0,
    }


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=8, ge=1, le=15)


@router.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    try:
        category = _detect_category(request.message)

        # For direct requests such as "give jobs from database", use Supabase
        # as the source of truth. Do not let semantic search return unrelated
        # categories or stale vector payloads.
        if category:
            response = (
                get_db()
                .table("opportunities")
                .select("*")
                .eq("category", category)
                .limit(request.limit)
                .execute()
            )
            results = [_db_record(row) for row in (response.data or []) if row.get("id") is not None]
        else:
            results = retrieve(request.message, limit=request.limit)

        if not results:
            return {
                "success": True,
                "answer": "I could not find verified matching opportunities in the Citizen Portal database.",
                "sources": [],
                "relatedOpportunities": [],
            }

        context = build_context(results)
        answer = generate_answer(request.message, context)

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
