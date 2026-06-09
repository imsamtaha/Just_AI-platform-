"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { Zap, Plus, Play, Pause, MoreHorizontal, ArrowRight, Mail, MessageSquare, Database, FileText, Bell, Clock, Bot } from "lucide-react";

const automations = [
  {
    id: "1",
    name: "New Lead → AI Score + Email",
    status: "ACTIVE",
    trigger: "New Lead Created",
    actions: ["AI Lead Scoring", "Send Welcome Email", "Update CRM"],
    runCount: 142,
    lastRun: "2h ago",
  },
  {
    id: "2",
    name: "Daily Report Generator",
    status: "ACTIVE",
    trigger: "Schedule: Daily 9AM",
    actions: ["Collect Analytics", "Generate AI Report", "Send Slack Message"],
    runCount: 28,
    lastRun: "9h ago",
  },
  {
    id: "3",
    name: "Document → Knowledge Base",
    status: "ACTIVE",
    trigger: "New Document Upload",
    actions: ["Process Document", "Generate Embeddings", "Add to Knowledge Base"],
    runCount: 67,
    lastRun: "1d ago",
  },
  {
    id: "4",
    name: "Task Overdue Alert",
    status: "INACTIVE",
    trigger: "Task Past Due Date",
    actions: ["Send Notification", "Create Follow-up Task"],
    runCount: 0,
    lastRun: "Never",
  },
];

const triggerTypes = [
  { id: "email", label: "New Email", icon: Mail },
  { id: "lead", label: "New Lead", icon: Database },
  { id: "task", label: "New Task", icon: FileText },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "webhook", label: "Webhook", icon: Zap },
];

const actionTypes = [
  { id: "ai-content", label: "Generate Content", icon: Bot },
  { id: "send-email", label: "Send Email", icon: Mail },
  { id: "create-task", label: "Create Task", icon: FileText },
  { id: "crm-update", label: "CRM Update", icon: Database },
  { id: "slack", label: "Slack Message", icon: MessageSquare },
  { id: "notify", label: "Notification", icon: Bell },
];

export default function AutomationsPage() {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="AI Automations" subtitle="Visual workflow builder — Zapier meets AI" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active", value: "3", color: "text-green-400" },
            { label: "Total Runs", value: "237", color: "text-orange-400" },
            { label: "Errors", value: "0", color: "text-green-400" },
            { label: "Time Saved", value: "14.2h", color: "text-orange-300" },
          ].map((stat) => (
            <div key={stat.label} className="card-3d rounded-xl p-4">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Workflows</h2>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Automation
          </button>
        </div>

        {/* Automations list */}
        <div className="space-y-4">
          {automations.map((auto, i) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-3d rounded-2xl p-5 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${auto.status === "ACTIVE" ? "bg-green-500/15" : "bg-white/5"}`}>
                    <Zap className={`w-5 h-5 ${auto.status === "ACTIVE" ? "text-green-400" : "text-white/30"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{auto.name}</h3>
                    <p className="text-xs text-white/30 mt-0.5">
                      Runs: {auto.runCount} · Last: {auto.lastRun}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 rounded-lg transition-all">
                    {auto.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 rounded-lg transition-all">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Flow visualization */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">{auto.trigger}</span>
                </div>
                {auto.actions.map((action, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                    <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                      <Bot className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400">{action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Builder Modal placeholder */}
        {showBuilder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0D0D0D] border border-white/10 rounded-2xl w-full max-w-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">New Automation</h2>
                <button onClick={() => setShowBuilder(false)} className="text-white/40 hover:text-white/80 transition-colors">×</button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">1. Choose Trigger</h3>
                  <div className="space-y-2">
                    {triggerTypes.map(t => (
                      <button key={t.id} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-orange-500/10 border border-white/8 hover:border-orange-500/30 rounded-xl text-sm text-white/60 hover:text-orange-400 transition-all text-left">
                        <t.icon className="w-4 h-4 flex-shrink-0" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">2. Add Actions</h3>
                  <div className="space-y-2">
                    {actionTypes.map(a => (
                      <button key={a.id} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-orange-500/10 border border-white/8 hover:border-orange-500/30 rounded-xl text-sm text-white/60 hover:text-orange-400 transition-all text-left">
                        <a.icon className="w-4 h-4 flex-shrink-0" />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/5">
                <button onClick={() => setShowBuilder(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-sm transition-all">Cancel</button>
                <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all">Create Automation</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
