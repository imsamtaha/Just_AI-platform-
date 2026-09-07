import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  selectedSkills?: string[];
  timestamp: Date;
}

interface UseChatsOptions {
  model?: string;
  onMessage?: (message: ChatMessage) => void;
}

export function useChats({ model = "GPT4O", onMessage }: UseChatsOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            model,
            ...(sessionId ? { sessionId } : {}),
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.sessionId) setSessionId(data.sessionId);

        const assistantMessage: ChatMessage = {
          id: data.executionId || `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content || "Sorry, I couldn't process that.",
          model: data.model,
          selectedSkills: data.selectedSkills,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        onMessage?.(assistantMessage);
        return assistantMessage;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        toast.error("Failed to get JUST AI response");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, model, onMessage, sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  const editMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m))
    );
  }, []);

  return {
    messages,
    sessionId,
    loading,
    error,
    sendMessage,
    clearMessages,
    editMessage,
  };
}
