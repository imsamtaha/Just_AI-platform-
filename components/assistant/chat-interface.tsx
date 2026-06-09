"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Paperclip, Mic, Bot, User, Copy, ThumbsUp,
  RefreshCw, Sparkles, Check, StopCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCopy } from "@/hooks/use-copy";
import { useAppStore } from "@/store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
}

const WELCOME_SUGGESTIONS = [
  "Analyze my business model and suggest improvements",
  "Create a 30-day marketing plan for my SaaS",
  "Write a compelling cold email template",
  "Help me build a revenue forecasting model",
  "Explain RAG architecture and how to implement it",
  "What are the best growth strategies for a B2B startup?",
];

export function ChatInterface({ chatId }: { chatId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { activeModel } = useAppStore();
  const { copy, copied } = useCopy();

  // Load chat messages if chatId provided
  useEffect(() => {
    if (!chatId) return;
    fetch(`/api/chats/${chatId}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            id: m.id,
            role: m.role.toLowerCase() as "user" | "assistant",
            content: m.content,
            model: m.model,
            timestamp: new Date(m.createdAt),
          })));
        }
      })
      .catch(() => {});
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  const stopGeneration = () => {
    abortController?.abort();
    setStreaming(false);
    setLoading(false);
    if (streamBuffer) {
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: streamBuffer + " *(stopped)*",
          model: activeModel,
          timestamp: new Date(),
        },
      ]);
      setStreamBuffer("");
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || streaming) return;

    const userContent = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, model: activeModel }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream request failed");
      }

      setLoading(false);
      setStreaming(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setStreamBuffer(fullContent);
              }
            } catch {}
          }
        }
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullContent,
        model: activeModel,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamBuffer("");

      // Persist to DB if we have a chatId
      if (chatId) {
        Promise.all([
          fetch(`/api/chats/${chatId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "user", content: userContent }),
          }),
          fetch(`/api/chats/${chatId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "assistant",
              content: fullContent,
              model: activeModel,
            }),
          }),
        ]).catch(() => {});
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setStreaming(false);
      setAbortController(null);
    }
  }, [input, messages, loading, streaming, activeModel, chatId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-white/30">{activeModel.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/40">Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-6 glow-orange"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">How can I help you?</h2>
            <p className="text-white/40 mb-8 max-w-md text-sm">
              I'm SAM AI — powered by GPT-4o, Claude 3, Gemini & DeepSeek.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {WELCOME_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="text-left p-4 card-3d rounded-xl text-sm text-white/60 hover:text-white/90 transition-all hover:scale-[1.02] hover:border-orange-500/20"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1}
                onCopy={(text) => copy(text)}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Streaming bubble */}
        {streaming && streamBuffer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white/80" />
            </div>
            <div className="max-w-[75%] card-3d px-4 py-3 rounded-2xl rounded-tl-sm">
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-code:text-orange-400 prose-strong:text-white text-white/80">
                {streamBuffer}
              </ReactMarkdown>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {loading && !streaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white/80" />
            </div>
            <div className="card-3d px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              {[0, 0.2, 0.4].map((d) => (
                <div key={d} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 flex-shrink-0">
        <div className="relative rounded-2xl overflow-hidden glass-orange">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message SAM AI… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="w-full bg-transparent px-4 py-4 pr-28 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none scrollbar-thin"
            style={{ minHeight: 56, maxHeight: 200 }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5">
              <Mic className="w-4 h-4" />
            </button>
            {(loading || streaming) ? (
              <button
                onClick={stopGeneration}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">
          SAM AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isLast,
  onCopy,
}: {
  message: Message;
  isLast: boolean;
  onCopy: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${isUser ? "bg-orange-500" : "bg-white/10"}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white/80" />}
      </div>

      <div className={`max-w-[75%] space-y-1 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-orange-500 text-white rounded-tr-sm" : "card-3d text-white/85 rounded-tl-sm"}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-white prose-headings:font-bold prose-code:text-orange-400 prose-code:bg-orange-500/10 prose-code:px-1 prose-code:rounded prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-strong:text-white prose-a:text-orange-400 prose-blockquote:border-orange-500 prose-blockquote:text-white/60">
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <AnimatePresence>
          {!isUser && showActions && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 px-1"
            >
              <ActionButton icon={Copy} label="Copy" onClick={() => onCopy(message.content)} />
              <ActionButton icon={ThumbsUp} label="Like" onClick={() => {}} />
              <ActionButton icon={RefreshCw} label="Regenerate" onClick={() => {}} />
              {message.model && (
                <span className="text-xs text-orange-400/50 ml-1">{message.model}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
