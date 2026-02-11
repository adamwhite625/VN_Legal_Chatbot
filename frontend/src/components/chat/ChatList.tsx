import { useEffect, useRef } from "react";
import ChatMessageItem from "./ChatMessageItem";
import TypingIndicator from "./TypingIndicator";
import type { Message } from "@/types";

interface ChatListProps {
  messages: Message[];
  isLoading: boolean; // Nhận prop loading
}

export default function ChatList({ messages, isLoading }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll mỗi khi messages thay đổi hoặc trạng thái loading thay đổi
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50">
          <span className="text-4xl">⚖️</span>
        </div>
        <p className="text-lg font-medium">
          Bạn cần tư vấn pháp luật gì hôm nay?
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
      {messages.map((msg, index) => (
        <ChatMessageItem key={index} message={msg} />
      ))}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <TypingIndicator />
        </div>
      )}

      {/* Invisible element để scroll xuống đáy */}
      <div ref={bottomRef} className="h-px w-full" />
    </div>
  );
}
