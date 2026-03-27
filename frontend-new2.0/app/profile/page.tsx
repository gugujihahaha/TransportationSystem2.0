// app/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // 密码修改表单状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 提示信息状态
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 客户端路由保护：未登录自动踢回登录页
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 2. 处理密码更新逻辑（前端验证 + 模拟接口预留）
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 前端基础验证
    if (newPassword.length < 6) {
      return setMessage({ type: 'error', text: '新密码长度至少需要 6 位' });
    }
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: '两次输入的新密码不一致' });
    }
    if (oldPassword === newPassword) {
      return setMessage({ type: 'error', text: '新密码不能与旧密码相同' });
    }

    setIsSubmitting(true);

    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: 后续对接后端真实接口
      // const res = await fetchWithAuth('/api/auth/password', {
      //   method: 'PUT',
      //   body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      // });
      // if (!res.ok) throw new Error('密码修改失败');

      // 模拟成功响应
      setMessage({ type: 'success', text: '🚧 密码修改功能开发中，实际将调用后端接口。验证已通过！' });
      
      // 注意：按需求不清空表单
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '系统异常，请稍后再试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 格式化注册时间
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '未知' : date.toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // 页面加载中防闪烁
  if (authLoading || !user) {
    return <div className="min-h-[70vh] flex items-center justify-center text-[#00f0ff] exp2-subtitle">权限验证中...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto min-h-[75vh] pt-10 pb-16 exp2-bg-container">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold exp2-title tracking-widest flex items-center gap-3">
          <span className="w-1.5 h-8 bg-gradient-to-b from-[#0070f3] to-[#00f0ff] rounded-full"></span>
          系统用户中心
        </h2>
        <p className="text-slate-400 mt-2 tracking-wider">管理您的个人档案与安全凭证</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左侧：个人信息卡片 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="exp2-glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* 顶部背景装饰 */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0070f3]/20 to-transparent"></div>
            
            {/* 默认头像占位 */}
            <div className="relative w-24 h-24 rounded-full bg-[#0a1438] border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center mb-6 mt-4 z-10">
              <span className="text-4xl">👨‍💻</span>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-[#0a1438] rounded-full"></div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{user.username}</h3>
            <span className="px-3 py-1 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] text-xs border border-[#00f0ff]/30 mb-6">
              系统操作员
            </span>

            <div className="w-full space-y-4 text-left border-t border-[rgba(0,240,255,0.2)] pt-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">联系邮箱</p>
                <p className="text-sm text-slate-200 font-medium">{user.email || '未设置'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">档案建立时间</p>
                <p className="text-sm text-slate-200 font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">用户识别码 (ID)</p>
                <p className="text-sm text-slate-200 font-mono">#{user.id}</p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="mt-8 w-full py-3 rounded-lg border border-red-500/50 text-red-400 font-bold tracking-widest hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
            >
              安全退出系统
            </button>
          </div>
        </motion.div>

        {/* 右侧：安全设置卡片（修改密码） */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="exp2-glass-card p-8 lg:p-10 h-full">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[rgba(0,240,255,0.2)] pb-4 flex items-center gap-3">
              <span className="text-[#00f0ff]">🔒</span> 安全凭证更新
            </h3>

            {/* 提示信息展示 */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg border text-sm flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
                {message.text}
              </motion.div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">当前访问密钥</label>
                <input 
                  type="password" required 
                  className="w-full exp2-input"
                  value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入当前使用的密码"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">全新访问密钥</label>
                <input 
                  type="password" required 
                  className="w-full exp2-input"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少需要 6 位字符"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">确认全新密钥</label>
                <input 
                  type="password" required 
                  className="w-full exp2-input"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={isSubmitting}
                  className="exp2-btn py-3 px-8 text-lg tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      凭证更新中...
                    </>
                  ) : '更 新 凭 证'}
                </button>
              </div>
            </form>

            <div className="mt-10 p-5 rounded-lg bg-[#0070f3]/10 border border-[#00f0ff]/20">
              <h4 className="text-[#00f0ff] font-bold text-sm mb-2">安全提示</h4>
              <ul className="text-slate-400 text-xs space-y-1.5 list-disc list-inside">
                <li>请勿使用过于简单的密码，建议包含大小写字母及数字。</li>
                <li>定期更换访问密钥有助于保护您的系统档案安全。</li>
                <li>如发现账号异常，请立即联系系统超级管理员进行冻结。</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}