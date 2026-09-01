from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$", description="Format email yang valid")
    full_name: str = Field(..., min_length=2, max_length=150)
    role: str = Field("operator", pattern="^(admin|operator|viewer)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = Field(None, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    role: Optional[str] = Field(None, pattern="^(admin|operator|viewer)$")
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True
