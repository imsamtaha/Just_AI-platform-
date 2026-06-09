"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Mic, Bot, User, Copy, ThumbsUp, RefreshCw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
}

const welcomeSuggestions = [
  "Analyze my business model and suggest improvements",
  "Create a 30-day marketing plan for my SaaS",
  "Write a compelling cold email template",
  "Help me build a revenue forecasting model",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], model: "GPT4O" }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I apologize, I couldn't process that request.",
        model: data.model,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-white/30">GPT-4o · Claude · Gemini · DeepSeek</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/40">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-6 glow-orange"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">How can I help you?</h2>
            <p className="text-white/40 mb-8 max-w-md">
              I'm SAM AI — your intelligent assistant powered by the world's best AI models.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {welcomeSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="text-left p-4 card-3d rounded-xl text-sm text-white/60 hover:text-white/90 transition-all hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 text-white/80"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`max-w-[75%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-orange-500 text-white rounded-tr-sm"
                        : "card-3d text-white/80 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-code:text-orange-400 prose-strong:text-white">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 px-1">
                      <button className="text-white/20 hover:text-white/60 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-white/20 hover:text-white/60 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-white/20 hover:text-white/60 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      {msg.model && (
                        <span className="text-xs text-orange-400/50 ml-1">{msg.model}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white/80" />
            </div>
            <div className="card-3d px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1.5">
                {[0, 0.2, 0.4].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 flex-shrink-0">
        <div className="relative glass-orange rounded-2xl">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message SAM AI... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="w-full bg-transparent px-4 py-4 pr-24 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none scrollbar-thin max-h-32"
            style={{ minHeight: 56 }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white rounded-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">
          SAM AI may make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
