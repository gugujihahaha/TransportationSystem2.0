// app/insights/layout.tsx
"use client";

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function InsightsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#010a18] text-white overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      {/* HUD 风格沉浸式 Header */}
      <header className="sticky top-0 z-50 bg-[rgba(10,30,60,0.8)] backdrop-blur-md border-b border-[#00f0ff]/30 px-8 py-5 flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#00f0ff]/80 hover:text-white transition-colors text-sm font-bold tracking-widest group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回全局大屏中心
          </button>
          <div className="h-6 w-[1px] bg-slate-700"></div>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00f0ff] tracking-widest">
            Exp3 核心模型全息数据审计报告
          </h1>
        </div>
        <div className="text-xs text-slate-500 font-mono">[ 国家级大数据实践赛 参赛作品 ]</div>
      </header>
      
      {/* 子页面内容注入区 */}
      <main className="max-w-[1400px] mx-auto mt-8 px-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}