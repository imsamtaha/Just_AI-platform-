"use client";

import { motion } from "framer-motion";
import { CheckSquare, Clock, FolderOpen, Target, Bot, TrendingUp, Zap, Users } from "lucide-react";

const cards = [
  {
    title: "Tasks",
    value: "12",
    sub: "3 due today",
    icon: CheckSquare,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    trend: "+2 new",
    trendUp: true,
  },
  {
    title: "Focus Time",
    value: "4.2h",
    sub: "Today",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    trend: "+0.8h vs yesterday",
    trendUp: true,
  },
  {
    title: "Projects",
    value: "5",
    sub: "2 in progress",
    icon: FolderOpen,
    color: "text-orange-300",
    bgColor: "bg-orange-300/10",
    trend: "1 completed",
    trendUp: true,
  },
  {
    title: "Goals",
    value: "3",
    sub: "Active",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    trend: "67% avg progress",
    trendUp: true,
  },
  {
    title: "AI Chats",
    value: "28",
    sub: "This week",
    icon: Bot,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    trend: "+12 vs last week",
    trendUp: true,
  },
  {
    title: "AI Usage",
    value: "68%",
    sub: "Monthly quota",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    trend: "32% remaining",
    trendUp: false,
  },
  {
    title: "Leads",
    value: "14",
    sub: "Active pipeline",
    icon: Users,
    color: "text-orange-300",
    bgColor: "bg-orange-300/10",
    trend: "3 hot leads",
    trendUp: true,
  },
  {
    title: "Productivity",
    value: "87",
    sub: "Score today",
    icon: TrendingUp,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    trend: "+5 vs yesterday",
    trendUp: true,
  },
];

export function DashboardOverview() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-3d rounded-2xl p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <span className={`text-xs font-medium ${card.trendUp ? "text-green-400" : "text-orange-400"}`}>
                {card.trend}
              </span>
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{card.value}</div>
            <div className="text-sm font-medium text-white/50">{card.title}</div>
            <div className="text-xs text-white/30 mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
