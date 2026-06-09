"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { NotificationCenter } from "./notification-center";
import { CommandPalette } from "./command-palette";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useUser();

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

      {/* Command palette trigger */}
      <CommandPalette />

      {/* Notifications */}
      <NotificationCenter />

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
