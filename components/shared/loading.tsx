"use client";

import { motion } from "framer-motion";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = "md", text, fullScreen = false }: LoadingProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizes[size]}`}>
        <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500`}
        />
        <div className="absolute inset-2 rounded-full bg-orange-500/10 flex items-center justify-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        </div>
      </div>
      {text && <p className="text-white/40 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`shimmer rounded-lg bg-white/5 ${className}`} />
  );
}

export function PageLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loading size="md" text="Loading..." />
    </div>
  );
}
