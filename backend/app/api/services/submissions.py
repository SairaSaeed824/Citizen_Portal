import re
from datetime import datetime, timezone
from typing import Any, Dict

from app.core.database import get_db

ALLOWED_CATEGORIES = {"job", "scholarship", "loan", "training", "internship", "project"}


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" .,:;-\n\t")


def _first_match(patterns: list[str], text: str) -> str:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return _clean(match.group(1))
    return ""


def extract_attributes(name: str, detail: str, category: str) -> Dict[str, Any]:
    """Extract useful structured attributes from free-form submission details.

    This intentionally does not discard unknown information: detected attributes are
    stored in extra_data so the frontend can render them dynamically.
    """
    text = detail.strip()
    extra: Dict[str, Any] = {}

    organization = _first_match([
        r"(?:organization|organisation|department|ministry|provided by|offered by)\s*[:\-]\s*([^\n]+)",
        r"(?:by|from)\s+([A-Z][A-Za-z& .'-]{2,80}(?:Department|Ministry|Authority|University|Foundation|Bank|Corporation|Commission|Program|Government)?)"
    ], text)
    if organization:
        extra["organization"] = organization

    province = _first_match([
        r"(?:province|provincial)\s*[:\-]\s*([^\n,;.]+)",
        r"\b(Punjab|Sindh|Khyber Pakhtunkhwa|KPK|Balochistan|Gilgit[- ]Baltistan|Azad Jammu and Kashmir|AJK|Islamabad Capital Territory|ICT)\b"
    ], text)
    if province:
        extra["province"] = province

    location = _first_match([
        r"(?:location|city|located in)\s*[:\-]\s*([^\n;.]+)"
    ], text)
    if location:
        extra["location"] = location

    deadline = _first_match([
        r"(?:deadline|closing date|last date|apply before|applications close)\s*[:\-]?\s*([^\n;.]+)",
        r"(?:before|by)\s+((?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}))"
    ], text)
    if deadline:
        extra["closing_date_text"] = deadline

    for key, patterns in {
        "eligibility": [r"(?:eligibility|eligible|who can apply)\s*[:\-]\s*([^\n]+)"],
        "education": [r"(?:education|qualification|degree|qualification required)\s*[:\-]\s*([^\n]+)"],
        "age_limit": [r"(?:age limit|age)\s*[:\-]\s*([^\n]+)"],
        "duration": [r"(?:duration|period)\s*[:\-]\s*([^\n]+)"],
        "stipend": [r"(?:stipend|monthly stipend)\s*[:\-]?\s*([^\n]+)"],
        "amount": [r"(?:amount|financial assistance|loan amount|grant amount|funding)\s*[:\-]?\s*([^\n]+)"],
        "required_documents": [r"(?:required documents|documents required|documents)\s*[:\-]\s*([^\n]+)"],
        "benefits": [r"(?:benefits|features)\s*[:\-]\s*([^\n]+)"],
        "application_process": [r"(?:application process|how to apply|apply)\s*[:\-]\s*([^\n]+)"],
        "contact": [r"(?:contact|contact person|helpline)\s*[:\-]\s*([^\n]+)"],
    }.items():
        value = _first_match(patterns, text)
        if value:
            extra[key] = value

    urls = re.findall(r"https?://[^\s<>"]+", text)
    if urls:
        extra["apply_link"] = urls[0].rstrip(".,)")
        if len(urls) > 1:
            extra["additional_links"] = [u.rstrip(".,)") for u in urls[1:]]

    # Keep the complete citizen-provided detail available for audit/review.
    extra["submitted_details"] = text
    extra["submitted_at"] = datetime.now(timezone.utc).isoformat()
    extra["source_type"] = "user_submitted"
    extra["verification_status"] = "pending"
    extra["category"] = category

    return extra


def _normalize_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def find_duplicate(name: str, category: str) -> Dict[str, Any] | None:
    db = get_db()
    normalized = _normalize_title(name)

    # Exact/near-exact title checks against both public and pending records.
    for table in ("opportunities", "submitted_opportunities"):
        try:
            rows = db.table(table).select("id,title,name,category,status").execute().data or []
        except Exception:
            continue
        for row in rows:
            existing_title = row.get("title") or row.get("name") or ""
            if row.get("category", "").lower() == category and _normalize_title(existing_title) == normalized:
                return {"table": table, "record": row}
    return None


def create_submission(name: str, category: str, detail: str) -> Dict[str, Any]:
    category = category.lower().strip()
    if category not in ALLOWED_CATEGORIES:
        raise ValueError("Invalid category")

    duplicate = find_duplicate(name, category)
    if duplicate:
        raise ValueError("A similar opportunity already exists in the database or is already pending review.")

    extra_data = extract_attributes(name, detail, category)
    payload = {
        "title": name.strip(),
        "name": name.strip(),
        "category": category,
        "description": detail.strip(),
        "extra_data": extra_data,
        "status": "pending",
        "verification_status": "pending",
        "source_type": "user_submitted",
    }

    db = get_db()
    result = db.table("submitted_opportunities").insert(payload).execute()
    return (result.data or [{}])[0]


def list_pending_submissions() -> list[Dict[str, Any]]:
    db = get_db()
    result = db.table("submitted_opportunities").select("*").eq("status", "pending").order("id", desc=True).execute()
    return result.data or []


def review_submission(submission_id: int, action: str, edited_data: Dict[str, Any] | None = None) -> Dict[str, Any]:
    action = action.lower().strip()
    if action not in {"approve", "reject"}:
        raise ValueError("Action must be approve or reject")

    db = get_db()
    current = db.table("submitted_opportunities").select("*").eq("id", submission_id).single().execute().data
    if not current:
        raise ValueError("Submission not found")

    if action == "reject":
        return db.table("submitted_opportunities").update({"status": "rejected", "verification_status": "rejected"}).eq("id", submission_id).execute().data[0]

    record = dict(current)
    if edited_data:
        for key in ("title", "category", "description", "extra_data"):
            if key in edited_data:
                record[key] = edited_data[key]

    public_payload = {
        "title": record.get("title") or record.get("name"),
        "category": record.get("category"),
        "description": record.get("description") or "",
        "extra_data": record.get("extra_data") or {},
        "status": "active",
        "verification_status": "verified",
        "source_type": "user_submitted",
    }

    # Final duplicate check immediately before publishing.
    duplicate = find_duplicate(public_payload["title"], public_payload["category"])
    if duplicate and duplicate["table"] == "opportunities":
        raise ValueError("This opportunity already exists in the public database.")

    inserted = db.table("opportunities").insert(public_payload).execute().data
    if not inserted:
        raise ValueError("Could not publish approved opportunity")

    db.table("submitted_opportunities").update({
        "status": "approved",
        "verification_status": "verified"
    }).eq("id", submission_id).execute()

    return inserted[0]
