// components/life/UserStoryCard.tsx
"use client";
import { motion } from 'framer-motion';

interface UserStoryProps {
  name: string;
  job: string;
  location: string;
  originalTime: number;
  optimizedTime: number;
  story: string;
}

export default function UserStoryCard({ name, job, location, originalTime, optimizedTime, story }: UserStoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#0070f3] flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          {name[0]}
        </div>
        <div>
          <h4 className="text-white font-bold">{name}</h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{job} | 居住：{location}</p>
        </div>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed italic opacity-80">"{story}"</p>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-[#020b1e] border border-slate-800 p-3 rounded-lg text-center">
          <p className="text-[10px] text-slate-500 mb-1">原耗时</p>
          <p className="text-xl font-black text-slate-400 font-mono">{originalTime}min</p>
        </div>
        <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/30 p-3 rounded-lg text-center">
          <p className="text-[10px] text-[#00f0ff] mb-1">优化后</p>
          <p className="text-xl font-black text-[#00f0ff] font-mono drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">{optimizedTime}min</p>
        </div>
      </div>
    </div>
  );
}