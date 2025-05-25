from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Environment, FileSystemLoader
import os
import tempfile
import shutil
import json
import re
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import Header, Body, Depends
import jwt
from typing import List, Dict
import time
from pydantic import BaseModel
from app.routers import kakao, google

from pydantic import BaseModel

class FileContentRequest(BaseModel):
    projectName: str
    filePath: str

# 환경변수 로드
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Backend 디렉토리
dotenv_path = os.path.join(BASE_DIR, '.env')
print(f"Loading .env from: {dotenv_path}")
print(f"File exists: {os.path.exists(dotenv_path)}")
load_dotenv(dotenv_path)

# 환경 변수 확인
print("Environment variables:")
print(f"GOOGLE_CLIENT_ID: {os.getenv('GOOGLE_CLIENT_ID')}")
print(f"KAKAO_CLIENT_ID: {os.getenv('KAKAO_CLIENT_ID')}")
print(f"JWT_SECRET_KEY: {os.getenv('JWT_SECRET_KEY')}")

# FastAPI 앱 생성
app = FastAPI()
app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

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

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
   raise ValueError("JWT_SECRET_KEY가 .env에 없습니다.")


genai.configure(api_key=GEMINI_API_KEY)

# 요청 모델 정의
class GenerateRequest(BaseModel):
    prompt: str
    
@app.post("/api/generate")
async def generate_code(request: GenerateRequest, 
                  authorization: str = Header(None)):
   tmp_dir = tempfile.mkdtemp()
   try:
      print("Starting code generation...")
      print(f"Received prompt: {request.prompt}")
      
      model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
      if not authorization or not authorization.startswith("Bearer "):
         raise HTTPException(status_code=401, detail="Authorization 헤더가 유효하지 않습니다.")

      token = authorization.replace("Bearer ", "").strip()
      try:
         payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
         user_email = payload.get("sub")
         print(f"Decoded token payload: {payload}")
         if user_email is None:
            raise HTTPException(status_code=401, detail="토큰에 user.email이 없습니다.")
      except jwt.ExpiredSignatureError:
         raise HTTPException(status_code=401, detail="토큰이 만료되었습니다.")
      except jwt.InvalidTokenError as e:
         print(f"Token validation error: {str(e)}")
         raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

      prompt = f"""
당신은 소프트웨어 프로젝트 생성기입니다. 사용자의 요청에 맞는 프로젝트 구조를 JSON 형태로 반환하세요.

설명하지 말고 아래 형식 그대로 순수 JSON만 반환하세요. 코드 블록으로 감싸지 마세요.

예시:
{{
  "project_name": "my_project",
  "files": [
    {{
      "path": "src/main.py",
      "content": "# main code"
    }},
    {{
      "path": ".env",
      "content": ""
    }},
    {{
      "path": "requirements.txt",
      "content": "fastapi\ndotenv"
    }}
  ]
}}

사용자 요청:
{request.prompt}
"""

      print("Sending request to Gemini API...")
      response = model.generate_content(prompt)
      raw_text = response.text.strip()
      print(f"Received response from Gemini: {raw_text[:200]}...")  # 첫 200자만 출력

      # 코드블럭 제거 및 JSON 추출
      match = re.search(r"```json(.*?)```", raw_text, re.DOTALL)
      if match:
         raw_text = match.group(1).strip()

      try:
         project_data = json.loads(raw_text)
         print("Successfully parsed JSON response")
      except json.JSONDecodeError as e:
         print(f"JSON parsing error: {str(e)}")
         print(f"Raw text that failed to parse: {raw_text}")
         raise HTTPException(status_code=500, detail={
            "error": "Internal Server Error",
            "message": "AI 응답이 올바른 JSON 형식이 아닙니다."
         })

      # 임시 디렉토리에 프로젝트 생성
      project_dir = os.path.join(tmp_dir, f"user_{user_email}_project")
      os.makedirs(project_dir, exist_ok=True)

      for file in project_data["files"]:
         file_path = os.path.join(project_dir, file["path"])
         os.makedirs(os.path.dirname(file_path), exist_ok=True)
         with open(file_path, "w", encoding="utf-8") as f:
            f.write(file["content"])

      # 프로젝트를 generated_projects 디렉토리에 복사
      generated_projects_dir = os.path.join(BASE_DIR, "generated_projects")
      os.makedirs(generated_projects_dir, exist_ok=True)
      
      final_project_dir = os.path.join(generated_projects_dir, project_data.get("project_name"))
      
      # 기존 디렉토리가 있다면 안전하게 삭제
      if os.path.exists(final_project_dir):
         try:
            shutil.rmtree(final_project_dir)
         except PermissionError:
            # 권한 오류 발생 시 다른 이름으로 저장
            timestamp = int(time.time())
            final_project_dir = os.path.join(generated_projects_dir, f"{project_data.get('project_name')}_{timestamp}")
            print(f"Using alternative directory: {final_project_dir}")

      shutil.copytree(project_dir, final_project_dir)

      # ZIP 파일 생성
      zip_base_path = os.path.join(tempfile.gettempdir(), f"user_{user_email}_project")
      shutil.make_archive(zip_base_path, "zip", project_dir)
      zip_path = f"{zip_base_path}.zip"

      save_to_db({
         "user_email": user_email,
         "prompt": request.prompt,
         "project_name": project_data.get("project_name"),
      })

      return JSONResponse({
         "project_name": project_data.get("project_name"),
         "download_url": f"{BASE_URL}/download/{os.path.basename(zip_path)}"
      })

   except Exception as e:
      print(f"Error in generate_code: {str(e)}")
      print(f"Error type: {type(e)}")
      import traceback
      print(f"Traceback: {traceback.format_exc()}")
      raise HTTPException(status_code=500, detail={
         "error": "Internal Server Error",
         "message": str(e)
      })

   finally:
      try:
         shutil.rmtree(tmp_dir, ignore_errors=True)
      except Exception as e:
         print(f"Error cleaning up temp directory: {str(e)}")

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

