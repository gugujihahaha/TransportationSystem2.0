# app/models_def.py
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Tuple


class BaseTransportationClassifier(nn.Module):
    """交通方式识别基类"""

    def __init__(self, input_dims: List[int], hidden_dims: List[int], num_layers: int = 2, num_classes: int = 7,
                 dropout: float = 0.3):
        super().__init__()
        assert len(input_dims) == len(hidden_dims), "input_dims 与 hidden_dims 长度必须一致"
        self.num_classes = num_classes

        self.encoders = nn.ModuleList([
            nn.LSTM(input_size=in_dim, hidden_size=h_dim, num_layers=num_layers, batch_first=True,
                    dropout=dropout if num_layers > 1 else 0.0, bidirectional=True)
            for in_dim, h_dim in zip(input_dims, hidden_dims)
        ])

        fusion_in = sum(h * 2 for h in hidden_dims)
        fusion_hidden = hidden_dims[0] * 2

        self.fusion_layer = nn.Sequential(
            nn.Linear(fusion_in, fusion_hidden),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(fusion_hidden, fusion_hidden // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
        )

        self.classifier = nn.Linear(fusion_hidden // 2, num_classes)
        self.attn_projections = nn.ModuleList([nn.Linear(hd * 2, 1) for hd in hidden_dims])

    def forward(self, *inputs: torch.Tensor) -> torch.Tensor:
        reprs = []
        for i, (encoder, x) in enumerate(zip(self.encoders, inputs)):
            out, _ = encoder(x)
            attn_weights = torch.softmax(self.attn_projections[i](out), dim=1)
            repr_i = (attn_weights * out).sum(dim=1)
            reprs.append(repr_i)
        combined = torch.cat(reprs, dim=1)
        fused = self.fusion_layer(combined)
        return self.classifier(fused)


class HierarchicalTransportationClassifier(BaseTransportationClassifier):
    """层次化时序编码器"""

    def __init__(self, input_dims: list, hidden_dims: list, num_layers: int = 2, num_classes: int = 7,
                 dropout: float = 0.3, num_segments: int = 5, local_hidden: int = 64, global_hidden: int = 128,
                 segment_stats_dim: int = 0):
        super().__init__(input_dims=input_dims, hidden_dims=hidden_dims, num_layers=num_layers, num_classes=num_classes,
                         dropout=dropout)

        self.num_segments = num_segments
        self.segment_stats_dim = segment_stats_dim

        self.local_encoders = nn.ModuleList([
            nn.LSTM(input_size=in_dim, hidden_size=local_hidden, num_layers=1, batch_first=True, bidirectional=True)
            for in_dim in input_dims
        ])

        global_input_dim = local_hidden * 2 * len(input_dims)
        self.global_encoder = nn.LSTM(input_size=global_input_dim, hidden_size=global_hidden, num_layers=num_layers,
                                      batch_first=True, dropout=dropout if num_layers > 1 else 0, bidirectional=True)

        self.global_attn = nn.Linear(global_hidden * 2, 1)

        classifier_input_dim = global_hidden * 2 + segment_stats_dim
        self.classifier = nn.Sequential(
            nn.Linear(classifier_input_dim, global_hidden),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(global_hidden, num_classes)
        )

    def forward(self, *inputs: torch.Tensor, segment_stats: torch.Tensor = None) -> torch.Tensor:
        seq_len = inputs[0].size(1)
        seg_len = max(1, seq_len // self.num_segments)

        local_reprs = []
        for i, (inp, local_enc) in enumerate(zip(inputs, self.local_encoders)):
            seg_reprs = []
            for s in range(self.num_segments):
                start = s * seg_len
                end = start + seg_len if s < self.num_segments - 1 else seq_len
                seg = inp[:, start:end, :]
                out, _ = local_enc(seg)
                seg_reprs.append(out[:, -1, :].unsqueeze(1))
            local_reprs.append(torch.cat(seg_reprs, dim=1))

        combined = torch.cat(local_reprs, dim=2)
        global_out, _ = self.global_encoder(combined)
        attn_weights = torch.softmax(self.global_attn(global_out), dim=1)
        global_repr = (attn_weights * global_out).sum(dim=1)

        if segment_stats is not None and self.segment_stats_dim > 0:
            global_repr = torch.cat([global_repr, segment_stats], dim=1)

        return self.classifier(global_repr)


class TransportationModeClassifier(HierarchicalTransportationClassifier):
    """交通方式分类器 (Exp3)"""

    def __init__(self, trajectory_feature_dim: int = 21, spatial_feature_dim: int = 12, segment_stats_dim: int = 18,
                 hidden_dim: int = 128, num_layers: int = 2, num_classes: int = 7, dropout: float = 0.3):
        # 假设有两个输入流：一个是 21维(或9维轨迹)，一个是 12维空间
        super().__init__(
            input_dims=[trajectory_feature_dim, spatial_feature_dim],
            hidden_dims=[hidden_dim, hidden_dim // 2],
            num_layers=num_layers, num_classes=num_classes, dropout=dropout,
            segment_stats_dim=segment_stats_dim
        )

class TransportationModeClassifierWithWeather(HierarchicalTransportationClassifier):
    """
    Exp3 分类器
    输入:
        trajectory_features : (B, T, 21)  — 点级融合特征(9轨迹+12空间)，复用exp2
        weather_features    : (B, T, 10)  — 逐点广播的日级天气特征
        segment_stats       : (B, 18)     — 段级统计特征
    """

    def __init__(
        self,
        trajectory_feature_dim: int = 21,   # 复用exp2：9轨迹+12空间
        weather_feature_dim: int = 10,       # 日级天气10维
        segment_stats_dim: int = 18,
        hidden_dim: int = 128,
        num_layers: int = 2,
        num_classes: int = 6,
        dropout: float = 0.3,
        num_segments: int = 5,
        local_hidden: int = 64,
        global_hidden: int = 128,
    ):
        # 两路LSTM: [轨迹21维, 天气10维]
        super().__init__(
            input_dims=[trajectory_feature_dim, weather_feature_dim],
            hidden_dims=[hidden_dim, hidden_dim // 4],
            num_layers=num_layers,
            num_classes=num_classes,
            dropout=dropout,
            num_segments=num_segments,
            local_hidden=local_hidden,
            global_hidden=global_hidden,
            segment_stats_dim=segment_stats_dim,
        )
        self.trajectory_feature_dim = trajectory_feature_dim
        self.weather_feature_dim = weather_feature_dim
        self.segment_stats_dim = segment_stats_dim

    def forward(
        self,
        trajectory_features: torch.Tensor,   # (B, T, 21)
        weather_features: torch.Tensor,       # (B, T, 10)
        segment_stats: torch.Tensor = None    # (B, 18)
    ) -> torch.Tensor:
        return super().forward(
            trajectory_features, weather_features,
            segment_stats=segment_stats
        )

    def predict_proba(
        self,
        trajectory_features: torch.Tensor,
        weather_features: torch.Tensor,
        segment_stats: torch.Tensor = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        return super().predict_proba(
            trajectory_features, weather_features,
            segment_stats=segment_stats
        )