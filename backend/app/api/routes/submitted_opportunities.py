from fastapi import APIRouter, Depends, HTTPException

from app.models.submitted_opportunity import OpportunitySubmission, SubmissionReview
from app.api.services.submissions import create_submission, list_pending_submissions, review_submission
from app.core.admin_auth import get_current_admin

router = APIRouter(prefix="/api/submitted-opportunities", tags=["Submitted Opportunities"])


@router.post("")
def submit_opportunity(payload: OpportunitySubmission):
    try:
        data = payload.model_dump()
        name = data.pop("name")
        category = data.pop("category")
        return {"success": True, "data": create_submission(name, category, data)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not save submission: {exc}")


@router.get("/pending")
def pending_opportunities(_: dict = Depends(get_current_admin)):
    try:
        data = list_pending_submissions()
        return {"success": True, "count": len(data), "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load submissions: {exc}")


@router.patch("/{submission_id}/review")
def review_opportunity(
    submission_id: int,
    payload: SubmissionReview,
    _: dict = Depends(get_current_admin),
):
    try:
        data = review_submission(submission_id, payload.action, payload.edited_data)
        return {"success": True, "data": data}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not review submission: {exc}")