# JWT 토큰 검증을 위한 의존성 함수
async def get_current_user(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Authorization header is missing or invalid")
        
        token = auth_header.replace("Bearer ", "").strip()
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("sub")
        if user_email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        return user_email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class ProjectStructureRequest(BaseModel):
    projectName: str

    class Config:
        json_schema_extra = {
            "example": {
                "projectName": "example_project"
            }
        }

@app.post("/api/generate/structure")
async def get_project_structure(
    request: ProjectStructureRequest,
    token: str = Depends(get_current_user)
):
    try:
        print(f"Received request for project: {request.projectName}")
        # 프로젝트 디렉토리 경로
        project_dir = os.path.join("generated_projects", request.projectName)
        print(f"Looking for project in: {project_dir}")
        
        if not os.path.exists(project_dir):
            print(f"Project directory not found: {project_dir}")
            # 임시 디렉토리에서도 찾아보기
            temp_dir = os.path.join(tempfile.gettempdir(), f"user_{token}_project")
            if os.path.exists(temp_dir):
                project_dir = temp_dir
                print(f"Found project in temp directory: {temp_dir}")
            else:
                raise HTTPException(status_code=404, detail="Project not found")
        
        def get_file_structure(path: str, base_path: str = "") -> List[Dict]:
            structure = []
            try:
                print(f"Reading directory: {path}")
                items = os.listdir(path)
                print(f"Found items: {items}")
                
                for item in items:
                    item_path = os.path.join(path, item)
                    relative_path = os.path.join(base_path, item)
                    print(f"Processing item: {item} at {relative_path}")
                    
                    if os.path.isdir(item_path):
                        structure.append({
                            "name": item,
                            "type": "directory",
                            "path": relative_path,
                            "children": get_file_structure(item_path, relative_path)
                        })
                    else:
                        structure.append({
                            "name": item,
                            "type": "file",
                            "path": relative_path
                        })
                return structure
            except Exception as e:
                print(f"Error reading directory {path}: {str(e)}")
                return []
        
        structure = get_file_structure(project_dir)
        print(f"Generated structure: {structure}")
        return {"structure": structure}
        
    except Exception as e:
        print(f"Error getting project structure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/file-content")
async def get_file_content(
    request: FileContentRequest,
    token: str = Depends(get_current_user)
):
    try:
        project_name = request.projectName
        file_path = request.filePath

        # 경로 로그 출력
        project_dir = os.path.join("generated_projects", project_name)
        full_path = os.path.join(project_dir, file_path)
        print(f"📂 Checking file path: {full_path}")
        
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if not os.path.isfile(full_path):
            raise HTTPException(status_code=400, detail="Path is not a file")
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {"content": content}

    except Exception as e:
        print(f"Error reading file content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class DownloadRequest(BaseModel):
    projectName: str
    savePath: str

    class Config:
        json_schema_extra = {
            "example": {
                "projectName": "example_project",
                "savePath": "C:/Users/username/projects"
            }
        }

@app.post("/api/generate/download")
async def save_project(
    request: DownloadRequest,
    token: str = Depends(get_current_user)
):
    try:
        print(f"Received download request for project: {request.projectName}")
        print(f"Save path: {request.savePath}")
        
        # 프로젝트 디렉토리 경로
        project_dir = os.path.join("generated_projects", request.projectName)
        print(f"Looking for project in: {project_dir}")
        
        if not os.path.exists(project_dir):
            print(f"Project directory not found: {project_dir}")
            # 임시 디렉토리에서도 찾아보기
            temp_dir = os.path.join(tempfile.gettempdir(), f"user_{token}_project")
            if os.path.exists(temp_dir):
                project_dir = temp_dir
                print(f"Found project in temp directory: {temp_dir}")
            else:
                raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")

        # 저장 경로 정규화 및 검증
        try:
            save_path = os.path.normpath(request.savePath)
            print(f"Normalized save path: {save_path}")
            
            # 경로가 유효한지 확인
            if not os.path.isabs(save_path):
                raise HTTPException(status_code=400, detail="절대 경로를 입력해주세요.")
            
            # 저장 경로가 존재하는지 확인
            if not os.path.exists(save_path):
                print(f"Creating directory: {save_path}")
                os.makedirs(save_path, exist_ok=True)
                print(f"Created directory: {save_path}")

            # 프로젝트를 지정된 경로에 복사
            target_dir = os.path.join(save_path, request.projectName)
            print(f"Target directory: {target_dir}")
            
            if os.path.exists(target_dir):
                print(f"Removing existing directory: {target_dir}")
                try:
                    shutil.rmtree(target_dir)
                except PermissionError as e:
                    print(f"Permission error while removing directory: {str(e)}")
                    # 권한 오류 발생 시 다른 이름으로 저장
                    timestamp = int(time.time())
                    target_dir = os.path.join(save_path, f"{request.projectName}_{timestamp}")
                    print(f"Using alternative directory: {target_dir}")
            
            print(f"Copying project from {project_dir} to {target_dir}")
            shutil.copytree(project_dir, target_dir)
            print("Project copied successfully")

            return {"message": f"프로젝트가 {target_dir}에 저장되었습니다."}

        except PermissionError as e:
            print(f"Permission error: {str(e)}")
            raise HTTPException(status_code=403, detail="저장 경로에 대한 접근 권한이 없습니다.")
        except OSError as e:
            print(f"OS error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"잘못된 저장 경로입니다: {str(e)}")

    except Exception as e:
        print(f"Error saving project: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"프로젝트 저장 중 오류가 발생했습니다: {str(e)}")