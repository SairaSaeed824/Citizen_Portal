import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.database import get_db

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def _require_secret_key() -> str:
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY is not configured on the server.",
        )
    return SECRET_KEY


def _verify_password(password: str, stored_password: str) -> bool:
    """Support existing plaintext admin rows once, then upgrade them to bcrypt."""
    if not stored_password:
        return False

    if stored_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            return pwd_context.verify(password, stored_password)
        except (ValueError, TypeError):
            return False

    return password == stored_password


def authenticate_admin(username: str, password: str) -> dict:
    db = get_db()
    admin = (
        db.table("admins")
        .select("username,password")
        .eq("username", username.strip())
        .maybe_single()
        .execute()
        .data
    )

    if not admin or not _verify_password(password, str(admin.get("password", ""))):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # Upgrade an old plaintext password to bcrypt after the first successful login.
    stored_password = str(admin.get("password", ""))
    if not stored_password.startswith(("$2a$", "$2b$", "$2y$")):
        db.table("admins").update({"password": pwd_context.hash(password)}).eq(
            "username", username.strip()
        ).execute()

    return {"username": username.strip()}


def create_access_token(username: str) -> str:
    secret = _require_secret_key()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "role": "admin", "exp": expires_at}
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        secret = _require_secret_key()
        payload = jwt.decode(credentials.credentials, secret, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if not username or role != "admin":
            raise JWTError("Invalid admin claims")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"username": username, "role": role}
