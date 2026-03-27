// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLocalToken, setLocalToken, removeLocalToken, fetchCurrentUserApi, loginApi, registerApi } from '@/lib/authApi';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  username: string;
  email: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string, e?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化：检查本地 Token 并尝试自动登录
  useEffect(() => {
    const initAuth = async () => {
      const token = getLocalToken();
      if (token) {
        try {
          const userData = await fetchCurrentUserApi();
          setUser(userData);
        } catch (error) {
          removeLocalToken(); // Token无效，清理
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await loginApi(username, password);
    setLocalToken(data.access_token);
    const userData = await fetchCurrentUserApi();
    setUser(userData);
  };

  const register = async (username: string, password: string, email?: string) => {
    await registerApi(username, password, email);
    // 注册成功后自动调用登录
    await login(username, password);
  };

  const logout = () => {
    removeLocalToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};