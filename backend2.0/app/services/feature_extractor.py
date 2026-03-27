# app/services/feature_extractor.py
import numpy as np
from typing import List, Dict, Tuple
from .osm_feature_extractor import OsmSpatialExtractor

# 初始化空间提取器实例 (全局可用)
spatial_extractor = OsmSpatialExtractor()


def extract_features(points: List[Dict]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    将前端传入的轨迹点转换为模型输入特征。
    返回:
        traj_features_21: (1, 50, 21) 维度序列
        spatial_features_12: (1, 50, 12) 维度序列
        segment_stats: (1, 18) 维度段级统计
    """
    FIXED_SEQUENCE_LENGTH = 50

    # 1. 提取 9 维原生轨迹特征
    feature_cols = ['lat', 'lng', 'speed', 'acceleration', 'bearing_change',
                    'distance', 'time_diff', 'total_distance', 'total_time']

    raw_features = []
    for p in points:
        row = [p.get(c, 0.0) for c in feature_cols]
        raw_features.append(row)

    features = np.array(raw_features, dtype=np.float32)
    current_length = len(features)

    # 2. 插值或截断到固定长度 (50)
    if current_length > FIXED_SEQUENCE_LENGTH:
        indices = np.linspace(0, current_length - 1, FIXED_SEQUENCE_LENGTH, dtype=int)
        features = features[indices]
    elif current_length < FIXED_SEQUENCE_LENGTH:
        if current_length == 0:
            features = np.zeros((FIXED_SEQUENCE_LENGTH, 9), dtype=np.float32)
        else:
            padding = np.zeros((FIXED_SEQUENCE_LENGTH - current_length, 9), dtype=np.float32)
            features = np.vstack([features, padding])

    # 3. 提取 12 维空间特征
    spatial_features = spatial_extractor.extract_spatial_features(features)

    # 4. 组合成模型需要的 21 维输入 (9 + 12 = 21)
    combined_21 = np.concatenate([features, spatial_features], axis=1)

    # 5. 计算 18 维段级统计特征 (这里用序列的 9 个属性的 均值 和 标准差 构成 18 维)
    means = np.mean(features, axis=0)
    stds = np.std(features, axis=0)
    segment_stats = np.concatenate([means, stds]).astype(np.float32)

    # 增加 batch 维度 (Batch Size = 1)
    combined_21_batch = np.expand_dims(combined_21, axis=0)
    spatial_12_batch = np.expand_dims(spatial_features, axis=0)
    segment_stats_batch = np.expand_dims(segment_stats, axis=0)

    return combined_21_batch, spatial_12_batch, segment_stats_batch