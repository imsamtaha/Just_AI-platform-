"use client";

import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Zap, Target, Users, DollarSign } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const areaData = [
  { month: "Jul", ai: 120, tasks: 85, revenue: 3200 },
  { month: "Aug", ai: 145, tasks: 95, revenue: 4100 },
  { month: "Sep", ai: 165, tasks: 110, revenue: 4800 },
  { month: "Oct", ai: 188, tasks: 128, revenue: 5600 },
  { month: "Nov", ai: 210, tasks: 145, revenue: 6900 },
  { month: "Dec", ai: 248, tasks: 162, revenue: 8200 },
];

const modelUsage = [
  { name: "GPT-4o", value: 42, color: "#FF7A00" },
  { name: "Claude 3", value: 28, color: "#FF9B42" },
  { name: "Gemini Pro", value: 18, color: "#FFB570" },
  { name: "DeepSeek", value: 12, color: "#FFCA80" },
];

const weeklyTasks = [
  { day: "Mon", done: 8, total: 10 },
  { day: "Tue", done: 12, total: 14 },
  { day: "Wed", done: 6, total: 9 },
  { day: "Thu", done: 15, total: 15 },
  { day: "Fri", done: 11, total: 13 },
  { day: "Sat", done: 4, total: 5 },
  { day: "Sun", done: 2, total: 3 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-3 text-xs">
        <p className="text-white/50 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Analytics" subtitle="Productivity scores, AI usage & growth insights" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Productivity Score", value: "87", unit: "/100", icon: BarChart3, color: "text-orange-400", trend: "+5" },
            { label: "AI Chats", value: "248", unit: "this month", icon: Zap, color: "text-orange-300", trend: "+32%" },
            { label: "Tasks Done", value: "162", unit: "this month", icon: Target, color: "text-green-400", trend: "+18%" },
            { label: "Goals Progress", value: "68", unit: "%", icon: TrendingUp, color: "text-amber-400", trend: "+12%" },
            { label: "Active Leads", value: "14", unit: "hot", icon: Users, color: "text-orange-500", trend: "+3" },
            { label: "MRR", value: "$8.2K", unit: "monthly", icon: DollarSign, color: "text-green-400", trend: "+19%" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-3d rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-green-400 font-medium">{kpi.trend}</span>
              </div>
              <div className="text-xl font-black text-white">{kpi.value}<span className="text-xs text-white/30 ml-1">{kpi.unit}</span></div>
              <div className="text-xs text-white/40 mt-0.5">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Growth Chart */}
          <div className="xl:col-span-2 card-3d rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/60 mb-6">Growth Trends (6 months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB570" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFB570" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ai" name="AI Chats" stroke="#FF7A00" strokeWidth={2} fill="url(#aiGrad)" />
                <Area type="monotone" dataKey="tasks" name="Tasks" stroke="#FFB570" strokeWidth={2} fill="url(#taskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Model Usage */}
          <div className="card-3d rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/60 mb-6">AI Model Usage</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={modelUsage} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {modelUsage.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {modelUsage.map(m => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-xs text-white/50">{m.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white/70">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Tasks */}
        <div className="card-3d rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 mb-6">Weekly Task Completion</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyTasks} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" fill="rgba(255,122,0,0.2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="done" name="Completed" fill="#FF7A00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
