// app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/authApi';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar'; 

//   科技风沉浸式卡片容器 (废除溢出隐藏，改为弹性拉伸)
const DvBox = ({ title, subTitle, children, className = "", onClick, highlight = false, isDanger = false }: { title?: string, subTitle?: string, children: React.ReactNode, className?: string, onClick?: () => void, highlight?: boolean, isDanger?: boolean }) => {
  const color = isDanger ? 'red-500' : highlight ? '[#00f0ff]' : '[#00f0ff]/40';
  const hoverColor = isDanger ? 'red-400' : '[#00f0ff]';
  
  return (
    <div onClick={onClick} className={`relative bg-[rgba(6,18,46,0.6)] border border-${color} shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] p-5 flex flex-col cursor-pointer hover:border-${hoverColor} hover:bg-[rgba(6,18,46,0.85)] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300 group rounded-sm ${className}`}>
      {/* 科幻装饰角 */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${isDanger ? 'red-500' : '[#00f0ff]'}`}></div>
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${isDanger ? 'red-500' : '[#00f0ff]'}`}></div>
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${isDanger ? 'red-500' : '[#00f0ff]'}`}></div>
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${isDanger ? 'red-500' : '[#00f0ff]'}`}></div>
      
      {/* 标题栏 (shrink-0 防止被压缩) */}
      <div className={`flex justify-between items-end border-b border-${isDanger ? 'red-500/30' : '[#00f0ff]/20'} pb-2 mb-4 shrink-0`}>
         <div className="flex items-center gap-2">
           <span className={`w-1.5 h-1.5 ${isDanger ? 'bg-red-500' : 'bg-[#00f0ff]'} shadow-[0_0_5px_currentColor]`}></span>
           <span className={`font-bold text-sm tracking-widest group-hover:text-white transition-colors block ${isDanger ? 'text-red-500' : 'text-[#00f0ff]'}`}>{title}</span>
         </div>
         <div className="flex flex-col items-end">
           {subTitle && <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">{subTitle}</span>}
           <span className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 ${isDanger ? 'text-red-400' : 'text-[#00f0ff]'}`}>进入详情审计 &rarr;</span>
         </div>
      </div>
      {/* 核心内容区 (改为 flex-col 让内部元素自然伸展，不强制隐藏) */}
      <div className="flex-1 relative w-full flex flex-col justify-center">{children}</div>
    </div>
  );
};

export default function DashboardHome() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<{id: number, time: string, text: string, mode: string, lat: string, lng: string, latency: number}[]>([]);
  const [cpuLoad, setCpuLoad] = useState([45, 62, 38]);
  const [globalLatency, setGlobalLatency] = useState(12);

  // 1. 获取后端全局数据
  useEffect(() => {
    fetchWithAuth('/api/stats/overall').then(res => res.json()).then(data => setStats(data));
  }, []);

  // 2. 雷达实时捕获日志 (增加延迟 latency)
  useEffect(() => {
    let logId = 0;
    const modes = ['步行', '公交', '私家车', '地铁', '骑行'];
    const interval = setInterval(() => {
      const mode = modes[Math.floor(Math.random() * modes.length)];
      const conf = (Math.random() * 0.15 + 0.84).toFixed(3);
      const lat = (116.3 + Math.random() * 0.2).toFixed(4);
      const lng = (39.8 + Math.random() * 0.2).toFixed(4);
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      const latency = Math.floor(Math.random() * 25 + 5); // 生成 5-30ms 的随机延迟
      
      setLogs(prev => [{
        id: logId++, time, mode, lat, lng, latency,
        text: `时空特征对齐成功 [置信度: ${conf}]`
      }, ...prev].slice(0, 6)); 
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // 3. 模拟算力负载与全局延迟跳动
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuLoad(prev => prev.map(v => Math.min(100, Math.max(15, v + (Math.random() * 20 - 10)))));
      setGlobalLatency(Math.floor(Math.random() * 8 + 8)); // 8-15ms 波动
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // 提取 F1 数据
  const f1Data = stats?.f1_scores 
    ? Object.entries(stats.f1_scores).map(([k, v]) => ({ name: k, value: (v as number) * 100 })).slice(0, 4)
    : [{name: 'Walk(步行)', value: 89.7}, {name: 'Bike(骑行)', value: 94.4}, {name: 'Bus(公交)', value: 79.5}, {name: 'Car(机动车)', value: 55.9}];

  return (
    <div className="min-h-screen bg-[#010a18] text-white overflow-hidden flex flex-col font-sans relative">
      <div className="absolute inset-0 opacity-[0.12] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <div className="pt-2 z-50"><Navbar /></div>

      <main className="flex-1 grid grid-cols-12 gap-5 px-6 pb-6 w-full max-w-[1900px] mx-auto mt-4 z-10 items-stretch">
        
        {/* ================= 顶栏遥测状态区 ================= */}
        <div className="col-span-12 flex justify-between items-center bg-[rgba(0,240,255,0.03)] border border-[#00f0ff]/20 px-5 py-3 rounded font-mono text-[11px] text-[#00f0ff] shrink-0">
          <div className="flex gap-10">
            <span className="flex items-center gap-2 font-bold"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></span>系统集群状态：稳定在线 (ONLINE)</span>
            <span className="text-slate-400">上行数据带宽：<span className="text-[#00f0ff]">24.5 Mbps</span></span>
            <span className="text-slate-400">实时推演延迟：<span className="text-emerald-400 font-bold">{globalLatency} ms</span></span>
          </div>
          <div className="flex gap-10 text-slate-400">
            <span>底层基准数据：<span className="text-purple-400">Geolife V1.3</span></span>
            <span>核心驱动引擎：<span className="text-orange-400">ST-Fusion_Exp3</span></span>
          </div>
        </div>

        {/* ================= 左侧列 ================= */}
        <div className="col-span-3 flex flex-col gap-5">
          
          {/* 【入口 1】 底层数据资产 (使用 min-h，避免截断) */}
          <DvBox title="底层数据资产溯源" subTitle="Geolife Dataset" onClick={() => router.push('/insights/dataset')} className="min-h-[220px] shrink-0">
             <div className="flex justify-between items-center h-full pt-2 px-2">
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-[11px] text-slate-400 tracking-widest uppercase mb-2 font-bold">全域有效时空锚点</p>
                    <p className="text-4xl font-black font-mono text-white tracking-tighter leading-none">24.5<span className="text-base text-slate-600 ml-1">M</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 tracking-widest uppercase mb-1.5">清洗后轨迹切片总量</p>
                    <p className="text-2xl font-black font-mono text-purple-400 leading-none">145,892</p>
                  </div>
                </div>
                {/* 装饰性数据流环 */}
                <div className="w-16 h-16 rounded-full border border-dashed border-slate-600 flex items-center justify-center animate-[spin_8s_linear_infinite] shrink-0 ml-4">
                  <div className="w-10 h-10 border border-slate-500 rounded-full"></div>
                </div>
             </div>
          </DvBox>

          {/* 【入口 2】 核心精度与性能 (使用 flex-1，自动向下撑开) */}
          <DvBox title="引擎精度演进审计" subTitle="Accuracy & F1-Score" onClick={() => router.push('/insights/accuracy')} className="flex-1 min-h-[400px]">
             <div className="flex flex-col h-full justify-evenly">
                <div className="flex flex-col items-center justify-center py-4 border-b border-slate-800/50 shrink-0">
                  <p className="text-[11px] text-slate-400 tracking-widest mb-4">Exp3 SOTA 全局准确率</p>
                  <div className="relative">
                    <p className="text-[3.5rem] font-black font-mono text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.6)] leading-none">{stats ? `${stats.accuracy}%` : '84.84%'}</p>
                    <div className="absolute top-0 -right-6 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center space-y-5 pt-4">
                  <p className="text-[10px] text-slate-500 border-b border-slate-800 pb-2 uppercase tracking-widest">单类别 F1 分数监控 (Class-Level F1)</p>
                  {f1Data.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[11px] text-slate-300 font-mono mb-2">
                        <span>{item.name}</span>
                        <span className="text-[#00f0ff] font-bold">{item.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1.5 }} className={`h-full ${item.value > 85 ? 'bg-gradient-to-r from-[#0070f3] to-[#00f0ff]' : 'bg-gradient-to-r from-orange-600 to-orange-400'}`}></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </DvBox>
        </div>

        {/* ================= 中间列 ================= */}
        <div className="col-span-6 flex flex-col bg-[rgba(2,8,20,0.85)] border border-[#00f0ff]/50 shadow-[0_0_30px_rgba(0,240,255,0.15)] rounded-sm p-6 relative">
          
          <div className="flex justify-between items-center border-b border-[#00f0ff]/30 pb-4 mb-5 shrink-0">
             <div className="flex items-center gap-3">
               <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></span>
               <h2 className="text-[#00f0ff] font-bold tracking-widest text-lg uppercase">全域态势时空雷达监控核心</h2>
             </div>
             <span className="text-xs text-[#00f0ff]/80 font-mono tracking-widest bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-3 py-1 rounded-sm">雷达扫描中...</span>
          </div>

          <div className="flex-1 flex flex-col gap-5 relative">
             
             {/* 🎯 纯正科幻雷达 */}
             <div className="flex-1 bg-[#010a18] relative overflow-hidden flex items-center justify-center border border-[#00f0ff]/20 rounded-sm shadow-inner min-h-[250px]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.08)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                
                <div className="relative w-[300px] h-[300px] rounded-full border-2 border-[#00f0ff]/30 flex items-center justify-center">
                   <div className="absolute w-[200px] h-[200px] rounded-full border border-[#00f0ff]/20"></div>
                   <div className="absolute w-[100px] h-[100px] rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/5"></div>
                   <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_#fff]"></div>
                   
                   <div className="absolute w-[300%] h-[1px] bg-[#00f0ff]/20"></div>
                   <div className="absolute h-[300%] w-[1px] bg-[#00f0ff]/20"></div>

                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(0,240,255,0.4)_100%)] origin-center" />

                   <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.8 }} className="absolute top-10 right-16 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_red]"></div>
                      <div className="mt-1 bg-black/80 border border-red-500/50 text-[9px] text-red-400 font-mono px-1 rounded-sm">目标_A</div>
                   </motion.div>

                   <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1 }} className="absolute bottom-16 left-12 flex flex-col items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]"></div>
                      <div className="mt-1 bg-black/80 border border-emerald-500/50 text-[9px] text-emerald-400 font-mono px-1 rounded-sm">目标_B</div>
                   </motion.div>
                </div>

                <div className="absolute top-3 left-3 text-[11px] text-slate-500 font-mono bg-black/50 px-2 py-1 rounded">雷达方位角: 184.2°</div>
                <div className="absolute bottom-3 right-3 text-[11px] text-[#00f0ff] font-mono bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-2 py-1 rounded animate-pulse">模式: 实时推演拦截</div>
             </div>

             {/*     终端拦截日志 (加入延迟 ms 字段) */}
             <div className="h-[180px] w-full bg-[#030712] border border-slate-700 p-4 font-mono flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,1)] rounded-sm shrink-0">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3 shrink-0">
                   <span className="text-slate-500 text-[11px]">监控终端 | /var/log/st_intercept.log</span>
                   <span className="text-emerald-500 text-[10px] bg-emerald-500/10 px-2 py-1 border border-emerald-500/30 rounded-sm">轨迹同步中...</span>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col justify-end gap-2 text-[11px]">
                  <AnimatePresence>
                    {logs.map((log) => (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 border-l-2 border-emerald-500/30 pl-2">
                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                        {/*   新增的延迟展示区 */}
                        <span className="text-yellow-400 font-bold shrink-0 w-[80px]">延迟:{log.latency}ms</span>
                        <span className="text-[#00f0ff] shrink-0 w-[140px] whitespace-nowrap">坐标: {log.lat}, {log.lng}</span>
                        <span className="text-emerald-400/90 flex-1 truncate">{log.text}</span>
                        <span className="bg-[#00f0ff]/10 text-[#00f0ff] px-2 py-0.5 rounded border border-[#00f0ff]/30 font-bold whitespace-nowrap shrink-0">[{log.mode}]</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
             </div>

             {/* 🎯 终极沙盘推演入口 */}
             <button onClick={() => router.push('/predict')} className="w-full h-[56px] bg-gradient-to-r from-[#00f0ff]/10 to-transparent border border-[#00f0ff]/50 hover:bg-[#00f0ff] hover:text-[#010a18] text-[#00f0ff] font-black tracking-[0.2em] uppercase transition-all rounded shadow-[0_0_15px_rgba(0,240,255,0.1)] text-[15px] shrink-0">
                启动微观实盘推演沙盘 &gt;&gt;
             </button>
          </div>
        </div>

        {/* ================= 右侧列 ================= */}
        <div className="col-span-3 flex flex-col gap-5">
          
          {/* 【入口 3】 时空引擎 (使用 min-h) */}
          <DvBox title="底层算法特征引擎" subTitle="Engine Architecture" onClick={() => router.push('/insights/architecture')} className="min-h-[200px] shrink-0">
             <div className="flex items-center justify-center h-full gap-5 px-2">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-orange-500/30 rounded-full border-t-orange-500"></motion.div>
                   <span className="font-mono text-white text-base font-black drop-shadow-[0_0_5px_#f97316]">58维</span>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  {[
                    {name: '多模态张量组装', val: cpuLoad[0]},
                    {name: '注意力特征融合', val: cpuLoad[1]},
                    {name: 'LSTM 时序推理', val: cpuLoad[2]}
                  ].map((l, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] text-slate-300 font-mono mb-1"><span>{l.name}</span><span className="text-orange-400">{Math.round(l.val)}%</span></div>
                      <div className="h-1 bg-slate-800 rounded-full"><motion.div animate={{width: `${l.val}%`}} className="h-full bg-orange-500 rounded-full shadow-[0_0_5px_#f97316]" /></div>
                    </div>
                  ))}
                </div>
             </div>
          </DvBox>

          {/* 【入口 4】 宏观潮汐画像 (flex-1 自动伸缩) */}
          <DvBox title="宏观全域潮汐画像" subTitle="Distribution Tide" onClick={() => router.push('/insights/distribution')} className="flex-1 min-h-[240px]">
            <div className="flex flex-col justify-end h-full px-2 pb-2">
              <div className="flex items-end justify-between h-[130px] gap-2 border-b border-slate-700">
                {[20, 45, 95, 40, 30, 85, 55, 20].map((val, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [`${val-15}%`, `${val}%`, `${val-15}%`] }} 
                    transition={{ repeat: Infinity, duration: 1.5 + i*0.2, ease: "easeInOut" }} 
                    className={`w-full rounded-t-sm ${i === 2 || i === 5 ? 'bg-gradient-to-t from-[#00f0ff]/50 to-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-slate-700'}`} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-[#00f0ff] font-mono tracking-widest mt-5 text-center animate-pulse">24H 潮汐波动推演中...</p>
            </div>
          </DvBox>

          {/* 【入口 5】 误差归因诊断 (min-h) */}
          <DvBox title="误差根因热力诊断" subTitle="Error Matrix" onClick={() => router.push('/insights/confusion')} isDanger={true} className="min-h-[150px] shrink-0">
             <div className="w-full h-full flex items-center justify-between px-3">
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-[11px] text-red-400 uppercase tracking-widest">核心特征混淆边界</p>
                  <p className="text-xl font-bold text-white tracking-widest font-mono">公交车 <span className="text-red-500 text-sm mx-1">VS</span> 机动车</p>
                </div>
                <div className="w-14 h-14 rounded bg-red-500/10 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
                  <span className="text-red-500 font-black text-sm tracking-widest animate-ping">警告</span>
                </div>
             </div>
          </DvBox>

        </div>

        {/* ================= 底部通栏：业务价值与 ROI ================= */}
        <div className="col-span-12">
          {/* 解除高度锁死，改用 min-h，彻底避免文字遮挡！ */}
          <DvBox title="系统业务落地应用场景与实证审计报告" subTitle="Empirical Value & ROI Audit" onClick={() => router.push('/insights/cases')} className="min-h-[180px] py-6 hover:border-emerald-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 h-full pt-3 px-4">
              {[
                { title: '慢行友好系统空间重构', desc: '精准识别慢行热力区域，优化核心商圈路权分配。', kpi: '道路效能提升 18.4%' },
                { title: '大型企业园区通勤降本', desc: '聚类分析园区接驳盲区，高效疏导职场潮汐积压。', kpi: '平均通勤时延下降 22.1%' },
                { title: '城市碳普惠计量与交易闭环', desc: '打通市民绿色出行行为特征与政府碳积分发还体系。', kpi: '单季度核算减排 85.2 吨' }
              ].map((scene, idx) => (
                <div key={idx} className="flex flex-col justify-start relative pl-4 border-l-2 border-slate-700 hover:border-emerald-500 transition-colors">
                  <h4 className="text-emerald-400 font-bold text-[15px] mb-2">{scene.title}</h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{scene.desc}</p>
                  <div className="mt-auto">
                     <span className="text-[13px] font-black text-white tracking-widest bg-emerald-500/10 inline-block px-3 py-1.5 rounded border border-emerald-500/20">
                       {scene.kpi}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </DvBox>
        </div>
      </main>
    </div>
  );
}