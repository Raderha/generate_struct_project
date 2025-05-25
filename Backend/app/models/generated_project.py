from app.core.db import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, func

class GeneratedProject(Base):
    __tablename__ = "generated_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=False)
    project_name = Column(String(255))
    prompt = Column(Text)
    zip_filename = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())