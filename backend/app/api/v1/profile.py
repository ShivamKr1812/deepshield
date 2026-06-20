from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.log import Log
from app.schemas.user import UserResponse, UserUpdate, ChangePassword
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Get current active user profile information.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_in: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update profile details (name/email).
    """
    if user_in.email and user_in.email != current_user.email:
        # Check if email is already taken
        exists = db.query(User).filter(User.email == user_in.email).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered by another account."
            )
        current_user.email = user_in.email

    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    # Log action
    client_host = request.client.host if request.client else "unknown"
    audit_log = Log(
        user_id=current_user.id,
        action="update_profile",
        ip_address=client_host,
        details={"updated_fields": user_in.model_dump(exclude_unset=True)}
    )
    db.add(audit_log)
    db.commit()

    return current_user

@router.post("/change-password")
def change_password(
    password_in: ChangePassword,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Change user account password.
    """
    if not verify_password(password_in.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect existing password"
        )
        
    current_user.hashed_password = get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()

    # Log action
    client_host = request.client.host if request.client else "unknown"
    audit_log = Log(
        user_id=current_user.id,
        action="change_password",
        ip_address=client_host,
        details={}
    )
    db.add(audit_log)
    db.commit()

    return {"message": "Password changed successfully."}
