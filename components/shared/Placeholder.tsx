'use client';

import { motion } from 'framer-motion';

interface PlaceholderProps {
  title: string;
  description?: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 mt-1">{description || 'قيد التطوير...'}</p>
      </div>
      <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
        <p className="text-gray-400">هذا القسم قيد التطوير حالياً</p>
      </div>
    </motion.div>
  );
}