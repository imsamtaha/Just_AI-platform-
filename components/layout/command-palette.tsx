"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, MessageSquare, FileText, BarChart2, Settings,
  Zap, Users, FolderOpen, BookOpen, Target, PenTool,
  Briefcase, ArrowRight, X, Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href: string;
  category: string;
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
  { id: "assistant", label: "AI Assistant", description: "Chat with multi-model AI", icon: <MessageSquare className="w-4 h-4" />, href: "/assistant", category: "Modules", keywords: ["chat", "gpt", "claude", "ai"] },
  { id: "planner", label: "AI Planner", description: "Goals and task management", icon: <Target className="w-4 h-4" />, href: "/planner", category: "Modules", keywords: ["goals", "tasks", "roadmap"] },
  { id: "writer", label: "AI Writer", description: "Generate content with AI", icon: <PenTool className="w-4 h-4" />, href: "/writer", category: "Modules", keywords: ["blog", "email", "copy"] },
  { id: "consultant", label: "Business Consultant", description: "SWOT, market analysis and more", icon: <Briefcase className="w-4 h-4" />, href: "/consultant", category: "Modules", keywords: ["swot", "strategy", "business"] },
  { id: "projects", label: "Project Manager", description: "Kanban boards and sprints", icon: <FolderOpen className="w-4 h-4" />, href: "/projects", category: "Modules", keywords: ["kanban", "sprint", "board"] },
  { id: "knowledge", label: "Knowledge Base", description: "RAG over your documents", icon: <BookOpen className="w-4 h-4" />, href: "/knowledge", category: "Modules", keywords: ["rag", "search", "pdf"] },
  { id: "automations", label: "AI Automations", description: "Build visual workflows", icon: <Zap className="w-4 h-4" />, href: "/automations", category: "Modules", keywords: ["workflow", "trigger", "automate"] },
  { id: "crm", label: "CRM", description: "Contacts, leads, deals", icon: <Users className="w-4 h-4" />, href: "/crm", category: "Modules", keywords: ["contacts", "leads", "sales"] },
  { id: "documents", label: "Document Center", description: "Upload and manage files", icon: <FileText className="w-4 h-4" />, href: "/documents", category: "Modules", keywords: ["files", "upload", "pdf"] },
  { id: "analytics", label: "Analytics", description: "Productivity and revenue metrics", icon: <BarChart2 className="w-4 h-4" />, href: "/analytics", category: "Modules", keywords: ["metrics", "charts", "reports"] },
  { id: "settings", label: "Settings", description: "Profile, billing, AI preferences", icon: <Settings className="w-4 h-4" />, href: "/settings", category: "Settings", keywords: ["profile", "billing", "api"] },
  { id: "dashboard", label: "Dashboard", description: "Overview and quick actions", icon: <BarChart2 className="w-4 h-4" />, href: "/dashboard", category: "Navigation", keywords: ["home", "overview"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? COMMANDS.filter(c => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q)) ||
          (c.keywords?.some(k => k.includes(q)))
        );
      })
    : COMMANDS;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const allFiltered = Object.values(grouped).flat();

  const navigate = useCallback((item: CommandItem) => {
    router.push(item.href);
    setOpen(false);
    setQuery("");
  }, [router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allFiltered[activeIndex]) {
      navigate(allFiltered[activeIndex]);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg text-sm text-white/40 hover:text-white/60 transition-all"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search</span>
        <kbd className="ml-2 text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-2xl shadow-black overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search commands, modules, settings..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                  />
                  <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/50 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto scrollbar-thin py-2">
                  {allFiltered.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-white/30">No results for &ldquo;{query}&rdquo;</p>
                    </div>
                  ) : (
                    Object.entries(grouped).map(([category, items]) => (
                      <div key={category} className="mb-2">
                        <p className="text-[10px] text-white/25 uppercase tracking-wider px-4 py-1.5">{category}</p>
                        {items.map(item => {
                          const globalIndex = allFiltered.indexOf(item);
                          const isActive = globalIndex === activeIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => navigate(item)}
                              onMouseEnter={() => setActiveIndex(globalIndex)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                isActive ? "bg-orange-500/10" : "hover:bg-white/5"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                isActive ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/40"
                              )}>
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-white/70")}>
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-white/30 truncate">{item.description}</p>
                                )}
                              </div>
                              {isActive && <ArrowRight className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/5 px-4 py-2.5 flex items-center gap-4 text-[11px] text-white/20">
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white/10 rounded px-1 font-mono">↑↓</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white/10 rounded px-1 font-mono">↵</kbd> Open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white/10 rounded px-1 font-mono">Esc</kbd> Close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
