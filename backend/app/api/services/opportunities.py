from typing import Any, Dict, List
from app.core.database import get_db


def get_opportunities(
    category: str = "all",
    province: str = "all",
    location: str = "",
    organization: str = "",
    deadline: str = "all",
    sort_by: str = "default",
):
    """Fetch opportunities with flexible server-side filters."""
    db = get_db()
    query = db.table("opportunities").select("*")

    if category and category.lower() != "all":
        query = query.eq("category", category.lower().strip())

    if province and province.lower() != "all":
        query = query.ilike("province", f"%{province.strip()}%")

    if location and location.strip():
        query = query.ilike("location", f"%{location.strip()}%")

    if organization and organization.strip():
        query = query.ilike("organization", f"%{organization.strip()}%")

    response = query.execute()
    data = response.data or []

    # Deadline filtering is done in Python because scraped records may store
    # deadline/closing_date in different places inside extra_data.
    if deadline and deadline != "all":
        from datetime import date, timedelta
        today = date.today()

        def closing_date(item):
            extra = item.get("extra_data") or {}
            return item.get("closing_date") or extra.get("closing_date") or extra.get("deadline") or extra.get("last_date")

        parsed = []
        for item in data:
            raw = closing_date(item)
            try:
                parsed.append((item, date.fromisoformat(str(raw)[:10])))
            except (TypeError, ValueError):
                continue

        if deadline == "today":
            data = [item for item, d in parsed if d == today]
        elif deadline == "7_days":
            end = today + timedelta(days=7)
            data = [item for item, d in parsed if today <= d <= end]
        elif deadline == "30_days":
            end = today + timedelta(days=30)
            data = [item for item, d in parsed if today <= d <= end]

    if sort_by == "title":
        data.sort(key=lambda x: str(x.get("title") or "").lower())
    elif sort_by == "closing_soon":
        from datetime import date
        data.sort(key=lambda x: str(
            x.get("closing_date") or (x.get("extra_data") or {}).get("closing_date") or "9999-12-31"
        )[:10])
    elif sort_by == "newest":
        data.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)

    return data


def get_opportunity_by_id(opportunity_id: int) -> Dict[str, Any] | None:
    db = get_db()
    result = db.table("opportunities").select("*").eq("id", opportunity_id).execute()
    if not result.data:
        return None
    return result.data[0]


def search_opportunities(query: str, category: str = "all") -> List[Dict[str, Any]]:
    """Search opportunity titles first; this is the public directory search."""
    db = get_db()
    db_query = db.table("opportunities").select("*")

    if category and category != "all":
        db_query = db_query.eq("category", category.lower().strip())

    # User-facing search is intentionally title-focused rather than matching
    # arbitrary scraped text, which produces noisy results.
    db_query = db_query.ilike("title", f"%{query.strip()}%")
    result = db_query.execute()
    return result.data or []
