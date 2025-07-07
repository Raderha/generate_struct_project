from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.users import User
import uuid
from app.core.security import pwd_context
from app.core.db import SessionLocal
from sqlalchemy.exc import NoResultFound
from app.core.security import verify_password
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Pydantic 모델
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail = "이미 등록된 이메일입니다.")

    hashed_pw = pwd_context.hash(req.password)
    user = User(id=str(uuid.uuid4()), email=req.email, password=hashed_pw)
    db.add(user)
    db.commit()
    return {"message":"회원가입 성공"}

# DB 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(req: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == req.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ JWT 토큰 생성
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    token = jwt.encode({"sub": user.email}, JWT_SECRET_KEY, algorithm=ALGORITHM)

    return {
    "access_token": token, 
    "user": {
        "email": user.email
    }
}



ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token (no subject)")

        db = SessionLocal()
        user = db.query(User).filter(User.email == email).first()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme), user: User = Depends(get_current_user)):
    return {
    "access_token": token,
    "user": {"email": user.email}
}
