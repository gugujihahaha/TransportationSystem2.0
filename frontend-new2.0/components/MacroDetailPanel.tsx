'use client';

import { motion } from 'framer-motion';

interface MacroDetailPanelProps {
  modeKey: string | null;
  onClose: () => void;
}

export default function MacroDetailPanel({ modeKey, onClose }: MacroDetailPanelProps) {
  if (!modeKey) return null;

  const mockDetails: Record<string, { title: string; trend: string; recommendation: string }> = {
    BIKE: { title: '骑行流量深挖', trend: '上升 12%', recommendation: '增设电子围栏' },
    WALK: { title: '步行区域分析', trend: '持平', recommendation: '优化红绿灯配时' },
    CAR: { title: '机动车流审计', trend: '下降 5%', recommendation: '潮汐车道评估' },
    BUS: { title: '公交效能审计', trend: '上升 8%', recommendation: '拉直冗余线路' },
  };

  const detail = mockDetails[modeKey.toUpperCase()] || mockDetails.CAR;

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
