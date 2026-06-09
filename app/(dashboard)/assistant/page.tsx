import { ChatInterface } from "@/components/assistant/chat-interface";
import { ChatSidebar } from "@/components/assistant/chat-sidebar";

export const metadata = { title: "AI Assistant" };

export default function AssistantPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <ChatSidebar />
      <ChatInterface />
    </div>
  );
}
