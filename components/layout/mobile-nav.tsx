"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
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
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assistant", icon: Bot, label: "AI Assistant" },
  { href: "/planner", icon: Target, label: "AI Planner" },
  { href: "/writer", icon: PenTool, label: "AI Writer" },
  { href: "/consultant", icon: Briefcase, label: "Consultant" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { href: "/automations", icon: Zap, label: "Automations" },
  { href: "/crm", icon: Users, label: "CRM" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Top bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange-sm">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="text-lg font-black text-gradient">SAM AI</span>
        </div>
        <div className="flex items-center gap-2">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-1 ring-orange-500/30" } }} />
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#080808] border-r border-white/5 z-50 md:hidden flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                    <span className="text-white font-black text-xs">S</span>
                  </div>
                  <span className="font-black text-gradient">SAM AI</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-orange-400" : "text-white/40")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Plan indicator */}
              <div className="p-4 border-t border-white/5">
                <div className="glass-orange rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-orange-400">Pro Plan</p>
                    <p className="text-[10px] text-white/30 mt-0.5">68% of quota used</p>
                  </div>
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-[68%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* Bottom nav for mobile */
export function BottomNav() {
  const pathname = usePathname();
  const quickItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/assistant", icon: Bot, label: "Chat" },
    { href: "/planner", icon: Target, label: "Plan" },
    { href: "/writer", icon: PenTool, label: "Write" },
    { href: "/analytics", icon: BarChart3, label: "Stats" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#080808]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2">
      {quickItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
              isActive ? "text-orange-400" : "text-white/30 hover:text-white/60"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
