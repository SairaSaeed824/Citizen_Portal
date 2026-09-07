from fastapi import APIRouter, Query, HTTPException

from app.api.services.opportunities import get_opportunities
from app.models.opportunity import OpportunityResponse
from app.api.services.opportunities import get_opportunities, get_opportunity_by_id, search_opportunities

router = APIRouter(
    prefix="/api/opportunities",
    tags=["Opportunities"]
)


@router.get("", response_model=OpportunityResponse)
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
        "internship",
        "project"
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

    return OpportunityResponse(
        success=True,
        category=category,
        count=len(data),
        data=data
    )

@router.get("/search")
def search_opportunities_route(
    q: str = Query(..., min_length=1, description="Search keyword"),
    category: str = Query("all")
):
    results = search_opportunities(q, category)

    return {
        "success": True,
        "query": q,
        "category": category,
        "count": len(results),
        "data": results
    }
@router.get("/{opportunity_id}")
def fetch_opportunity(opportunity_id: int):
    opportunity = get_opportunity_by_id(opportunity_id)

    if opportunity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Opportunity with id {opportunity_id} not found"
        )

    return {
        "success": True,
        "data": opportunity
    }
