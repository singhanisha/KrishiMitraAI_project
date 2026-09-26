from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


# --------------------------------------------------
# Password hashing
# --------------------------------------------------

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using Argon2.
    """
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plain-text password against its Argon2 hash.
    """
    try:
        return password_hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


# --------------------------------------------------
# JWT configuration
# --------------------------------------------------

JWT_SECRET_KEY = "krishimitra-change-this-secret-key"

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(user_id: int) -> str:
    """
    Create a JWT access token for the authenticated user.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

    return token