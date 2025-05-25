from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGODB_DB", "project")

client = MongoClient(MONGO_URI)
mongo_db = client[MONGO_DB_NAME]
template_structures = mongo_db.template_structures  # 템플릿 구조 저장 컬렉션


# 몽고 디비 비밀번호 WYK61NRc0ZsJkMH1

#mongodb+srv://udy5224:WYK61NRc0ZsJkMH1@cluster0.u8cmdhl.mongodb.net/