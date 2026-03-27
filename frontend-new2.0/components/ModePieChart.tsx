// components/ModePieChart.tsx
"use client";

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface PieData {
  name: string;
  value: number;
}

export default function ModePieChart({ data }: { data: PieData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(2, 10, 28, 0.9)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
      legend: {
        top: '5%',
        textStyle: { color: '#e2e8f0' },
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#00f0ff', '#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'],
      series: [
        {
          name: '交通方式分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#020a1c',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 18, fontWeight: 'bold', color: '#fff' }
          },
          labelLine: { show: false },
          data: data
        }
      ]
    };

    chartInstance.current.setOption(option);

    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  return <div ref={chartRef} className="w-full h-full"></div>;
}