// app/insights/distribution/page.tsx
"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ModePieChart from '@/components/ModePieChart'; // 必须引回你的饼图组件

//   统一视觉容器
const DvBox = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[rgba(6,18,46,0.6)] border border-[#113d6a] p-6 rounded-xl overflow-hidden backdrop-blur-md transition-all hover:border-[#00f0ff]/50 ${className}`}>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f0ff]"></div>
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00f0ff]"></div>
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00f0ff]"></div>
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00f0ff]"></div>
    {title && <h3 className="text-[#00f0ff] font-bold text-base tracking-widest mb-6 flex items-center gap-2 uppercase">
      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]"></span>{title}
    </h3>}
    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
);

export default function DistributionInsightPage() {
  const router = useRouter();

  //   重新引回：6 大类真实占比数据
  const modeData = [
    { name: "Walk (步行)", value: 25, color: "#10b981" },
    { name: "Bike (骑行)", value: 20, color: "#3b82f6" },
    { name: "Bus (公交)", value: 30, color: "#8b5cf6" },
    { name: "Car (机动车)", value: 15, color: "#f59e0b" },
    { name: "Train (火车)", value: 8, color: "#ec4899" },
    { name: "Subway (地铁)", value: 2, color: "#06b6d4" }
  ];

  //   核心潮汐数据
  const timeSeriesData = [
    { hour: '06:00', walk: 10, bus: 20, car: 15 },
    { hour: '08:00', walk: 45, bus: 85, car: 90 }, // 早高峰
    { hour: '10:00', walk: 25, bus: 40, car: 35 },
    { hour: '12:00', walk: 30, bus: 30, car: 25 },
    { hour: '14:00', walk: 20, bus: 35, car: 30 },
    { hour: '18:00', walk: 55, bus: 95, car: 85 }, // 晚高峰
    { hour: '20:00', walk: 35, bus: 50, car: 45 },
    { hour: '22:00', walk: 15, bus: 20, car: 25 },
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white font-sans relative pb-12">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-8 mt-8 space-y-8 relative z-10">
        
        {/* 顶部标题栏 */}
        <div className="flex justify-between items-end border-b border-[#00f0ff]/20 pb-6">
          <div className="border-l-4 border-[#00f0ff] pl-4">
            <h2 className="text-3xl font-black text-white tracking-widest mb-2 uppercase flex items-center gap-3">
              全域 6 大类运力画像分布 <span className="text-[#00f0ff] text-xl font-normal">/ 6-Classes Distribution</span>
            </h2>
            <p className="text-slate-400 text-sm font-mono tracking-widest">
              Macro-Spatiotemporal Distribution Analysis
            </p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="px-6 py-2 border border-slate-700 text-slate-400 hover:text-[#00f0ff] hover:border-[#00f0ff] transition-all text-xs font-bold tracking-widest bg-slate-900/50"
          >
            &lt;&lt; 返回总线大屏 (DASHBOARD)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === 左侧：6 大类占比饼图 (呼应首页的 6 Classes) === */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <DvBox title="6 大类出行模态分布矩阵" className="flex-1">
              <div className="flex flex-col h-full">
                {/* 饼图容器 */}
                <div className="h-[280px] w-full flex items-center justify-center relative mb-4">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]"></div>
                   <ModePieChart data={modeData} />
                </div>
                
                {/* 6大类数据网格 */}
                <div className="grid grid-cols-2 gap-3">
                  {modeData.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-[#00f0ff]/50 transition-all">
                      <span className="text-[11px] text-slate-400 font-mono tracking-widest group-hover:text-white transition-colors">{m.name}</span>
                      <span className="text-sm font-black drop-shadow-[0_0_5px_currentColor]" style={{ color: m.color }}>{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </DvBox>
          </div>

          {/* === 右侧：24H潮汐图谱 与 业务审计 === */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <DvBox title="6 大类出行结构 24H 潮汐演变图谱">
              <div className="w-full h-[280px] flex items-end justify-between border-b border-slate-700 pb-4 relative px-4">
                {/* 辅助网格线 */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-800/50"></div>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800/50"></div>

                {timeSeriesData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative max-w-[60px]">
                    <div className="flex gap-1 items-end h-[220px] w-full px-1">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${data.bus}%` }} transition={{ duration: 1, delay: idx*0.05 }} className="flex-1 bg-gradient-to-t from-purple-900 to-purple-400 rounded-t-sm relative shadow-[0_0_10px_rgba(168,85,247,0.2)]" />
                      <motion.div initial={{ height: 0 }} animate={{ height: `${data.car}%` }} transition={{ duration: 1, delay: idx*0.05+0.1 }} className="flex-1 bg-gradient-to-t from-[#0070f3] to-[#00f0ff] rounded-t-sm relative shadow-[0_0_10px_rgba(0,240,255,0.2)]" />
                      <motion.div initial={{ height: 0 }} animate={{ height: `${data.walk}%` }} transition={{ duration: 1, delay: idx*0.05+0.2 }} className="flex-1 bg-gradient-to-t from-emerald-900 to-emerald-400 rounded-t-sm relative" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4 font-mono group-hover:text-white transition-colors z-10 bg-[#010a18] px-1">{data.hour}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center gap-10 text-[10px] font-mono tracking-widest uppercase">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-sm"></span> 公交/地铁 (Bus/Subway)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#00f0ff] rounded-sm"></span> 机动车 (Car)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> 慢行 (Walk/Bike)</span>
              </div>
            </DvBox>

            <div className="grid grid-cols-2 gap-6">
               <DvBox title="潮汐峰值审计结论">
                  <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-[#00f0ff] pl-4 font-mono">
                    "全域统计证实：早高峰 (08:00) 机动车向心通勤显著，占比达 95%；而晚高峰 (18:00) 慢行系统分担率相比早高峰上升了 <span className="text-emerald-400 font-bold">12%</span>，印证了微循环接驳的巨大需求。"
                  </p>
               </DvBox>

               <DvBox title="宏观调控建议">
                 <div className="space-y-4">
                   <div className="p-3 bg-slate-900/80 rounded border border-slate-700">
                     <strong className="text-[11px] text-purple-400 block mb-1 tracking-widest uppercase">方案 A: 公交线网冗余裁撤</strong>
                     <span className="text-[10px] text-slate-400">平峰期公交空驶率高，建议实施“响应式定制公交”。</span>
                   </div>
                   <div className="p-3 bg-slate-900/80 rounded border border-slate-700">
                     <strong className="text-[11px] text-[#00f0ff] block mb-1 tracking-widest uppercase">方案 B: 接驳最后一公里扩容</strong>
                     <span className="text-[10px] text-slate-400">针对 18:00 慢行激增，建议强制扩容共享单车电子围栏。</span>
                   </div>
                 </div>
               </DvBox>
            </div>

            {/* 出口 */}
            <button 
              onClick={() => router.push('/predict')}
              className="w-full py-4 bg-gradient-to-r from-[#00f0ff]/10 to-[#0070f3]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-black text-xs tracking-[0.3em] hover:bg-[#00f0ff] hover:text-[#010a18] transition-all rounded shadow-[0_0_20px_rgba(0,240,255,0.1)] uppercase mt-2"
            >
              启动微观 6 大类单规推演沙盘 &gt;&gt;
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}