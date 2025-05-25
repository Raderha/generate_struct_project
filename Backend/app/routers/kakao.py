from fastapi import APIRouter, Request, HTTPException, Form
import os
import httpx
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth/kakao", tags=["kakao"])

ALGORITHM = "HS256"

@router.get("/login")
def kakao_login():
    # 환경 변수 검증
    KAKAO_CLIENT_ID = os.getenv("KAKAO_CLIENT_ID")
    KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if not all([KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, JWT_SECRET_KEY]):
        raise ValueError("필수 환경 변수가 설정되지 않았습니다. KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, JWT_SECRET_KEY를 확인하세요.")

    print(f"카카오 로그인 URL 생성 - CLIENT_ID: {KAKAO_CLIENT_ID}, REDIRECT_URI: {KAKAO_REDIRECT_URI}")
    kakao_auth_url = (
        f"https://kauth.kakao.com/oauth/authorize"
        f"?client_id={KAKAO_CLIENT_ID}"
        f"&redirect_uri={KAKAO_REDIRECT_URI}"
        f"&response_type=code"
    )
    return {"redirect_url": kakao_auth_url}

@router.post("/callback")
async def kakao_callback(code: str = Form(...)):
    # 환경 변수 검증
    KAKAO_CLIENT_ID = os.getenv("KAKAO_CLIENT_ID")
    KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if not all([KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, JWT_SECRET_KEY]):
        raise ValueError("필수 환경 변수가 설정되지 않았습니다. KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI, JWT_SECRET_KEY를 확인하세요.")

    if not code:
        raise HTTPException(status_code=400, detail="인가 코드(code)가 없습니다.")

    async with httpx.AsyncClient() as client:
        # 토큰 요청
        token_res = await client.post(
            "https://kauth.kakao.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": KAKAO_CLIENT_ID,
                "redirect_uri": KAKAO_REDIRECT_URI,
                "code": code,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if token_res.status_code != 200:
            print("🔴 토큰 요청 실패:", token_res.text)
            raise HTTPException(
                status_code=400,
                detail=f"카카오 토큰 요청 실패: {token_res.text}"
            )

        token_json = token_res.json()
        access_token = token_json.get("access_token")

        # 사용자 정보 요청
        user_info_res = await client.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if user_info_res.status_code != 200:
            print("🔴 사용자 정보 요청 실패 응답:", user_info_res.text)
            raise HTTPException(
                status_code=400,
                detail=f"카카오 사용자 정보 요청 실패: {user_info_res.text}"
            )

        profile = user_info_res.json()
        kakao_account = profile.get("kakao_account", {})
        email = kakao_account.get("email")

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
                "email": email
            }
        }
