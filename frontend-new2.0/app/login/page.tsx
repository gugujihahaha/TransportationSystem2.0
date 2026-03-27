"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      router.push('/'); // 登录成功前往演示大屏
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative z-10 exp2-bg-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="exp2-glass-card p-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl exp2-title mb-3">系统登录</h2>
          <p className="exp2-subtitle">欢迎进入交通方式识别系统</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm mb-2 pl-1 font-medium">授权账号</label>
            <input 
              type="text" required 
              className="w-full exp2-input"
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的用户名"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2 pl-1 font-medium">安全密码</label>
            <input 
              type="password" required 
              className="w-full exp2-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full exp2-btn mt-4 text-lg tracking-widest disabled:opacity-50 flex justify-center items-center"
          >
            {isSubmitting ? (
               <span className="flex items-center gap-2">
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 验证中...
               </span>
            ) : '登 录'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm exp2-subtitle">
          还没有账号？ <Link href="/register" className="exp2-highlight hover:text-white transition-colors">立即注册开通权限</Link>
        </p>
      </motion.div>
    </div>
  );
}