import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.database import get_db

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
bearer_scheme = HTTPBearer(auto_error=False)


def _require_secret_key() -> str:
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY is not configured on the server.",
        )
    return SECRET_KEY


def _is_bcrypt_hash(value: str) -> bool:
    return value.startswith(("$2a$", "$2b$", "$2y$"))


def _verify_password(password: str, stored_password: str) -> bool:
    """Verify bcrypt passwords or support an existing plaintext admin row once."""
    if not stored_password:
        return False

    if _is_bcrypt_hash(stored_password):
        try:
            return bcrypt.checkpw(
                password.encode("utf-8"),
                stored_password.encode("utf-8"),
            )
        except (ValueError, TypeError):
            return False

    return password == stored_password


def _hash_password(password: str) -> str:
    """Create a bcrypt hash without passlib."""
    try:
        return bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin password must be 72 bytes or fewer.",
        ) from exc


def authenticate_admin(username: str, password: str) -> dict:
    username = username.strip()
    db = get_db()
    admin = (
        db.table("admins")
        .select("username,password")
        .eq("username", username)
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
    if not _is_bcrypt_hash(stored_password):
        db.table("admins").update({"password": _hash_password(password)}).eq(
            "username", username
        ).execute()

    return {"username": username}


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
