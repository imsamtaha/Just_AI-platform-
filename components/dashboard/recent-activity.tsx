"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Target, PenTool, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface RecentChat { id: string; title: string; model?: string; updatedAt: string; }
interface RecentTask { id: string; title: string; status: string; priority: string; }
interface ActiveGoal { id: string; title: string; progress: number; dueDate?: string; }

const statusColors: Record<string, string> = {
  "in-progress": "text-orange-400 bg-orange-500/10",
  todo: "text-white/50 bg-white/5",
  done: "text-green-400 bg-green-500/10",
  "in_progress": "text-orange-400 bg-orange-500/10",
};

const priorityColors: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

export function RecentActivity() {
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [tasks, setTasks] = useState<RecentTask[]>([]);
  const [goals, setGoals] = useState<ActiveGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then(r => r.json()).catch(() => ({})),
      fetch("/api/goals?limit=3").then(r => r.json()).catch(() => ({})),
    ]).then(([analytics, goalsData]) => {
      if (analytics.recentChats) setChats(analytics.recentChats);
      if (analytics.recentTasks) setTasks(analytics.recentTasks);
      if (goalsData.goals) setGoals(goalsData.goals.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

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
          <Link href="/assistant" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))
          ) : chats.length === 0 ? (
            <div className="text-center py-4">
              <Bot className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No chats yet</p>
              <Link href="/assistant" className="text-xs text-orange-400 hover:underline mt-1 block">
                Start a conversation →
              </Link>
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/assistant`}
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
                    <span className="text-xs text-white/30">{formatRelativeTime(chat.updatedAt)}</span>
                    {chat.model && <span className="text-xs text-orange-400/60">{chat.model.replace(/_/g, " ")}</span>}
                  </div>
                </div>
              </Link>
            ))
          )}
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
          <Link href="/planner" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))
          ) : tasks.length === 0 ? (
            <div className="text-center py-4">
              <Target className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No tasks yet</p>
              <Link href="/planner" className="text-xs text-orange-400 hover:underline mt-1 block">
                Create your first task →
              </Link>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{task.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs capitalize ${priorityColors[task.priority] || "text-white/40"}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[task.status] || "text-white/40 bg-white/5"}`}>
                    {task.status.replace(/[-_]/g, " ")}
                  </span>
                </div>
              </div>
            ))
          )}
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
          <Link href="/planner" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))
          ) : goals.length === 0 ? (
            <div className="text-center py-4">
              <PenTool className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No active goals</p>
              <Link href="/planner" className="text-xs text-orange-400 hover:underline mt-1 block">
                Set your first goal →
              </Link>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70 truncate flex-1">{goal.title}</span>
                  {goal.dueDate && (
                    <span className="text-xs text-white/30 ml-2 flex-shrink-0">
                      {new Date(goal.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-orange-400 font-medium flex-shrink-0">{goal.progress}%</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-400/60" />
            <span className="text-xs text-white/30">AI recommendations available</span>
            <Link href="/consultant" className="text-xs text-orange-400 font-medium hover:underline">View →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
