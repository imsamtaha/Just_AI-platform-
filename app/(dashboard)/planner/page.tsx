"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import {
  Plus, Target, CheckSquare, Calendar, Sparkles, TrendingUp,
  ChevronRight, X, Loader2, Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: string;
  priority: string;
  dueDate?: string;
  milestones: { id: string; title: string; status: string }[];
  tasks: { id: string; status: string }[];
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string;
}

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

function NewGoalModal({ onClose, onCreated }: { onClose: () => void; onCreated: (goal: Goal) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, dueDate: dueDate || undefined }),
      });
      const data = await res.json();
      if (data.goal || data.id) {
        const goal = data.goal || data;
        onCreated({ ...goal, milestones: [], tasks: [], dueDate: goal.dueDate });
        toast.success("Goal created!");
        onClose();
      }
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">New Goal</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Goal Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe this goal in detail..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 appearance-none"
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
                  <option key={p} value={p} className="bg-[#0D0D0D]">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40"
              />
            </div>
          </div>
          <button
            onClick={save}
            disabled={!title.trim() || saving}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Goal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, dueDate: dueDate || undefined }),
      });
      const data = await res.json();
      if (data.id) {
        onCreated(data);
        toast.success("Task created!");
        onClose();
      }
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">New Task</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Task Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()}
              placeholder="What needs to be done?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 appearance-none"
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
                  <option key={p} value={p} className="bg-[#0D0D0D]">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40"
              />
            </div>
          </div>
          <button
            onClick={save}
            disabled={!title.trim() || saving}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "tasks" | "calendar">("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [goalsRes, tasksRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/tasks"),
      ]);
      const [goalsData, tasksData] = await Promise.all([goalsRes.json(), tasksRes.json()]);
      if (goalsData.goals) setGoals(goalsData.goals);
      if (Array.isArray(tasksData)) setTasks(tasksData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch {}
  };

  const generateAIPlan = async (goalId: string, goalTitle: string) => {
    setAiGenerating(goalId);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalTitle }),
      });
      const data = await res.json();
      if (data.plan) toast.success("AI plan generated! Check your tasks.", { duration: 4000 });
    } catch {
      toast.error("Failed to generate AI plan");
    } finally {
      setAiGenerating(null);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== "DONE").length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="AI Planner" subtitle="Turn your goals into actionable plans" />

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Goals", value: goals.filter(g => g.status === "ACTIVE").length, icon: Target, color: "text-orange-400" },
              { label: "Open Tasks", value: activeTasks, icon: CheckSquare, color: "text-orange-300" },
              { label: "Completed", value: completedTasks, icon: TrendingUp, color: "text-green-400" },
              { label: "Milestones", value: goals.reduce((s, g) => s + g.milestones.length, 0), icon: Calendar, color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="card-3d rounded-2xl p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                <div className="text-2xl font-black text-white">{loading ? "—" : stat.value}</div>
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
                    ? "bg-orange-500 text-white"
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

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-white/3 rounded-2xl animate-pulse" />)}
                </div>
              ) : goals.length === 0 ? (
                <div className="card-3d rounded-2xl p-12 text-center">
                  <Target className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm mb-1">No goals yet</p>
                  <p className="text-white/20 text-xs mb-4">Set your first goal and let AI help you plan</p>
                  <button
                    onClick={() => setShowNewGoal(true)}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    Create First Goal
                  </button>
                </div>
              ) : (
                goals.map((goal, i) => (
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
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[goal.priority] || "text-white/40 bg-white/5 border-white/10"}`}>
                            {goal.priority}
                          </span>
                          {goal.dueDate && (
                            <span className="text-xs text-white/30">
                              {formatDate(goal.dueDate)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-white/40 mt-1">{goal.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => generateAIPlan(goal.id, goal.title)}
                        disabled={aiGenerating === goal.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-xs transition-all disabled:opacity-50 ml-4 flex-shrink-0"
                      >
                        {aiGenerating === goal.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        AI Plan
                      </button>
                    </div>

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

                    {goal.milestones.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {goal.milestones.map((milestone) => {
                          const done = milestone.status === "COMPLETED";
                          return (
                            <div
                              key={milestone.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                                done
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-white/3 text-white/40 border border-white/5"
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 border ${done ? "bg-green-400 border-green-400" : "border-white/20"}`} />
                              <span className="truncate">{milestone.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Tasks</h2>
                <button
                  onClick={() => setShowNewTask(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>

              {loading ? (
                <div className="h-48 bg-white/3 rounded-2xl animate-pulse" />
              ) : tasks.length === 0 ? (
                <div className="card-3d rounded-2xl p-12 text-center">
                  <CheckSquare className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm mb-1">No tasks yet</p>
                  <button
                    onClick={() => setShowNewTask(true)}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all mt-3"
                  >
                    Add First Task
                  </button>
                </div>
              ) : (
                <div className="card-3d rounded-2xl overflow-hidden">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-all group"
                    >
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.status === "DONE"
                            ? "bg-orange-500 border-orange-500"
                            : "border-white/20 hover:border-orange-400"
                        }`}
                      >
                        {task.status === "DONE" && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.status === "DONE" ? "text-white/30 line-through" : "text-white/80"}`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-white/30 mt-0.5">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${priorityColors[task.priority] || "text-white/40"}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs flex-shrink-0 ${statusColors[task.status] || "text-white/40"}`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
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

      <AnimatePresence>
        {showNewGoal && (
          <NewGoalModal
            onClose={() => setShowNewGoal(false)}
            onCreated={(goal) => setGoals(prev => [goal, ...prev])}
          />
        )}
        {showNewTask && (
          <NewTaskModal
            onClose={() => setShowNewTask(false)}
            onCreated={(task) => setTasks(prev => [task, ...prev])}
          />
        )}
      </AnimatePresence>
    </>
  );
}
