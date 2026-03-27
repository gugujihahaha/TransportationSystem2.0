# app/routers/predict.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
import json

# 导入项目内部模块
from .. import models, database, auth
from ..services.model_loader import predict as model_predict

router = APIRouter(prefix="/api/predict", tags=["Predict"])


# --- 请求体定义 ---

class TrajectoryRequest(BaseModel):
    points: List[Dict[str, Any]]
    model_type: str = "exp3"  # 默认使用 SOTA 模型 (Exp3)


class CompareRequest(BaseModel):
    points: List[Dict[str, Any]]
    model_types: List[str] = ["exp1", "exp2", "exp3", "exp4"]


# --- 路由接口 ---

@router.post("/")
async def predict_single(
        request: TrajectoryRequest,
        db: Session = Depends(database.get_db),  # 注入数据库会话
        current_user: models.User = Depends(auth.get_current_user)  # 获取当前登录用户
):
    """
    常规预测接口：执行 AI 推理并将结果实时存入数据库历史记录
    """
    try:
        # 1. 调用 AI 模型进行推理
        result = model_predict(request.points, model_type=request.model_type)

        # 2. 构造数据库模型对象
        # 注意：trajectory_points 和 feature_weights 在 models.py 中是 JSON 类型
        # SQLAlchemy 会自动处理 Python 对象到 JSON 字符串的转换
        new_prediction = models.Prediction(
            user_id=current_user.id,
            predicted_mode=result.get("predicted_mode"),
            confidence=float(result.get("confidence", 0)),
            trajectory_points=request.points,
            feature_weights=result.get("feature_weights", {})
        )

        # 3. 执行写入操作
        db.add(new_prediction)
        db.commit()  # 提交到 app.db
        db.refresh(new_prediction)  # 获取生成自增 ID

        # 4. 返回结果给前端，包含新记录的 ID 证明保存成功
        return {
            "status": "success",
            "data": result,
            "record_id": new_prediction.id
        }

    except Exception as e:
        db.rollback()  # 发生任何错误都要回滚，防止数据库死锁
        raise HTTPException(status_code=500, detail=f"推理或保存失败: {str(e)}")


@router.post("/compare")
async def compare_models(request: CompareRequest):
    """
    消融实验对比接口：用于 Insights 页面比对模型，通常不记录个人历史记录
    """
    try:
        comparisons = {}
        for m_type in request.model_types:
            res = model_predict(request.points, model_type=m_type)
            comparisons[m_type] = res

        return {"status": "success", "comparisons": comparisons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"多模型比对失败: {str(e)}")