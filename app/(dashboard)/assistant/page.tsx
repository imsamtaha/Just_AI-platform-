"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/assistant/chat-interface";
import { ChatSidebar } from "@/components/assistant/chat-sidebar";

export default function AssistantPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();

  const handleNewChat = () => setSelectedChatId(undefined);

  return (
    <div className="flex h-full overflow-hidden">
      <ChatSidebar
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
        onNewChat={handleNewChat}
      />
      <ChatInterface
        chatId={selectedChatId}
        key={selectedChatId || "new"}
      />
    </div>
  );
}
