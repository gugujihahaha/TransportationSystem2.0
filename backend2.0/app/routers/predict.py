# app/routers/predict.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
# 导入多模型推理工厂
from ..services.model_loader import predict as model_predict

router = APIRouter(prefix="/api/predict", tags=["Predict"])


# 基础预测请求体
class TrajectoryRequest(BaseModel):
    points: List[Dict[str, Any]]
    model_type: str = "exp3"  # 默认使用 SOTA 模型 (Exp3)


# 🌟 多模型对比请求体
class CompareRequest(BaseModel):
    points: List[Dict[str, Any]]
    model_types: List[str] = ["exp1", "exp2", "exp3", "exp4"]  # 默认同时跑四个


@router.post("/")
async def predict_single(request: TrajectoryRequest):
    """
    常规预测接口：供前端大屏首页的 Map.tsx 使用
    """
    try:
        result = model_predict(request.points, model_type=request.model_type)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推理失败: {str(e)}")


@router.post("/compare")
async def compare_models(request: CompareRequest):
    """
    🌟 消融实验对比接口：供 insights 页面使用
    将同一段轨迹同时喂给 4 个模型，返回差异化结果
    """
    try:
        comparisons = {}
        for m_type in request.model_types:
            # 依次调用工厂中的不同模型
            res = model_predict(request.points, model_type=m_type)
            comparisons[m_type] = res

        return {"status": "success", "comparisons": comparisons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"多模型比对失败: {str(e)}")