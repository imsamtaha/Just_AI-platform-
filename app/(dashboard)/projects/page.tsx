"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { Plus, FolderOpen, MoreHorizontal, Users, Calendar, Layers } from "lucide-react";

const projects = [
  { id: "1", name: "SAM AI Platform", color: "#FF7A00", tasks: 24, completed: 18, members: 3, dueDate: "Dec 31", status: "ACTIVE" },
  { id: "2", name: "Marketing Campaign Q1", color: "#FF9B42", tasks: 12, completed: 5, members: 2, dueDate: "Jan 15", status: "ACTIVE" },
  { id: "3", name: "Product Documentation", color: "#FFB570", tasks: 8, completed: 8, members: 1, dueDate: "Dec 20", status: "COMPLETED" },
  { id: "4", name: "Sales Playbook", color: "#FF6B00", tasks: 15, completed: 3, members: 4, dueDate: "Feb 1", status: "ACTIVE" },
];

const kanbanColumns = [
  { id: "todo", name: "To Do", color: "#666", items: [
    { id: "t1", title: "Set up authentication", priority: "HIGH" },
    { id: "t2", title: "Design landing page", priority: "MEDIUM" },
    { id: "t3", title: "Write API docs", priority: "LOW" },
  ]},
  { id: "inprogress", name: "In Progress", color: "#FF7A00", items: [
    { id: "t4", title: "Build dashboard UI", priority: "HIGH" },
    { id: "t5", title: "Integrate Stripe", priority: "URGENT" },
  ]},
  { id: "review", name: "In Review", color: "#FFB570", items: [
    { id: "t6", title: "AI chat module", priority: "HIGH" },
  ]},
  { id: "done", name: "Done", color: "#4ade80", items: [
    { id: "t7", title: "Project setup", priority: "LOW" },
    { id: "t8", title: "Database schema", priority: "MEDIUM" },
    { id: "t9", title: "Auth integration", priority: "HIGH" },
  ]},
];

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-500/20 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "kanban">("grid");
  const [activeProject, setActiveProject] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Project Manager" subtitle="Kanban boards, tasks & team collaboration" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            {(["grid", "kanban"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${v === view ? "bg-orange-500 text-white" : "text-white/40 hover:text-white/70"}`}
              >
                {v === "grid" ? "Projects" : "Kanban Board"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setView("kanban")}
                className="card-3d rounded-2xl p-5 cursor-pointer hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: project.color + "20" }}>
                      <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <span className={`text-xs ${project.status === "COMPLETED" ? "text-green-400" : "text-orange-400"}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>{project.completed} / {project.tasks} tasks</span>
                    <span>{Math.round((project.completed / project.tasks) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(project.completed / project.tasks) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/30">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {project.members} members
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {project.dueDate}
                  </div>
                </div>
              </motion.div>
            ))}
            {/* New Project Card */}
            <div className="border-2 border-dashed border-white/8 rounded-2xl p-5 flex items-center justify-center cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/3 transition-all group min-h-[160px]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-orange-500/10 flex items-center justify-center mx-auto mb-3 transition-all">
                  <Plus className="w-6 h-6 text-white/30 group-hover:text-orange-400" />
                </div>
                <p className="text-sm text-white/30 group-hover:text-white/60 transition-colors">New Project</p>
              </div>
            </div>
          </div>
        ) : (
          /* Kanban Board */
          <div className="flex gap-5 overflow-x-auto scrollbar-thin pb-4">
            {kanbanColumns.map((col) => (
              <div key={col.id} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="text-sm font-semibold text-white/70">{col.name}</h3>
                    <span className="text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">{col.items.length}</span>
                  </div>
                  <button className="text-white/20 hover:text-white/60 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {col.items.map((item) => (
                    <div key={item.id} className="card-3d rounded-xl p-4 cursor-pointer hover:scale-105 transition-all duration-200">
                      <p className="text-sm text-white/80 mb-3">{item.title}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <div className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-white/20" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:border-orange-500/30 hover:text-orange-400 text-sm transition-all">
                    <Plus className="w-4 h-4" />
                    Add task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
