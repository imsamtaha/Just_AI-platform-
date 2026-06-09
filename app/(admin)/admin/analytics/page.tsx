"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, DollarSign, Zap, TrendingUp, Activity } from "lucide-react";

interface AdminStats {
  users: { total: number; newThisWeek: number; newThisMonth: number };
  subscriptions: { active: number; pro: number; business: number };
  ai: { totalChats: number; chatsToday: number };
  revenue: { mrr: number };
}

const mockGrowth = [
  { month: "Jul", users: 420, revenue: 12000, chats: 3200 },
  { month: "Aug", users: 580, revenue: 16800, chats: 4500 },
  { month: "Sep", users: 720, revenue: 19200, chats: 5800 },
  { month: "Oct", users: 890, revenue: 22400, chats: 7200 },
  { month: "Nov", users: 1050, revenue: 25900, chats: 8100 },
  { month: "Dec", users: 1284, revenue: 28450, chats: 9600 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-white/50 mb-1.5 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {typeof p.value === "number" && p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: "Total Users", value: stats.users.total.toLocaleString(), sub: `+${stats.users.newThisWeek} this week`, icon: Users, color: "text-orange-400" },
    { label: "MRR", value: `$${stats.revenue.mrr.toLocaleString()}`, sub: "Monthly recurring", icon: DollarSign, color: "text-green-400" },
    { label: "AI Chats Today", value: stats.ai.chatsToday.toLocaleString(), sub: `${stats.ai.totalChats.toLocaleString()} total`, icon: Zap, color: "text-orange-300" },
    { label: "Active Subs", value: stats.subscriptions.active.toLocaleString(), sub: `${stats.subscriptions.pro} Pro + ${stats.subscriptions.business} Business`, icon: TrendingUp, color: "text-amber-400" },
  ] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Platform Analytics" subtitle="Revenue, users & AI usage metrics" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-3d rounded-2xl p-5 h-28 shimmer" />
            ))
          ) : kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-3d rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <Activity className="w-3.5 h-3.5 text-white/10" />
              </div>
              <div className="text-2xl font-black text-white">{kpi.value}</div>
              <div className="text-sm text-white/50 mt-0.5">{kpi.label}</div>
              <div className="text-xs text-green-400 mt-1">{kpi.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Growth Chart */}
        <div className="card-3d rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-6">Platform Growth (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockGrowth}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="users" stroke="#FF7A00" strokeWidth={2} fill="url(#usersGrad)" />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#4ade80" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Usage */}
        <div className="card-3d rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-6">AI Chat Volume (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="chats" name="chats" fill="#FF7A00" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { plan: "Free", users: stats?.users.total ? stats.users.total - stats.subscriptions.active : 0, revenue: 0, color: "bg-white/10" },
            { plan: "Pro ($29)", users: stats?.subscriptions.pro || 0, revenue: (stats?.subscriptions.pro || 0) * 29, color: "bg-orange-500/20" },
            { plan: "Business ($99)", users: stats?.subscriptions.business || 0, revenue: (stats?.subscriptions.business || 0) * 99, color: "bg-amber-500/20" },
          ].map((row) => (
            <div key={row.plan} className="card-3d rounded-xl p-5">
              <div className={`w-3 h-3 rounded-full ${row.color} mb-3`} />
              <h3 className="text-sm font-medium text-white/60">{row.plan}</h3>
              <div className="text-2xl font-black text-white mt-1">{row.users}</div>
              <div className="text-xs text-white/30 mt-0.5">users</div>
              {row.revenue > 0 && (
                <div className="text-sm font-semibold text-green-400 mt-2">
                  ${row.revenue.toLocaleString()} MRR
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
