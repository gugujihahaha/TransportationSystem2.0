// app/insights/accuracy/page.tsx
"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// 🌟 统一视觉容器 (青色学术风)
const DvBox = ({ title, children, className = "", highlight = false }: { title?: string, children: React.ReactNode, className?: string, highlight?: boolean }) => (
  <div className={`relative bg-[rgba(6,18,46,0.6)] border ${highlight ? 'border-[#00f0ff] shadow-[0_0_30px_rgba(0,240,255,0.1)]' : 'border-[#113d6a]'} p-8 rounded-xl overflow-hidden backdrop-blur-md transition-all ${className}`}>
    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${highlight ? 'border-[#00f0ff]' : 'border-slate-500'}`}></div>
    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${highlight ? 'border-[#00f0ff]' : 'border-slate-500'}`}></div>
    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${highlight ? 'border-[#00f0ff]' : 'border-slate-500'}`}></div>
    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${highlight ? 'border-[#00f0ff]' : 'border-slate-500'}`}></div>
    {title && <h3 className={`font-bold text-lg tracking-widest mb-8 flex items-center gap-2 uppercase ${highlight ? 'text-[#00f0ff]' : 'text-slate-300'}`}>
      <span className={`w-2 h-2 rounded-full ${highlight ? 'bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]' : 'bg-slate-500'}`}></span>{title}
    </h3>}
    {children}
  </div>
);

