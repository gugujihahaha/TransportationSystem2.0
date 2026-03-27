'use client';

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';

interface MetricRow { category: string; precision: number; recall: number; f1Score: number; support: number; }
interface Props { data: MetricRow[]; }

export const MetricsTable = ({ data }: Props) => (
  <Table aria-label="分类指标表格">
    <TableHeader>
      <TableColumn>类别</TableColumn>
      <TableColumn>精确率</TableColumn>
      <TableColumn>召回率</TableColumn>
      <TableColumn>F1分数</TableColumn>
      <TableColumn>支持数</TableColumn>
    </TableHeader>
    <TableBody>
      {data.map((item, idx) => (
        <TableRow key={idx}>
          <TableCell>{item.category}</TableCell>
          <TableCell>{(item.precision * 100).toFixed(2)}%</TableCell>
          <TableCell>{(item.recall * 100).toFixed(2)}%</TableCell>
          <TableCell>{(item.f1Score * 100).toFixed(2)}%</TableCell>
          <TableCell>{item.support}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);