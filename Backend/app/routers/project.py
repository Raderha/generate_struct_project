from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SessionLocal
from app.models.generated_project import GeneratedProject
import jwt
import os
import json

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/save")
def save_project(data: dict, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    db: Session = SessionLocal()
    new_project = GeneratedProject(
        user_email=user_email,
        project_name=data.get("project_name"),
        prompt=data.get("prompt"),
        zip_filename=data.get("zip_filename")
    )
    db.add(new_project)
    db.commit()
    db.close()

    return {"message": "저장 성공"}


@router.get("/")
def get_user_projects(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    db: Session = SessionLocal()
    results = db.query(GeneratedProject).filter_by(user_email=user_email).order_by(GeneratedProject.created_at.desc()).all()
    db.close()

    return [
        {
            "project_name": p.project_name,
            "prompt": p.prompt,
            "zip_filename": p.zip_filename,
            "created_at": p.created_at
        }
        for p in results
    ]

@router.post("/update-file")
def update_file(data: dict, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    project_name = data.get("projectName")
    file_path = data.get("filePath")
    content = data.get("content")

    if not all([project_name, file_path, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # 프로젝트 디렉토리 경로
    project_dir = os.path.join("generated_projects", project_name)
    
    # 파일의 전체 경로
    full_file_path = os.path.join(project_dir, file_path.lstrip('/'))
    
    # 보안 검사: 프로젝트 디렉토리 밖으로 나가지 않도록
    if not os.path.abspath(full_file_path).startswith(os.path.abspath(project_dir)):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        # 디렉토리가 존재하는지 확인하고 없으면 생성
        os.makedirs(os.path.dirname(full_file_path), exist_ok=True)
        
        # 파일에 내용 쓰기
        with open(full_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {"message": "File updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update file: {str(e)}")
