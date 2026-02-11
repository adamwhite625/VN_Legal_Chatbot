export interface Message {
  sender: "user" | "assistant";
  message: string;
  sources?: string[];
}

export interface Session {
  id: number;
  first_message?: string;
  title: string;
  created_at: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: "user" | "admin"; // <--- Thêm dòng này
}
