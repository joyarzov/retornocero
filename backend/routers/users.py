from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
import models
from auth_utils import get_current_admin, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    username: str
    full_name: str
    password: str
    is_admin: bool = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    return db.query(models.User).all()


@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = models.User(
        username=user.username,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        is_admin=user.is_admin,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.full_name is not None:
        db_user.full_name = user.full_name
    if user.password is not None:
        db_user.hashed_password = get_password_hash(user.password)
    if user.is_admin is not None:
        db_user.is_admin = user.is_admin
    if user.is_active is not None:
        db_user.is_active = user.is_active
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.username == "joyarzo":
        raise HTTPException(status_code=400, detail="Cannot delete main admin")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}
