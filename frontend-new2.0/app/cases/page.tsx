// app/cases/page.tsx
"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function IndustrySolutionsPage() {
  const router = useRouter();

  const scenarios = [
    {
      title: "智慧城市交通线网规划",
      problem: "传统交通规划依赖人工抽样，数据滞后且粒度粗，无法掌握慢行系统与机动车的实时博弈。",
      vision: "提供流批一体的交通全息画像，为道路红线规划提供最真实的微观时空依据。",
      stats: ["规划偏差率 ↓ 34%", "决策效率提升 2倍"],
      icon: "🏙️",
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "政企数字化通勤管理",
      problem: "园区员工通勤复杂，班车利用率低，缺乏精准的行为数据支持导致管理成本高昂。",
      vision: "自动识别多模态接驳，实现响应式班车动态排班，将减排行为转化为福利账单。",
      stats: ["运营降本 22%", "员工满意度 ↑ 35%"],
      icon: "🏢",
      color: "from-purple-600 to-indigo-500"
    },
    {
      title: "MaaS 平台智能分流",
      problem: "网约车平台无法获知乘客出站意图，导致接驾点与落点不符，增加空驶与等待时间。",
      vision: "端侧实时感知用户意图，提前指引接驾位置，实现城市级人车撮合效率最大化。",
      stats: ["接驾时延 ↓ 11%", "派单成功率 ↑ 15%"],
      icon: "🚕",
      color: "from-emerald-600 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white flex flex-col relative pb-20">
      <Navbar />
      <main className="max-w-[1500px] mx-auto w-full px-8 relative z-10 mt-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00f0ff] mb-6 italic uppercase">
            智慧交通行业解决方案
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto tracking-widest">
            TrafficRec 致力于将多模态识别技术转化为可落地的行业治理工具
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {scenarios.map((s, i) => (
            <motion.div key={i} className="bg-slate-900/40 border border-slate-800 p-10 rounded-2xl group hover:border-[#00f0ff] transition-all flex flex-col">
              <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-lg`}>
                {s.icon}
              </div>
              <h2 className="text-2xl font-bold mb-6 text-white tracking-widest">{s.title}</h2>
              <div className="space-y-6 mb-10 flex-1">
                <div className="space-y-2">
                   <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">【 行业痛点 】</p>
                   <p className="text-sm text-slate-400 leading-relaxed">{s.problem}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">【 赋能场景 】</p>
                   <p className="text-sm text-slate-300 leading-relaxed">{s.vision}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-8">
                {s.stats.map((st, idx) => (
                  <span key={idx} className="bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] px-3 py-1 font-bold rounded-sm border border-[#00f0ff]/20">{st}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}