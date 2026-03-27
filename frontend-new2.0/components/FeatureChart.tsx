// components/FeatureChart.tsx
"use client";

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface FeatureData {
  name: string;
  value: number; // 权重百分比
}

interface FeatureChartProps {
  data: FeatureData[];
}

export default function FeatureChart({ data }: FeatureChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    if (data.length === 0) {
      chartInstance.current.clear();
      return;
    }

    // 排序使最高权重在最上方显示
    const sortedData = [...data].sort((a, b) => a.value - b.value);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(2, 10, 28, 0.9)',
        borderColor: '#00f0ff',
        textStyle: { color: '#fff' }
      },
      grid: { left: '3%', right: '10%', bottom: '3%', top: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.1)', type: 'dashed' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(item => item.name),
        axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.3)' } },
        axisLabel: { color: '#00f0ff', fontWeight: 'bold' }
      },
      series: [
        {
          name: '特征贡献权重',
          type: 'bar',
          barWidth: '50%',
          data: sortedData.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#00f0ff' },
              { offset: 1, color: '#0070f3' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: '#fff',
            formatter: '{c}%'
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  if (data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500">暂无特征权重数据</div>;
  }

  return <div ref={chartRef} className="w-full h-[250px]"></div>;
}