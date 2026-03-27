// components/ConfusionMatrix.tsx
"use client";

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ConfusionMatrixProps {
  matrix: number[][];
  labels: string[];
}

export default function ConfusionMatrix({ matrix, labels }: ConfusionMatrixProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || matrix.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    // 将二维数组转换为 ECharts heatmap 需要的 [y, x, value] 格式
    const data = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        data.push([j, i, matrix[i][j]]);
      }
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: { position: 'top', backgroundColor: 'rgba(2, 10, 28, 0.9)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
      grid: { top: '10%', bottom: '15%', left: '15%', right: '5%' },
      xAxis: {
        type: 'category',
        data: labels,
        splitArea: { show: true },
        axisLabel: { color: '#94a3b8', rotate: 45, interval: 0 },
        axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } }
      },
      yAxis: {
        type: 'category',
        data: labels,
        splitArea: { show: true },
        axisLabel: { color: '#94a3b8' },
        axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
        inverse: true // Y轴反转，符合阅读习惯
      },
      visualMap: {
        min: 0,
        max: 150, // 根据实际样本量调整
        calculable: true,
        orient: 'vertical',
        right: '0%',
        bottom: '15%',
        textStyle: { color: '#e2e8f0' },
        inRange: { color: ['#020a1c', '#0070f3', '#00f0ff'] },
        show: false
      },
      series: [{
        name: '混淆矩阵',
        type: 'heatmap',
        data: data,
        label: { show: true, color: '#fff' },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }]
    };

    chartInstance.current.setOption(option);

    return () => window.removeEventListener('resize', handleResize);
  }, [matrix, labels]);

  return <div ref={chartRef} className="w-full h-full"></div>;
}