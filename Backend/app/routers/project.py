from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SessionLocal
from app.models.generated_project import GeneratedProject
import jwt

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/save")
def save_project(data: dict, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("user.email")
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
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("user.email")
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
