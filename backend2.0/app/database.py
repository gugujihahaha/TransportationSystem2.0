from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# SQLite 特殊配置：check_same_thread=False 允许跨线程访问
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依赖注入函数，确保每个请求后关闭连接
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()