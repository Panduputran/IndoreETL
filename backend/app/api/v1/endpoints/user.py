from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.user import AppUser
from app.schema.user import UserCreate, UserLogin, UserResponse, UserUpdate
from app.schema.token import Token
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter()


@router.post("/login", response_model=Token, summary="User Login & Get JWT Access Token")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Autentikasi user dengan username dan password.
    Mengembalikan JWT access token jika kredensial valid.
    """
    user = db.query(AppUser).filter(
        func.lower(AppUser.username) == payload.username.lower().strip()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun pengguna dinonaktifkan. Hubungi administrator.",
        )

    # Update timestamp last login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }


@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User Profile")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Mengambil data profil pengguna yang sedang login berdasarkan JWT token.
    """
    user = db.query(AppUser).filter(AppUser.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan.")
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register New User")
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(lambda: None)  # Optional check
):
    """
    Mendaftarkan pengguna baru.
    Jika belum ada user sama sekali di database, user pertama otomatis menjadi admin.
    """
    # Cek username duplikat
    existing_username = db.query(AppUser).filter(
        func.lower(AppUser.username) == payload.username.lower().strip()
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' sudah digunakan.",
        )

    # Cek email duplikat
    existing_email = db.query(AppUser).filter(
        func.lower(AppUser.email) == payload.email.lower().strip()
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' sudah terdaftar.",
        )

    # Cek total user di database
    total_users = db.query(AppUser).count()
    assigned_role = "admin" if total_users == 0 else payload.role

    new_user = AppUser(
        username=payload.username.strip(),
        email=payload.email.strip().lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=assigned_role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/list", response_model=List[UserResponse], summary="List All Registered Users (Admin / Operator)")
def list_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengambil daftar seluruh pengguna terdaftar di sistem.
    """
    users = db.query(AppUser).order_by(AppUser.id.asc()).all()
    return users
