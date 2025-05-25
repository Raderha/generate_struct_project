from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import pymysql
import os

router = APIRouter()

# DB 연결 함수 (간단 버전, 실제로는 pool 사용 추천)
def get_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="your_password",
        database="project",
        cursorclass=pymysql.cursors.DictCursor
    )

@router.get("/mypage")
def get_mypage(user_id: str = Query(...)):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 사용자 정보 가져오기
            cursor.execute("SELECT id, email FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()

            if not user:
                return JSONResponse(status_code=404, content={"message": "User not found"})

            # 프로젝트 정보 가져오기
            cursor.execute("""
                SELECT id, title, created_at
                FROM projects
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            projects = cursor.fetchall()

        return {
            "user": user,
            "projects": projects
        }

    finally:
        conn.close()
