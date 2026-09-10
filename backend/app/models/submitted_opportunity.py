from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class OpportunitySubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=300)
    category: str
    organization: Optional[str] = None
    location: Optional[str] = None
    province: Optional[str] = None
    eligibility: Optional[str] = None
    education: Optional[str] = None
    age_limit: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[str] = None
    amount: Optional[str] = None
    deadline: Optional[str] = None
    required_documents: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    contact: Optional[str] = None
    description: Optional[str] = None
    apply_link: str = Field(..., min_length=1)

    @field_validator("apply_link")
    @classmethod
    def validate_apply_link(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Apply link is required")
        if not value.startswith(("http://", "https://")):
            raise ValueError("Apply link must start with http:// or https://")
        return value


class SubmissionReview(BaseModel):
    admin_username: str
    admin_password: str
    action: str
    edited_data: Optional[Dict[str, Any]] = None
