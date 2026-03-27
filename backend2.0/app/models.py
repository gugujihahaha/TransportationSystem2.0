# app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 建立与 Prediction 的一对多关系
    predictions = relationship("Prediction", back_populates="owner", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trajectory_points = Column(JSON, nullable=False) # 存储轨迹点数组
    predicted_mode = Column(String(20), nullable=False) # 如 "Walk", "Bike" 等
    confidence = Column(Float, nullable=False)
    feature_weights = Column(JSON, nullable=False) # 存储特征权重字典
    created_at = Column(DateTime, default=datetime.utcnow)

    # 反向关联到 User
    owner = relationship("User", back_populates="predictions")