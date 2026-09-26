from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth.models import User
from auth.schemas import SignupRequest, LoginRequest, AuthResponse
from auth.security import hash_password, verify_password, create_access_token


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
        token_type="bearer"
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
        token_type="bearer"
    )