import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: '交通方式识别系统 | 大数据指挥中心',
  description: '核心 Exp3 模型，准确率 84.84%',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} text-white`}>
        <AuthProvider>
          {/* <Navbar /> */}
          <main className="min-h-[80vh]">
            {children}
          </main>
          <footer className="mt-16 py-8 border-t border-[rgba(0,240,255,0.1)] text-center text-sm text-gray-500">
            © 2026 中国计算机设计大赛大数据实践赛项目 | 核心模型 Exp3 准确率 84.84%
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}