import re
from datetime import date, datetime
from typing import Any, Dict, Optional, Tuple

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.rag.gemini import generate_answer
from app.rag.query_guard import check_query_relevance, normalize_query
from app.rag.retriever import build_context, retrieve

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

CATEGORY_ALIASES = {
    "job": {"job", "jobs", "employment", "vacancies", "vacancy"},
    "scholarship": {"scholarship", "scholarships", "schoolarship", "schoolarships", "scholorship", "scholorships"},
    "loan": {"loan", "loans"},
    "training": {"training", "trainings", "courses", "course"},
    "internship": {"internship", "internships", "internhips"},
    "project": {"project", "projects"},
}

PROVINCES = {"punjab": "Punjab", "sindh": "Sindh", "kpk": "KPK", "kp": "KPK", "khyber pakhtunkhwa": "KPK", "balochistan": "Balochistan", "islamabad": "Islamabad"}
LOCATION_TERMS = {"lahore", "karachi", "islamabad", "rawalpindi", "peshawar", "quetta", "multan", "faisalabad", "hyderabad", "sialkot", "gujranwala", "bahawalpur", "sargodha", "abbottabad", "murree"}
STOPWORDS = {"a", "an", "the", "for", "in", "on", "at", "to", "of", "and", "or", "me", "my", "is", "are", "show", "give", "list", "find", "get", "available", "latest", "new", "please", "any", "some", "with", "from", "near", "opportunities", "opportunity", "openings", "opening", "there", "can", "you", "want", "need", "looking", "tell", "about", "what", "which", "how", "information", "info", "explain", "explanation", "let", "know", "would", "could", "please", "me", "i", "id", "like", "provide", "provide", "details", "detail", "regarding", "regard", "interested", "interest", "showing", "tell", "more"}


def _words(message: str) -> list[str]:
    return re.sub(r"[^a-z0-9\s]", " ", normalize_query(message)).lower().split()


def _detect_category(message: str) -> Optional[str]:
    words = set(_words(message))
    for category, aliases in CATEGORY_ALIASES.items():
        if words & aliases:
            return category
    return None


def _extract_limit(message: str, default: int) -> int:
    match = re.search(r"\b(\d{1,2})\s+(?:latest\s+)?(?:jobs?|scholarships?|loans?|trainings?|courses?|internships?|projects?|opportunities?)\b", normalize_query(message))
    if not match:
        match = re.search(r"\b(\d{1,2})\b", normalize_query(message))
    return max(1, min(int(match.group(1)), 15)) if match else default


def _extract_filters(message: str) -> Tuple[Optional[str], Optional[str], list[str], bool]:
    text = normalize_query(message)
    words = _words(text)
    province = next((value for key, value in PROVINCES.items() if key in text), None)
    location = next((value.title() for value in LOCATION_TERMS if value in words), None)
    category = _detect_category(text)
    latest = bool(re.search(r"\b(latest|newest|recent|new)\b", text))
    category_words = set().union(*CATEGORY_ALIASES.values())
    filter_words = set(PROVINCES) | LOCATION_TERMS | category_words | STOPWORDS
    keywords = [word for word in words if word not in filter_words and len(word) > 2 and not word.isdigit()]
    return province, location, keywords, latest


def _db_record(row: Dict[str, Any]) -> Dict[str, Any]:
    extra = row.get("extra_data") or {}
    return {"opportunity_id": row.get("id"), "title": row.get("title") or extra.get("title") or "", "category": row.get("category") or "", "province": extra.get("province") or "", "location": extra.get("location") or "", "organization": extra.get("organization") or extra.get("department") or extra.get("company") or "", "description": row.get("description") or extra.get("description") or "", "eligibility": extra.get("eligibility") or "", "closing_date": extra.get("closing_date") or extra.get("deadline") or "", "apply_link": extra.get("apply_link") or extra.get("link") or extra.get("url") or "", "source": extra.get("source") or "", "score": 0.0}


