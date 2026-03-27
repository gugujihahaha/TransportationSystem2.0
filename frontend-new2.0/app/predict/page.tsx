// app/predict/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/authApi';
import Map from '@/components/Map';
import ConfidenceRing from '@/components/ConfidenceRing';
import FeatureChart from '@/components/FeatureChart';
import TrajectoryUpload from '@/components/TrajectoryUpload';
import { validateCoordinates, generateTrajectoryFromPoints, TrajectoryPoint } from '@/lib/geoutils';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🌟 独立数字滚动组件 ---
function AnimatedNumber({ value, duration = 2000, suffix = "" }: { value: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) { animationFrame = requestAnimationFrame(step); }
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

// ============================================================================
// 🌟 深度通勤建议与价值落地弹窗 (AdviceModal)
// ============================================================================
const ADVICE_DATA: Record<string, any> = {
  WALK: {
    icon: '🚶', title: '慢行友好系统：步行通勤深度建议',
    kpis: [{ label: '预估耗时', value: '18 min' }, { label: '卡路里消耗', value: '120 kcal' }, { label: '碳减排', value: '0.8 kg' }],
    case: { source: '市交通委慢行改造白皮书', text: '“某社区慢行系统改造接入态势感知后，居民步行通勤意愿上升40%，有效激活了周边微商圈的经济活力。”' },
    steps: ['① 穿过奥森公园内部专用步道，避开人车混行区。', '② 保持 5.5 km/h 配速，达到最佳燃脂心率。', '③ 途经 2 个 24h 便利店，建议作为补给点。'],
    chart: [ { name: '步行', time: 18, carbon: 0 }, { name: '公交', time: 12, carbon: 45 }, { name: '打车', time: 8, carbon: 120 } ]
  },
  BIKE: {
    icon: '🚲', title: '低碳骑行网络：微循环优化建议',
    kpis: [{ label: '预估耗时', value: '12 min' }, { label: '路线平顺度', value: '92%' }, { label: '碳减排', value: '1.2 kg' }],
    case: { source: '共享单车潮汐调度实验室', text: '“该高新区引入Exp3态势感知后，单车智能调度效率提升30%，彻底消灭了早高峰地铁口的‘单车坟场’现象。”' },
    steps: ['① 导航至前方 50m 的青桔/美团单车推荐停放点。', '② 沿城市新铺设的彩色沥青骑行绿道直行。', '③ 规范停放至电子围栏，获取碳普惠积分奖励。'],
    chart: [ { name: '骑行', time: 12, carbon: 0 }, { name: '公交', time: 15, carbon: 45 }, { name: '打车', time: 10, carbon: 120 } ]
  },
  BUS: {
    icon: '🚌', title: '干线公交效能：公共交通换乘建议',
    kpis: [{ label: '预估耗时', value: '35 min' }, { label: '拥挤度预测', value: '45%' }, { label: '准点率', value: '96%' }],
    case: { source: '公交集团路权优化报告', text: '“利用海量轨迹拟合优化线路后，早高峰公交准点率提升12%，平均通勤时间缩短 8 分钟，大幅提升公交分担率。”' },
    steps: ['① 打开公交App，目标车辆距您还有 2 站 (约3分钟)。', '② 建议在【中关村南站】同站台换乘 302 路直达。', '③ 当前车厢较空，建议向后排移动获取座位。'],
    chart: [ { name: '公交', time: 35, carbon: 45 }, { name: '地铁', time: 30, carbon: 20 }, { name: '打车', time: 25, carbon: 120 } ]
  },
  CAR: {
    icon: '🚗', title: '机动车流引导：拥堵规避与拼车建议',
    kpis: [{ label: '预估耗时', value: '42 min' }, { label: '拥堵延误', value: '+12 min' }, { label: '碳排放', value: '2.5 kg' }],
    case: { source: '交管局绿波带干预中心', text: '“基于海量机动车轨迹特征实施自适应红绿灯绿波干预，主干道机动车通行效率稳步提升 18%。”' },
    steps: ['① 前方核心商圈拥堵，建议开启高德地图避堵路线。', '② 建议在系统内发布【顺风车】行程，分摊通勤成本。', '③ 驶入非限行区域，并留意前方 2km 处的潮汐车道。'],
    chart: [ { name: '打车/自驾', time: 42, carbon: 250 }, { name: '地铁', time: 35, carbon: 20 }, { name: '公交', time: 55, carbon: 45 } ]
  }
};
ADVICE_DATA['SUBWAY'] = ADVICE_DATA['BUS'];
ADVICE_DATA['TRAIN'] = { ...ADVICE_DATA['BUS'], title: '🚄 城际轨道枢纽：跨城接驳建议', icon: '🚄' };
ADVICE_DATA['AIRPLANE'] = { ...ADVICE_DATA['BUS'], title: '✈️ 航空干线枢纽：航站楼引导建议', icon: '✈️' };

function AdviceModal({ isOpen, onClose, mode, confidence }: { isOpen: boolean, onClose: () => void, mode: string | null, confidence: number }) {
  if (!isOpen || !mode || mode.toUpperCase().includes('INVALID')) return null;
  const modeKey = mode.toUpperCase();
  const data = ADVICE_DATA[modeKey] || ADVICE_DATA['CAR'];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[rgba(6,18,46,0.95)] border border-[#00f0ff]/50 shadow-[0_0_50px_rgba(0,240,255,0.2)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative flex flex-col">
          <div className="sticky top-0 bg-[rgba(6,18,46,0.95)] backdrop-blur px-8 py-5 border-b border-[#00f0ff]/30 flex justify-between items-center z-10">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-widest">
              <span className="text-3xl drop-shadow-[0_0_10px_#00f0ff]">{data.icon}</span> {data.title}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-[#00f0ff] text-3xl font-black transition-colors">&times;</button>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-3 gap-6">
              {data.kpis.map((kpi: any, idx: number) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#00f0ff]/50 transition-colors">
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#00f0ff]/20 blur-xl rounded-full group-hover:bg-[#00f0ff]/40 transition-colors"></div>
                  <span className="text-xs text-slate-400 mb-1 tracking-widest">{kpi.label}</span>
                  <span className="text-2xl font-black text-[#00f0ff] font-mono">{kpi.value}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-700 p-5 rounded-lg">
                <h3 className="text-[#00f0ff] font-bold text-sm mb-6 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#00f0ff]"></span>多维度交通方式能效对比图</h3>
                <div className="space-y-5">
                  {data.chart.map((c: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                        <span>{c.name} (耗时: {c.time}m)</span><span>碳排: {c.carbon}g</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(c.time/60)*100}%` }} transition={{ duration: 1 }} className="bg-gradient-to-r from-blue-500 to-[#00f0ff] h-full rounded-full" />
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(c.carbon/300)*100}%` }} transition={{ duration: 1, delay: 0.2 }} className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-[#00f0ff] font-bold text-sm mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#00f0ff]"></span>AI 智能通勤行动指南</h3>
                  <div className="space-y-4">
                    {data.steps.map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start bg-slate-800/30 p-3 rounded border border-slate-700/50 hover:border-[#00f0ff]/30 transition-colors">
                        <span className="text-[#00f0ff] mt-0.5 animate-pulse">⚡</span>
                        <span className="text-sm text-slate-300 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-[#00f0ff]/10 border border-[#00f0ff]/50 text-[#00f0ff] font-bold tracking-widest rounded hover:bg-[#00f0ff] hover:text-black transition-all">
                  接收建议并返回沙盘
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[rgba(0,240,255,0.1)] to-transparent border-l-4 border-[#00f0ff] p-5 rounded-r-lg relative overflow-hidden">
              <div className="text-4xl absolute -top-2 -left-2 opacity-20 text-[#00f0ff] font-serif">"</div>
              <h3 className="text-[#00f0ff] font-bold text-sm mb-2">真实场景落地验证</h3>
              <p className="text-slate-300 text-sm italic mb-3 relative z-10 leading-relaxed">{data.case.text}</p>
              <div className="text-right text-xs text-slate-500 font-mono relative z-10">— 来源: {data.case.source}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// --- 🌟 叙事核心：业务课题剧本 ---
const MISSIONS = [
  { id: 'planning', name: '🏙️ 城市慢行系统规划', center: [116.391, 40.007] as [number, number], defaultKey: 'walk', briefing: "当前课题：奥森公园周边近期反馈人车混行严重。我们需要通过AI识别出慢行（步行/骑行）的高频轨迹，以决定是否需要增设隔离带与慢行绿道。" },
  { id: 'commuting', name: '🏢 科技园早高峰疏导', center: [116.310, 39.980] as [number, number], defaultKey: 'bus', briefing: "当前课题：中关村园区早高峰通勤效率低下。目标是筛查公共交通（公交/地铁）的拥堵断点，评估是否需要由政府联合企业开设定制接驳班车。" },
  { id: 'smart_travel', name: '🚕 核心商圈运力调度', center: [116.460, 39.910] as [number, number], defaultKey: 'car', briefing: "当前课题：CBD商圈夜间出现打车难问题。需精准识别机动车（网约车/私家车）流向，以制定动态价格补贴与拼车分流策略。" }
];

const PRESET_SCENARIOS = {
  walk: [
    { lng: 116.39123, lat: 40.00756, timestamp: 1610000000, speed: 1.2, acceleration: 0.1, bearing_change: 5, distance: 10, time_diff: 8, total_distance: 10, total_time: 8 },
    { lng: 116.39135, lat: 40.00768, timestamp: 1610000010, speed: 1.4, acceleration: 0.02, bearing_change: 5, distance: 14, time_diff: 10, total_distance: 24, total_time: 18 },
    { lng: 116.39150, lat: 40.00780, timestamp: 1610000020, speed: 1.1, acceleration: -0.03, bearing_change: 45, distance: 11, time_diff: 10, total_distance: 35, total_time: 28 },
  ],
  bus: [
    { lng: 116.3100, lat: 39.9800, timestamp: 1610002000, speed: 8.5, acceleration: 1.2, bearing_change: 0, distance: 85, time_diff: 10, total_distance: 85, total_time: 10 },
    { lng: 116.3200, lat: 39.9850, timestamp: 1610002030, speed: 6.2, acceleration: 0.8, bearing_change: 0, distance: 124, time_diff: 20, total_distance: 209, total_time: 40 },
  ],
  car: [
    { lng: 116.4600, lat: 39.9100, timestamp: 1610003000, speed: 15.5, acceleration: 1.2, bearing_change: 0, distance: 150, time_diff: 10, total_distance: 150, total_time: 10 },
    { lng: 116.4700, lat: 39.9150, timestamp: 1610003020, speed: 14.5, acceleration: -0.8, bearing_change: 5, distance: 145, time_diff: 10, total_distance: 475, total_time: 30 },
  ]
};

interface StructuredSuggestion { title: string; status: string; analysis: string; actions: string[]; }

function MacroDetailPanel({ modeKey, onClose }: { modeKey: string | null; onClose: () => void }) {
  if (!modeKey) return null;
  const mockDetails: Record<string, any> = {
    'BIKE': { title: '骑行流量深挖', trend: '上升 12%', recommendation: '增设电子围栏' },
    'WALK': { title: '步行区域分析', trend: '持平', recommendation: '优化红绿灯配时' },
    'CAR': { title: '机动车流审计', trend: '下降 5%', recommendation: '潮汐车道评估' },
    'BUS': { title: '公交效能审计', trend: '上升 8%', recommendation: '拉直冗余线路' },
  };
  const detail = mockDetails[modeKey.toUpperCase()] || mockDetails['CAR'];
  return (
    <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className="absolute top-0 right-0 w-80 h-full bg-[rgba(15,23,42,0.95)] border-l border-[#00f0ff]/30 p-6 z-20 backdrop-blur-lg shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-6"><h4 className="text-xl font-black text-[#00f0ff] tracking-wider">{detail.title}</h4><button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">×</button></div>
      <div className="space-y-4 text-sm">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700"><p className="text-slate-400">区域近期趋势</p><p className="text-xl font-bold text-white">{detail.trend}</p></div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700"><p className="text-slate-400">城市大脑治理建议</p><p className="text-white text-xs mt-1 leading-relaxed">{detail.recommendation}</p></div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 🌟 核心推演主面板
// ============================================================================
function PredictContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get('id');

  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'manual'>('presets');
  const [mapCenter, setMapCenter] = useState<[number, number]>(MISSIONS[0].center);
  const [isScanning, setIsScanning] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const [decision, setDecision] = useState<StructuredSuggestion>({
    title: "系统就绪", status: "等待特征输入...", analysis: "请通过左侧面板载入轨迹点，构建全息态势基底。", actions: ["载入轨迹数据", "启动智能拟合", "执行 AI 推演"]
  });

  const [currentPoints, setCurrentPoints] = useState<TrajectoryPoint[]>(PRESET_SCENARIOS.walk);
  const [predictedMode, setPredictedMode] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [placeInput, setPlaceInput] = useState('');
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [featureWeights, setFeatureWeights] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const [macroStats, setMacroStats] = useState<{total: number, dist: Record<string, number>} | null>(null);
  const [selectedMacroKey, setSelectedMacroKey] = useState<string | null>(null);
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [compareResults, setCompareResults] = useState<any>(null);

  const [activeModel, setActiveModel] = useState<string>('exp3');
  const ENGINES = [
    { id: 'exp1', name: 'EXP-1', detail: '纯轨迹运动特征' },
    { id: 'exp2', name: 'EXP-2', detail: '+ 空间语义映射' },
    { id: 'exp3', name: 'EXP-3', detail: '全维融合 (SOTA)' },
    { id: 'exp4', name: 'EXP-4', detail: '+ Focal Loss' }
  ];

  // 🛡️ 所有 Hook 全部安全放在这里！
  useEffect(() => {
    (window as any)._AMapSecurityConfig = { securityJsCode: '0fb0f8fa5a04a38e318d1ad5c87e3b97' };
  }, []);

  useEffect(() => {
    if (historyId && user) {
      const loadHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const res = await fetchWithAuth(`/api/history/${historyId}`);
          if (!res.ok) throw new Error("无法读取历史档案");
          const data = await res.json();
          setCurrentPoints(data.trajectory_points);
          setPredictedMode(data.predicted_mode);
          setConfidence(Math.round(data.confidence * 100));
          setFeatureWeights(Object.keys(data.feature_weights).map(k => ({ name: k, value: Math.round(Number(data.feature_weights[k])) })));
          setMacroStats(null);
          setDecision({
            title: `档案 #${historyId} 全息回溯`, status: "数据已复现",
            analysis: `${activeModel.toUpperCase()} 模型成功从云端档案回溯出原始轨迹，并校验了当时的交通模式为: ${data.predicted_mode}。`, actions: ["查看特征权重", "执行假设性分析"]
          });
        } catch (err: any) { setError(err.message); } 
        finally { setIsHistoryLoading(false); }
      };
      loadHistory();
    }
  }, [historyId, user, activeModel]);

const handleMissionChange = (mission: typeof MISSIONS[0]) => {
    // 1. 立即重置 UI 状态，确保交互响应
    setActiveTab('presets'); 
    setActiveMission(mission); 
    setMapCenter(mission.center); // 这里改变 center 会触发 Map.tsx 里的 panTo
    
    // 2. 清理之前的预测结果与错误信息
    setPredictedMode(null); 
    setMacroStats(null); 
    setError(''); 
    setCompareResults(null);
    
    // 3. 开启扫描动效并清空当前路径点
    setIsScanning(true); 
    setCurrentPoints([]); 
    
    setTimeout(() => {
      // 4. 载入对应场景的预设轨迹
      const scenarioData = PRESET_SCENARIOS[mission.defaultKey as keyof typeof PRESET_SCENARIOS];
      if (scenarioData) {
        setCurrentPoints(scenarioData);
      }
      
      setIsScanning(false);
      
      // 5. 更新决策简报文案
      setDecision({
        title: mission.name, 
        status: "场景沙盘已加载",
        analysis: `已锁定核心区域沙盘，全息装载该场景的典型采样轨迹，准备进行 AI 决策推演。`, 
        actions: ["启动 AI 推演", "观察特征贡献"]
      });

      if (window.location.search.includes('id=')) {
        window.history.replaceState(null, '', '/predict');
      }
    }, 1000);
  };

  const loadNewPoints = (points: TrajectoryPoint[]) => {
    setCurrentPoints(points); setPredictedMode(null); setConfidence(0);
    setFeatureWeights([]); setMacroStats(null); setError(''); setCompareResults(null);
    if (window.location.search.includes('id=')) {
      window.history.replaceState(null, '', '/predict');
    }
  };

  const handleSearchPlace = () => {
    if (!placeInput.trim()) return;
    setIsSearchingPlace(true); setError('');
    if (!(window as any).AMap || !(window as any).AMap.Geocoder) {
      setError("❌ 地图引擎尚未就绪，请尝试刷新。"); setIsSearchingPlace(false); return;
    }
    (window as any).AMap.plugin('AMap.Geocoder', function() {
      const geocoder = new (window as any).AMap.Geocoder({ city: "全国" });
      geocoder.getLocation(placeInput, function(status: string, result: any) {
        setIsSearchingPlace(false);
        if (status === 'complete' && result.geocodes.length > 0) {
          const { lng, lat } = result.geocodes[0].location;
          setManualText(prev => prev.trim() ? `${prev.trim()}\n${lng}, ${lat}` : `${lng}, ${lat}`);
          setPlaceInput(''); 
        } else { setError(`❌ 地名嗅探失败。`); }
      });
    });
  };

  const handleManualParse = () => {
    try {
      setError('');
      const normalizedText = manualText.replace(/，/g, ',');
      const lines = normalizedText.split(/;|\r?\n/).filter(p => p.trim() !== '');
      const rawPoints = lines.map((line) => {
        const parts = line.split(',').map(n => parseFloat(n.trim()));
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) throw new Error(`坐标格式错误`);
        return { lng: parts[0], lat: parts[1] };
      });
      const trajectory = generateTrajectoryFromPoints(rawPoints, autoGenerate);
      loadNewPoints(trajectory);
    } catch (e: any) { setError(e.message); }
  };

  const handlePredict = async () => {
    setIsPredicting(true); setPredictedMode(null); setMacroStats(null); setError(''); setSelectedMacroKey(null);
    setCompareResults(null);
    
    try {
      const mainPredictPromise = fetchWithAuth('/api/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ points: currentPoints, model_type: activeModel })
      });

      const comparePromise = fetchWithAuth('/api/predict/compare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ points: currentPoints, model_types: ["exp1", "exp2", "exp3", "exp4"] })
      });

      const [mainRes, compareRes] = await Promise.all([mainPredictPromise, comparePromise]);
      
      const mainText = await mainRes.text();
      const compareText = await compareRes.text();
      const data = JSON.parse(mainText);
      const compareData = JSON.parse(compareText);

      if (!mainRes.ok) throw new Error(`主引擎预测失败`);
      
      const mode = data.predicted_mode || data.data?.predicted_mode || "Unknown";
      const conf = data.confidence || data.data?.confidence || 0;
      const fWeights = data.feature_weights || data.data?.feature_weights || {};
      const mStats = data.macro_stats || data.data?.macro_stats || null;

      setPredictedMode(mode);
      setConfidence(Math.round(conf * 100));
      setFeatureWeights(Object.entries(fWeights).map(([n, v]) => ({ name: n, value: Number(v) })));
      if (mStats) setMacroStats(mStats);

      if (compareRes.ok && compareData.status === 'success') {
        setCompareResults(compareData.comparisons);
      }

      // 🛡️ 加上安全问号
      const isInvalid = mode?.includes('Invalid') || mode?.includes('INVALID');
      setDecision({
        title: isInvalid ? "🚨 物理守卫拦截" : `${mode} 推演成功`,
        status: isInvalid ? "异常数据报警" : "态势分析中",
        analysis: isInvalid 
           ? "检测到物理常识违例脏数据，判定为传感器故障，已触发安全拦截机制。" 
           : `${activeModel.toUpperCase()} 模型将此轨迹识别为【${mode}】。同时已调度全线模型进行防线审计。系统已联动区域流量进行宏观态势评估。`,
        actions: isInvalid ? ["拦截异常特征流"] : ["执行对应市政治理建议", "钻取宏观流量详情", "查看消融实验联防报告"]
      });
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setIsPredicting(false); 
    }
  };

  // 🛡️ 拦截必须在所有 Hooks 之后！
  if (authLoading || !user) return <div className="text-center mt-20 text-[#00f0ff] font-bold text-xl tracking-widest animate-pulse">系统权限核准中...</div>;

  return (
    <div className="max-w-[1500px] mx-auto pb-12 pt-8 exp2-bg-container min-h-[85vh]">
      <AdviceModal isOpen={isAdviceModalOpen} onClose={() => setIsAdviceModalOpen(false)} mode={predictedMode} confidence={confidence} />

      <div className="mb-6 border-b border-[#00f0ff]/20 pb-4 relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#00f0ff] rounded-r"></div>
        <h2 className="text-3xl font-bold exp2-title flex items-center gap-3 pl-4">
          TrafficRec v2.0 <span className="text-xs text-[#00f0ff] font-mono border border-[#00f0ff]/50 px-2 py-0.5 rounded transition-all">{activeModel.toUpperCase()} 核心</span>
        </h2>
        <p className="text-slate-400 mt-2 ml-4 tracking-wider text-sm">全息时空态势感知与模型审计工作台</p>
      </div>

      {error && <div className="mb-4 p-4 rounded-lg bg-red-900/40 border border-red-500/50 text-red-400 text-sm shadow-md flex items-center gap-3">⚠️ {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="exp2-glass-card p-5 relative overflow-hidden group">
            <h3 className="text-[#00f0ff] font-black text-sm mb-3 tracking-widest uppercase">STAGE 1: 确立业务审计课题</h3>
            <div className="flex flex-col gap-2">
              {MISSIONS.map(m => (
                <button key={m.id} onClick={() => handleMissionChange(m)} disabled={isScanning}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-all border ${activeMission.id === m.id ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-white' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}>
                  {m.name}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-slate-800 rounded text-xs text-slate-300 leading-relaxed border border-slate-700">【业务课题简报】{activeMission.briefing}</div>
          </div>

          <div className="exp2-glass-card p-5 flex flex-col relative overflow-hidden">
            <h3 className="text-[#0070f3] font-black text-sm mb-3 tracking-widest uppercase">STAGE 2: 目标时空特征侦测</h3>
            <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
              {['presets', 'upload', 'manual'].map((tab) => (
                <button key={tab} disabled={isPredicting || isScanning} onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === tab ? 'bg-[#00f0ff] text-slate-900' : 'text-slate-400'}`}>
                  {tab === 'presets' ? '调取样本库' : tab === 'upload' ? '本地导入' : '特征发生器'}
                </button>
              ))}
            </div>
            <div className="min-h-[140px]">
              {activeTab === 'presets' && <div className="text-center py-6 font-bold text-slate-300 uppercase">[ 已锁定演示轨迹 ]</div>}
              {activeTab === 'upload' && <TrajectoryUpload onUploadSuccess={loadNewPoints} />}
              {activeTab === 'manual' && (
                <div className="flex flex-col h-full gap-3">
                  <input type="text" className="bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white" placeholder="地名智能嗅探..." value={placeInput} onChange={e => setPlaceInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchPlace()} />
                  <textarea className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-xs font-mono text-slate-300 resize-none" value={manualText} onChange={e => setManualText(e.target.value)} placeholder="填入精准经纬度..." />
                  <button onClick={handleManualParse} className="py-1.5 px-4 bg-[#00f0ff]/10 text-[#00f0ff] text-xs font-bold rounded border border-[#00f0ff]/30">投射至态势沙盘</button>
                </div>
              )}
            </div>
          </div>

          <div className="exp2-glass-card p-5 relative overflow-hidden flex flex-col group border-[#00f0ff]/20 hover:border-[#00f0ff]/50 transition-colors">
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#a855f7] opacity-40"></div>
            
            <h3 className="text-[#a855f7] font-black text-sm mb-4 tracking-widest uppercase flex items-center gap-2">
               <span className="animate-pulse">⚡</span> STAGE 3: 核心算力引擎调度
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ENGINES.map(eng => {
                const isActive = activeModel === eng.id;
                const isSota = eng.id === 'exp3';
                return (
                  <div key={eng.id} onClick={() => setActiveModel(eng.id)} className={`cursor-pointer p-3 rounded-lg border transition-all flex flex-col items-center justify-center text-center relative ${isActive ? (isSota ? 'bg-[#00f0ff]/10 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#a855f7]/10 border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.2)]') : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}>
                     {isSota && isActive && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f0ff]"></span></span>}
                     <span className={`font-black font-mono text-sm tracking-wider ${isActive ? (isSota ? 'text-[#00f0ff]' : 'text-[#a855f7]') : 'text-slate-400'}`}>{eng.name}</span>
                     <span className={`text-[9px] mt-1 tracking-widest uppercase ${isActive ? 'text-white' : 'text-slate-500'}`}>{eng.detail}</span>
                  </div>
                )
              })}
            </div>

            <button onClick={handlePredict} disabled={isPredicting || currentPoints.length < 2 || isScanning}
              className="w-full py-4 bg-gradient-to-r from-[#0070f3] to-[#00f0ff] text-[#010a18] text-base tracking-widest font-black rounded shadow-[0_0_15px_rgba(0,112,243,0.5)] hover:scale-[1.02] active:scale-95 transition-all">
              {isPredicting ? "城市大脑全维推演中..." : "STAGE 4: 启动态势推演与审计"}
            </button>
          </div>

        </div>

        <div className="lg:col-span-8 exp2-glass-card p-1 relative min-h-[500px] border border-blue-500/20 shadow-[0_0_30px_rgba(0,240,255,0.05)]overflow-hidden">
          <Map points={currentPoints.map(p => ({lng: p.lng, lat: p.lat}))} center={mapCenter} predictedMode={predictedMode} />          
        </div>
      </div>

  <AnimatePresence>
    {predictedMode && (
      <motion.div
        key="predicted-mode-panel"  // ✅ 添加唯一 key
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="exp2-glass-card p-8 border-t-4 border-[#00f0ff] mb-12 relative overflow-hidden"
      >
        <MacroDetailPanel modeKey={selectedMacroKey} onClose={() => setSelectedMacroKey(null)} />

        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 tracking-widest">
          📑 城市大脑 <span className="text-[#00f0ff]">{activeModel.toUpperCase()}</span> 决策简报
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 bg-[rgba(2,10,28,0.6)] p-6 rounded-xl border border-[#00f0ff]/20 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-2xl"></div>
            <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">核心锚点轨迹识别为</p>
            <h4 className="text-4xl font-black text-[#00f0ff] uppercase tracking-wider drop-shadow-[0_0_10px_#00f0ff]">{predictedMode}</h4>
            <div className="mt-4"><ConfidenceRing confidence={confidence} /></div>
            
            {/* 🛡️ 加上安全问号 */}
            {!predictedMode?.includes('Invalid') && (
              <button onClick={() => setIsAdviceModalOpen(true)} className="mt-8 w-full py-2.5 bg-gradient-to-r from-[#00f0ff]/20 to-[#0070f3]/20 border border-[#00f0ff]/50 text-[#00f0ff] font-bold tracking-widest text-sm rounded hover:from-[#00f0ff] hover:to-[#0070f3] hover:text-white hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] transition-all z-10 flex items-center justify-center gap-2">
                <span className="animate-pulse">⚡</span> 查看深度通勤建议
              </button>
            )}
          </div>
          
          <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div><p className="text-[#00f0ff] text-sm font-bold mb-2 border-l-4 border-[#00f0ff] pl-3">态势评估</p><p className="text-slate-300 text-sm bg-slate-800 p-4 rounded-lg">{decision.analysis}</p></div>
              <div><p className="text-[#00f0ff] text-sm font-bold mb-2 border-l-4 border-[#00f0ff] pl-3">市政治理建议 ({activeModel.toUpperCase()} 联合推演)</p>
                <ul className="text-slate-300 text-sm space-y-2 bg-slate-800 p-4 rounded-lg">
                    {decision.actions.map((act, i) => (<li key={i} className="flex items-start gap-2">▸ {act}</li>))}
                </ul>
              </div>
            </div>
            <div className="h-full bg-slate-800 p-4 rounded-lg flex flex-col justify-center">
              <p className="text-[#00f0ff] text-sm font-bold text-center mb-4 uppercase tracking-widest">特征决策权重</p>
              <div className="h-[200px] w-full"><FeatureChart data={featureWeights} /></div>
            </div>
          </div>

          {/* 🛡️ 加上安全问号 */}
          {macroStats && !predictedMode?.includes('Invalid') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-1 md:col-span-4 bg-[rgba(15,23,42,0.8)] p-8 rounded-xl border border-[#0070f3]/40 mt-4 shadow-[0_0_30px_rgba(0,112,243,0.15)]">
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-700 pb-4 gap-4">
                <div>
                    <h4 className="text-[#00f0ff] font-bold tracking-widest text-xl uppercase">🌐 区域宏观流量实时态势感知图谱</h4>
                    <p className="text-xs text-slate-500 mt-1">关联此轨迹的宏观流量伴随分析。点击卡片可钻取特定方式详情。</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1 tracking-widest">后台解析总样本量</p>
                  <span className="text-2xl font-black text-[#00f0ff] font-mono drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                    <AnimatedNumber value={macroStats.total} /> <span className="text-sm font-normal text-slate-500">条关联轨迹</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(macroStats.dist).map(([key, val], idx) => (
                    <div key={key} onClick={() => setSelectedMacroKey(key)}
                      className={`bg-[rgba(2,10,28,0.5)] p-5 rounded-lg border transition-all cursor-pointer group flex flex-col justify-between h-32
                                  ${selectedMacroKey === key ? 'border-[#00f0ff] shadow-[0_0_15px_#00f0ff]' : 'border-[rgba(0,240,255,0.1)] hover:border-[#00f0ff]/50'}`}>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest group-hover:text-[#00f0ff]">{key}</p>
                      <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                            <AnimatedNumber value={val as number} />
                            <span className="text-xl text-slate-500">%</span>
                          </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden relative border border-slate-700">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }} 
                            className={`h-full absolute left-0 top-0 rounded-full ${(val as number) > 50 ? 'bg-gradient-to-r from-red-500 to-yellow-400' : 'bg-gradient-to-r from-[#0070f3] to-[#00f0ff]'}`}>
                            <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-pulse"></div>
                          </motion.div>
                      </div>
                    </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    )}
    
    {/* 🛡️ 加上安全问号 */}
    {compareResults && predictedMode && !predictedMode?.includes('Invalid') && (
      <motion.div
        key="compare-results-panel"  // ✅ 添加唯一 key
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="col-span-1 md:col-span-4 bg-[rgba(6,18,46,0.6)] p-8 rounded-xl border border-[#00f0ff]/30 mt-4 shadow-[0_0_20px_rgba(0,240,255,0.05)] backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
          <span className="text-2xl animate-pulse">🛰️</span>
          <div>
            <h4 className="text-[#00f0ff] font-bold tracking-widest text-lg uppercase">多维消融实验实时联防审计</h4>
            <p className="text-xs text-slate-500 font-mono mt-1">Exp1-Exp4 Concurrent Inference Validation</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {["exp1", "exp2", "exp3", "exp4"].map((modelKey, idx) => {
            const res = compareResults[modelKey];
            if (!res) return null;
            const isCurrent = modelKey === activeModel; 
            
            return (
              <div key={modelKey} className={`relative p-5 rounded-lg border transition-all ${isCurrent ? 'bg-[rgba(0,240,255,0.05)] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)] scale-105 z-10' : 'bg-slate-900/50 border-slate-700'}`}>
                {isCurrent && <div className="absolute top-0 right-0 bg-[#00f0ff] text-[#010a18] text-[10px] font-black px-2 py-1 rounded-bl-lg tracking-widest z-10">当前主视角</div>}
                <h5 className={`text-xs font-mono uppercase mb-3 ${isCurrent ? 'text-[#00f0ff]' : 'text-slate-400'}`}>
                  {modelKey.replace('exp', 'Experiment ')}
                </h5>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Predicted</span>
                  <span className={`text-xl font-black tracking-wider ${isCurrent ? 'text-white drop-shadow-[0_0_5px_#fff]' : 'text-slate-300'}`}>
                    {res.predicted_mode}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1 relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${res.confidence * 100}%` }} transition={{ duration: 1, delay: 0.8 + idx * 0.1 }}
                    className={`h-full absolute left-0 top-0 rounded-full ${isCurrent ? 'bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]' : 'bg-slate-500'}`} />
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400">Conf: {(res.confidence * 100).toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
        <button 
          onClick={() => router.push('/insights/accuracy')}
          className="mt-6 w-full py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-bold tracking-widest hover:bg-[#00f0ff]/20 transition-all"
        >
          &gt;&gt; 查看 Exp1-Exp4 详细消融实验报告
        </button>
      </motion.div>
    )}
  </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 🌟 页面骨架与导航
// ============================================================================
export default function PredictPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setCurrentTime(`${dateStr} ${timeStr}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#010a18] text-white overflow-hidden flex flex-col font-sans relative">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      
      <header className="relative w-full flex flex-col justify-center items-center pt-4 mb-6 z-20">
        <div className="relative w-full flex justify-center items-center h-16">
           <div className="absolute top-0 w-[55%] h-14 bg-[rgba(10,30,60,0.8)] border-b-2 border-[#00f0ff]" style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)' }}></div>
           <h1 className="relative z-10 text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
             交通轨迹智算大屏分析平台
           </h1>
           <div className="absolute right-8 top-1 text-[#00f0ff] font-mono flex items-center gap-4 bg-[rgba(6,18,46,0.8)] px-5 py-2 border border-[#113d6a] rounded shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]">
              <span className="text-sm text-slate-300 font-bold tracking-wider">{currentTime.split(' ')[0] || 'YYYY-MM-DD'}</span>
              <div className="w-[1px] h-6 bg-slate-600"></div>
              <span className="text-3xl font-black drop-shadow-[0_0_8px_#00f0ff] min-w-[140px] text-right">{currentTime.split(' ')[1] || '00:00:00'}</span>
           </div>
        </div>

        <div className="flex gap-8 mt-2 text-sm font-bold text-slate-400 font-mono tracking-widest relative z-20 bg-[rgba(6,18,46,0.6)] px-10 py-2 border border-[#00f0ff]/30 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.1)] backdrop-blur-md">
          <span onClick={() => router.push('/')} className="hover:text-white hover:drop-shadow-[0_0_5px_#fff] cursor-pointer transition-all pb-1 border-b-2 border-transparent hover:border-white">全局大屏总览 (Dashboard)</span>
          <span className="text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1 drop-shadow-[0_0_5px_#00f0ff] cursor-default">全息态势感知 (Awareness)</span>
          <span onClick={() => router.push('/insights/accuracy')} className="hover:text-white hover:drop-shadow-[0_0_5px_#fff] cursor-pointer transition-all pb-1 border-b-2 border-transparent hover:border-white">模型精度审计 (Audit)</span>
          <span onClick={() => router.push('/insights/architecture')} className="hover:text-white hover:drop-shadow-[0_0_5px_#fff] cursor-pointer transition-all pb-1 border-b-2 border-transparent hover:border-white">时空特征引擎 (Features)</span>
        </div>
      </header>

      <Suspense fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-[#00f0ff] gap-4 relative z-10">
          <div className="w-12 h-12 border-4 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-xl tracking-widest animate-pulse"> 视觉感知引擎初始化中...</p>
        </div>
      }>
        <div className="relative z-10">
          <PredictContent />
        </div>
      </Suspense>
      
      <div className="mt-8 mb-4 text-center text-slate-600 text-xs font-mono relative z-10">
        TrafficRec Holo-态势感知工作台 | 基于 58D 时空特征融合与 Macro-Concomitant 分析闭环
      </div>
    </div>
  );
}