from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)

    email: EmailStr

    phone: str = Field(..., min_length=10, max_length=10)

    password: str = Field(..., min_length=6, max_length=128)

    confirm_password: str

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, value):
        email = str(value).lower()

        if not email.endswith("@gmail.com"):
            raise ValueError("Only Gmail addresses are allowed")

        return email

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if not value.isdigit():
            raise ValueError("Mobile number must contain only digits")

        if len(value) != 10:
            raise ValueError("Mobile number must contain exactly 10 digits")

        if value[0] not in "6789":
            raise ValueError("Mobile number must start with 6, 7, 8, or 9")

        return value

    @field_validator("confirm_password")
    @classmethod
    def validate_password_match(cls, value, info):
        password = info.data.get("password")

        if password is not None and value != password:
            raise ValueError("Passwords do not match")

        return value


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(..., min_length=1)


class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"