# app/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
# 引入所有路由，包含新增的 stats 路由
from .routers import auth, predict, history, stats

# 初始化数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Traffic Mode Recognition API", version="1.0.0")

# 配置 CORS，允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册所有路由
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(history.router)
app.include_router(stats.router) # 注册统计数据路由

@app.get("/")
def read_root():
    return {"message": "Welcome to Traffic Mode Recognition API"}