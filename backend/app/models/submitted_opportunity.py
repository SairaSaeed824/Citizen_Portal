from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class OpportunitySubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=300)
    category: str
    detail: str = Field(..., min_length=10)


class SubmissionReview(BaseModel):
    admin_username: str
    admin_password: str
    action: str
    edited_data: Optional[Dict[str, Any]] = None
