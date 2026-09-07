from typing import Any, List
from pydantic import BaseModel


class OpportunityResponse(BaseModel):
    success: bool
    category: str
    count: int
    data: List[Any]