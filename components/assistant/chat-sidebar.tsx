"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageSquare, Star, Trash2, Loader2, MoreHorizontal, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { formatRelativeTime } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  pinned: boolean;
  model?: string;
  updatedAt: string;
  lastMessage?: string;
}

const models = [
  { id: "GPT4O", label: "GPT-4o", provider: "OpenAI" },
  { id: "GPT4O_MINI", label: "GPT-4o mini", provider: "OpenAI" },
  { id: "GPT4", label: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "CLAUDE3_SONNET", label: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "CLAUDE3_HAIKU", label: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "GEMINI_PRO", label: "Gemini Pro", provider: "Google" },
  { id: "GEMINI_FLASH", label: "Gemini Flash", provider: "Google" },
  { id: "DEEPSEEK_CHAT", label: "DeepSeek Chat", provider: "DeepSeek" },
];

interface ChatSidebarProps {
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  selectedChatId?: string;
}

export function ChatSidebar({ onChatSelect, onNewChat, selectedChatId }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { activeModel, setActiveModel } = useAppStore();

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (data.chats) setChats(data.chats);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const data = await res.json();
      if (data.chat) {
        setChats(prev => [data.chat, ...prev]);
        onChatSelect?.(data.chat.id);
        onNewChat?.();
      }
    } catch {}
  };

  const togglePin = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    try {
      await fetch(`/api/chats`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chatId, pinned: !chat.pinned }),
      });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, pinned: !c.pinned } : c));
    } catch {}
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chats?id=${chatId}`, { method: "DELETE" });
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (selectedChatId === chatId) onNewChat?.();
    } catch {}
  };

  const filtered = chats.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter(c => c.pinned);
  const recent = filtered.filter(c => !c.pinned);

  return (
    <div className="w-72 border-r border-white/5 bg-[#080808] flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <button
          onClick={createChat}
          className="w-full flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-white/5 border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-orange-500/40"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/25">No chats yet</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] text-white/25 uppercase tracking-wider px-3 py-2">Pinned</p>
                <AnimatePresence>
                  {pinned.map(chat => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      active={selectedChatId === chat.id}
                      onClick={() => onChatSelect?.(chat.id)}
                      onPin={togglePin}
                      onDelete={deleteChat}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
            {recent.length > 0 && (
              <>
                <p className="text-[10px] text-white/25 uppercase tracking-wider px-3 py-2">Recent</p>
                <AnimatePresence>
                  {recent.map(chat => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      active={selectedChatId === chat.id}
                      onClick={() => onChatSelect?.(chat.id)}
                      onPin={togglePin}
                      onDelete={deleteChat}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>

      {/* Model selector */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-white/30 mb-2">Active Model</p>
        <div className="relative">
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 appearance-none cursor-pointer"
          >
            {models.map(m => (
              <option key={m.id} value={m.id} className="bg-[#0D0D0D]">
                {m.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-white/20 mt-2 text-center">
          {models.find(m => m.id === activeModel)?.provider || ""}
        </p>
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  active,
  onClick,
  onPin,
  onDelete,
}: {
  chat: Chat;
  active: boolean;
  onClick: () => void;
  onPin: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group relative",
        active ? "bg-orange-500/10 border border-orange-500/20" : "hover:bg-white/5 border border-transparent"
      )}
    >
      <MessageSquare className={cn(
        "w-4 h-4 mt-0.5 flex-shrink-0 transition-colors",
        active ? "text-orange-400" : "text-white/30"
      )} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate", active ? "text-white/90" : "text-white/60")}>
          {chat.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/25">
            {formatRelativeTime(new Date(chat.updatedAt))}
          </span>
          {chat.model && (
            <span className="text-xs text-orange-400/40 truncate">
              {chat.model.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-2 top-2 flex items-center gap-0.5"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={(e) => onPin(chat.id, e)}
              className="p-1 text-white/20 hover:text-orange-400 rounded transition-colors"
              title={chat.pinned ? "Unpin" : "Pin"}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => onDelete(chat.id, e)}
              className="p-1 text-white/20 hover:text-red-400 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
