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


def _clean_database_answer(results: list[Dict[str, Any]], category: str) -> str:
    """Build a deterministic, clean answer directly from database records."""
    label = category.capitalize() + ("ies" if category == "opportunit" else "s")
    if category == "job":
        label = "Jobs"
    elif category == "scholarship":
        label = "Scholarships"
    elif category == "loan":
        label = "Loans"
    elif category == "training":
        label = "Training Opportunities"
    elif category == "internship":
        label = "Internships"
    elif category == "project":
        label = "Projects"

    lines = [f"### {label}", ""]
    for index, item in enumerate(results, start=1):
        title = item.get("title") or "Untitled opportunity"
        lines.append(f"**{index}. {title}**")

        organization = item.get("organization")
        if organization:
            lines.append(f"Organization: {organization}")

        location = item.get("location")
        if location:
            lines.append(f"Location: {location}")

        province = item.get("province")
        if province:
            lines.append(f"Province: {province}")

        deadline = item.get("closing_date")
        if deadline:
            lines.append(f"Deadline: {deadline}")

        apply_link = item.get("apply_link")
        if apply_link:
            lines.append(f"[Apply Now]({apply_link})")

        lines.append("")

    return "\n".join(lines).strip()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=8, ge=1, le=15)


@router.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    try:
        category = _detect_category(request.message)

        # Direct category requests use Supabase as the source of truth.
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

        # For direct database/category requests, do not ask Gemini to rewrite
        # the records. This keeps titles, deadlines and Apply links exact.
        if category:
            answer = _clean_database_answer(results, category)
        else:
            context = build_context(results)
            answer = generate_answer(request.message, context)

        # The chatbot intentionally returns no related-opportunity cards.
        # The answer itself contains the verified Apply links.
        return {
            "success": True,
            "answer": answer,
            "sources": [],
            "relatedOpportunities": [],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chatbot service error: {exc}")
