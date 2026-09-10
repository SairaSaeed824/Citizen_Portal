from typing import Any, List
from pydantic import BaseModel


class OpportunityResponse(BaseModel):
    success: bool
    category: str
    count: int
    total: int = 0
    page: int = 1
    limit: int = 50
    has_next: bool = False
    data: List[Any]
