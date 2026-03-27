# app/config.py
from pydantic_settings import BaseSettings
import os

# 获取当前文件 (config.py) 的绝对路径，再向上推两级，定位到 backend2.0 目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    # 将 SQLite 数据库直接放在 backend2.0 目录下
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}"

    # JWT 安全认证配置
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # ==========================================
    # AI 模型与空间特征相关配置 (第十步新增)
    # ==========================================
    # Exp3 模型权重文件绝对路径
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH",
        r"D:\TransportationModeRecognition\backend2.0\exp3\checkpoints\exp3_model.pth"
    )

    # OSM 增强 GeoJSON 数据绝对路径
    OSM_GEOJSON_PATH: str = os.getenv(
        "OSM_GEOJSON_PATH",
        r"D:\TransportationModeRecognition\backend2.0\data\beijing_osm_full_enhanced_verified.geojson"
    )

    class Config:
        env_file = ".env"


settings = Settings()