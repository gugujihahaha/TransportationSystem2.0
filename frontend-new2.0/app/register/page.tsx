"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPwd) return setError('两次输入的密码不一致，请重新核对');
    if (password.length < 6) return setError('安全密码至少需要6位');
    
    setError('');
    setIsSubmitting(true);
    try {
      await register(username, password, email.trim() || undefined);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '注册失败，该用户名可能已被占用');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative z-10 exp2-bg-container py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="exp2-glass-card p-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl exp2-title mb-3">申请权限</h2>
          <p className="exp2-subtitle">开通交通方式智能分析系统访问权限</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2 pl-1 font-medium">系统用户名 <span className="text-[#00f0ff]">*</span></label>
            <input 
              type="text" required 
              className="w-full exp2-input"
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入系统用户名"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2 pl-1 font-medium">联系邮箱 (可选)</label>
            <input 
              type="email" 
              className="w-full exp2-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2 pl-1 font-medium">安全密码 <span className="text-[#00f0ff]">*</span></label>
            <input 
              type="password" required 
              className="w-full exp2-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="设置6位以上的强密码"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2 pl-1 font-medium">确认密码 <span className="text-[#00f0ff]">*</span></label>
            <input 
              type="password" required 
              className="w-full exp2-input"
              value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="请再次确认密码"
            />
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full exp2-btn mt-6 text-lg tracking-widest disabled:opacity-50 flex justify-center items-center"
          >
            {isSubmitting ? '系统建档中...' : '立即注册'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm exp2-subtitle">
          已有账号？ <Link href="/login" className="exp2-highlight hover:text-white transition-colors">返回登录</Link>
        </p>
      </motion.div>
    </div>
  );
}