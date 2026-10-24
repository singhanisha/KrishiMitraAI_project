""" from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth.models import User
from auth.schemas import SignupRequest, LoginRequest, AuthResponse
from auth.security import hash_password, verify_password, create_access_token
import jwt
from fastapi import Header
from auth.security import JWT_SECRET_KEY, JWT_ALGORITHM


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# --------------------------------------------------
# Register
# --------------------------------------------------

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: SignupRequest,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Check if phone already exists
    existing_phone = (
        db.query(User)
        .filter(User.phone == user_data.phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this mobile number already exists."
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create user
    new_user = User(
        full_name=user_data.full_name.strip(),
        email=str(user_data.email).lower(),
        phone=user_data.phone,
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create JWT token
    access_token = create_access_token(new_user.id)

    return AuthResponse(
        message="Account created successfully.",
        access_token=access_token,
        token_type="bearer",
        full_name=new_user.full_name,
    )


# --------------------------------------------------
# Login
# --------------------------------------------------

@router.post(
    "/login",
    response_model=AuthResponse
)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == str(login_data.email).lower())
        .first()
    )

    # Do not reveal whether email exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    password_correct = verify_password(
        login_data.password,
        user.password_hash
    )

    if not password_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate JWT token
    access_token = create_access_token(user.id)

    return AuthResponse(
        message="Login successful.",
        access_token=access_token,
        token_type="bearer",
        full_name=user.full_name,
    )

@router.get("/me")
def get_me(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated."
        )
 
    token = authorization.split(" ", 1)[1]
 
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )
 
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
 
    return {"full_name": user.full_name, "email": user.email}
  """


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth.models import User, PasswordResetToken
from auth.schemas import (
    SignupRequest, LoginRequest, AuthResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from auth.security import hash_password, verify_password, create_access_token
import jwt
import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from fastapi import Header, BackgroundTasks
from auth.email_service import send_password_reset_email
from auth.security import JWT_SECRET_KEY, JWT_ALGORITHM


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# --------------------------------------------------
# Register
# --------------------------------------------------

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: SignupRequest,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Check if phone already exists
    existing_phone = (
        db.query(User)
        .filter(User.phone == user_data.phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this mobile number already exists."
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create user
    new_user = User(
        full_name=user_data.full_name.strip(),
        email=str(user_data.email).lower(),
        phone=user_data.phone,
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create JWT token
    access_token = create_access_token(new_user.id)

    return AuthResponse(
        message="Account created successfully.",
        access_token=access_token,
        token_type="bearer",
        full_name=new_user.full_name,
    )


# --------------------------------------------------
# Login
# --------------------------------------------------

@router.post(
    "/login",
    response_model=AuthResponse
)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == str(login_data.email).lower())
        .first()
    )

    # Do not reveal whether email exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    password_correct = verify_password(
        login_data.password,
        user.password_hash
    )

    if not password_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate JWT token
    access_token = create_access_token(user.id)

    return AuthResponse(
        message="Login successful.",
        access_token=access_token,
        token_type="bearer",
        full_name=user.full_name,
    )

@router.get("/me")
def get_me(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated."
        )
 
    token = authorization.split(" ", 1)[1]
 
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )
 
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
 
    return {"full_name": user.full_name, "email": user.email}


# --------------------------------------------------
# Forgot / Reset password
# --------------------------------------------------

RESET_TOKEN_EXPIRE_MINUTES = 15


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _send_reset_mail_safe(email: str, name: str, link: str):
    try:
        send_password_reset_email(email, name, link)
    except Exception as exc:
        # Mail fail ho to bhi user ko response same jayega (security)
        print("Reset email failed:", exc)


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    generic = {
        "message": "If an account exists with this email, a reset link has been sent."
    }

    user = (
        db.query(User)
        .filter(User.email == str(data.email).lower())
        .first()
    )

    # Email exist karta hai ya nahi - ye reveal nahi karna
    if not user:
        return generic

    # Purane unused tokens invalidate
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False  # noqa: E712
    ).update({"used": True})

    raw_token = secrets.token_urlsafe(32)

    db.add(PasswordResetToken(
        user_id=user.id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    ))
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={raw_token}"

    background_tasks.add_task(
        _send_reset_mail_safe, user.email, user.full_name, reset_link
    )

    return generic


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == _hash_token(data.token))
        .first()
    )

    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Reset link is invalid or has expired."
    )

    if not record or record.used:
        raise invalid

    expires_at = record.expires_at
    if expires_at.tzinfo is None:  # SQLite naive datetime return karta hai
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise invalid

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise invalid

    user.password_hash = hash_password(data.new_password)
    record.used = True
    db.commit()

    return {"message": "Password reset successful. Please log in."}
