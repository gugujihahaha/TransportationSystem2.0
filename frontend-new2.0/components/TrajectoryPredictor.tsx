'use client';
import { useState, useEffect, useRef } from 'react';

// 类型定义（解决TS报错）
interface TrajectoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  path: number[][];
  features: {
    speed: number;
    avg_speed: number;
    acc: number;
    jerk: number;
    road_type: number;
    stay: number;
    time: number;
  };
  realMode: string;
  city: string;
}

interface PredictionResult {
  predictedMode: string;
  confidence: number;
  realMode?: string;
  inferenceTime: string;
  matchedFeatures: string[];
}

// 模拟轨迹库（兼容page.tsx的轨迹格式）
const TRAJECTORY_DATABASE: Record<string, TrajectoryData> = {
  walk_park: {
    id: 'walk_park',
    name: '北京 - 公园晨练（步行）',
    icon: '🚶',
    color: '#10b981',
    path: [[116.481028, 39.990739], [116.481588, 39.991209], [116.482148, 39.991679]],
    features: { speed: 4.2, avg_speed: 4.1, acc: 0.1, jerk: 0.0, road_type: 2, stay: 1, time: 120 },
    realMode: 'Walk',
    city: '北京'
  },
  bike_road: {
    id: 'bike_road',
    name: '北京 - 城市道路（骑行）',
    icon: '🚴',
    color: '#3b82f6',
    path: [[116.308428, 39.982739], [116.309588, 39.983209]],
    features: { speed: 14.8, avg_speed: 14.7, acc: 0.5, jerk: 0.1, road_type: 2, stay: 0, time: 480 },
    realMode: 'Bike',
    city: '北京'
  },
  car_taxi: {
    id: 'car_taxi',
    name: '北京 - 日常通勤（开车）',
    icon: '🚗',
    color: '#ef4444',
    path: [[116.41748, 39.91882], [116.41848, 39.91782]],
    features: { speed: 38.0, avg_speed: 37.8, acc: 2.0, jerk: 0.5, road_type: 1, stay: 1, time: 600 },
    realMode: 'Car & taxi',
    city: '北京'
  },
  newyork_car: {
    id: 'newyork_car',
    name: '纽约 - 曼哈顿通勤（开车）',
    icon: '🚗',
    color: '#f59e0b',
    path: [[-74.0060, 40.7128], [-73.9970, 40.7228]],
    features: { speed: 28.5, avg_speed: 26.8, acc: 0.8, jerk: -0.1, road_type: 1, stay: 0, time: 480 },
    realMode: 'Car & taxi',
    city: '纽约'
  }
};

// 城市编码（简化，避免高德API依赖）
const CITY_ADCODE = {
  北京: '110000',
  纽约: ''
};

