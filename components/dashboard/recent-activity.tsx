"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Target, PenTool, Briefcase, Clock, ArrowRight } from "lucide-react";

const recentChats = [
  { title: "Market analysis for Q4 2024", time: "2h ago", model: "GPT-4" },
  { title: "Write product description for SaaS tool", time: "5h ago", model: "Claude" },
  { title: "Business roadmap for my startup", time: "Yesterday", model: "GPT-4" },
  { title: "Email campaign for product launch", time: "2d ago", model: "Gemini" },
];

const recentTasks = [
  { title: "Review Q4 marketing strategy", status: "in-progress", priority: "high" },
  { title: "Update CRM with new leads", status: "todo", priority: "medium" },
  { title: "Write blog post draft", status: "done", priority: "low" },
  { title: "Prepare investor presentation", status: "todo", priority: "urgent" },
];

const recentGoals = [
  { title: "Launch MVP", progress: 75, dueDate: "Dec 31" },
  { title: "Reach 1000 users", progress: 42, dueDate: "Jan 2025" },
  { title: "$10K MRR", progress: 28, dueDate: "Mar 2025" },
];

const statusColors: Record<string, string> = {
  "in-progress": "text-orange-400 bg-orange-500/10",
  todo: "text-white/50 bg-white/5",
  done: "text-green-400 bg-green-500/10",
};

const priorityColors: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

export function RecentActivity() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Chats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-3d rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white/80">Recent Chats</h3>
          </div>
          <Link href="/assistant" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentChats.map((chat, i) => (
            <Link
              key={i}
              href="/assistant"
              className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/70 group-hover:text-white/90 truncate transition-colors">
                  {chat.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/30">{chat.time}</span>
                  <span className="text-xs text-orange-400/60">{chat.model}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-3d rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white/80">Recent Tasks</h3>
          </div>
          <Link href="/planner" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentTasks.map((task, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate">{task.title}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs capitalize ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[task.status]}`}>
                  {task.status.replace("-", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active Goals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-3d rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white/80">Active Goals</h3>
          </div>
          <Link href="/planner" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentGoals.map((goal, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70 truncate flex-1">{goal.title}</span>
                <span className="text-xs text-white/30 ml-2 flex-shrink-0">{goal.dueDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-orange-400 font-medium flex-shrink-0">{goal.progress}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-400/60" />
            <span className="text-xs text-white/30">AI recommendations ready</span>
            <span className="text-xs text-orange-400 font-medium cursor-pointer hover:underline">View →</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
