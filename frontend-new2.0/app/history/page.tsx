// app/history/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/authApi';

// 定义历史记录的数据结构
interface HistoryRecord {
  id: number;
  predicted_mode: string;
  confidence: number;
  created_at: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 页面状态
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 1. 客户端路由保护：未登录自动踢回登录页
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 2. 获取历史记录数据
  const loadHistoryData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      // 请求后端 /api/history 接口（已在 fetchWithAuth 中自动带上 token）
      const res = await fetchWithAuth('/api/history');
      if (!res.ok) throw new Error('无法获取历史记录，请检查网络或登录状态');
      const data = await res.json();
      setRecords(data);
    } catch (err: any) {
      setError(err.message || '加载历史数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistoryData();
    }
  }, [user]);

  // 3. 辅助函数：为不同的交通方式生成带有科技感的徽章样式和图标
  const getModeBadge = (mode: string) => {
    switch(mode.toLowerCase()) {
      case 'walk': 
        return { icon: '🚶', style: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' };
      case 'bike': 
        return { icon: '🚴', style: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
      case 'bus': 
        return { icon: '🚌', style: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
      case 'subway': 
        return { icon: '🚇', style: 'bg-purple-500/20 text-purple-400 border-purple-500/50' };
      case 'train': 
        return { icon: '🚆', style: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' };
      case 'car & taxi': 
      case 'car':
        return { icon: '🚗', style: 'bg-red-500/20 text-red-400 border-red-500/50' };
      default: 
        return { icon: '❓', style: 'bg-slate-500/20 text-slate-400 border-slate-500/50' };
    }
  };

  // 4. 分页计算
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const currentRecords = records.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // 页面加载中防闪烁
  if (authLoading || !user) {
    return <div className="min-h-[70vh] flex items-center justify-center text-[#00f0ff]">系统权限验证中...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto min-h-[75vh] flex flex-col pt-8">
      
      <div className="flex flex-col gap-6 mb-12">
        <button 
          onClick={() => router.push('/')} 
          className="group flex items-center gap-3 text-slate-400 hover:text-[#00f0ff] transition-all w-fit"
        >
          <span className="text-4xl group-hover:-translate-x-2 transition-transform">«</span>
          <span className="text-sm font-bold tracking-widest uppercase">返回城市监控中心总线</span>
        </button>
        
        <div className="flex justify-between items-end border-b-2 border-[#00f0ff]/20 pb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-[0.2em] flex items-center gap-6">
              <span className="w-3 h-12 bg-[#00f0ff] rounded-sm shadow-[0_0_20px_#00f0ff]"></span>
              历史轨迹分析档案馆
            </h2>
            <p className="text-slate-400 mt-4 text-base tracking-widest font-light">全量时空识别记录回溯与多模态审计结果查询</p>
          </div>
          <button 
            onClick={loadHistoryData} 
            className="text-base font-bold text-[#00f0ff] hover:text-white transition-all border-2 border-[#00f0ff]/40 px-10 py-4 rounded-sm bg-[#00f0ff]/5 hover:bg-[#00f0ff]/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          >
            🔄 同步最新数据流
          </button>
        </div>
      </div>

      <div className="dv-border-box flex-1 flex flex-col p-8 relative">
        <div className="dv-corner-bottom"></div>

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded mb-6 flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={loadHistoryData} className="px-4 py-1 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors">
              重试
            </button>
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#00f0ff]/70 space-y-4">
            <div className="w-10 h-10 border-4 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin"></div>
            <p className="tracking-widest">读取历史档案中...</p>
          </div>
        ) : records.length === 0 && !error ? (
          /* 空数据状态 */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-6">
            <div className="text-6xl opacity-50">📂</div>
            <p className="text-lg tracking-widest">暂无任何轨迹分析档案</p>
            <Link href="/predict" className="dv-btn px-8 py-3 font-bold tracking-widest rounded text-[#00f0ff]">
              前往发起在线预测
            </Link>
          </div>
        ) : (
          /* 数据表格展示 */
          <div className="flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b-2 border-[#00f0ff]/40 py-4 px-4 text-[#00f0ff] font-bold tracking-widest w-1/4">档案生成时间</th>
                    <th className="border-b-2 border-[#00f0ff]/40 py-4 px-4 text-[#00f0ff] font-bold tracking-widest w-1/4">系统判定方式</th>
                    <th className="border-b-2 border-[#00f0ff]/40 py-4 px-4 text-[#00f0ff] font-bold tracking-widest w-1/4">模型置信度</th>
                    <th className="border-b-2 border-[#00f0ff]/40 py-4 px-4 text-[#00f0ff] font-bold tracking-widest text-right w-1/4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => {
                    const badge = getModeBadge(record.predicted_mode);
                    return (
                      <tr 
                        key={record.id} 
                        className={`border-b border-[#00f0ff]/10 hover:bg-[#00f0ff]/10 transition-colors ${index % 2 === 0 ? 'bg-[rgba(2,10,28,0.3)]' : 'bg-transparent'}`}
                      >
                        {/* 时间 */}
                        <td className="py-4 px-4 text-slate-300 font-mono text-sm">
                          {new Date(record.created_at).toLocaleString('zh-CN', { hour12: false })}
                        </td>
                        
                        {/* 预测结果徽章 */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-sm font-bold ${badge.style}`}>
                            <span>{badge.icon}</span>
                            <span className="uppercase tracking-wider">{record.predicted_mode}</span>
                          </span>
                        </td>
                        
                        {/* 置信度条 */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[#00f0ff] font-bold w-12">{Math.round(record.confidence * 100)}%</span>
                            <div className="flex-1 h-1.5 bg-[#020a1c] rounded-full overflow-hidden border border-[#00f0ff]/20">
                              <div 
                                className="h-full bg-gradient-to-r from-[#0070f3] to-[#00f0ff]" 
                                style={{ width: `${record.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        
                        {/* 操作按钮 */}
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => router.push(`/predict?id=${record.id}`)}
                            className="bg-[#00f0ff]/10 hover:bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/50 px-4 py-1.5 rounded transition-all text-sm tracking-wider"
                          >
                            调阅详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 前端分页控件 */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-[#00f0ff]/20">
                <span className="text-slate-400 text-sm">
                  共 <span className="text-[#00f0ff] font-bold">{records.length}</span> 份档案，当前第 {currentPage} / {totalPages} 页
                </span>
                <div className="flex gap-3">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-1.5 bg-[#020a1c] border border-[#00f0ff]/40 text-[#00f0ff] rounded hover:bg-[#00f0ff]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-1.5 bg-[#020a1c] border border-[#00f0ff]/40 text-[#00f0ff] rounded hover:bg-[#00f0ff]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}