"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Plus, Target, CheckSquare, Calendar, Sparkles, TrendingUp, ChevronRight } from "lucide-react";

const goals = [
  {
    id: "1",
    title: "Launch SaaS MVP",
    description: "Build and launch the minimum viable product",
    progress: 75,
    status: "ACTIVE",
    priority: "HIGH",
    dueDate: "Dec 31, 2024",
    milestones: [
      { title: "Complete backend API", done: true },
      { title: "Build frontend UI", done: true },
      { title: "Set up payments", done: true },
      { title: "Beta testing", done: false },
      { title: "Public launch", done: false },
    ],
  },
  {
    id: "2",
    title: "Reach 1,000 Users",
    description: "Grow user base through marketing and word of mouth",
    progress: 42,
    status: "ACTIVE",
    priority: "HIGH",
    dueDate: "Feb 28, 2025",
    milestones: [
      { title: "First 100 users", done: true },
      { title: "Product Hunt launch", done: false },
      { title: "Social media strategy", done: false },
      { title: "1000 users milestone", done: false },
    ],
  },
  {
    id: "3",
    title: "$10K Monthly Revenue",
    description: "Achieve sustainable monthly recurring revenue",
    progress: 28,
    status: "ACTIVE",
    priority: "URGENT",
    dueDate: "Mar 31, 2025",
    milestones: [
      { title: "First paying customer", done: true },
      { title: "$1K MRR", done: false },
      { title: "$5K MRR", done: false },
      { title: "$10K MRR", done: false },
    ],
  },
];

const tasks = [
  { id: "1", title: "Review Q4 marketing strategy", priority: "HIGH", status: "IN_PROGRESS", dueDate: "Today" },
  { id: "2", title: "Update CRM with new leads", priority: "MEDIUM", status: "TODO", dueDate: "Today" },
  { id: "3", title: "Write launch blog post", priority: "HIGH", status: "TODO", dueDate: "Tomorrow" },
  { id: "4", title: "Set up Stripe webhooks", priority: "URGENT", status: "IN_PROGRESS", dueDate: "Today" },
  { id: "5", title: "User interview sessions", priority: "MEDIUM", status: "TODO", dueDate: "Dec 20" },
  { id: "6", title: "Fix onboarding flow bugs", priority: "HIGH", status: "TODO", dueDate: "Dec 18" },
];

const priorityColors: Record<string, string> = {
  URGENT: "text-red-400 bg-red-500/10 border-red-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  LOW: "text-green-400 bg-green-500/10 border-green-500/20",
};

const statusColors: Record<string, string> = {
  IN_PROGRESS: "text-orange-400",
  TODO: "text-white/40",
  DONE: "text-green-400",
};

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "tasks" | "calendar">("goals");
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const generateAIPlan = async (goalTitle: string) => {
    setAiGenerating(true);
    setTimeout(() => setAiGenerating(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="AI Planner" subtitle="Turn your goals into actionable plans" />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Goals", value: "3", icon: Target, color: "text-orange-400" },
            { label: "Tasks Today", value: "6", icon: CheckSquare, color: "text-orange-300" },
            { label: "Completed", value: "24", icon: TrendingUp, color: "text-green-400" },
            { label: "Focus Time", value: "4.2h", icon: Calendar, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="card-3d rounded-2xl p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
          {(["goals", "tasks", "calendar"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-orange-500 text-white shadow-orange-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Goals</h2>
              <button
                onClick={() => setShowNewGoal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                New Goal
              </button>
            </div>

            {goals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-3d rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[goal.priority]}`}>
                        {goal.priority}
                      </span>
                      <span className="text-xs text-white/30">{goal.dueDate}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                    <p className="text-sm text-white/40 mt-1">{goal.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => generateAIPlan(goal.title)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-xs transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {aiGenerating ? "Generating..." : "AI Plan"}
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">Progress</span>
                    <span className="text-xs font-bold text-orange-400">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {goal.milestones.map((milestone, j) => (
                    <div
                      key={j}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                        milestone.done
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-white/3 text-white/40 border border-white/5"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 border ${milestone.done ? "bg-green-400 border-green-400" : "border-white/20"}`} />
                      <span className="truncate">{milestone.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Tasks</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-sm transition-all">
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>
            <div className="card-3d rounded-2xl overflow-hidden">
              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/3 transition-all group"
                >
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 cursor-pointer ${
                    task.status === "DONE" ? "bg-orange-500 border-orange-500" : "border-white/20 hover:border-orange-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80">{task.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">Due: {task.dueDate}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs flex-shrink-0 ${statusColors[task.status]}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="card-3d rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-orange-400/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/50 mb-2">Calendar View</h3>
              <p className="text-white/30 text-sm">Smart scheduling with AI recommendations coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
