// components/Navbar.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🌟 重构后的核心导航菜单（5项，符合完美故事线）
  const navItems = user ? [
    { href: '/', label: '首页看板' },
    { href: '/predict', label: '在线预测' },
    { href: '/tech-insights', label: '技术解析' }, // 聚合了之前的三个技术页
    { href: '/cases', label: '行业全场景解决方案' },         // 新增的社会价值落地页
    { href: '/history', label: '我的记录' }
  ] : [
    { href: '/', label: '首页看板' },
    { href: '/predict', label: '系统演示' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="sticky top-6 z-50 w-[95%] max-w-[1400px] mx-auto mb-10"
    >
      <div className="glass-card px-6 lg:px-8 py-4 flex items-center justify-between bg-[rgba(10,20,56,0.85)] backdrop-blur-xl border border-[#00f0ff]/30 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.15)]">
        
        {/* 左侧 Logo */}
        <Link href="/" className="flex items-center gap-3 lg:gap-4">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-[#0070f3] to-[#00f0ff] p-[2px] shadow-[0_0_10px_#00f0ff]">
            <div className="w-full h-full bg-[#0a1438] rounded-full flex items-center justify-center">
              <span className="text-[#00f0ff] font-bold text-base lg:text-lg tracking-tighter">TR</span>
            </div>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00f0ff] tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            TrafficRec
          </h1>
        </Link>

        {/* ================= PC 端菜单 ================= */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative px-4 py-2 group">
                <span className={`text-sm xl:text-base transition-colors duration-300 font-bold tracking-widest ${isActive ? 'text-white drop-shadow-[0_0_8px_#fff]' : 'text-slate-400 group-hover:text-[#00f0ff]'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-[#00f0ff] rounded-full"
                    style={{ boxShadow: '0 0 10px rgba(0,240,255,0.8)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* PC 端用户信息区 */}
        <div className="hidden lg:flex items-center gap-4 border-l border-[#00f0ff]/20 pl-6 min-w-[150px] justify-end">
          {loading ? (
            <div className="text-slate-500 text-sm animate-pulse font-mono tracking-widest">AUTH...</div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-[#00f0ff] font-bold tracking-widest text-sm hover:text-white transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Hi, {user.username}
              </Link>
              <button 
                onClick={logout} 
                className="px-4 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500 transition-all text-sm font-bold tracking-widest"
              >
                退出
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-[#00f0ff] font-bold text-sm tracking-widest transition-colors px-3">登录</Link>
              <Link href="/register" className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/50 rounded-lg text-sm py-1.5 px-5 hover:bg-[#00f0ff] hover:text-[#0a1438] hover:shadow-[0_0_15px_#00f0ff] transition-all font-bold tracking-widest">立即注册</Link>
            </>
          )}
        </div>

        {/* ================= 移动端汉堡按钮 ================= */}
        <div className="lg:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#00f0ff] p-2 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ================= 移动端下拉菜单 ================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-2 overflow-hidden rounded-2xl bg-[rgba(10,20,56,0.95)] backdrop-blur-xl border border-[#00f0ff]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="px-4 pt-2 pb-6 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-bold tracking-widest transition-colors ${
                      isActive ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-[#00f0ff]/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}