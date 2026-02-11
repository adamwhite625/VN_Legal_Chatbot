import { useState, useEffect, useRef } from "react";
import { toast } from "sonner"; // Import để hiện thông báo
import * as api from "@/services/chatApi"; // Import API
import type { Message, Session } from "@/types";

export function useChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null); // Đổi tên từ currentSessionId cho ngắn gọn
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Ref này có thể giữ lại để tương thích, dù ChatList mới đã tự xử lý scroll
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Tải danh sách Sessions khi vào trang
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await api.fetchSessions();
      // Kiểm tra cấu trúc trả về, nếu api trả về { data: [...] } thì dùng res.data
      setSessions(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách session:", error);
    }
  };

  // 2. Chọn Session -> Tải lịch sử
  const selectSession = async (id: number) => {
    setSessionId(id);
    setLoading(true);
    try {
      const res = await api.fetchHistory(id);
      setMessages(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải lịch sử đoạn chat");
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset (Chat mới)
  const resetSession = () => {
    setSessionId(null);
    setMessages([]);
    setInput("");
  };

  // 4. Gửi tin nhắn
  const send = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput(""); // Xóa ô nhập ngay lập tức cho mượt

    // Optimistic UI: Hiện tin nhắn user ngay lập tức
    setMessages((prev) => [...prev, { sender: "user", message: userText }]);
    setLoading(true);

    try {
      let currentId = sessionId;

      // Nếu chưa có session -> Tạo mới trước
      if (!currentId) {
        const res = await api.createSession();
        const newSession = res.data || res; // Tùy cấu trúc API trả về
        currentId = newSession.id;

        setSessionId(currentId);
        setSessions((prev) => [newSession, ...prev]); // Cập nhật sidebar
      }

      // Gửi tin nhắn
      const res = await api.sendMessage({
        query: userText,
        session_id: currentId!,
      });

      const data = res.data || res; // Tùy cấu trúc API

      // Cập nhật câu trả lời từ Bot
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          message: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Gửi tin nhắn thất bại", {
        description: "Vui lòng kiểm tra kết nối mạng.",
      });
      // (Tùy chọn) Khôi phục lại input nếu muốn user sửa và gửi lại
      // setInput(userText);
    } finally {
      setLoading(false);
    }
  };

  // Trả về đúng các biến mà ChatPage cần
  return {
    sessions,
    sessionId, // Đã đổi tên khớp với ChatPage
    messages,
    input,
    loading,
    scrollRef,
    setInput,
    selectSession,
    resetSession, // Đã thêm hàm này
    send,
  };
}
