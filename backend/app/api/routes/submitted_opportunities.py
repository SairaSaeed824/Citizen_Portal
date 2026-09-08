from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.core.database import get_db
from app.models.submitted_opportunity import OpportunitySubmission, SubmissionReview
from app.api.services.submissions import create_submission, list_pending_submissions, review_submission

router = APIRouter(prefix="/api/submitted-opportunities", tags=["Submitted Opportunities"])


@router.post("")
def submit_opportunity(payload: OpportunitySubmission):
    try:
        return {"success": True, "data": create_submission(payload.name, payload.category, payload.detail)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not save submission: {exc}")


@router.get("/pending")
def pending_opportunities():
    try:
        return {"success": True, "count": len(list_pending_submissions()), "data": list_pending_submissions()}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load submissions: {exc}")


@router.patch("/{submission_id}/review")
def review_opportunity(submission_id: int, payload: SubmissionReview):
    # Keep compatibility with the portal's current admin table while ensuring
    # review mutations happen server-side rather than directly from the browser.
    try:
        db = get_db()
        admin = db.table("admins").select("username,password").eq("username", payload.admin_username.strip()).maybe_single().execute().data
        if not admin or str(admin.get("password", "")).strip() != payload.admin_password.strip():
            raise HTTPException(status_code=401, detail="Invalid admin credentials")

        data = review_submission(submission_id, payload.action, payload.edited_data)
        return {"success": True, "data": data}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not review submission: {exc}")
