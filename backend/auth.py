import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt
from jose import JWTError, jwt
from pydantic import BaseModel

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# In-memory user store: email -> user dict
USERS_DB: dict[str, dict] = {}


def _seed_users():
    USERS_DB["provider@demo.com"] = {
        "email": "provider@demo.com",
        "name": "Dr. Smith",
        "hashed_password": _hash_password("password"),
        "role": "provider",
    }
    USERS_DB["patient@demo.com"] = {
        "email": "patient@demo.com",
        "name": "Jane Doe",
        "hashed_password": _hash_password("password"),
        "role": "patient",
    }


_seed_users()


class User(BaseModel):
    email: str
    name: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str  # "provider" or "patient"


def get_user(email: str) -> Optional[dict]:
    return USERS_DB.get(email)


def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = get_user(email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_access_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return User(email=user["email"], name=user["name"], role=user["role"])


def login_endpoint(body: LoginRequest) -> Token:
    user = authenticate_user(body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(user["email"])
    return Token(access_token=token, token_type="bearer", role=user["role"], name=user["name"])


def register_endpoint(body: RegisterRequest) -> Token:
    if body.role not in ("provider", "patient"):
        raise HTTPException(status_code=400, detail="Role must be 'provider' or 'patient'")
    if body.email in USERS_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    USERS_DB[body.email] = {
        "email": body.email,
        "name": body.name,
        "hashed_password": _hash_password(body.password),
        "role": body.role,
    }
    token = create_access_token(body.email)
    return Token(access_token=token, token_type="bearer", role=body.role, name=body.name)
