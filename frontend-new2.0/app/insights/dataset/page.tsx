// app/insights/dataset/page.tsx
"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const DvBox = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[rgba(6,18,46,0.6)] border border-[#113d6a] p-8 rounded-xl overflow-hidden backdrop-blur-md transition-all hover:border-[#00f0ff]/50 ${className}`}>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f0ff]"></div>
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00f0ff]"></div>
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00f0ff]"></div>
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00f0ff]"></div>
    {title && <h3 className="text-[#00f0ff] font-bold text-lg tracking-widest mb-8 flex items-center gap-2 uppercase">
      <span className="w-2 h-2 bg-[#00f0ff] rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]"></span>{title}
    </h3>}
    {children}
  </div>
);

export default function DatasetInsightPage() {
  const router = useRouter();

  const pipelineSteps = [
    { step: "01", name: "原始 GPS 轨迹提取", val: "24,876,543", unit: "pts", desc: "接入 Geolife v1.3 全量原始 PLT 轨迹文件。" },
    { step: "02", name: "经纬度异常漂移降噪", val: "-1,204,500", unit: "pts", desc: "基于瞬时速度（>200km/h）及物理极值的无效跳点剔除。" },
    { step: "03", name: "时空轨迹序列化切片", val: "145,892", unit: "segments", desc: "以 20min 停顿为阈值，将原始点序列化为独立运动片段。" },
    { step: "04", name: "特征张量高维映射", val: "2,400,000", unit: "dim", desc: "完成 58 维时空特征向量融合，生成模型输入张量。" }
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white font-sans relative pb-12">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <Navbar />

      <main className="max-w-[1500px] mx-auto px-8 mt-10 space-y-10 relative z-10">
        
        {/* 顶部标题栏 */}
        <div className="flex justify-between items-end border-b border-[#00f0ff]/20 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">底层数据资产溯源与清洗审计</h1>
            <p className="text-slate-500 font-mono text-sm tracking-[0.2em]">Data Provenance & Pre-processing Pipeline [Audit Mode]</p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="px-8 py-3 border border-slate-700 text-slate-400 hover:text-[#00f0ff] hover:border-[#00f0ff] transition-all text-xs font-bold tracking-[0.3em] bg-slate-900/50 rounded-sm"
          >
            &lt;&lt; 返回大屏中心
          </button>
        </div>

        <div className="grid grid-cols-12 gap-10">
          
          {/* 核心内容：清洗流水线 */}
          <div className="col-span-8">
            <DvBox title="自动化预处理审计流水线 (Cleaning Flow)">
              <div className="space-y-6 pt-4">
                {pipelineSteps.map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ x: -50, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center justify-between p-6 bg-slate-900/60 border-l-4 border-[#00f0ff] rounded-r-lg group hover:bg-slate-800 transition-all"
                  >
                    <div className="flex gap-8 items-center">
                      <span className="text-3xl font-black text-slate-700 font-mono group-hover:text-[#00f0ff] transition-colors">{item.step}</span>
                      <div>
                        <h4 className="text-white font-bold text-base mb-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 italic">{item.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black font-mono text-white group-hover:text-[#00f0ff] transition-colors">{item.val}</p>
                       <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">{item.unit}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </DvBox>
          </div>

          {/* 右侧：统计概览与结论 */}
          <div className="col-span-4 space-y-8">
            <DvBox title="数据集健康度审计">
               <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-mono">采集周期</p>
                    <p className="text-2xl font-black text-white italic">6 MONTHS <span className="text-xs text-slate-600">Continuous</span></p>
                  </div>
                  <div className="pb-4 border-b border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-mono">北京主城区路网覆盖</p>
                    <p className="text-2xl font-black text-[#00f0ff] italic">82.4% <span className="text-xs text-slate-600">Density</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-mono">独立用户参与数</p>
                    <p className="text-2xl font-black text-purple-400 italic">182 USERS</p>
                  </div>
               </div>
            </DvBox>

            <DvBox title="审计员评价 [EXP-3]">
               <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-4 font-mono">
                 "通过对 2.4 M 维特征张量的深度审计，系统排除了约 5% 的低质量噪点污染，确保了后续训练集在北京极高密度路网场景下的鲁棒性置信度。"
               </p>
               <button 
                onClick={() => router.push('/insights/distribution')}
                className="mt-10 w-full py-5 bg-gradient-to-r from-[#00f0ff]/20 to-[#0070f3]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-black text-xs tracking-[0.3em] hover:bg-[#00f0ff] hover:text-[#010a18] transition-all rounded-sm uppercase"
               >
                 查看清洗后的 24H 潮汐分布 &rarr;
               </button>
            </DvBox>
          </div>
        </div>
      </main>
    </div>
  );
}