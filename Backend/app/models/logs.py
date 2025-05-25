from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from .base import Base
from sqlalchemy.dialects.mysql import CHAR

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"))
    action = Column(String(50))
    message = Column(Text)
    created_at = Column(DateTime, default=func.now())
