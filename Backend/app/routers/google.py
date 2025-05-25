from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import httpx
from urllib.parse import urlencode
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth/google", tags=["google"])

ALGORITHM = "HS256"

class GoogleCode(BaseModel):
    code: str

@router.get("/login")
def google_login():
    # 환경 변수 검증
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET_KEY]):
        raise ValueError("필수 환경 변수가 설정되지 않았습니다. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET_KEY를 확인하세요.")

    print(f"구글 로그인 URL 생성 - CLIENT_ID: {GOOGLE_CLIENT_ID}, REDIRECT_URI: {GOOGLE_REDIRECT_URI}")
    query = urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile"
    })
    return {"redirect_url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}

@router.post("/callback")
async def google_callback(payload: GoogleCode):
    # 환경 변수 검증
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET_KEY]):
        raise ValueError("필수 환경 변수가 설정되지 않았습니다. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET_KEY를 확인하세요.")

    code = payload.code

    async with httpx.AsyncClient() as client:
        # 토큰 요청
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )
        tokens = token_res.json()
        access_token = tokens.get("access_token")

        # 사용자 정보 요청
        user_info = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        profile = user_info.json()
        email = profile.get("email")

        if not email:
            raise HTTPException(status_code=400, detail="이메일 정보를 가져올 수 없습니다.")

        # JWT 토큰 생성
        token = jwt.encode(
            {
                "sub": email,
                "exp": datetime.utcnow() + timedelta(days=1)
            },
            JWT_SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "access_token": token,
            "user": {
                "email": email,
                "name": profile.get("name"),
            }
        }