"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MessageSquare, Folder, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const mockChats = [
  { id: "1", title: "Market analysis for Q4", time: "2h ago", model: "GPT-4", pinned: true },
  { id: "2", title: "Write product description", time: "5h ago", model: "Claude", pinned: false },
  { id: "3", title: "Business roadmap 2025", time: "Yesterday", model: "GPT-4", pinned: false },
  { id: "4", title: "Email marketing campaign", time: "2d ago", model: "Gemini", pinned: false },
  { id: "5", title: "Competitor analysis report", time: "3d ago", model: "GPT-4o", pinned: false },
];

const models = [
  { id: "GPT4O", label: "GPT-4o", provider: "OpenAI" },
  { id: "GPT4", label: "GPT-4", provider: "OpenAI" },
  { id: "CLAUDE3_SONNET", label: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "GEMINI_PRO", label: "Gemini Pro", provider: "Google" },
  { id: "DEEPSEEK_CHAT", label: "DeepSeek Chat", provider: "DeepSeek" },
];

export function ChatSidebar() {
  const [activeChat, setActiveChat] = useState("1");
  const [search, setSearch] = useState("");

  const filtered = mockChats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-72 border-r border-white/5 bg-[#080808] flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <button className="w-full flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:shadow-orange-sm">
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-orange-500/40"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {filtered.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-white/25 uppercase tracking-wider px-3 py-1">Pinned</p>
            {filtered.filter(c => c.pinned).map(chat => (
              <ChatItem key={chat.id} chat={chat} active={activeChat === chat.id} onClick={() => setActiveChat(chat.id)} />
            ))}
          </div>
        )}
        <p className="text-[10px] text-white/25 uppercase tracking-wider px-3 py-1">Recent</p>
        {filtered.filter(c => !c.pinned).map(chat => (
          <ChatItem key={chat.id} chat={chat} active={activeChat === chat.id} onClick={() => setActiveChat(chat.id)} />
        ))}
      </div>

      {/* Model selector */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-white/30 mb-2">Active Model</p>
        <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 appearance-none">
          {models.map(m => (
            <option key={m.id} value={m.id} className="bg-[#0D0D0D]">{m.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ChatItem({ chat, active, onClick }: { chat: typeof mockChats[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group",
        active ? "bg-orange-500/10 border border-orange-500/20" : "hover:bg-white/5"
      )}
    >
      <MessageSquare className={cn("w-4 h-4 mt-0.5 flex-shrink-0", active ? "text-orange-400" : "text-white/30")} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate", active ? "text-white/90" : "text-white/60")}>{chat.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/25">{chat.time}</span>
          <span className="text-xs text-orange-400/50">{chat.model}</span>
        </div>
      </div>
    </button>
  );
}
