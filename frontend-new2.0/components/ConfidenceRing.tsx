// components/ConfidenceRing.tsx
"use client";

interface ConfidenceRingProps {
  confidence: number; // 0 - 100
}

export default function ConfidenceRing({ confidence }: ConfidenceRingProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - confidence / 100);

  return (
    <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
        {/* 背景环 */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="10"
        />
        {/* 进度环 */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="url(#confidenceGradient)" strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0070f3" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white text-cyan-glow">{confidence}%</span>
        <span className="text-xs text-gray-400 mt-1">置信度</span>
      </div>
    </div>
  );
}