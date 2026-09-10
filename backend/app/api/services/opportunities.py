from typing import Any, Dict, List
from datetime import date, timedelta
from app.core.database import get_db


def _value(item: Dict[str, Any], *keys: str) -> str:
    extra = item.get("extra_data") or {}
    for key in keys:
        value = item.get(key) or extra.get(key)
        if value not in (None, ""):
            return str(value).strip()
    return ""


def _closing_date(item: Dict[str, Any]) -> str:
    return _value(item, "closing_date", "deadline", "last_date")


def get_opportunities(category="all", province="all", location="", organization="", deadline="all", sort_by="default", keyword=""):
    db = get_db()
    query = db.table("opportunities").select("*")
    if category and category.lower() != "all":
        query = query.eq("category", category.lower().strip())
    data = query.execute().data or []

    if province and province.lower() != "all":
        target = province.lower().strip()
        data = [item for item in data if target in _value(item, "province", "location").lower() or "all pakistan" in _value(item, "province", "location").lower()]
    if location.strip():
        target = location.lower().strip()
        data = [item for item in data if target in _value(item, "location", "city", "district").lower()]
    if organization.strip():
        target = organization.lower().strip()
        data = [item for item in data if target in _value(item, "organization", "company", "department", "ministry", "source").lower()]

    if keyword.strip():
        target = " ".join(keyword.lower().strip().split())
        data = [item for item in data if target in " ".join(_value(item, "title", "name", "job_title").lower().split())]

    if deadline != "all":
        today = date.today()
        parsed = []
        for item in data:
            raw = _closing_date(item)
            try: parsed.append((item, date.fromisoformat(raw[:10])))
            except (TypeError, ValueError): pass
        if deadline == "today": data = [item for item, d in parsed if d == today]
        elif deadline == "7_days": data = [item for item, d in parsed if today <= d <= today + timedelta(days=7)]
        elif deadline == "30_days": data = [item for item, d in parsed if today <= d <= today + timedelta(days=30)]

    if sort_by == "title": data.sort(key=lambda x: _value(x, "title", "name", "job_title").lower())
    elif sort_by == "closing_soon": data.sort(key=lambda x: _closing_date(x)[:10] or "9999-12-31")
    elif sort_by == "newest": data.sort(key=lambda x: _value(x, "created_at", "posted_date", "scraped_at"), reverse=True)
    return data


def get_opportunity_by_id(opportunity_id: int) -> Dict[str, Any] | None:
    db = get_db()
    result = db.table("opportunities").select("*").eq("id", opportunity_id).execute()
    return result.data[0] if result.data else None


def search_opportunities(query: str, category="all", province="all", location="", organization="", deadline="all", sort_by="default") -> List[Dict[str, Any]]:
    """Search title/name and then apply the same advanced directory filters."""
    data = get_opportunities(category, province, location, organization, deadline, sort_by)
    target = query.strip().lower()
    return [item for item in data if target in _value(item, "title", "name", "job_title").lower()]
