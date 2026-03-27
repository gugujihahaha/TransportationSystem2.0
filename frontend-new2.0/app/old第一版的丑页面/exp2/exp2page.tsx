"use client";
declare global {
  interface Window {
    AMap: any;
  }
}
import { MD5 } from 'crypto-js'; // 需要安装 crypto-js
import { Variants } from 'framer-motion';
// 生成高德地图请求签名
const generateAMapSig = (params: Record<string, string>, secretKey: string): string => {
  // 1. 按字典序排序参数
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 2. 拼接安全密钥
  const strToSign = `${sortedParams}${secretKey}`;
  
  // 3. MD5 加密得到 sig
  return MD5(strToSign).toString();
};
if (typeof window !== 'undefined' && !window.AMap) {
  const script = document.createElement('script');
  script.src = `https://webapi.amap.com/maps?v=2.0&key=f767f1bd274ac75111bbffd9b7995a48`;
  script.async = true; // 异步加载，不阻塞页面渲染
  script.defer = true; // 延迟执行，等DOM加载完再初始化
  script.crossOrigin = 'anonymous';
  // 👇 关键：强制缓存SDK，30天内不用重复下载
  script.setAttribute('cache-control', 'max-age=2592000');
  document.head.appendChild(script);
}
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
// 🔥 彻底删除 HorizontalBarChart、HorizontalBar，仅保留Recharts支持的组件
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, ReferenceLine
} from 'recharts';
// FontAwesome 相关导入（正确）
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faExclamationTriangle, faCheckCircle, faArrowUp, faChevronDown,
  faCircleExclamation, faRoute, faBrain, faClock, faAward,
  faShield, faBullseye, faZap, faDatabase
} from '@fortawesome/free-solid-svg-icons';
import TrajectoryPredictor from '@/components/TrajectoryPredictor';
// 初始化FontAwesome图标库
library.add(
  faExclamationTriangle, faCheckCircle, faArrowUp, faChevronDown,
  faCircleExclamation, faRoute, faBrain, faClock, faAward,
  faShield, faBullseye, faZap, faDatabase
);

// ===================== 轨迹地图数据配置 =====================
// 模拟6类轨迹的高德地图坐标点（可根据实际需求调整）
const trajectoryMapData = {
  walk: {
    name: "步行到地铁站（1km）",
    path: [
      [116.397428, 39.90923], // 起点：天安门
      [116.407428, 39.90923], // 中点
      [116.417428, 39.90923]  // 终点：王府井地铁站
    ],
    startName: "天安门",
    endName: "王府井地铁站",
    color: "#00f0ff"
  },
  bike: {
    name: "骑行2公里到公交站",
    path: [
      [116.387428, 39.91923],
      [116.397428, 39.91423],
      [116.407428, 39.90923]
    ],
    startName: "西单",
    endName: "天安门东公交站",
    color: "#00a0ff"
  },
  bus: {
    name: "公交5路转地铁2号线",
    path: [
      [116.377428, 39.92923],
      [116.387428, 39.91923],
      [116.397428, 39.90923],
      [116.407428, 39.90423]
    ],
    startName: "复兴门",
    endName: "崇文门地铁站",
    color: "#0080ff"
  },
  subway: {
    name: "地铁3号线通勤（5站）",
    path: [
      [116.427428, 39.90923],
      [116.437428, 39.91423],
      [116.447428, 39.91923],
      [116.457428, 39.92423],
      [116.467428, 39.92923]
    ],
    startName: "东单",
    endName: "三元桥",
    color: "#0060ff"
  },
  car: {
    name: "私家车上下班（10km）",
    path: [
      [116.307428, 39.90923],
      [116.337428, 39.91423],
      [116.367428, 39.91923],
      [116.397428, 39.92423]
    ],
    startName: "石景山",
    endName: "朝阳区CBD",
    color: "#0040ff"
  },
  taxi: {
    name: "网约车出行（机场接送）",
    path: [
      [116.507428, 39.90923],
      [116.477428, 39.91423],
      [116.447428, 39.91923],
      [116.417428, 39.92423]
    ],
    startName: "首都机场",
    endName: "东直门",
    color: "#0020ff"
  }
};

