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