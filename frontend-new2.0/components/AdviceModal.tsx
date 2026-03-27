'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface AdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string | null;
  confidence: number;
}

type AdviceDataItem = {
  icon: string;
  title: string;
  kpis: { label: string; value: string }[];
  case: { source: string; text: string };
  steps: string[];
  chart: { name: string; time: number; carbon: number }[];
};

const ADVICE_DATA: Record<string, AdviceDataItem> = {
  WALK: {
    icon: '🚶', title: '慢行友好系统：步行通勤深度建议',
    kpis: [{ label: '预估耗时', value: '18 min' }, { label: '卡路里消耗', value: '120 kcal' }, { label: '碳减排', value: '0.8 kg' }],
    case: { source: '市交通委慢行改造白皮书', text: '“某社区慢行系统改造接入态势感知后，居民步行通勤意愿上升40%，有效激活了周边微商圈的经济活力。”' },
    steps: ['① 穿过奥森公园内部专用步道，避开人车混行区。', '② 保持 5.5 km/h 配速，达到最佳燃脂心率。', '③ 途经 2 个 24h 便利店，建议作为补给点。'],
    chart: [{ name: '步行', time: 18, carbon: 0 }, { name: '公交', time: 12, carbon: 45 }, { name: '打车', time: 8, carbon: 120 }],
  },
  BIKE: {
    icon: '🚲', title: '低碳骑行网络：微循环优化建议',
    kpis: [{ label: '预估耗时', value: '12 min' }, { label: '路线平顺度', value: '92%' }, { label: '碳减排', value: '1.2 kg' }],
    case: { source: '共享单车潮汐调度实验室', text: '“该高新区引入Exp3态势感知后，单车智能调度效率提升30%，彻底消灭了早高峰地铁口的‘单车坟场’现象。”' },
    steps: ['① 导航至前方 50m 的青桔/美团单车推荐停放点。', '② 沿城市新铺设的彩色沥青骑行绿道直行。', '③ 规范停放至电子围栏，获取碳普惠积分奖励。'],
    chart: [{ name: '骑行', time: 12, carbon: 0 }, { name: '公交', time: 15, carbon: 45 }, { name: '打车', time: 10, carbon: 120 }],
  },
  BUS: {
    icon: '🚌', title: '干线公交效能：公共交通换乘建议',
    kpis: [{ label: '预估耗时', value: '35 min' }, { label: '拥挤度预测', value: '45%' }, { label: '准点率', value: '96%' }],
    case: { source: '公交集团路权优化报告', text: '“利用海量轨迹拟合优化线路后，早高峰公交准点率提升12%，平均通勤时间缩短 8 分钟，大幅提升公交分担率。”' },
    steps: ['① 打开公交App，目标车辆距您还有 2 站 (约3分钟)。', '② 建议在【中关村南站】同站台换乘 302 路直达。', '③ 当前车厢较空，建议向后排移动获取座位。'],
    chart: [{ name: '公交', time: 35, carbon: 45 }, { name: '地铁', time: 30, carbon: 20 }, { name: '打车', time: 25, carbon: 120 }],
  },
  CAR: {
    icon: '🚗', title: '机动车流引导：拥堵规避与拼车建议',
    kpis: [{ label: '预估耗时', value: '42 min' }, { label: '拥堵延误', value: '+12 min' }, { label: '碳排放', value: '2.5 kg' }],
    case: { source: '交管局绿波带干预中心', text: '“基于海量机动车轨迹特征实施自适应红绿灯绿波干预，主干道机动车通行效率稳步提升 18%。”' },
    steps: ['① 前方核心商圈拥堵，建议开启高德地图避堵路线。', '② 建议在系统内发布【顺风车】行程，分摊通勤成本。', '③ 驶入非限行区域，并留意前方 2km 处的潮汐车道。'],
    chart: [{ name: '打车/自驾', time: 42, carbon: 250 }, { name: '地铁', time: 35, carbon: 20 }, { name: '公交', time: 55, carbon: 45 }],
  },
};

ADVICE_DATA.SUBWAY = ADVICE_DATA.BUS;
ADVICE_DATA.TRAIN = { ...ADVICE_DATA.BUS, title: '🚄 城际轨道枢纽：跨城接驳建议', icon: '🚄' };
ADVICE_DATA.AIRPLANE = { ...ADVICE_DATA.BUS, title: '✈️ 航空干线枢纽：航站楼引导建议', icon: '✈️' };

export default function AdviceModal({ isOpen, onClose, mode }: AdviceModalProps) {
  if (!isOpen || !mode || mode.toUpperCase().includes('INVALID')) return null;
  const modeKey = mode.toUpperCase();
  const data = ADVICE_DATA[modeKey] || ADVICE_DATA.CAR;

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
              {data.kpis.map((kpi, idx) => (
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
                  {data.chart.map((c, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                        <span>{c.name} (耗时: {c.time}m)</span><span>碳排: {c.carbon}g</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(c.time / 60) * 100}%` }} transition={{ duration: 1 }} className="bg-gradient-to-r from-blue-500 to-[#00f0ff] h-full rounded-full" />
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(c.carbon / 300) * 100}%` }} transition={{ duration: 1, delay: 0.2 }} className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-[#00f0ff] font-bold text-sm mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#00f0ff]"></span>AI 智能通勤行动指南</h3>
                  <div className="space-y-4">
                    {data.steps.map((step, idx) => (
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
