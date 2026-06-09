"use client";

import { useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useUser();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="h-16 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl flex items-center px-6 gap-4 flex-shrink-0">
      {/* Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="text-lg font-bold text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center">
        <AnimatePresence>
          {showSearch ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                onBlur={() => setShowSearch(false)}
                placeholder="Search anything..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
              />
            </motion.div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-xl transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <button className="relative p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-xl transition-all">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
      </button>

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-white/80 leading-none">
            {user?.firstName || "User"}
          </p>
          <p className="text-xs text-white/30 mt-0.5">Pro Plan</p>
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 ring-2 ring-orange-500/30",
            },
          }}
        />
      </div>
    </header>
  );
}
