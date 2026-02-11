import { Toaster, toast } from "sonner"; // Import Toast

import Sidebar from "@/components/sidebar/Sidebar";
import ChatList from "@/components/chat/ChatList"; // Component hiển thị list chat mới
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const chat = useChat();

  // Hàm wrapper để xử lý sự kiện gửi từ Input
  const handleSendWrapper = async () => {
    if (chat.loading) return;
    await chat.send();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Thông báo nổi (Toast) */}
      <Toaster position="top-right" richColors />

      {/* Sidebar - Cột trái */}
      <div className="w-[280px] hidden md:block shrink-0 border-r bg-muted/10">
        <Sidebar
          sessions={chat.sessions}
          currentSessionId={chat.sessionId}
          onSelect={chat.selectSession}
          onNew={chat.resetSession} // Nút Chat mới
        />
      </div>

      {/* Main Chat - Cột phải */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
        {/* Header */}
        <ChatHeader />

        {/* Khu vực tin nhắn (Đã thay ScrollArea bằng ChatList tự xử lý scroll) */}
        <ChatList messages={chat.messages} isLoading={chat.loading} />

        {/* Khu vực nhập liệu */}
        <div className="p-4 bg-background border-t">
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              value={chat.input}
              onChange={chat.setInput}
              onSend={handleSendWrapper}
              disabled={chat.loading}
            />
            <div className="text-xs text-center text-muted-foreground mt-2 opacity-70">
              AI có thể mắc lỗi. Hãy luôn kiểm tra lại với văn bản luật gốc.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
