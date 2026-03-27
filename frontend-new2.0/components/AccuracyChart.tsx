"use client";
import React from 'react';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AccuracyChartProps {
  data: { name: string; accuracy: number }[];
}

export const AccuracyChart = ({ data }: AccuracyChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const maxAccuracy = 100;
  const barHeight = 60;
  const barGap = 20;
  const labelWidth = 180;
  const colorGradients = [
    'linear-gradient(90deg, #0070f3, #00a0ff)',
    'linear-gradient(90deg, #00a0ff, #00f0ff)',
    'linear-gradient(90deg, #00f0ff, #00d0ff)',
    'linear-gradient(90deg, #00d0ff, #0090ff)',
    'linear-gradient(90deg, #0090ff, #0070f3)',
  ];

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.style.opacity = '1';
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      ref={chartRef}
      className="w-full max-w-5xl mx-auto"
      style={{ 
        opacity: 0,
        padding: '40px 30px',
        background: 'rgba(5, 10, 30, 0.85)',
        borderRadius: '20px',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 112, 243, 0.1)',
        overflowX: 'auto',
        overflowY: 'hidden'
      }}
    >
      <h3 className="text-2xl font-bold text-center mb-10 text-white" style={{
        textShadow: '0 0 10px rgba(0, 240, 255, 0.8)'
      }}>
        各实验模型准确率对比
      </h3>

      {/* 完全移除刻度，只保留实验名称和条形 */}
      <div className="relative pl-0 pr-20" style={{ minWidth: '700px' }}>
        <div className="flex flex-col gap-[20px]">
          {data.map((item, index) => {
            const widthPercentage = (item.accuracy / maxAccuracy) * 100;
            return (
              <motion.div 
                key={item.name}
                className="flex items-center gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              >
                <div 
                  className="text-xl font-medium text-white shrink-0"
                  style={{
                    width: `${labelWidth}px`,
                    textAlign: 'right',
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                  }}
                >
                  {item.name}
                </div>
                
                <div className="flex items-center flex-1 h-full">
                  <motion.div
                    className="h-[60px] rounded-lg relative overflow-hidden flex items-center justify-end pr-4"
                    style={{
                      width: '0%',
                      background: colorGradients[index % colorGradients.length],
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 1, ease: "easeOut" }}
                  >
                    <span className="text-white font-bold text-xl shrink-0 w-20 text-right" style={{
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                    }}>
                      {item.accuracy}%
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center text-[#e2e8f0]/90 text-lg">
        <p style={{ textShadow: '0 0 5px rgba(0, 240, 255, 0.4)' }}>
          Exp2（轨迹+基础KG）以 <span className="text-[#00f0ff] font-bold text-xl">79.49%</span> 取得最优准确率
        </p>
      </div>
    </motion.div>
  );
};