// app/insights/architecture/page.tsx
"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

//   核心引擎视觉容器 (橙色高能警告风)
const DvBox = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[rgba(6,18,46,0.6)] border border-[#113d6a] p-8 rounded-xl overflow-hidden backdrop-blur-md transition-all hover:border-orange-500/50 ${className}`}>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500"></div>
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500"></div>
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500"></div>
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500"></div>
    {title && <h3 className="text-orange-500 font-black text-lg tracking-widest mb-8 flex items-center gap-3 uppercase">
      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]"></span>{title}
    </h3>}
    {children}
  </div>
);

export default function ArchitectureInsightPage() {
  const router = useRouter();

  //   独家主权数据：58 维特征的真实拆解
  const features = [
    { cat: '运动学张量 (21 Dim)', ratio: 36, icon: '🏃', color: '#00f0ff', desc: '提取速度、加速度、跃度及航向角变化率，构建基础物理序列。' },
    { cat: '空间语义特征 (15 Dim)', ratio: 26, icon: '🗺️', color: '#a855f7', desc: '引入 OSM 路网拓扑映射，计算与地铁站、公交站点的 POI 距离。' },
    { cat: '频域转换特征 (12 Dim)', ratio: 21, icon: '〰️', color: '#3b82f6', desc: '通过 FFT 快速傅里叶变换，提取轨迹序列的主频能量与振幅谱。' },
    { cat: '气象补偿特征 (10 Dim)', ratio: 17, icon: '🌦️', color: '#10b981', desc: '融合实时温度、降水与风速数据，构建恶劣天气下的信号衰减补偿。' }
  ];

  //   Exp3 的神经网络 Pipeline
  const networkLayers = [
    { step: 'TENSOR INPUT', name: '多源异构张量对齐', desc: '58-Dimensional Feature Fusion', color: 'border-orange-500/30' },
    { step: 'ATTN LAYER', name: '跨模态自注意力层', desc: 'Cross-Modal Attention (提取空间-气象耦合关联)', color: 'border-[#a855f7]/40' },
    { step: 'RNN UNIT', name: '双向 LSTM 循环网络', desc: 'Bi-LSTM (捕获时序前后的运动变异)', color: 'border-[#3b82f6]/40' },
    { step: 'OUTPUT', name: 'Softmax 决策输出', desc: '6 大类出行模式概率分布', color: 'border-[#00f0ff]/50 bg-gradient-to-r from-[#00f0ff]/10 to-transparent' }
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white font-sans relative pb-12">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-8 mt-10 space-y-10 relative z-10">
        
        {/* 顶部标题栏 */}
        <div className="flex justify-between items-end border-b border-orange-500/30 pb-8">
          <div className="border-l-4 border-orange-500 pl-4">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">时空特征引擎与网络架构解剖</h1>
            <p className="text-slate-500 font-mono text-sm tracking-[0.2em]">58-Dimensional Feature Tensor & Neural Pipeline [Exp3]</p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="px-8 py-3 border border-slate-700 text-slate-400 hover:text-orange-400 hover:border-orange-400 transition-all text-xs font-bold tracking-[0.3em] bg-slate-900/50 rounded-sm uppercase"
          >
            &lt;&lt; 返回总调度中心
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 左侧：58维特征工程雷达图/解构 */}
          <div className="lg:col-span-7 space-y-8">
            <DvBox title="58 维特征张量融合矩阵 (Feature Space)">
              <div className="grid grid-cols-1 gap-6 pt-2">
                 {features.map((f, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -30 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     transition={{ delay: i * 0.15 }}
                     className="flex items-center gap-8 bg-slate-900/60 p-6 rounded-lg border border-slate-800 group hover:border-orange-500/50 transition-all relative overflow-hidden"
                   >
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>

                      {/* 动态圆环进度图 */}
                      <div className="w-20 h-20 flex-shrink-0 relative flex items-center justify-center bg-slate-950 rounded-full border border-slate-800 shadow-inner">
                         <div className="text-2xl z-10">{f.icon}</div>
                         <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <motion.circle 
                              cx="40" cy="40" r="36" fill="none" stroke={f.color} strokeWidth="4" 
                              strokeDasharray="226" 
                              initial={{ strokeDashoffset: 226 }} 
                              animate={{ strokeDashoffset: 226 - (226 * f.ratio) / 100 }} 
                              transition={{ duration: 1.5, delay: 0.5 + i*0.2 }} 
                              className="drop-shadow-[0_0_5px_currentColor]"
                            />
                         </svg>
                      </div>

                      <div className="flex-1 z-10">
                         <div className="flex justify-between items-end mb-2">
                            <h4 className="text-white font-bold text-lg uppercase tracking-widest">{f.cat}</h4>
                            <span className="text-xl font-black font-mono" style={{ color: f.color }}>{f.ratio}%</span>
                         </div>
                         <p className="text-xs text-slate-400 leading-relaxed mb-3">{f.desc}</p>
                         <div className="flex gap-4 items-center">
                            <span className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">Info_Gain_Weight</span>
                            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${f.ratio}%` }} transition={{ delay: 1 }} className="h-full bg-slate-600 group-hover:bg-orange-500 transition-colors"></motion.div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
            </DvBox>
          </div>

          {/* 右侧：神经网络层级拓扑 */}
          <div className="lg:col-span-5 space-y-8">
            <DvBox title="Exp3 核心网络拓扑 (Neural Pipeline)">
              
              <div className="relative py-6 flex flex-col items-center">
                 {/* 背景数据流连线 (发光光束) */}
                 <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-800 overflow-hidden">
                    <motion.div 
                      animate={{ y: ['-100%', '400%'] }} 
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
                      className="w-full h-24 bg-gradient-to-b from-transparent via-orange-500 to-transparent blur-[1px]"
                    />
                 </div>

                 {/* 网络层级堆叠图 */}
                 <div className="w-full space-y-10 relative z-10">
                    {networkLayers.map((layer, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + idx*0.2 }}
                        className="w-full flex justify-center"
                      >
                         <div className={`w-[85%] p-5 text-center rounded-lg border backdrop-blur-md shadow-2xl transition-transform hover:scale-105 bg-slate-900/90 ${layer.color}`}>
                            <p className="text-[10px] text-slate-500 font-black font-mono tracking-[0.3em] mb-2 uppercase">
                              [ {layer.step} ]
                            </p>
                            <h4 className={`font-black text-base tracking-widest uppercase mb-1 ${idx === 3 ? 'text-[#00f0ff]' : 'text-orange-400'}`}>
                              {layer.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 italic">
                              {layer.desc}
                            </p>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
            </DvBox>

            {/* 学术评价区 & 下一个逻辑出口 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
               <h4 className="text-orange-500 font-bold mb-3 uppercase text-xs tracking-widest">白盒化架构诊断报告</h4>
               <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-orange-500 pl-4 font-mono">
                 “相比于 Exp1 的纯运动学基线，Exp3 引擎不仅将张量扩充至 58 维，其核心创新在于加入了 Cross-Modal Attention（跨模态注意力层），让模型能够动态感知‘天气’对‘速度’的非线性影响，从底层杜绝了极端环境下的精度崩溃。”
               </p>
               
               {/* 逻辑闭环出口：看完技术去看看最终能赚多少钱/有什么价值 */}
               <button 
                 onClick={() => router.push('/insights/cases')}
                 className="mt-8 w-full py-4 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 text-orange-500 font-bold text-xs tracking-[0.3em] hover:bg-orange-500 hover:text-[#010a18] transition-all rounded uppercase"
               >
                 查看引擎赋能下的业务落地与 ROI 审计 &rarr;
               </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}