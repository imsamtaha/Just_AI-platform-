"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-orange-400/50" />
      </div>
      <h3 className="text-xl font-bold text-white/50 mb-2">{title}</h3>
      <p className="text-white/30 text-sm max-w-xs mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
