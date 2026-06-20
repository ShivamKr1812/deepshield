from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.models.user import User
from app.models.log import Log
from app.schemas.user import UserCreate, UserResponse, Token, ForgotPassword
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    """
    Register a new user in the platform.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Check if this is the first user; make them admin!
    role = "user"
    if db.query(User).count() == 0:
        role = "admin"

    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Log action
    client_host = request.client.host if request.client else "unknown"
    audit_log = Log(
        user_id=db_user.id,
        action="register",
        ip_address=client_host,
        details={"email": db_user.email, "role": db_user.role}
    )
    db.add(audit_log)
    db.commit()

    return db_user

@router.post("/login", response_model=Token)
def login(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, retrieve a JWT token on success.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    
    # Log action
    client_host = request.client.host if request.client else "unknown"
    audit_log = Log(
        user_id=user.id,
        action="login",
        ip_address=client_host,
        details={"email": user.email}
    )
    db.add(audit_log)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password")
def forgot_password(email_in: ForgotPassword, request: Request, db: Session = Depends(get_db)):
    """
    Password recovery endpoint. In a real environment, sends a recovery email.
    """
    user = db.query(User).filter(User.email == email_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist."
        )
    
    # Simulate email token generation
    client_host = request.client.host if request.client else "unknown"
    audit_log = Log(
        user_id=user.id,
        action="forgot_password_request",
        ip_address=client_host,
        details={"email": user.email}
    )
    db.add(audit_log)
    db.commit()

    return {"message": "If the email exists, a password reset link has been dispatched."}