def _date_value(value: Any) -> Optional[date]:
    if not value:
        return None
    text = str(value).strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(text[:10], fmt).date()
        except ValueError:
            continue
    return None


def _is_active(item: Dict[str, Any]) -> bool:
    deadline = _date_value(item.get("closing_date"))
    return deadline is None or deadline >= date.today()


def _matches_keywords(item: Dict[str, Any], keywords: list[str]) -> bool:
    if not keywords:
        return True
    searchable = " ".join(str(item.get(key, "")) for key in ("title", "description", "organization", "eligibility", "location", "province")).lower()
    return all(keyword.lower() in searchable for keyword in keywords)


def _matches_location(item: Dict[str, Any], province: Optional[str], location: Optional[str]) -> bool:
    if province:
        searchable = f"{item.get('province', '')} {item.get('location', '')}".lower()
        if province.lower() not in searchable:
            return False
    if location:
        searchable = f"{item.get('location', '')} {item.get('province', '')}".lower()
        if location.lower() not in searchable:
            return False
    return True


def _fetch_structured(category: str, limit: int, province: Optional[str], location: Optional[str], keywords: list[str], latest: bool) -> list[Dict[str, Any]]:
    response = get_db().table("opportunities").select("*").eq("category", category).limit(200).execute()
    results = [_db_record(row) for row in (response.data or []) if row.get("id") is not None]
    results = [item for item in results if _matches_location(item, province, location) and _matches_keywords(item, keywords) and _is_active(item)]
    if latest:
        results.sort(key=lambda item: _date_value(item.get("closing_date")) or date.max)
    return results[:limit]


def _clean_database_answer(results: list[Dict[str, Any]], category: str) -> str:
    labels = {"job": "Jobs", "scholarship": "Scholarships", "loan": "Loans", "training": "Training Opportunities", "internship": "Internships", "project": "Projects"}
    intro = {"job": "Here are the active job opportunities available on Citizen Portal:", "scholarship": "Here are the active scholarship opportunities available on Citizen Portal:", "loan": "Here are the active loan opportunities available on Citizen Portal:", "training": "Here are the active training opportunities available on Citizen Portal:", "internship": "Here are the active internship opportunities available on Citizen Portal:", "project": "Here are the active project opportunities available on Citizen Portal:"}
    lines = [intro.get(category, "Here are the available opportunities on Citizen Portal:"), "", f"### {labels.get(category, 'Opportunities')}", ""]
    for index, item in enumerate(results, start=1):
        lines.append(f"**{index}. {item.get('title') or 'Untitled opportunity'}**")
        for label, key in (("Organization", "organization"), ("Location", "location"), ("Province", "province"), ("Deadline", "closing_date")):
            if item.get(key):
                lines.append(f"{label}: {item[key]}")
        if item.get("apply_link"):
            lines.append(f"[Apply Now]({item['apply_link']})")
        lines.append("")
    return "\n".join(lines).strip()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=8, ge=1, le=15)


@router.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    try:
        is_relevant, _reason = check_query_relevance(request.message)
        if not is_relevant:
            return {"success": True, "answer": "I can help with jobs, internships, scholarships, loans, training, and projects listed on Citizen Portal. Please ask a question related to these opportunities.", "sources": [], "relatedOpportunities": []}

        query = normalize_query(request.message)
        category = _detect_category(query)
        province, location, keywords, latest = _extract_filters(query)
        requested_limit = _extract_limit(query, request.limit)

        if category:
            results = _fetch_structured(category, requested_limit, province, location, keywords, latest)
        else:
            results = retrieve(query, limit=requested_limit)

        if not results:
            return {"success": True, "answer": "I could not find any active, matching opportunities in the Citizen Portal database.", "sources": [], "relatedOpportunities": []}

        answer = _clean_database_answer(results, category) if category else generate_answer(query, build_context(results))
        return {"success": True, "answer": answer, "sources": [], "relatedOpportunities": []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chatbot service error: {exc}")
