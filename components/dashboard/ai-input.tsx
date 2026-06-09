"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Target, PenTool, BarChart3, ArrowRight, Sparkles } from "lucide-react";

const quickActions = [
  { icon: Bot, label: "Chat", href: "/assistant", color: "text-orange-400" },
  { icon: Target, label: "Plan", href: "/planner", color: "text-orange-300" },
  { icon: PenTool, label: "Write", href: "/writer", color: "text-orange-500" },
  { icon: BarChart3, label: "Analyze", href: "/consultant", color: "text-amber-400" },
];

export function DashboardAiInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (query.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden glass-orange p-1"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5" />
      <div className="relative bg-[#0D0D0D] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-sm font-semibold text-orange-400">Ask SAM AI</span>
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask SAM anything — plan a project, write content, analyze your business..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all hover:shadow-orange-sm flex items-center gap-2 text-sm font-medium"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-white/30">Quick:</span>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/50 hover:text-white/80 transition-all border border-white/5"
            >
              <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
