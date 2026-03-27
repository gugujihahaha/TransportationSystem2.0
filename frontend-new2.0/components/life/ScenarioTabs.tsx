// components/life/ScenarioTabs.tsx
"use client";
import { useState } from 'react';

export default function ScenarioTabs() {
  const [active, setActive] = useState('morning');
  const scenarios: any = {
    morning: { label: '早高峰', acc: '83.2%', advice: '建议提前查看实时公交，避开拥堵。' },
    evening: { label: '晚高峰', acc: '85.1%', advice: '地铁识别准确率极高，建议优先选择。' },
    holiday: { label: '节假日', acc: '82.5%', advice: '公交线路变动大，可考虑骑行接驳。' }
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-[#0a1438] p-1 rounded-lg border border-[#00f0ff]/20">
        {Object.keys(scenarios).map((id) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest rounded transition-all ${
              active === id ? 'bg-[#00f0ff] text-[#010a18] shadow-[0_0_10px_#00f0ff]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {scenarios[id].label}
          </button>
        ))}
      </div>
      <div className="p-3 bg-[#020b1e] border border-slate-800 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-slate-500 uppercase">识别准确率</span>
          <span className="text-lg font-black text-[#00f0ff] font-mono">{scenarios[active].acc}</span>
        </div>
        <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-2 leading-relaxed">
          💡 <span className="text-[#00f0ff]">建议：</span>{scenarios[active].advice}
        </p>
      </div>
    </div>
  );
}