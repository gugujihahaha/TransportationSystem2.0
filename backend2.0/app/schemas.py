# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- 原有的 User 和 Token 模型 ---
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- 新增：预测与历史记录模型 ---
class TrajectoryPoint(BaseModel):
    lng: float
    lat: float
    timestamp: int          # 时间戳（秒）
    speed: float            # 速度（m/s）
    acceleration: float     # 加速度（m/s²）
    bearing_change: float   # 方向变化率（°/s）
    distance: float         # 相邻点距离（m）
    time_diff: float        # 相邻点时间差（s）
    total_distance: float   # 滑动窗口总距离（m）
    total_time: float       # 滑动窗口总时间（s）

class PredictRequest(BaseModel):
    points: List[TrajectoryPoint]

class PredictResponse(BaseModel):
    predicted_mode: str
    confidence: float
    feature_weights: Dict[str, float]

class PredictionRecord(BaseModel):
    id: int
    predicted_mode: str
    confidence: float
    created_at: datetime
    class Config:
        from_attributes = True

class PredictionDetail(PredictionRecord):
    trajectory_points: List[Dict[str, Any]]
    feature_weights: Dict[str, float]
    class Config:
        from_attributes = True