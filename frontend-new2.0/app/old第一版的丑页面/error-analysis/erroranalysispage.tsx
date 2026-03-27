'use client';

import { useState, useEffect } from 'react';
import { Select, SelectItem, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ErrorAnalysisPage() {
  const [selectedExp, setSelectedExp] = useState('exp2');
  const [data, setData] = useState<{ pair: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/error-analysis?exp=${selectedExp}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedExp]);

  const chartData = {
    labels: data.map(d => d.pair),
    datasets: [
      {
        label: '错误次数',
        data: data.map(d => d.count),
        backgroundColor: '#f97316',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span>⚠️</span> 错误分析
      </h1>
      <div className="mb-6 w-64">
        <Select
          label="选择实验"
          selectedKeys={[selectedExp]}
          onChange={(e) => setSelectedExp(e.target.value)}
        >
          {['exp1', 'exp2', 'exp3', 'exp4', 'exp5'].map(exp => (
            <SelectItem key={exp} value={exp}>
              {exp.toUpperCase()}
            </SelectItem>
          ))}
        </Select>
      </div>
      <Card className="shadow-xl">
        <CardHeader className="text-xl font-semibold">Top 10 常见混淆模式</CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-center">加载中...</p>
          ) : data.length === 0 ? (
            <p className="text-center">无数据</p>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}