// ===================== 原有业务逻辑 =====================
const bestModelMeta = {
  id: "exp2",
  name: "轨迹+基础知识图谱融合模型",
  accuracy: 79.49,
  precision: 98.2,
  recall: 97.8,
  f1Score: 98.0,
  supportTypes: ["步行", "骑行", "公交", "地铁", "私家车", "网约车"],
  applicableScenarios: [
    "城市交通流量分析", 
    "出行行为研究", 
    "智慧交通调度", 
    "碳排放计算",
    "公共交通优化",
    "出行推荐系统"
  ],
  solveProblems: [
{ text: "传统GPS轨迹识别准确率低（仅69.6%）的问题", icon: <FontAwesomeIcon icon={faBullseye} className="text-red-400" /> },
    { text: "复杂场景下（如公交/地铁换乘）识别混淆的问题", icon: <FontAwesomeIcon icon={faRoute} className="text-red-400" /> },
    { text: "缺乏先验知识导致抗干扰能力弱的问题", icon: <FontAwesomeIcon icon={faShield} className="text-red-400" /> },
    { text: "多交通方式混合识别效率低的问题", icon: <FontAwesomeIcon icon={faZap} className="text-red-400" /> }
  ]
};

const modelParams = [
  { key: "核心架构", value: "CNN+LSTM 时空融合模型", desc: "CNN提取空间特征，LSTM捕捉时间序列特征" },
  { key: "输入特征维度", value: "128维", desc: "GPS轨迹(64维)+KG道路/规则特征(64维)" },
  { key: "训练迭代次数", value: "100 epochs", desc: "收敛稳定，无过拟合" },
  { key: "批处理大小", value: "32", desc: "平衡训练效率与内存占用" },
  { key: "优化器", value: "Adam (lr=0.001)", desc: "自适应学习率，收敛速度快" },
  { key: "推理耗时", value: "20ms/条", desc: "满足实时识别需求" },
  { key: "KG特征维度", value: "11维", desc: "道路类型、站点距离等先验知识特征" },
  { key: "数据集规模", value: "10万+轨迹样本", desc: "覆盖6类交通方式的真实场景数据" }
];

const comparisonData = [
  { name: "Exp2（轨迹+KG）", accuracy: 79.49, advantage: "+9.89%", color: "#00f0ff" },
  { name: "Exp3（增强KG）", accuracy: 78.25, advantage: "-1.24%", color: "#00a0ff" },
  { name: "Exp4（+天气特征）", accuracy: 74.80, advantage: "-4.69%", color: "#0080ff" },
  { name: "Exp1（仅轨迹）", accuracy: 69.60, advantage: "-9.89%", color: "#0060ff" },
  { name: "Exp5（弱监督）", accuracy: 64.01, advantage: "-15.48%", color: "#0040ff" },
];

const kgFeatures = [
  { name: "道路类型独热编码", desc: "区分主干道/次干道/支路/步行街，辅助识别步行/骑行" },
  { name: "最近公交站距离", desc: "近距离特征显著提升公交/步行识别准确率" },
  { name: "最近地铁站距离", desc: "核心特征，解决地铁识别混淆问题" },
  { name: "最近火车站距离", desc: "辅助区分长途/短途交通方式" },
  { name: "道路密度", desc: "高密度区域更易出现步行/公交，低密度多为私家车" },
  { name: "路网复杂度", desc: "复杂路网提升换乘场景识别精度" },
  { name: "交通管制规则", desc: "限行/禁行区域规则约束识别结果" },
  { name: "POI密度", desc: "商圈/办公区POI密度辅助判断出行目的与方式" },
  { name: "平均车速限制", desc: "速度阈值区分高速/低速交通方式" },
  { name: "车道数量", desc: "多车道更可能是私家车/公交，少车道多为骑行/步行" },
  { name: "是否允许停车", desc: "辅助识别私家车/网约车临时停靠行为" }
];

const f1ComparisonData = [
  { name: "Walk", exp1: 0.72, exp2: 0.92 },
  { name: "Bike", exp1: 0.68, exp2: 0.91 },
  { name: "Bus", exp1: 0.65, exp2: 0.88 },
  { name: "Subway", exp1: 0.51, exp2: 0.85 },
  { name: "Car & taxi", exp1: 0.78, exp2: 0.95 },
  { name: "Train", exp1: 0.45, exp2: 0.80 }
];

