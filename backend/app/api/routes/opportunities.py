from fastapi import APIRouter, Query, HTTPException
from app.api.services.opportunities import get_opportunities, get_opportunity_by_id, search_opportunities
from app.models.opportunity import OpportunityResponse

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])

ALLOWED_CATEGORIES = {"all", "job", "scholarship", "loan", "training", "internship", "project"}
ALLOWED_DEADLINES = {"all", "today", "7_days", "30_days"}
ALLOWED_SORTS = {"default", "title", "closing_soon", "newest"}


def validate_filters(category: str, deadline: str, sort_by: str):
    category = category.lower().strip()
    deadline = deadline.lower().strip()
    sort_by = sort_by.lower().strip()
    if category not in ALLOWED_CATEGORIES: raise HTTPException(400, "Invalid category")
    if deadline not in ALLOWED_DEADLINES: raise HTTPException(400, "Invalid deadline filter")
    if sort_by not in ALLOWED_SORTS: raise HTTPException(400, "Invalid sort option")
    return category, deadline, sort_by


@router.get("", response_model=OpportunityResponse)
def fetch_opportunities(
    category: str = Query("all"), province: str = Query("all"), location: str = Query(""),
    organization: str = Query(""), deadline: str = Query("all"), sort_by: str = Query("default")
):
    category, deadline, sort_by = validate_filters(category, deadline, sort_by)
    data = get_opportunities(category, province, location, organization, deadline, sort_by)
    return OpportunityResponse(success=True, category=category, count=len(data), data=data)


@router.get("/search")
def search_opportunities_route(
    q: str = Query(..., min_length=1, description="Search opportunity title"),
    category: str = Query("all"), province: str = Query("all"), location: str = Query(""),
    organization: str = Query(""), deadline: str = Query("all"), sort_by: str = Query("default")
):
    category, deadline, sort_by = validate_filters(category, deadline, sort_by)
    results = search_opportunities(q, category, province, location, organization, deadline, sort_by)
    return {"success": True, "query": q, "category": category, "count": len(results), "data": results}


@router.get("/{opportunity_id}")
def fetch_opportunity(opportunity_id: int):
    opportunity = get_opportunity_by_id(opportunity_id)
    if opportunity is None: raise HTTPException(404, f"Opportunity with id {opportunity_id} not found")
    return {"success": True, "data": opportunity}
