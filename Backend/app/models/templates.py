from sqlalchemy import Column, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.sql import func
from .base import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(CHAR(36), primary_key=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(Enum("public", "private", "custom"), default="custom")
    created_at = Column(DateTime, default=func.now())