export default function AccuracyInsightPage() {
  const router = useRouter();

  // 🌟 1. 全局消融实验数据 (来自你的真实 JSON 的 accuracy 字段)
  const ablation = [
    { id: 'Exp1', acc: 83.30, label: '基础物理运动学基线', color: 'bg-slate-600', desc: '纯物理特征，基线性能' },
    { id: 'Exp2', acc: 83.88, label: '+ 空间路网语义映射', color: 'bg-slate-500', desc: '引入 OSM，精度微升' },
    { id: 'Exp4', acc: 81.57, label: '+ Focal Loss 对照组', color: 'bg-purple-600', desc: '权重失衡，全局回落' },
    { id: 'Exp3', acc: 84.84, label: '全维特征融合 (SOTA 版)', color: 'bg-[#00f0ff]', desc: '气象补偿加持，全局最优' }
  ];

  // 🌟 2. 细粒度 F1-Score 对比 (严格提取自你的 Exp1 与 Exp3 JSON)
  // 重点展示 Subway 和 Car 的巨大提升，以及 Walk 的微小 Trade-off
  const classF1 = [
    { name: 'Subway', exp1: 61.1, exp3: 76.4, diff: '+15.3' }, // 巨大提升
    { name: 'Car & Taxi', exp1: 50.0, exp3: 55.9, diff: '+5.9' },  // 突破瓶颈
    { name: 'Train', exp1: 81.4, exp3: 86.2, diff: '+4.8' },
    { name: 'Bike', exp1: 92.4, exp3: 94.4, diff: '+2.0' },
    { name: 'Bus', exp1: 78.5, exp3: 79.5, diff: '+1.0' },
    { name: 'Walk', exp1: 91.8, exp3: 89.7, diff: '-2.1' },  // 真实的 Trade-off
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white font-sans relative pb-12">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-8 mt-10 space-y-10 relative z-10">
        
        {/* 顶部标题区 */}
        <div className="flex justify-between items-end border-b border-[#00f0ff]/30 pb-8">
          <div className="border-l-4 border-[#00f0ff] pl-4">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">架构演进与细粒度精度审计</h1>
            <p className="text-slate-500 font-mono text-sm tracking-[0.2em]">Ablation Study & Class-level F1-Score Diagnosis</p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="px-8 py-3 border border-slate-700 text-slate-400 hover:text-[#00f0ff] hover:border-[#00f0ff] transition-all text-xs font-bold tracking-[0.3em] bg-slate-900/50 rounded-sm uppercase"
          >
            &lt;&lt; 返回总调度中心
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 左侧：宏观消融实验演进 */}
          <div className="lg:col-span-5 space-y-8">
            <DvBox title="Exp1-Exp4 全局精度消融曲线" highlight={true}>
              <div className="space-y-10 pt-2">
                {ablation.map((e, i) => (
                  <div key={i} className="relative group">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <span className={`text-sm font-mono uppercase tracking-widest block mb-1 ${i===3?'text-white font-bold':'text-slate-400'}`}>
                          {e.id}: {e.label}
                        </span>
                        <span className="text-[10px] text-slate-500 italic">{e.desc}</span>
                      </div>
                      <span className={`text-3xl font-black font-mono tracking-tighter ${i===3?'text-[#00f0ff] drop-shadow-[0_0_15px_#00f0ff]':'text-slate-500'}`}>
                        {e.acc.toFixed(2)}%
                      </span>
                    </div>
                    
                    {/* 科技感进度条 */}
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${e.acc}%` }} 
                        transition={{ duration: 1.5, delay: i*0.2, ease: "easeOut" }} 
                        className={`h-full relative ${e.color} ${i===3?'shadow-[0_0_20px_#00f0ff]':''}`} 
                      >
                         <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </DvBox>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
               <h4 className="text-slate-500 font-bold mb-3 uppercase text-xs tracking-widest">全局架构审计结论</h4>
               <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-slate-600 pl-4 font-mono">
                 “盲目引入 Focal Loss (Exp4) 试图解决样本不平衡，反而导致主类特征权重衰减，全局精度回落至 81.57%。最终的 Exp3 架构证明了：多维度的特征融合（气象+空间）远比单纯修改损失函数更有效。”
               </p>
            </div>
          </div>

          {/* 右侧：微观 Class-level F1 分数对比 (你的真实数据！) */}
          <div className="lg:col-span-7">
            <DvBox title="Exp1 vs Exp3 细粒度 F1-Score 突破审计">
              <div className="space-y-8 pt-4">
                
                {/* 标尺头 */}
                <div className="flex text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-4 border-b border-slate-800 pb-2">
                   <div className="w-24">Class</div>
                   <div className="flex-1 flex justify-between px-2">
                     <span>50%</span><span>60%</span><span>70%</span><span>80%</span><span>90%</span><span>100%</span>
                   </div>
                   <div className="w-16 text-right">Delta</div>
                </div>

                {classF1.map((c, i) => {
                  // 计算柱状图的相对宽度 (以 50 为基准起点，放大差异)
                  const w1 = `${(c.exp1 - 40) * 1.66}%`; 
                  const w3 = `${(c.exp3 - 40) * 1.66}%`;
                  const isPositive = parseFloat(c.diff) > 0;

                  return (
                    <div key={i} className="flex items-center group">
                      {/* 类别名 */}
                      <div className="w-24 text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{c.name}</div>
                      
                      {/* 双重对比柱状图 */}
                      <div className="flex-1 h-10 relative border-l border-slate-700 pl-2">
                         {/* Exp1 (基线) - 灰色 */}
                         <div className="absolute top-1 left-2 h-3 bg-slate-700 rounded-r flex items-center" style={{ width: w1 }}>
                            <span className="text-[9px] font-mono text-slate-400 ml-full pl-2">{c.exp1}%</span>
                         </div>
                         {/* Exp3 (SOTA) - 青色/红色 */}
                         <motion.div 
                           initial={{ width: 0 }} animate={{ width: w3 }} transition={{ duration: 1, delay: 0.5 + i*0.1 }}
                           className={`absolute bottom-1 left-2 h-4 rounded-r flex items-center shadow-[0_0_10px_rgba(0,240,255,0.2)] ${isPositive ? 'bg-[#00f0ff]' : 'bg-red-500'}`} 
                         >
                            <span className={`text-[10px] font-black font-mono ml-full pl-2 ${isPositive ? 'text-[#00f0ff]' : 'text-red-500'}`}>{c.exp3}%</span>
                         </motion.div>
                      </div>

                      {/* 差值 */}
                      <div className={`w-16 text-right text-sm font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-red-500'}`}>
                        {c.diff}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 深入分析区块：展示学术真实性 */}
              <div className="mt-12 p-5 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-lg">
                <strong className="text-sm text-[#00f0ff] block mb-2 tracking-widest uppercase">模型性能迁跃解构 (Performance Leap)</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  “通过微观对比可知，Exp3 提升的 1.54% 总精度并非均匀分布。它通过引入空间语义和气象补偿，将 <span className="text-white font-bold">Subway（地铁）</span> 的识别率暴增了 <span className="text-emerald-400 font-black">+15.3%</span>！同时突破了 <span className="text-white font-bold">Car（机动车）</span> 的特征混淆瓶颈（+5.9%）。虽然在 Walk 类别上出现了极轻微的特征挤压（-2.1%），但换来了复杂模态下全局鲁棒性的质变。”
                </p>
              </div>

              {/* 唯一出口 */}
              <button 
                 onClick={() => router.push('/insights/confusion')}
                 className="mt-6 w-full py-4 bg-gradient-to-r from-[#00f0ff]/10 to-transparent border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-xs tracking-[0.3em] hover:bg-[#00f0ff] hover:text-[#010a18] transition-all rounded uppercase"
               >
                 下钻查看 Exp3 误差根因混淆矩阵 &rarr;
               </button>
            </DvBox>
          </div>

        </div>
      </main>
    </div>
  );
}