const exampleTrajectories = [
  { id: 1, label: "步行到地铁站（1km）", value: "walk", trueLabel: "步行" },
  { id: 2, label: "骑行2公里到公交站", value: "bike", trueLabel: "骑行" },
  { id: 3, label: "公交5路转地铁2号线", value: "bus", trueLabel: "公交" },
  { id: 4, label: "地铁3号线通勤（5站）", value: "subway", trueLabel: "地铁" },
  { id: 5, label: "私家车上下班（10km）", value: "car", trueLabel: "私家车" },
  { id: 6, label: "网约车出行（机场接送）", value: "taxi", trueLabel: "网约车" }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } }
} as const;

export default function Exp2Page() {
  const [selectedTrajectory, setSelectedTrajectory] = useState<string>("");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showToTopBtn, setShowToTopBtn] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false); // 地图加载状态
  const mapRef = useRef<HTMLDivElement>(null); // 地图容器ref
  const amapRef = useRef<any>(null); // 高德地图实例ref

  // ===================== 高德地图初始化逻辑 =====================
  useEffect(() => {
    // 加载高德地图JS API
    const loadAMap = () => {
      if (window.AMap) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=f767f1bd274ac75111bbffd9b7995a48`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => console.error('高德地图加载失败');
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    // 初始化地图
    const initMap = () => {
      if (!mapRef.current) return;
      
      // 创建地图实例
      const map = new window.AMap.Map(mapRef.current, {
        zoom: 12, // 初始缩放级别
        center: [116.397428, 39.90923], // 初始中心点（北京）
        resizeEnable: true,
        mapStyle: 'amap://styles/darkblue', // 深色风格，适配页面主题
        showLabel: true
      });

      amapRef.current = map;
      setMapLoaded(true);

      // 添加地图控件
      map.addControl(new window.AMap.Scale());
      map.addControl(new window.AMap.Zoom({ position: 'RB' }));
    };

    loadAMap();

    // 滚动监听逻辑
    const handleScroll = () => {
      setShowToTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // 销毁地图实例
      if (amapRef.current) {
        amapRef.current.destroy();
      }
    };
  }, []);

  // ===================== 轨迹选择后更新地图 =====================
  useEffect(() => {
    if (!mapLoaded || !selectedTrajectory || !amapRef.current) return;

    // 清空地图上的覆盖物
    amapRef.current.clearMap();

    const trajectory = trajectoryMapData[selectedTrajectory as keyof typeof trajectoryMapData];
    if (!trajectory) return;

    // 设置地图中心点和缩放级别
    amapRef.current.setCenter(trajectory.path[Math.floor(trajectory.path.length / 2)]);
    amapRef.current.setZoom(14);

    // 绘制轨迹线
    const polyline = new window.AMap.Polyline({
      path: trajectory.path,
      strokeColor: trajectory.color,
      strokeWeight: 6,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      zIndex: 50
    });
    polyline.addTo(amapRef.current);

    // 添加起点标记
    const startMarker = new window.AMap.Marker({
      position: trajectory.path[0],
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(30, 30),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
        imageSize: new window.AMap.Size(30, 30)
      }),
      title: `起点: ${trajectory.startName}`,
      zIndex: 100
    });
    startMarker.addTo(amapRef.current);

    // 添加终点标记
    const endMarker = new window.AMap.Marker({
      position: trajectory.path[trajectory.path.length - 1],
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(30, 30),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
        imageSize: new window.AMap.Size(30, 30)
      }),
      title: `终点: ${trajectory.endName}`,
      zIndex: 100
    });
    endMarker.addTo(amapRef.current);

    // 添加轨迹名称信息窗
    const infoWindow = new window.AMap.InfoWindow({
      content: `<div style="color:#fff; background:rgba(0,112,243,0.8); padding:8px; border-radius:6px;">
                  <strong>${trajectory.name}</strong>
                </div>`,
      position: trajectory.path[Math.floor(trajectory.path.length / 2)],
      offset: new window.AMap.Pixel(0, -30)
    });
    infoWindow.open(amapRef.current);

    // 预测结果展示时添加识别结果标记
    if (predictionResult) {
      const resultMarker = new window.AMap.Marker({
        position: trajectory.path[Math.floor(trajectory.path.length / 2)],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(40, 40),
          image: `https://webapi.amap.com/theme/v1.3/markers/b/${
            predictionResult.predicted === predictionResult.trueLabel ? 'green' : 'red'
          }_circle.png`,
          imageSize: new window.AMap.Size(40, 40)
        }),
        title: `识别结果: ${predictionResult.predicted} (置信度: ${predictionResult.confidence}%)`,
        zIndex: 150
      });
      resultMarker.addTo(amapRef.current);

      // 添加识别结果信息窗
      const resultInfoWindow = new window.AMap.InfoWindow({
        content: `<div style="color:#fff; background:rgba(0,240,255,0.9); padding:10px; border-radius:8px; min-width:200px;">
                    <div><strong>识别结果:</strong> ${predictionResult.predicted}</div>
                    <div><strong>置信度:</strong> ${predictionResult.confidence}%</div>
                    <div><strong>真实类型:</strong> ${predictionResult.trueLabel}</div>
                  </div>`,
        position: trajectory.path[Math.floor(trajectory.path.length / 2)],
        offset: new window.AMap.Pixel(0, -50)
      });
      resultInfoWindow.open(amapRef.current, resultMarker);
    }
  }, [selectedTrajectory, predictionResult, mapLoaded]);

  // ===================== 原有接口调用逻辑 =====================
  const handlePredict = async () => {
    if (!selectedTrajectory) {
      alert("请选择示例轨迹！");
      return;
    }
    
    const selectedItem = exampleTrajectories.find(item => item.value === selectedTrajectory);
    if (!selectedItem) return;

    setLoading(true);
    setPredictionResult(null);
    
    try {
      // ========== 接口 ==========
      const response = await fetch(`/api/exp2-report`, {
        method: 'POST', // 必须和后端接口的POST对应
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trajectoryId: selectedItem.id,
          trueLabel: selectedItem.trueLabel
        })
      });

      if (!response.ok) throw new Error(`接口返回错误: ${response.status}`);
      
      const data = await response.json();
      setPredictionResult({
        predicted: data.predictedLabel,
        confidence: data.confidence.toFixed(1),
        trueLabel: selectedItem.trueLabel,
        probability: data.probability,
        inferenceTime: data.inferenceTime
      });
    } catch (error) {
      console.error("预测接口调用失败:", error);
      alert("接口调用失败，请检查后端服务！");
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderConfidenceRing = (confidence: string) => {
    const percent = parseFloat(confidence);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - percent / 100);
    
    return (
      <div className="relative w-36 h-36 mx-auto">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="url(#confidenceGradient)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            className="transition-all duration-1500 ease-out"
          />
          <defs>
            <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0070f3" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>
          </defs>
          <text x="70" y="75" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
            {percent}%
          </text>
          <text x="70" y="95" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12">
            置信度
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[rgba(5,10,30,0.95)] text-white py-10 px-2 md:px-6 lg:px-8 exp2-bg-container">
      <svg className="fixed inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 300Q250 200 500 300T1000 300" stroke="url(#exp2Gradient)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M0 250Q250 150 500 250T1000 250" stroke="url(#exp2Gradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 5"/>
        <path d="M0 350Q250 450 500 350T1000 350" stroke="url(#exp2Gradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 5"/>
        {[...Array(15)].map((_, i) => (
          <circle 
            key={i} 
            cx={100 + i * 70} 
            cy={300 + (i % 2 === 0 ? -50 : 50)} 
            r={2 + i % 4} 
            fill="#00f0ff"
          >
            <animate 
              attributeName="cx" 
              values={`${100 + i * 70};${900 - i * 40};${100 + i * 70}`} 
              dur={`10 + ${i}s`} 
              repeatCount="indefinite"
            />
          </circle>
        ))}
        <defs>
          <linearGradient id="exp2Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0070f3"/>
            <stop offset="100%" stopColor="#00f0ff"/>
          </linearGradient>
        </defs>
      </svg>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 w-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* 原有头部内容 */}
        <motion.section variants={item} className="mb-12 text-center w-full">
          <div className="inline-flex items-center gap-3 mb-6 justify-center">
            <div className="w-1.5 h-10 bg-gradient-to-b from-[#0070f3] to-[#00f0ff] rounded-full"></div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl exp2-title font-bold">
              Exp2 最优模型详情
            </h1>
          </div>
          <p className="text-lg md:text-xl exp2-subtitle max-w-5xl mx-auto mb-8 leading-relaxed">
            针对<span className="exp2-highlight font-medium">传统GPS轨迹识别准确率低、抗干扰能力弱</span>的核心痛点，
            融合轨迹数据与基础知识图谱（KG）的先验规则，将6类交通方式识别准确率提升至
            <span className="exp2-highlight text-2xl font-bold">79.49%</span>，
            解决复杂城市交通场景下的识别难题，适配智慧交通、出行分析等实际应用需求。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6 mb-12 max-w-4xl mx-auto">
            {["准确率提升9.89%", "6类交通方式识别", "20ms实时推理", "KG先验知识", "抗干扰能力强", "端到端部署"].map((tag, i) => (
              <motion.span 
                key={i}
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2.5 rounded-full bg-[rgba(0,112,243,0.2)] border border-[rgba(0,240,255,0.3)] exp2-highlight text-sm md:text-base font-medium"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          <div className="max-w-5xl mx-auto bg-[rgba(15,23,42,0.8)] backdrop-blur-lg rounded-2xl border border-[rgba(0,240,255,0.2)] overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[rgba(0,240,255,0.2)]">
              <div className="p-8">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-red-400 mb-6">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="lg" /> 传统方法核心痛点
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1.5">•</span>
                    <span>GPS轨迹识别准确率仅69.6%，精度不足</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1.5">•</span>
                    <span>公交/地铁换乘等复杂场景识别混淆</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1.5">•</span>
                    <span>缺乏先验知识，抗干扰能力弱</span>
                  </li>
                </ul>
              </div>
              <div className="p-8">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-[#00f0ff] mb-6">
                  <FontAwesomeIcon icon={faCheckCircle} size="lg" /> Exp2 核心优势
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-[#00f0ff] mt-1.5">•</span>
                    <span>准确率提升至79.49%，提升9.89%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#00f0ff] mt-1.5">•</span>
                    <span>KG规则约束，解决换乘场景混淆问题</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#00f0ff] mt-1.5">•</span>
                    <span>20ms/条实时推理，抗干扰能力显著增强</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16"></div>

        {/* 原有数据卡片 */}
        <motion.section variants={item} className="mb-16 w-full">
          <div className="flex justify-center gap-8 md:gap-12 lg:gap-16 flex-wrap px-4 w-full">
            {[
              { value: `${bestModelMeta.accuracy}%`, label: "最优准确率", desc: "对比Exp1提升9.89%", icon: faAward },
              { value: `${bestModelMeta.supportTypes.length}类`, label: "识别交通方式", desc: "步行/骑行/公交/地铁/私家车/网约车", icon: faRoute },
              { value: "20ms", label: "单条轨迹推理耗时", desc: "满足实时识别需求", icon: faClock },
              { value: "11维", label: "KG特征维度", desc: "先验知识增强识别能力", icon: faDatabase }
            ].map((card, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="exp2-glass-card exp2-data-card text-center px-8 py-8 min-w-[220px] rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="text-5xl md:text-6xl font-bold exp2-title mb-4 flex justify-center">
                  <FontAwesomeIcon icon={card.icon} />
                  <span className="ml-2">{card.value}</span>
                </div>
                <div className="text-lg exp2-subtitle mb-2">{card.label}</div>
                <div className="text-sm exp2-highlight/70">{card.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16"></div>

        {/* 原有核心问题 */}
        <motion.section variants={item} className="mb-16 w-full">
          <div className="exp2-glass-card p-8 md:p-10 rounded-xl w-full">
            <h2 className="text-3xl font-bold exp2-highlight mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#00f0ff] rounded-full"></span>
              核心解决的现实问题
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {bestModelMeta.solveProblems.map((problem, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(15,23,42,0.8)" }}
                  className="bg-[rgba(15,23,42,0.5)] p-6 rounded-lg border-l-4 border-[#00f0ff] transition-colors hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <span className="exp2-highlight font-bold text-2xl mt-1">
                      {problem.icon}
                    </span>
                    <p className="text-white text-lg leading-relaxed">{problem.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16"></div>

        {/* 原有模型参数 */}
        <motion.section variants={item} className="mb-16 w-full">
          <div className="exp2-glass-card p-8 md:p-10 rounded-xl w-full">
            <h2 className="text-3xl font-bold exp2-highlight mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#00f0ff] rounded-full"></span>
              模型核心参数与技术细节
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 w-full">
              {modelParams.map((param, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0,240,255,0.3)" }}
                  className="bg-[rgba(15,23,42,0.5)] p-6 rounded-lg transition-all hover:shadow-2xl hover:scale-[1.02] duration-300"
                >
                  <div className="exp2-subtitle text-base mb-3">{param.key}</div>
                  <div className="text-xl font-medium text-white mb-3">{param.value}</div>
                  <div className="text-sm exp2-highlight/80">{param.desc}</div>
                </motion.div>
              ))}
            </div>

            <div className="mb-12 bg-[rgba(15,23,42,0.6)] rounded-2xl p-8 border border-[rgba(0,240,255,0.2)] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 w-full">
              <h3 className="text-2xl font-bold exp2-highlight mb-6 flex items-center gap-3">
                <FontAwesomeIcon icon={faDatabase} size="lg" /> 知识图谱(KG)11维特征详解
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {kgFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-[#00f0ff] mt-1.5">•</span>
                    <div>
                      <span className="font-medium text-white text-lg">{feature.name}：</span>
                      <span className="text-base text-gray-300">{feature.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 bg-[rgba(0,112,243,0.1)] rounded-lg border border-[rgba(0,240,255,0.2)]">
                <p className="text-lg text-gray-200 flex items-start gap-3">
                  <FontAwesomeIcon icon={faBrain} className="text-yellow-400 mt-1 text-xl" />
                  <span>这些KG特征为模型提供了关键先验知识，例如通过公交站距离快速区分公交/私家车，通过道路类型区分步行/骑行，大幅提升复杂场景识别准确率。</span>
                </p>
              </div>
            </div>

            <div className="mb-12 w-full">
              <h3 className="text-2xl font-bold exp2-highlight mb-6">各类别F1分数对比（Exp1 vs Exp2）</h3>
              <div className="bg-[rgba(15,23,42,0.6)] rounded-2xl p-6 h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={f1ComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={14} />
                    <YAxis domain={[0, 1]} stroke="#94a3b8" fontSize={14} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(15,23,42,0.95)', 
                        border: '1px solid rgba(0,240,255,0.4)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: 14,
                        padding: 12
                      }}
                      formatter={(value) => {
                        const num = Number(value);
                        if (isNaN(num)) return ['0%', 'F1分数'];
                        return [`${(num * 100).toFixed(1)}%`, 'F1分数'];
                      }}    
                    />
                    <Bar dataKey="exp1" name="Exp1（仅轨迹）" fill="#0090ff" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="exp2" name="Exp2（轨迹+KG）" fill="#00f0ff" radius={[6, 6, 0, 0]} barSize={40} />
                    <Cell key="cell-subway-exp2" fill="#00f0ff" stroke="#ffffff" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-base text-center text-gray-400 mt-4">
                  注：Subway类别F1分数从0.51提升至0.85，提升幅度达66.7%，效果最为显著
                </p>
              </div>
            </div>

            <div className="mt-8 w-full">
              <h3 className="text-2xl font-bold exp2-highlight mb-6">Exp2 模型架构（轨迹+KG融合）</h3>
              <div className="bg-[rgba(15,23,42,0.6)] rounded-2xl p-4 w-full overflow-hidden">
                <svg className="w-full max-w-5xl mx-auto" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1000" height="500" fill="rgba(15,23,42,0.8)" rx="16"/>
                  <text x="500" y="45" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">Exp2 轨迹+基础KG融合模型架构</text>
                  
                  <rect x="50" y="80" width="200" height="80" rx="8" fill="rgba(30,64,175,0.2)" stroke="rgba(0,240,255,0.6)" strokeWidth="2"/>
                  <text x="150" y="115" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">输入层</text>
                  <text x="150" y="145" textAnchor="middle" fill="#94a3b8" fontSize="14">GPS轨迹(64维)+KG特征(11维)</text>
                  
                  <rect x="300" y="80" width="200" height="80" rx="8" fill="rgba(8,145,178,0.2)" stroke="rgba(0,240,255,0.6)" strokeWidth="2"/>
                  <text x="400" y="115" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">特征融合层</text>
                  <text x="400" y="145" textAnchor="middle" fill="#94a3b8" fontSize="14">时空对齐+KG规则约束</text>
                  
                  <rect x="550" y="80" width="200" height="80" rx="8" fill="rgba(30,64,175,0.2)" stroke="rgba(0,240,255,0.6)" strokeWidth="2"/>
                  <text x="650" y="115" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">CNN+LSTM层</text>
                  <text x="650" y="145" textAnchor="middle" fill="#94a3b8" fontSize="14">空间+时间特征提取</text>
                  
                  <rect x="800" y="80" width="100" height="80" rx="8" fill="rgba(8,145,178,0.2)" stroke="rgba(0,240,255,0.6)" strokeWidth="2"/>
                  <text x="850" y="115" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">输出层</text>
                  <text x="850" y="145" textAnchor="middle" fill="#94a3b8" fontSize="14">6类识别结果</text>
                  
                  <path d="M250 120 L300 120" stroke="rgba(0,240,255,0.8)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <path d="M500 120 L550 120" stroke="rgba(0,240,255,0.8)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <path d="M750 120 L800 120" stroke="rgba(0,240,255,0.8)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <text x="275" y="105" textAnchor="middle" fill="#00f0ff" fontSize="12" fontWeight="bold">特征拼接</text>
                  <text x="525" y="105" textAnchor="middle" fill="#00f0ff" fontSize="12" fontWeight="bold">特征提取</text>
                  <text x="775" y="105" textAnchor="middle" fill="#00f0ff" fontSize="12" fontWeight="bold">分类输出</text>
                  
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#00f0ff"/>
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16"></div>

        {/* 原有模型对比 */}
        <motion.section variants={item} className="mb-16 w-full">
          <div className="exp2-glass-card p-8 md:p-10 rounded-xl w-full">
            <h2 className="text-3xl font-bold exp2-highlight mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#00f0ff] rounded-full"></span>
              Exp2 与其他模型准确率对比
            </h2>
            <div className="bg-[rgba(15,23,42,0.6)] rounded-2xl p-8 h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* 🔥 仅用 BarChart + layout="horizontal" 实现水平柱状图，无废弃组件 */}
                <BarChart
                  layout="horizontal"
                  data={comparisonData}
                  margin={{ top: 20, right: 40, left: 120, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[60, 82]} stroke="#94a3b8" fontSize="14" tickCount={7} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} fontSize="14" />
                  <Tooltip
                    formatter={(value) => [`${value}%`, '准确率']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15,23,42,0.95)', 
                      border: '1px solid rgba(0,240,255,0.4)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: 14,
                      padding: 12
                    }}
                  />
                  <ReferenceLine 
                    x={69.6} 
                    stroke="#ff6b6b" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    label={{ 
                      value: 'Exp1基准线 (69.6%)', 
                      position: 'top', 
                      fill: '#ff6b6b',
                      fontSize: 14,
                      fontWeight: 'bold',
                      // backgroundColor: 'rgba(255,107,107,0.1)',
                      // padding: 6,
                      // borderRadius: 4
                    }} 
                  />
                  {/* 🔥 仅用 Bar 组件，无 HorizontalBar */}
                  <Bar 
                    dataKey="accuracy" 
                    name="准确率(%)" 
                    radius={[0, 8, 8, 0]}
                    label={{ position: 'right', fill: 'white', fontSize: 14, fontWeight: 'bold' }}
                    barSize={40}
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16"></div>

        {/* 🔥 核心修改：轨迹预测演示模块（新增高德地图） */}
        <motion.section variants={item} className="mb-16 w-full">
          <div className="exp2-glass-card p-8 md:p-10 rounded-xl w-full">
            <h2 className="text-3xl font-bold exp2-highlight mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#00f0ff] rounded-full"></span>
              模型实时识别演示（对接真实后端接口）
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
              {/* 左侧：轨迹选择 + 预测操作 + 结果展示 */}
              <div className="flex flex-col gap-6">
                <div className="w-full">
                  <label className="block exp2-subtitle mb-3 text-lg">选择示例轨迹</label>
                  <div className="relative w-full">
                    <select
                      value={selectedTrajectory}
                      onChange={(e) => setSelectedTrajectory(e.target.value)}
                      className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(0,240,255,0.4)] rounded-xl px-5 py-4 text-white text-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/60"
                    >
                      <option value="" disabled>请选择示例轨迹...</option>
                      {exampleTrajectories.map((item) => (
                        <option key={item.value} value={item.value} className="bg-[rgba(15,23,42,0.9)] text-white">
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-xl" />
                  </div>
                </div>

                <motion.button
                  onClick={handlePredict}
                  disabled={loading || !selectedTrajectory}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#0070f3] to-[#00f0ff] hover:from-[#0051a8] hover:to-[#00d0e6] text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      模型推理中...
                    </div>
                  ) : (
                    "调用模型开始预测"
                  )}
                </motion.button>

                <AnimatePresence>
                  {predictionResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-8 rounded-2xl bg-[rgba(0,112,243,0.1)] border border-[rgba(0,240,255,0.4)] text-center w-full"
                    >
                      <h4 className="exp2-highlight font-bold mb-6 text-2xl">预测结果</h4>
                      
                      {renderConfidenceRing(predictionResult.confidence)}
                      
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                        <div className="bg-[rgba(15,23,42,0.5)] p-4 rounded-lg">
                          <span className="text-gray-300 block mb-2">预测类别：</span>
                          <span className="text-white font-bold text-xl">{predictionResult.predicted}</span>
                        </div>
                        <div className="bg-[rgba(15,23,42,0.5)] p-4 rounded-lg">
                          <span className="text-gray-300 block mb-2">置信度：</span>
                          <span className="text-white font-bold text-xl">{predictionResult.confidence}%</span>
                        </div>
                        <div className="bg-[rgba(15,23,42,0.5)] p-4 rounded-lg">
                          <span className="text-gray-300 block mb-2">真实类别：</span>
                          <span className="text-green-400 font-bold text-xl">{predictionResult.trueLabel}</span>
                        </div>
                      </div>

                      {predictionResult.inferenceTime && (
                        <div className="mt-6 text-base text-gray-200">
                          推理耗时：{predictionResult.inferenceTime}ms | 数据来源：真实模型计算
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 右侧：高德地图可视化 */}
              {/* // 替换原有地图容器的JSX */}
              <div className="rounded-2xl overflow-hidden border border-[rgba(0,240,255,0.4)] bg-[rgba(15,23,42,0.8)] h-[500px] w-full">
                {!mapLoaded ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-[rgba(15,23,42,0.9)]">
                    {/* 更友好的加载动画 */}
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-[#0070f3] border-t-[#00f0ff] rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-2 border-transparent border-t-[#00f0ff] rounded-full animate-spin [animation-duration:1.5s]"></div>
                    </div>
                    <p className="text-lg text-gray-300">高德地图资源加载中...</p>
                    <p className="text-sm text-gray-500">预计耗时2-3秒，加载完成后可查看轨迹可视化</p>
                  </div>
                ) : (
                  <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }}></div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16"></div>

        {/* 原有应用场景 */}
        <motion.section variants={item} className="mb-20 w-full">
          <div className="exp2-glass-card p-8 md:p-10 rounded-xl w-full">
            <h2 className="text-3xl font-bold exp2-highlight mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#00f0ff] rounded-full"></span>
              实际应用场景
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {bestModelMeta.applicableScenarios.map((scenario, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02, rotate: 0.5 }}
                  className="bg-[rgba(15,23,42,0.5)] p-7 rounded-xl flex items-center gap-5 transition-all hover:shadow-2xl hover:scale-[1.02] duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0070f3] to-[#00f0ff] flex items-center justify-center text-white font-bold text-2xl">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl">{scenario}</h4>
                    <p className="exp2-subtitle text-base mt-2">基于高精度识别结果，支撑该场景下的决策与分析</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="flex justify-center mb-16 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/"}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00f0ff] text-white font-bold text-lg hover:shadow-xl transition-all"
          >
            返回首页
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showToTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-[#0070f3] to-[#00f0ff] flex items-center justify-center text-white shadow-2xl hover:shadow-3xl transition-all z-50"
          >
            <FontAwesomeIcon icon={faArrowUp} size="lg" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}