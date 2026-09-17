from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.admin_auth import authenticate_admin, create_access_token

router = APIRouter(prefix="/api/admin", tags=["Admin Authentication"])


class AdminLogin(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


@router.post("/login")
def admin_login(payload: AdminLogin):
    admin = authenticate_admin(payload.username, payload.password)
    token = create_access_token(admin["username"])
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 3600,
        "admin": {"username": admin["username"], "role": "admin"},
    }
