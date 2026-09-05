from fastapi import APIRouter, Query, HTTPException

from app.api.services.opportunities import get_opportunities


router = APIRouter(
    prefix="/api/opportunities",
    tags=["Opportunities"]
)


@router.get("")
def fetch_opportunities(
    category: str = Query(
        "all",
        description="Opportunity category"
    )
):
    allowed_categories = {
        "all",
        "job",
        "scholarship",
        "loan",
        "training",
        "internship"
    }

    category = category.lower().strip()

    if category not in allowed_categories:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid category. Allowed categories: "
                + ", ".join(sorted(allowed_categories))
            )
        )

    data = get_opportunities(category)

    return {
        "success": True,
        "category": category,
        "count": len(data),
        "data": data
    }