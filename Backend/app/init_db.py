from app.core.db import engine
from app.models.base import Base
from app.models.users import User
from app.models.templates import Template
from app.models.projects import Project
from app.models.logs import Log


print("📦 Creating all tables...")
Base.metadata.create_all(bind=engine)
print("✅ Done!")
