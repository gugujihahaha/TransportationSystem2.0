# app/routers/history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, auth, database

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=List[schemas.PredictionRecord])
def get_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user) # 需要认证
):
    # 获取当前用户的所有预测记录，按创建时间降序排列
    records = db.query(models.Prediction)\
        .filter(models.Prediction.user_id == current_user.id)\
        .order_by(models.Prediction.created_at.desc())\
        .all()
    return records

@router.get("/{record_id}", response_model=schemas.PredictionDetail)
def get_history_detail(
    record_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user) # 需要认证
):
    # 获取特定记录，同时验证归属权
    record = db.query(models.Prediction)\
        .filter(models.Prediction.id == record_id, models.Prediction.user_id == current_user.id)\
        .first()

    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found")

    return record