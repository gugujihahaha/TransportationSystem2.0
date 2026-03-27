// components/TrajectoryUpload.tsx
"use client";

import { useState, useRef } from 'react';
import { parseCSV, TrajectoryPoint } from '@/lib/parsers';

interface TrajectoryUploadProps {
  onUploadSuccess: (points: TrajectoryPoint[]) => void;
  disabled?: boolean;
}

export default function TrajectoryUpload({ onUploadSuccess, disabled }: TrajectoryUploadProps) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return setError("仅支持上传 .csv 格式的文件");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const points = parseCSV(text);
        onUploadSuccess(points);
      } catch (err: any) {
        setError(err.message || '文件解析异常');
      }
    };
    reader.onerror = () => setError("文件读取失败");
    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed border-gray-600' :
          isDragging ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_20px_rgba(0,240,255,0.2)]' : 'border-[#0070f3]/50 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5'
        }`}
        onDragOver={(e) => { e.preventDefault(); if(!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled && e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input 
          type="file" accept=".csv" className="hidden" ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="text-4xl mb-3">📁</div>
        <p className="text-gray-300 font-medium mb-1">点击选择文件，或将 CSV 拖拽至此处</p>
        <p className="text-xs text-gray-500">需包含 lat, lng 字段，最大支持 10MB</p>
      </div>
      {error && <p className="text-red-400 text-sm mt-3 text-center">⚠️ {error}</p>}
    </div>
  );
}