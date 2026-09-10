import re
from datetime import datetime, timezone
from typing import Any, Dict

from app.core.database import get_db
from app.rag.indexer import index_new_opportunities


ALLOWED_CATEGORIES = {
    "job",
    "scholarship",
    "loan",
    "training",
    "internship",
    "project",
}


def _normalize_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _clean_attributes(attributes: Dict[str, Any]) -> Dict[str, Any]:
    """Keep only user-provided non-empty values and normalize strings."""
    cleaned: Dict[str, Any] = {}
    for key, value in attributes.items():
        if value is None:
            continue
        if isinstance(value, str):
            value = value.strip()
            if not value:
                continue
        elif isinstance(value, list):
            value = [str(item).strip() for item in value if str(item).strip()]
            if not value:
                continue
        cleaned[key] = value
    return cleaned


def find_duplicate(name: str, category: str) -> Dict[str, Any] | None:
    db = get_db()
    normalized = _normalize_title(name)
    category = category.lower().strip()

    try:
        public_rows = (
            db.table("opportunities")
            .select("id,category,extra_data")
            .eq("category", category)
            .execute()
            .data
            or []
        )
    except Exception:
        public_rows = []

    for row in public_rows:
        extra_data = row.get("extra_data") or {}
        existing_title = extra_data.get("title") or extra_data.get("name") or ""
        if _normalize_title(str(existing_title)) == normalized:
            return {"table": "opportunities", "record": row}

    try:
        submitted_rows = (
            db.table("submitted_opportunities")
            .select("id,name,category,status,extra_data")
            .eq("category", category)
            .execute()
            .data
            or []
        )
    except Exception:
        submitted_rows = []

    for row in submitted_rows:
        existing_title = row.get("name") or (row.get("extra_data") or {}).get("title") or ""
        if _normalize_title(str(existing_title)) == normalized:
            return {"table": "submitted_opportunities", "record": row}

    return None


def create_submission(name: str, category: str, attributes: Dict[str, Any]) -> Dict[str, Any]:
    category = category.lower().strip()
    name = name.strip()

    if category not in ALLOWED_CATEGORIES:
        raise ValueError("Invalid category")

    if not name:
        raise ValueError("Opportunity name is required")

    attributes = _clean_attributes(attributes)
    apply_link = str(attributes.get("apply_link", "")).strip()
    if not apply_link:
        raise ValueError("Apply link is required")
    if not apply_link.startswith(("http://", "https://")):
        raise ValueError("Apply link must start with http:// or https://")

    if find_duplicate(name, category):
        raise ValueError(
            "A similar opportunity already exists in the database or is already pending review."
        )

    # Keep the database format flexible: all optional attributes supplied by
    # the citizen are stored inside extra_data. Missing fields are not invented.
    extra_data = {
        **attributes,
        "title": name,
        "category": category,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "source_type": "user_submitted",
        "verification_status": "pending",
    }

    # `detail` is retained as an empty value for compatibility with an older
    # database column. The frontend no longer asks the citizen for a detail box.
    payload = {
        "name": name,
        "category": category,
        "detail": "",
        "extra_data": extra_data,
        "status": "pending",
        "verification_status": "pending",
        "source_type": "user_submitted",
    }

    result = get_db().table("submitted_opportunities").insert(payload).execute()
    return (result.data or [{}])[0]


def list_pending_submissions() -> list[Dict[str, Any]]:
    result = (
        get_db()
        .table("submitted_opportunities")
        .select("*")
        .eq("status", "pending")
        .order("id", desc=True)
        .execute()
    )
    return result.data or []


def review_submission(
    submission_id: int,
    action: str,
    edited_data: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    action = action.lower().strip()
    if action not in {"approve", "reject"}:
        raise ValueError("Action must be approve or reject")

    db = get_db()
    current = (
        db.table("submitted_opportunities")
        .select("*")
        .eq("id", submission_id)
        .single()
        .execute()
        .data
    )

    if not current:
        raise ValueError("Submission not found")

    if action == "reject":
        result = (
            db.table("submitted_opportunities")
            .update(
                {
                    "status": "rejected",
                    "verification_status": "rejected",
                }
            )
            .eq("id", submission_id)
            .execute()
            .data
        )
        return result[0]

    record = dict(current)
    if edited_data:
        for key in ("name", "category", "detail", "extra_data"):
            if key in edited_data:
                record[key] = edited_data[key]

    title = str(record.get("name") or (record.get("extra_data") or {}).get("title") or "").strip()
    category = str(record.get("category") or "").lower().strip()
    extra_data = _clean_attributes(dict(record.get("extra_data") or {}))

    if not title:
        raise ValueError("Opportunity name is required")
    if category not in ALLOWED_CATEGORIES:
        raise ValueError("Invalid category")
    if not extra_data.get("apply_link"):
        raise ValueError("Apply link is required before approval")

    extra_data["title"] = title
    extra_data["category"] = category
    extra_data["verification_status"] = "verified"

    duplicate = find_duplicate(title, category)
    if duplicate and duplicate["table"] == "opportunities":
        raise ValueError("This opportunity already exists in the public database.")

    inserted = db.table("opportunities").insert(
        {
            "category": category,
            "extra_data": extra_data,
        }
    ).execute().data

    if not inserted:
        raise ValueError("Could not publish approved opportunity")

    # Index only after approval/publication. If embedding fails, keep the public
    # DB row intact; the scheduler's reconciliation job can retry it later.
    try:
        index_new_opportunities(inserted)
    except Exception:
        pass

    db.table("submitted_opportunities").update(
        {
            "status": "approved",
            "verification_status": "verified",
        }
    ).eq("id", submission_id).execute()

    return inserted[0]
