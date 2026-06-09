"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  Target,
  PenTool,
  Briefcase,
  FolderKanban,
  BookOpen,
  Zap,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

const navItems = [
  {
    group: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/assistant", icon: Bot, label: "AI Assistant" },
      { href: "/planner", icon: Target, label: "AI Planner" },
      { href: "/writer", icon: PenTool, label: "AI Writer" },
      { href: "/consultant", icon: Briefcase, label: "Consultant" },
    ],
  },
  {
    group: "Workspace",
    items: [
      { href: "/projects", icon: FolderKanban, label: "Projects" },
      { href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
      { href: "/automations", icon: Zap, label: "Automations" },
      { href: "/crm", icon: Users, label: "CRM" },
      { href: "/documents", icon: FileText, label: "Documents" },
    ],
  },
  {
    group: "Insights",
    items: [
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata?.role as string) === "ADMIN";

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-[#080808] border-r border-white/5 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0 glow-orange-sm">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-black text-gradient whitespace-nowrap overflow-hidden"
              >
                SAM AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {navItems.map((group) => (
          <div key={group.group} className="mb-6">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-2"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-orange-500/15 text-orange-400 shadow-sm"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-r-full"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors",
                        isActive ? "text-orange-400" : "text-white/40 group-hover:text-white/60"
                      )}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div className="mb-6">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold text-orange-500/50 uppercase tracking-widest px-3 mb-2"
                >
                  Admin
                </motion.p>
              )}
            </AnimatePresence>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        )}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
