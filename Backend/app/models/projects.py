from sqlalchemy import Column, String, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.sql import func
from .base import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(CHAR(36), primary_key=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"))
    template_id = Column(CHAR(36), ForeignKey("templates.id"))
    title = Column(String(100))
    status = Column(Enum("generated", "downloaded"), default="generated")
    created_at = Column(DateTime, default=func.now())
