from typing import Any, Dict, List
from app.core.database import get_db

def get_opportunities(category: str = "all"):
    """
    Fetch opportunities from Supabase.

    category:
        all
        job
        scholarship
        loan
        training
        internship
    """

    db = get_db()

    query = (
        db.table("opportunities")
        .select("*")
    )

    # Only filter when a specific category is requested
    if category and category.lower() != "all":
        query = query.eq(
            "category",
            category.lower().strip()
        )

    response = query.execute()

    return response.data or []
def get_opportunity_by_id(opportunity_id: int) -> Dict[str, Any] | None:
    """Fetches a single opportunity by its id. Returns None if not found."""
    db = get_db()
    result = db.table("opportunities").select("*").eq("id", opportunity_id).execute()
    if not result.data:
        return None
    return result.data[0]
def search_opportunities(query: str, category: str = "all") -> List[Dict[str, Any]]:
    """Searches search_text (a stored text copy of extra_data) for the given keyword."""
    db = get_db()
    db_query = db.table("opportunities").select("*")

    if category != "all":
        db_query = db_query.eq("category", category)

    db_query = db_query.filter("search_text", "ilike", f"%{query}%")

    result = db_query.execute()
    return result.data