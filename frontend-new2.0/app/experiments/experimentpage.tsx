'use client';

import { Accordion, AccordionItem, Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';

const experiments = [
  { id: 'exp1', name: 'Exp1 (仅轨迹)', accuracy: '69.60%' },
  { id: 'exp3', name: 'Exp3 (轨迹+增强KG)', accuracy: '78.25%' },
  { id: 'exp4', name: 'Exp4 (轨迹+KG+天气)', accuracy: '74.80%' },
  { id: 'exp5', name: 'Exp5 (弱监督约束)', accuracy: '64.01%' },
];

export default function ExperimentsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span>🔬</span> 其他实验结果
      </h1>
      <Accordion variant="splitted">
        {experiments.map((exp, index) => (
          <AccordionItem
            key={exp.id}
            title={
              <span>
                {exp.name} <span className="text-green-400">- 准确率 {exp.accuracy}</span>
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardBody>
                  <img src={`/evaluation_results/${exp.id}/confusion_matrix.png`} alt="混淆矩阵" className="rounded-lg" />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <img src={`/evaluation_results/${exp.id}/per_class_f1_scores.png`} alt="F1分数" className="rounded-lg" />
                </CardBody>
              </Card>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}