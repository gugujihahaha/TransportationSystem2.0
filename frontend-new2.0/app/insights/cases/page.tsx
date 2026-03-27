// app/insights/cases/page.tsx
"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CasesInsightPage() {
  const router = useRouter();

  //   针对当前数据集（Geolife）的实测审计项
  const auditReport = [
    { 
      title: '慢行友好系统空间重构实证', 
      discovery: 'Exp3 引擎精准识别了晚高峰骑行轨迹在商圈路段的异常降速。审计发现：1.5km 的非机动车道被机动车违规侵占，导致路权效能降至冰点。',
      strategy: '基于识别出的高置信度坐标点，建议增设物理隔离带，并优化共享单车接驳区。',
      metrics: [
        { label: '路权分配效能', val: '↑ 18.4%', color: 'text-emerald-400' },
        { label: '安全隐患点锁定', val: '24 处', color: 'text-emerald-400' }
      ],
      icon: '🏙️',
      source: 'Geolife V1.3 特征热力审计'
    },
    { 
      title: '高新园区通勤时延诊断', 
      discovery: '通过对 5 万职场样本的聚类分析，系统精准定位了 3 处早高峰接驳盲点。员工在出地铁后存在明显的“无车可用、步行过长”的二次拥堵。',
      strategy: '引入识别结果辅助班车排班，建议将 2 条园区线终点站由单一站点调整为环形接驳。',
      metrics: [
        { label: '平均通勤时延', val: '↓ 22.1%', color: 'text-purple-400' },
        { label: '运营资源节省', val: '15.6%', color: 'text-purple-400' }
      ],
      icon: '🚌',
      source: '园区样本多模态聚类分析'
    },
    { 
      title: '全域碳普惠减排计量审计', 
      discovery: '利用 58 维特征张量精准剔除高碳排样本（机动车）。实测核算出市民由私家车向轨道交通转移的真实低碳贡献轨迹。',
      strategy: '数据标准已对齐市发改委碳资产模型，分类识别结果可直接作为碳积分发还依据。',
      metrics: [
        { label: '单季度核算减排', val: '85.2 吨', color: 'text-[#00f0ff]' },
        { label: '分类准确增益', val: '12.4%', color: 'text-[#00f0ff]' }
      ],
      icon: '🌱',
      source: '碳排放量化分析引擎审计'
    }
  ];

  return (
    <div className="min-h-screen bg-[#010a18] text-white flex flex-col relative pb-20">
      <Navbar />
      <main className="flex-1 max-w-[1600px] mx-auto px-10 w-full flex flex-col mt-12">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className="text-4xl font-black uppercase tracking-tighter mb-4 italic"
          >
            业务落地闭环与价值实证审计
          </motion.h1>
          <div className="flex items-center justify-center gap-4">
             <span className="h-[1px] w-20 bg-slate-800"></span>
             <p className="text-slate-500 font-mono text-[10px] tracking-[0.4em] uppercase">Impact Assessment Report Based On Current Dataset</p>
             <span className="h-[1px] w-20 bg-slate-800"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-20">
          {auditReport.map((a, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
              className="bg-slate-900/60 border border-slate-800 rounded-lg p-10 flex flex-col md:flex-row gap-12 hover:border-[#00f0ff]/30 transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono tracking-widest border-l border-b border-emerald-500/20 uppercase">
                已验证：{a.source}
              </div>
              
              <div className="text-7xl flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">{a.icon}</div>
              
              <div className="flex-1 space-y-8">
                <h3 className="font-bold text-2xl tracking-widest border-b border-slate-800 pb-4">{a.title}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="text-xs leading-relaxed text-slate-400"><strong className="text-white mr-2">[ 审计发现 ]</strong>{a.discovery}</p>
                    <p className="text-xs leading-relaxed text-slate-400"><strong className="text-white mr-2">[ 优化策略 ]</strong>{a.strategy}</p>
                  </div>
                  <div className="flex justify-around items-center bg-black/40 p-6 rounded border border-slate-800">
                    {a.metrics.map((m, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-3xl font-black font-mono ${m.color} mb-2`}>{m.val}</div>
                        <div className="text-[10px] text-slate-500 tracking-widest uppercase">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto py-12 border-t border-slate-800 flex justify-between items-center bg-[rgba(0,240,255,0.02)] px-10 rounded-lg">
           <div>
             <p className="text-xs text-slate-500 font-mono tracking-widest mb-2 uppercase">Verified Year-to-Date Economic Gain</p>
             <p className="text-2xl font-bold">预计年化综合经济效益：<span className="text-emerald-400 font-black font-mono text-4xl ml-4">$ 2.45 MILLION</span></p>
           </div>
           <button onClick={() => router.push('/')} className="px-12 py-5 bg-slate-800 border border-slate-700 hover:bg-white hover:text-black transition-all font-black tracking-[0.3em] uppercase rounded-sm text-xs">完成审计报告浏览</button>
        </div>
      </main>
    </div>
  );
}