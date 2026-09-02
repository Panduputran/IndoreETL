from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.models.base import Base

class AppUser(Base):
    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth SSO users
    full_name = Column(String(150), nullable=False)
    role = Column(String(20), nullable=False, default="operator")  # "admin" | "operator" | "viewer"
    auth_provider = Column(String(50), nullable=False, default="local")  # "local" | "google" | "microsoft"
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<AppUser(id={self.id}, username='{self.username}', role='{self.role}', provider='{self.auth_provider}')>"
