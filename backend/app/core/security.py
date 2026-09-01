import os
import hmac
import hashlib
import json
import base64
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

load_dotenv()

# Coba import bcrypt jika terpasang
try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

# Coba import jose jika terpasang
try:
    from jose import jwt as jose_jwt, JWTError
    HAS_JOSE = True
except ImportError:
    HAS_JOSE = False

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "indore-treaty-ru-secret-key-super-secure-2025")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ====================================================================
# PASSWORD HASHING (Universal PBKDF2-HMAC-SHA256 & Bcrypt Support)
# ====================================================================

def pbkdf2_hash(password: str, salt: Optional[str] = None) -> str:
    """Hash password menggunakan SHA256 PBKDF2 bawaan Python standard library (100% portable)"""
    if salt is None:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"pbkdf2_sha256${salt}${key.hex()}"


def pbkdf2_verify(password: str, hashed: str) -> bool:
    """Verifikasi password dengan format pbkdf2_sha256"""
    try:
        parts = hashed.split('$')
        if len(parts) != 3 or parts[0] != 'pbkdf2_sha256':
            return False
        salt = parts[1]
        expected_hash = pbkdf2_hash(password, salt)
        return hmac.compare_digest(expected_hash, hashed)
    except Exception:
        return False


def hash_password(password: str) -> str:
    """Meng-hash password mentah secara aman menggunakan PBKDF2 portable"""
    return pbkdf2_hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Memverifikasi kecocokan password mentah dengan hash (mendukung PBKDF2 dan Bcrypt)"""
    if not hashed_password or not plain_password:
        return False
    
    if hashed_password.startswith("pbkdf2_sha256$"):
        return pbkdf2_verify(plain_password, hashed_password)
    
    if HAS_BCRYPT:
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                hashed_password.encode("utf-8")
            )
        except Exception:
            pass
            
    return False


# ====================================================================
# JWT TOKEN GENERATION & DECODING (Universal Base64URL-HMAC & Jose)
# ====================================================================

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data + padding)

def _native_jwt_encode(payload: dict, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _base64url_encode(json.dumps(payload, default=str, separators=(',', ':')).encode('utf-8'))
    message = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def _native_jwt_decode(token: str, secret: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        message = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).digest()
        actual_sig = _base64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        # Check expiration
        exp = payload.get("exp")
        if exp:
            if isinstance(exp, (int, float)):
                exp_dt = datetime.fromtimestamp(exp, tz=timezone.utc)
            else:
                exp_dt = datetime.fromisoformat(str(exp).replace('Z', '+00:00'))
            if datetime.now(timezone.utc) > exp_dt:
                return None
        return payload
    except Exception:
        return None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Membuat JWT token dengan klaim dan masa kedaluwarsa"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})
    return _native_jwt_encode(to_encode, JWT_SECRET_KEY)


def decode_access_token(token: str) -> Optional[dict]:
    """Mendekode dan memvalidasi JWT token"""
    return _native_jwt_decode(token, JWT_SECRET_KEY)


def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    """FastAPI dependency untuk validasi user dari JWT token"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Token tidak ditemukan.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau telah kedaluwarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Klaim token tidak valid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "user_id": payload.get("user_id"),
        "username": username,
        "email": payload.get("email"),
        "full_name": payload.get("full_name"),
        "role": payload.get("role", "operator"),
    }
