from dotenv import load_dotenv
# 환경변수 로드
load_dotenv()


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Environment, FileSystemLoader
import os
import tempfile
import shutil
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import google.generativeai as genai
from pydantic import BaseModel
from app.routers import kakao, google



# FastAPI 앱 생성
app = FastAPI()
app.include_router(kakao.router)
app.include_router(google.router)

# 환경변수: BASE_URL (예: https://api.myapp.com)
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# 기본 루트 확인용 엔드포인트
@app.get("/")
def read_root():
    return {"message": "AI Codegen Backend is running"}

# CORS 설정 (프론트엔드 요청 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제로는 프론트 주소로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth
app.include_router(auth.router)


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}

# GEMINI API 키 가져오기 및 예외 처리
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY가 환경변수에 설정되어 있지 않습니다. .env 파일을 확인하세요.")

genai.configure(api_key=GEMINI_API_KEY)

# 요청 모델 정의
class GenerateRequest(BaseModel):
    prompt: str
    user_id: int  # 사용자 구분용 (DB에 저장 시 필요)

# 템플릿 렌더링 함수
def generate_files_from_template(request: GenerateRequest):
    # Jinja2 템플릿 환경 설정
    env = Environment(loader=FileSystemLoader('templates'))

    # 예시: 사용자 요청에 맞춰 템플릿 선택
    template_name = 'app.py.j2' if 'flask' in request.prompt.lower() else 'index.html.j2'

    template = env.get_template(template_name)

    # 템플릿 렌더링
    generated_code = template.render(prompt=request.prompt)

    return generated_code

@app.post("/generate")
async def generate_code(request: GenerateRequest):
    tmp_dir = tempfile.mkdtemp()
    try:
        # 템플릿 렌더링을 통해 코드 생성
        generated_code = generate_files_from_template(request)

        # 파일 확장자 자동 추출
        ext = get_file_extension(request.prompt)
        code_file_name = f"generated_code{ext}"
        code_file_path = os.path.join(tmp_dir, code_file_name)

        # 생성된 코드 파일 저장
        with open(code_file_path, "w", encoding="utf-8") as f:
            f.write(generated_code)

        # zip 압축 파일 생성
        zip_output_dir = tempfile.gettempdir()
        zip_base_path = os.path.join(zip_output_dir, f"user_{request.user_id}_code")
        shutil.make_archive(zip_base_path, "zip", tmp_dir)
        zip_path = f"{zip_base_path}.zip"

        # DB에 저장 (예시로 출력만 함)
        save_to_db({
            "user_id": request.user_id,
            "prompt": request.prompt,
            "generated_code": generated_code
        })

        # 절대 URL로 응답
        return JSONResponse({
            "code": generated_code,
            "download_url": f"{BASE_URL}/download/{os.path.basename(zip_path)}"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Internal Server Error", "message": str(e)})

    finally:
        # 임시 디렉토리 삭제
        shutil.rmtree(tmp_dir, ignore_errors=True)

# 다운로드 엔드포인트
@app.get("/download/{zip_filename}")
async def download_code(zip_filename: str):
    zip_output_dir = tempfile.gettempdir()
    zip_path = os.path.join(zip_output_dir, zip_filename)

    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    return FileResponse(zip_path, media_type="application/zip", filename=zip_filename)

# (예시) DB 저장 함수 - 실제로는 ORM으로 구현
def save_to_db(data: dict):
    print(f"DB에 저장할 데이터: {data}")

# 파일 확장자 추출 함수
def get_file_extension(prompt: str) -> str:
    prompt = prompt.lower()
    if "python" in prompt:
        return ".py"
    elif "react" in prompt or "javascript" in prompt:
        return ".js"
    elif "html" in prompt:
        return ".html"
    elif "css" in prompt:
        return ".css"
    elif "java" in prompt:
        return ".java"
    elif "c++" in prompt:
        return ".cpp"
    else:
        return ".txt"
