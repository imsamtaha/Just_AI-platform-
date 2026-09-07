"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  Copy,
  Sparkles,
  StopCircle,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Loader2,
  Wrench,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCopy } from "@/hooks/use-copy";
import { useAppStore } from "@/store";

interface ToolAction {
  status: "pending" | "executed" | "rejected" | "failed";
  requestId?: string;
  tool: string;
  risk: "read" | "write" | "consequential";
  reason?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  selectedSkills?: string[];
  toolAction?: ToolAction | null;
}

interface PendingToolRequest {
  id: string;
  tool_name: string;
  risk: "write" | "consequential";
  input: Record<string, unknown>;
  status: string;
}

const WELCOME_SUGGESTIONS = [
  "/research Compare the best architecture for my AI SaaS",
  "/automation Design an automated lead follow-up workflow",
  "/coding Help me implement a production API",
  "Create a GitHub issue for the next JUST AI dashboard milestone",
  "Schedule a project review meeting for tomorrow",
  "Analyze my business model and suggest improvements",
];

export function ChatInterface({ chatId }: { chatId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [pendingRequests, setPendingRequests] = useState<PendingToolRequest[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { activeModel } = useAppStore();
  const { copy } = useCopy();

  useEffect(() => {
    if (!chatId) return;
    fetch(`/api/chats/${chatId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.messages) {
          setMessages(
            data.messages.map((message: any) => ({
              id: message.id,
              role: message.role.toLowerCase() as "user" | "assistant",
              content: message.content,
              model: message.model,
              timestamp: new Date(message.createdAt),
            }))
          );
        }
      })
      .catch(() => {});
  }, [chatId]);

  const refreshPendingApprovals = useCallback(async () => {
    try {
      const response = await fetch("/api/agent/tools", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setPendingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
    } catch {
      // Keep chat available even if approval history cannot load.
    }
  }, []);

  useEffect(() => {
    refreshPendingApprovals();
  }, [refreshPendingApprovals]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingRequests, loading]);

  const stopGeneration = () => {
    abortController?.abort();
    setLoading(false);
    setAbortController(null);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userContent = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const allMessages = [...messages, userMessage].map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, model: activeModel, sessionId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Agent request failed");
      }

      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content || "I completed the agent run.",
        model: data.model || activeModel,
        timestamp: new Date(),
        selectedSkills: Array.isArray(data.selectedSkills) ? data.selectedSkills : [],
        toolAction: data.toolAction || null,
      };

      setMessages((previous) => [...previous, assistantMessage]);

      if (data.toolAction?.status === "pending") {
        refreshPendingApprovals();
      }

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
              content: assistantMessage.content,
              model: assistantMessage.model,
            }),
          }),
        ]).catch(() => {});
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I couldn't complete that agent run. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }, [input, loading, messages, activeModel, sessionId, chatId, refreshPendingApprovals]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    const element = event.target;
    element.style.height = "auto";
    element.style.height = Math.min(element.scrollHeight, 200) + "px";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">JUST AI Agent</h2>
            <p className="text-xs text-white/30">{activeModel.replace("_", " ")} · Skills · Tools · Memory</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/40">Agent Ready</span>
        </div>
      </div>

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
            <h2 className="text-2xl font-bold text-white mb-2">Your AI workforce starts here</h2>
            <p className="text-white/40 mb-8 max-w-lg text-sm">
              JUST AI routes your request through skills, memory, specialist agents, and approved tools.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {WELCOME_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="text-left p-4 card-3d rounded-xl text-sm text-white/60 hover:text-white/90 transition-all hover:scale-[1.02] hover:border-orange-500/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={copy}
                onApprovalChange={refreshPendingApprovals}
              />
            ))}
          </AnimatePresence>
        )}

        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/30">
              <ShieldAlert className="w-3.5 h-3.5" /> Pending approvals
            </div>
            {pendingRequests.map((request) => (
              <ApprovalCard
                key={request.id}
                action={{
                  status: "pending",
                  requestId: request.id,
                  tool: request.tool_name,
                  risk: request.risk,
                  input: request.input,
                  reason: "This action is waiting for your approval.",
                }}
                onChanged={refreshPendingApprovals}
              />
            ))}
          </div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white/80" />
            </div>
            <div className="card-3d px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              Routing skills and running the agent…
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5 flex-shrink-0">
        <div className="relative rounded-2xl overflow-hidden glass-orange">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask JUST AI or use /coding /automation /research /design…"
            rows={1}
            className="w-full bg-transparent px-4 py-4 pr-28 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none scrollbar-thin"
            style={{ minHeight: 56, maxHeight: 200 }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5" aria-label="Attach file">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5" aria-label="Voice input">
              <Mic className="w-4 h-4" />
            </button>
            {loading ? (
              <button onClick={stopGeneration} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all" aria-label="Stop">
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white rounded-lg transition-all"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">
          External write actions require your approval before execution.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  onApprovalChange,
}: {
  message: Message;
  onCopy: (text: string) => void;
  onApprovalChange: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${isUser ? "bg-orange-500" : "bg-white/10"}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white/80" />}
      </div>

      <div className={`max-w-[78%] space-y-2 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-orange-500 text-white rounded-tr-sm" : "card-3d text-white/85 rounded-tl-sm"}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-white prose-code:text-orange-400 prose-strong:text-white prose-a:text-orange-400">
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && message.selectedSkills && message.selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.selectedSkills.map((skill) => (
              <span key={skill} className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/15 text-[10px] text-orange-300">
                {skill}
              </span>
            ))}
          </div>
        )}

        {!isUser && message.toolAction && (
          <ApprovalCard action={message.toolAction} onChanged={onApprovalChange} />
        )}

        {!isUser && (
          <button onClick={() => onCopy(message.content)} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors">
            <Copy className="w-3 h-3" /> Copy
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ApprovalCard({ action, onChanged }: { action: ToolAction; onChanged: () => void }) {
  const [state, setState] = useState<ToolAction>(action);
  const [busy, setBusy] = useState(false);

  const decide = async (decision: "approve" | "reject") => {
    if (!state.requestId || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/agent/tools/requests/${state.requestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tool decision failed");

      if (decision === "reject") {
        setState((current) => ({ ...current, status: "rejected" }));
      } else {
        setState((current) => ({
          ...current,
          status: "executed",
          output: data.request?.output,
        }));
      }
      onChanged();
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "failed",
        error: error instanceof Error ? error.message : "Tool action failed",
      }));
    } finally {
      setBusy(false);
    }
  };

  const isPending = state.status === "pending";
  const Icon = state.risk === "consequential" ? ShieldAlert : ShieldCheck;

  return (
    <div className="w-full min-w-[280px] max-w-xl rounded-2xl border border-orange-500/20 bg-orange-500/[0.06] p-4 shadow-lg shadow-black/10">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{state.tool}</p>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase tracking-wide text-white/40">
              {state.risk}
            </span>
          </div>
          {state.reason && <p className="text-xs text-white/45 mt-1">{state.reason}</p>}

          {state.input && Object.keys(state.input).length > 0 && (
            <pre className="mt-3 max-h-36 overflow-auto rounded-xl bg-black/20 border border-white/5 p-3 text-[11px] text-white/50 whitespace-pre-wrap">
              {JSON.stringify(state.input, null, 2)}
            </pre>
          )}

          {isPending && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decide("approve")}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Approve & run
              </button>
              <button
                onClick={() => decide("reject")}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          )}

          {state.status === "executed" && (
            <div className="mt-3 rounded-xl border border-green-500/20 bg-green-500/10 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-green-300">
                <Check className="w-3.5 h-3.5" /> Executed
              </div>
              {state.output !== undefined && (
                <pre className="mt-2 max-h-40 overflow-auto text-[11px] text-white/50 whitespace-pre-wrap">
                  {JSON.stringify(state.output, null, 2)}
                </pre>
              )}
            </div>
          )}

          {state.status === "rejected" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-white/35">
              <X className="w-3.5 h-3.5" /> Rejected — no action was executed.
            </div>
          )}

          {state.status === "failed" && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              <div className="flex items-center gap-2"><Wrench className="w-3.5 h-3.5" /> Execution failed</div>
              {state.error && <p className="mt-1 text-red-300/70">{state.error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
