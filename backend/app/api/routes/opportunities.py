from fastapi import APIRouter, Query, HTTPException

from app.api.services.opportunities import (
    get_opportunities,
    get_opportunity_by_id,
    search_opportunities,
)
from app.models.opportunity import OpportunityResponse

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])


@router.get("", response_model=OpportunityResponse)
def fetch_opportunities(
    category: str = Query("all"),
    province: str = Query("all"),
    location: str = Query(""),
    organization: str = Query(""),
    deadline: str = Query("all"),
    sort_by: str = Query("default"),
):
    allowed_categories = {"all", "job", "scholarship", "loan", "training", "internship", "project"}
    allowed_deadlines = {"all", "today", "7_days", "30_days"}
    allowed_sorts = {"default", "title", "closing_soon", "newest"}

    category = category.lower().strip()
    deadline = deadline.lower().strip()
    sort_by = sort_by.lower().strip()

    if category not in allowed_categories:
        raise HTTPException(status_code=400, detail="Invalid category")
    if deadline not in allowed_deadlines:
        raise HTTPException(status_code=400, detail="Invalid deadline filter")
    if sort_by not in allowed_sorts:
        raise HTTPException(status_code=400, detail="Invalid sort option")

    data = get_opportunities(
        category=category,
        province=province,
        location=location,
        organization=organization,
        deadline=deadline,
        sort_by=sort_by,
    )

    return OpportunityResponse(success=True, category=category, count=len(data), data=data)


@router.get("/search")
def search_opportunities_route(
    q: str = Query(..., min_length=1, description="Search opportunity title"),
    category: str = Query("all"),
):
    results = search_opportunities(q, category)
    return {"success": True, "query": q, "category": category, "count": len(results), "data": results}


@router.get("/{opportunity_id}")
def fetch_opportunity(opportunity_id: int):
    opportunity = get_opportunity_by_id(opportunity_id)
    if opportunity is None:
        raise HTTPException(status_code=404, detail=f"Opportunity with id {opportunity_id} not found")
    return {"success": True, "data": opportunity}
