import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── App Store ─────────────────────────────────────────────────────────────

interface AppState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;

  activeModel: string;
  setActiveModel: (model: string) => void;

  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;

  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      activeModel: "GPT4O",
      setActiveModel: (model) => set({ activeModel: model }),

      currentChatId: null,
      setCurrentChatId: (id) => set({ currentChatId: id }),

      notifications: [],
      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications].slice(0, 50) })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "sam-ai-app",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeModel: state.activeModel,
      }),
    }
  )
);

// ─── Writer Store ───────────────────────────────────────────────────────────

interface WriterState {
  contentType: string;
  tone: string;
  length: string;
  prompt: string;
  output: string;
  generating: boolean;
  setContentType: (v: string) => void;
  setTone: (v: string) => void;
  setLength: (v: string) => void;
  setPrompt: (v: string) => void;
  setOutput: (v: string) => void;
  setGenerating: (v: boolean) => void;
  reset: () => void;
}

export const useWriterStore = create<WriterState>()((set) => ({
  contentType: "blog",
  tone: "Professional",
  length: "Medium (400 words)",
  prompt: "",
  output: "",
  generating: false,
  setContentType: (v) => set({ contentType: v }),
  setTone: (v) => set({ tone: v }),
  setLength: (v) => set({ length: v }),
  setPrompt: (v) => set({ prompt: v }),
  setOutput: (v) => set({ output: v }),
  setGenerating: (v) => set({ generating: v }),
  reset: () => set({ prompt: "", output: "", generating: false }),
}));

// ─── Chat Store ─────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  selectedModel: string;
  addMessage: (msg: ChatMessage) => void;
  setInput: (v: string) => void;
  setLoading: (v: boolean) => void;
  setSelectedModel: (v: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  input: "",
  loading: false,
  selectedModel: "GPT4O",
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setInput: (v) => set({ input: v }),
  setLoading: (v) => set({ loading: v }),
  setSelectedModel: (v) => set({ selectedModel: v }),
  clearMessages: () => set({ messages: [] }),
}));
