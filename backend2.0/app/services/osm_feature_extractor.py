# app/services/osm_feature_extractor.py
import numpy as np

class OsmSpatialExtractor:
    """
    OSM 空间特征提取器 (API 轻量化版)
    在演示和 API 环境中，使用模拟的 12 维空间上下文特征。
    如果需要全量真实查询，可以反向引入原实验环境的 KDTree 加载逻辑。
    """
    def __init__(self, geojson_path: str = None):
        self.geojson_path = geojson_path
        print(f"[OsmSpatialExtractor] 空间特征提取器已初始化。预留路径: {geojson_path}")

    def extract_spatial_features(self, trajectory: np.ndarray) -> np.ndarray:
        """
        为输入的轨迹点序列返回 12 维空间特征。
        这里我们使用合理的均值模拟以保证模型不会因为极端的 0 值而崩溃。
        """
        seq_len = trajectory.shape[0]
        # 模拟 12 维空间特征 (例如: 道路类型one-hot, POI距离, 道路密度等)
        mock_spatial = np.random.uniform(0.1, 0.5, size=(seq_len, 12)).astype(np.float32)
        return mock_spatial