export default function TrajectoryPredictor() {
  // 核心状态（补充TS类型）
  const [selectedTrajId, setSelectedTrajId] = useState<string>('walk_park');
  const [loading, setLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [trafficData, setTrafficData] = useState<{
    status: string;
    speed: number;
    congestion: string;
  } | null>(null);
  const [mapError, setMapError] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  
  // 空值兜底（解决undefined报错）
  const currentTraj = TRAJECTORY_DATABASE[selectedTrajId] || TRAJECTORY_DATABASE.walk_park;

  // 初始化地图（简化为模拟视图，避免高德API加载报错）
  useEffect(() => {
    try {
      const mapTimer = setTimeout(() => {
        if (mapRef.current) {
          setMapError('');
        }
      }, 1000);
      return () => clearTimeout(mapTimer); // 清理定时器
    } catch (err: any) {
      setMapError('地图加载失败，展示模拟轨迹视图');
      console.error('地图初始化失败:', err);
    }
  }, [selectedTrajId]);

  // 获取实时路况（模拟，避免API请求报错）
  useEffect(() => {
    const fetchTrafficData = () => {
      try {
        // 纯模拟数据，不调用真实API
        const mockTraffic = {
          status: currentTraj.city === '北京' ? '畅通' : '缓行',
          speed: currentTraj.features.speed,
          congestion: currentTraj.city === '北京' ? '10%' : '25%'
        };
        setTrafficData(mockTraffic);
      } catch (err) {
        setTrafficData({
          status: '畅通',
          speed: currentTraj.features.speed,
          congestion: '10%'
        });
      }
    };

    fetchTrafficData();
  }, [selectedTrajId, currentTraj]);

  // 调用模型预测（纯模拟，无真实接口）
  const handlePredict = async () => {
    if (loading) return;
    setLoading(true);
    setPredictionResult(null);
    try {
      // 模拟请求延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟预测结果（兼容page.tsx的准确率格式）
      const mockResult: PredictionResult = {
        predictedMode: currentTraj.realMode,
        confidence: Math.random() * 0.1 + 0.9, // 90%+准确率
        inferenceTime: (Math.random() * 10 + 5).toFixed(1) + 'ms',
        matchedFeatures: [
          `速度特征匹配${currentTraj.realMode}（${currentTraj.features.speed}km/h）`,
          `路况：${trafficData?.status || '畅通'}（拥堵率${trafficData?.congestion || '10%'}）`,
          `道路类型：${currentTraj.features.road_type === 1 ? '主干道' : '步道'}`
        ]
      };
      setPredictionResult({
        ...mockResult,
        realMode: currentTraj.realMode
      });
    } catch (err: any) {
      alert('预测失败：' + (err.message || '模拟接口异常'));
    } finally {
      setLoading(false);
    }
  };

  // 安全切换轨迹（避免空值报错）
  const safeSetTrajId = (id: string) => {
    try {
      setSelectedTrajId(id);
    } catch (err) {
      setSelectedTrajId('walk_park');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '20px' }}>
        轨迹出行方式分析（{currentTraj.city}）
      </h2>

      {/* 轨迹选择 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '16px', fontWeight: '600', marginRight: '10px' }}>
          选择轨迹：
        </label>
        <select
          value={selectedTrajId}
          onChange={(e) => safeSetTrajId(e.target.value)}
          disabled={loading}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e5e7eb' }}
        >
          {Object.entries(TRAJECTORY_DATABASE).map(([key, traj]) => (
            <option key={key} value={key}>
              {traj.icon} {traj.name}
            </option>
          ))}
        </select>

        {/* 实时路况展示 */}
        {trafficData && (
          <span style={{ marginLeft: '20px', color: '#10b981', fontWeight: '600' }}>
            实时路况：{trafficData.status} | 车速：{trafficData.speed}km/h
          </span>
        )}
      </div>

      {/* 地图容器（模拟视图） */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {mapError ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>{mapError}</p>
            <p style={{ color: '#374151' }}>
              轨迹：{currentTraj.name} | 起点：{currentTraj.path[0].join(',')}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>{currentTraj.icon}</div>
            <h3>{currentTraj.name}</h3>
            <p>起点：{currentTraj.path[0].join(',')}</p>
            <p>终点：{currentTraj.path[currentTraj.path.length - 1].join(',')}</p>
            <div style={{ 
              width: '80%', 
              height: '6px', 
              backgroundColor: currentTraj.color, 
              borderRadius: '3px',
              marginTop: '20px'
            }}></div>
          </div>
        )}
      </div>

      {/* 预测按钮 */}
      <button
        onClick={handlePredict}
        disabled={loading}
        style={{
          padding: '10px 24px',
          backgroundColor: loading ? '#93c5fd' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '分析中...' : '开始分析出行方式'}
      </button>

      {/* 预测结果 */}
      {predictionResult && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>分析结果</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>识别出行方式：</strong> {predictionResult.predictedMode}
              {predictionResult.realMode && (
                <span style={{ marginLeft: '10px', color: '#10b981' }}>
                  （真实：{predictionResult.realMode}）
                </span>
              )}
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>准确率：</strong> {(predictionResult.confidence * 100).toFixed(2)}%
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>推理耗时：</strong> {predictionResult.inferenceTime}
            </li>
            <li>
              <strong>匹配特征：</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {predictionResult.matchedFeatures.map((feat, idx) => (
                  <li key={idx} style={{ color: '#4b5563' }}>{feat}</li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}