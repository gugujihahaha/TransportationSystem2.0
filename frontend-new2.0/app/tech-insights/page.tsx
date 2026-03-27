// app/tech-insights/page.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

//   通用科幻边框组件 (弹性高度，防遮挡)
const DvBox = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[rgba(6,18,46,0.6)] border border-[#00f0ff]/30 shadow-[inset_0_0_20px_rgba(0,192,255,0.08)] p-6 flex flex-col rounded-sm hover:border-[#00f0ff]/80 transition-colors ${className}`}>
    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]"></div>
    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]"></div>
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]"></div>
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]"></div>
    {title && (
      <div className="text-[#00f0ff] font-bold text-base tracking-widest mb-6 border-b border-[#00f0ff]/20 pb-2 inline-block shrink-0">
        {title}
      </div>
    )}
    <div className="flex-1 relative w-full flex flex-col">{children}</div>
  </div>
);

type TabType = 'deployment' | 'feature_ops' | 'optimization';

export default function TechInsightsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('deployment');

  const tabs = [
    { id: 'deployment', label: '流式工程计算架构' },
    { id: 'feature_ops', label: '核心特征算子演进' },
    { id: 'optimization', label: '损失函数与收敛剖析' },
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white overflow-hidden flex flex-col font-sans relative pb-12">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <div className="pt-2 z-50"><Navbar /></div>

      <main className="max-w-[1600px] mx-auto w-full px-6 relative z-10 mt-6 flex-1 flex flex-col">
        
        {/* ================= 页面标题与 Tab 切换栏 ================= */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6 border-b border-[#00f0ff]/20 pb-6 shrink-0">
          <div className="border-l-4 border-[#00f0ff] pl-4">
            <h1 className="text-3xl font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              核心算法工程与数学原理剖析
            </h1>
            <p className="text-[#00f0ff]/70 text-xs mt-2 font-mono tracking-widest">
              底层逻辑 / 算子演进 / 部署架构
            </p>
          </div>

          <div className="flex bg-[#0a1438] p-1.5 rounded border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative px-6 py-2.5 text-sm font-bold tracking-widest transition-all rounded-sm z-10 ${
                  activeTab === tab.id ? 'text-[#010a18]' : 'text-[#00f0ff] hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tech-active-tab"
                    className="absolute inset-0 bg-[#00f0ff] rounded-sm -z-10 shadow-[0_0_10px_#00f0ff]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= Tab 动态内容区 ================= */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-y-auto pr-2"
            >
              
              {/* 模块 1：流式工程架构 (展示系统吞吐量) */}
              {activeTab === 'deployment' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  <div className="lg:col-span-8">
                    <DvBox title="高并发流式轨迹推理管道" className="h-full min-h-[450px]">
                      <div className="flex flex-col items-center justify-center flex-1 gap-6 relative font-mono text-sm font-bold w-full">
                         {/* 贯穿主轴的流向线 */}
                         <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-slate-700 via-[#00f0ff]/50 to-[#00f0ff] -translate-x-1/2 -z-10"></div>

                         <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-[85%] bg-slate-900 border border-slate-700 p-5 rounded text-center text-slate-300 shadow-lg">
                            【数据接入层】 终端 GPS 坐标实时信标推送 (MQTT 协议)
                         </motion.div>
                         
                         <div className="text-[#00f0ff] animate-bounce text-xl">▼</div>
                         
                         <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-[85%] bg-emerald-900/20 border border-emerald-500/50 p-5 rounded text-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            【流处理清洗层】 Flink 实时时间窗清洗 (极值跳点过滤 / 轨迹驻留切分)
                         </motion.div>
                         
                         <div className="text-[#00f0ff] animate-bounce text-xl">▼</div>

                         <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-[85%] bg-purple-900/20 border border-purple-500/50 p-5 rounded text-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            【并发算子层】 多线程特征组装 (Redis 缓存路网拓扑 / 并行拉取气象 API)
                         </motion.div>
                         
                         <div className="text-[#00f0ff] animate-bounce text-xl">▼</div>

                         <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="w-[85%] bg-gradient-to-r from-[#00f0ff]/20 to-[#0070f3]/20 border border-[#00f0ff] p-6 rounded text-center text-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.3)] tracking-widest text-base">
                            【模型推理层】 Exp3 全维特征引擎 (TensorRT GPU 显存级加速)
                         </motion.div>
                      </div>
                    </DvBox>
                  </div>
                  
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <DvBox title="工业级服务质量保障 (SLA)" className="h-full">
                       <div className="flex flex-col items-center justify-evenly h-full gap-8 py-4">
                          <div className="text-center w-full">
                            <div className="text-6xl font-black text-[#00f0ff] drop-shadow-[0_0_15px_#00f0ff] font-mono mb-4">{'<'} 45<span className="text-2xl ml-2">毫秒</span></div>
                            <div className="text-slate-400 tracking-widest text-xs border-t border-slate-700 pt-4 w-4/5 mx-auto">单轨迹并发端到端推理时延</div>
                          </div>
                          <div className="text-center w-full">
                            <div className="text-6xl font-black text-emerald-400 drop-shadow-[0_0_15px_#10b981] font-mono mb-4">99.8<span className="text-2xl ml-2">%</span></div>
                            <div className="text-slate-400 tracking-widest text-xs border-t border-slate-700 pt-4 w-4/5 mx-auto">推理集群高可用容灾率</div>
                          </div>
                       </div>
                    </DvBox>
                  </div>
                </div>
              )}

              {/* 模块 2：特征算子演进 (完全对应 Exp1 -> Exp2 -> Exp3 逻辑) */}
              {activeTab === 'feature_ops' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  <div className="lg:col-span-5">
                     <DvBox title="实验演进：核心数学算子重构" className="h-full min-h-[450px]">
                        <div className="space-y-8 flex-1 flex flex-col justify-center">
                          <div className="border-l-2 border-slate-600 pl-5 relative">
                             <div className="absolute -left-2 top-1 w-3.5 h-3.5 bg-slate-500 rounded-full"></div>
                             <h4 className="text-slate-300 text-base font-bold tracking-widest mb-2">Exp1: 基础滑动窗口算子 (21维)</h4>
                             <p className="text-sm text-slate-500 leading-relaxed">利用一阶微分计算相邻定位点的瞬时速度与加速度，并通过设定时间窗口，提取均值、方差、跃度等纯物理分布。</p>
                          </div>
                          
                          <div className="border-l-2 border-purple-500 pl-5 relative">
                             <div className="absolute -left-2 top-1 w-3.5 h-3.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></div>
                             <h4 className="text-purple-400 text-base font-bold tracking-widest mb-2">Exp2: 空间拓扑检索树 (36维)</h4>
                             <p className="text-sm text-slate-400 leading-relaxed">引入高德开放平台，构建路网 KD-Tree。使用半正矢公式 (Haversine) 快速检索轨迹点 50米 范围内的公交站与地铁站密度。</p>
                          </div>

                          <div className="border-l-2 border-[#00f0ff] pl-5 relative">
                             <div className="absolute -left-2 top-1 w-3.5 h-3.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_#00f0ff] animate-pulse"></div>
                             <h4 className="text-[#00f0ff] text-base font-bold tracking-widest mb-2">Exp3: 频域转换与气象插值 (58维)</h4>
                             <p className="text-sm text-slate-300 leading-relaxed">对时序速度应用快速傅里叶变换 (FFT) 提取高频抖动特征；建立时间戳平滑插值，对齐降雨量等环境因子，完成终极张量构建。</p>
                          </div>
                        </div>
                     </DvBox>
                  </div>
                  
                  <div className="lg:col-span-7">
                     <DvBox title="频域特征提取算子演示 (Exp3 核心突破)">
                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                           <div className="w-full flex items-center justify-between gap-6">
                             {/* 时域波形模拟 */}
                             <div className="flex-1 bg-slate-900 border border-slate-700 h-40 rounded-lg flex items-center px-2 relative overflow-hidden">
                                <svg className="w-full h-full stroke-emerald-500" fill="none" strokeWidth="3" viewBox="0 0 100 50" preserveAspectRatio="none">
                                   <path d="M0,25 Q10,10 20,25 T40,25 T60,25 Q70,40 80,25 T100,25" />
                                </svg>
                                <div className="absolute bottom-2 left-3 text-xs text-emerald-400 font-mono font-bold tracking-widest">时域序列 (常规速度)</div>
                             </div>
                             
                             {/* 转换算子 */}
                             <div className="flex flex-col items-center text-[#00f0ff] font-bold text-sm gap-2">
                                <span>傅里叶变换</span>
                                <span className="text-3xl animate-pulse">➾</span>
                                <span className="font-mono">FFT</span>
                             </div>

                             {/* 频域波形模拟 */}
                             <div className="flex-1 bg-[rgba(0,240,255,0.05)] border border-[#00f0ff]/40 h-40 rounded-lg flex items-end justify-center gap-3 pb-4 relative overflow-hidden">
                                <motion.div animate={{ height: ['20%', '60%', '20%'] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-5 bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] rounded-t-sm"></motion.div>
                                <motion.div animate={{ height: ['40%', '90%', '40%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-5 bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] rounded-t-sm"></motion.div>
                                <motion.div animate={{ height: ['10%', '30%', '10%'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-5 bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] rounded-t-sm"></motion.div>
                                <div className="absolute top-2 right-3 text-xs text-[#00f0ff] font-mono font-bold tracking-widest">频域能量谱 (高频抖动)</div>
                             </div>
                           </div>
                           
                           <div className="mt-10 text-sm text-slate-300 bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-5 rounded-lg leading-relaxed w-[95%]">
                              <strong className="text-[#00f0ff] text-base">突破原理解析：</strong> 步行产生的身体踏频抖动、公交车的引擎震动，在常规的速度曲线上极难区分。但通过 FFT 将信号转换到频域后，其 <strong className="text-white">能量谱密度的分布中心</strong> 呈现出高度的正交可分性，这是精度飙升的关键。
                           </div>
                        </div>
                     </DvBox>
                  </div>
                </div>
              )}

              {/* 模块 3：损失函数诊断 (对应为什么抛弃 Exp4) */}
              {activeTab === 'optimization' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  <div className="lg:col-span-12">
                    <DvBox title="模型收敛诊断：为何在对比组中拒绝 Focal Loss (Exp4)？" className="min-h-[450px]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 py-4">
                         
                         {/* 理论解释区 */}
                         <div className="space-y-8 flex flex-col justify-center">
                           <div className="p-6 bg-slate-900 border border-purple-500/40 rounded-lg">
                             <h4 className="text-purple-400 font-bold text-base mb-3 flex items-center gap-2">
                               <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> Exp4 理论陷阱：焦点损失的水土不服
                             </h4>
                             <p className="text-sm text-slate-400 leading-relaxed">
                               我们在 Exp4 尝试引入 Focal Loss 以增加“火车/地铁”等稀有样本的权重。但实验证实：系统过度关注长尾困难样本，导致 <strong className="text-red-400">主分类（公交/机动车）的特征表达被严重抑制</strong>，致使全局准确率从 83.88% 断崖式回落至 81.57%。
                             </p>
                           </div>

                           <div className="p-6 bg-[#00f0ff]/10 border border-[#00f0ff]/50 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                             <h4 className="text-[#00f0ff] font-bold text-base mb-3 flex items-center gap-2">
                               <span className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse"></span> Exp3 破局之道：标签平滑交叉熵
                             </h4>
                             <p className="text-sm text-[#00f0ff]/90 leading-relaxed">
                               果断废弃 Focal Loss。在最终的 Exp3 架构中，我们回归交叉熵，并加入 <strong className="text-white">标签平滑正则化 (Label Smoothing)</strong> 防止强类别过拟合。配合 AdamW 优化器，全局准确率稳步收敛至 <strong className="text-white text-lg font-mono">84.84%</strong> 的全局最优解。
                             </p>
                           </div>
                         </div>

                         {/* 收敛曲线模拟区 */}
                         <div className="bg-[#020813] border border-slate-700 p-6 rounded-lg flex flex-col relative overflow-hidden shadow-inner">
                            <div className="text-xs text-slate-400 font-bold mb-6 text-center tracking-widest uppercase border-b border-slate-800 pb-3">
                              训练轮次准确率收敛对比曲线 (Epoch vs Accuracy)
                            </div>
                            
                            <div className="flex-1 relative flex items-end pl-8 pb-8 mt-2">
                               {/* 坐标轴 */}
                               <div className="absolute left-8 top-0 bottom-8 w-[2px] bg-slate-700"></div>
                               <div className="absolute left-8 bottom-8 right-0 h-[2px] bg-slate-700"></div>
                               
                               <div className="absolute left-0 bottom-7 text-xs font-mono text-slate-500">80%</div>
                               <div className="absolute left-0 top-6 text-xs font-mono text-slate-500">85%</div>
                               <div className="absolute right-0 bottom-2 text-xs font-mono text-slate-500">Epoch 50</div>

                               {/* Exp4 走势线 (紫) -> 冲高回落 */}
                               <svg className="absolute inset-0 w-full h-full pl-8 pb-8 overflow-visible" preserveAspectRatio="none">
                                 <motion.path 
                                   initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5 }}
                                   d="M0,90 Q30,20 50,60 T100,75" fill="none" className="stroke-purple-500" strokeWidth="4" 
                                 />
                               </svg>

                               {/* Exp3 走势线 (青) -> 稳健攀升 */}
                               <svg className="absolute inset-0 w-full h-full pl-8 pb-8 overflow-visible" preserveAspectRatio="none">
                                 <motion.path 
                                   initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, delay: 0.5 }}
                                   d="M0,90 Q40,10 70,15 T100,5" fill="none" className="stroke-[#00f0ff]" strokeWidth="4"
                                   style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8))' }}
                                 />
                               </svg>
                            </div>

                            <div className="mt-4 flex justify-center gap-10 text-xs font-bold tracking-widest">
                              <span className="flex items-center gap-2"><span className="w-4 h-1.5 bg-purple-500 rounded-sm"></span> Exp4 导致过拟合回落</span>
                              <span className="flex items-center gap-2"><span className="w-4 h-1.5 bg-[#00f0ff] rounded-sm shadow-[0_0_8px_#00f0ff]"></span> Exp3 稳定收敛 SOTA</span>
                            </div>
                         </div>
                      </div>
                    </DvBox>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}