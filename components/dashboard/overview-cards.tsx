"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, FolderOpen, Target, Bot, Zap, Users, TrendingUp, Clock } from "lucide-react";

interface Stats {
  totalTasks: number;
  dueTodayTasks: number;
  activeProjects: number;
  completedProjects: number;
  activeGoals: number;
  avgGoalProgress: number;
  totalChatsThisWeek: number;
  chatUsagePct: number;
  activeLeads: number;
  hotLeads: number;
}

const DEFAULT_STATS: Stats = {
  totalTasks: 0,
  dueTodayTasks: 0,
  activeProjects: 0,
  completedProjects: 0,
  activeGoals: 0,
  avgGoalProgress: 0,
  totalChatsThisWeek: 0,
  chatUsagePct: 0,
  activeLeads: 0,
  hotLeads: 0,
};

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const cards = [
    {
      title: "Tasks",
      value: loaded ? String(stats.totalTasks) : "—",
      sub: stats.dueTodayTasks > 0 ? `${stats.dueTodayTasks} due today` : "All on track",
      icon: CheckSquare,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      trend: stats.dueTodayTasks > 0 ? `${stats.dueTodayTasks} urgent` : "Up to date",
      trendUp: stats.dueTodayTasks === 0,
    },
    {
      title: "Projects",
      value: loaded ? String(stats.activeProjects) : "—",
      sub: stats.completedProjects > 0 ? `${stats.completedProjects} completed` : "In progress",
      icon: FolderOpen,
      color: "text-orange-300",
      bgColor: "bg-orange-300/10",
      trend: stats.completedProjects > 0 ? `${stats.completedProjects} done` : "Active",
      trendUp: true,
    },
    {
      title: "Goals",
      value: loaded ? String(stats.activeGoals) : "—",
      sub: "Active",
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: stats.avgGoalProgress > 0 ? `${stats.avgGoalProgress}% avg` : "Just started",
      trendUp: stats.avgGoalProgress > 50,
    },
    {
      title: "AI Chats",
      value: loaded ? String(stats.totalChatsThisWeek) : "—",
      sub: "This week",
      icon: Bot,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      trend: stats.totalChatsThisWeek > 0 ? `${stats.totalChatsThisWeek} sessions` : "Start chatting",
      trendUp: stats.totalChatsThisWeek > 0,
    },
    {
      title: "AI Usage",
      value: loaded ? `${stats.chatUsagePct}%` : "—",
      sub: "Monthly quota",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      trend: `${100 - stats.chatUsagePct}% remaining`,
      trendUp: stats.chatUsagePct < 80,
    },
    {
      title: "Leads",
      value: loaded ? String(stats.activeLeads) : "—",
      sub: "Active pipeline",
      icon: Users,
      color: "text-orange-300",
      bgColor: "bg-orange-300/10",
      trend: stats.hotLeads > 0 ? `${stats.hotLeads} hot` : "Nurturing",
      trendUp: stats.hotLeads > 0,
    },
    {
      title: "Focus Time",
      value: "—",
      sub: "Coming soon",
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      trend: "Track sessions",
      trendUp: false,
    },
    {
      title: "Productivity",
      value: loaded ? `${Math.min(100, Math.round((stats.totalTasks > 0 ? stats.avgGoalProgress : 0) + stats.chatUsagePct * 0.3))}` : "—",
      sub: "Score",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: "Based on activity",
      trendUp: true,
    },
  ];

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
            className="card-3d rounded-2xl p-4 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
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
