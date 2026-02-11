import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff } from "lucide-react"; // Import icon Mic
import { useSpeechRecognition } from "@/hooks/useSpeech"; // Import Hook

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  // Sử dụng Hook nghe
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechRecognition();

  // Khi có kết quả từ giọng nói -> Gắn vào ô input
  useEffect(() => {
    if (transcript) {
      // Nếu muốn nối thêm vào text cũ: onChange(value + " " + transcript);
      // Nếu muốn ghi đè:
      onChange(transcript);
    }
  }, [transcript]);

  // Handle bấm nút Mic
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative w-full flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        disabled={disabled}
        placeholder={
          isListening ? "Đang nghe bạn nói..." : "Nhập câu hỏi pháp lý..."
        }
        className={`pr-24 h-14 text-base shadow-sm ${
          isListening ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""
        }`}
      />

      {/* Cụm nút bấm nằm bên phải */}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {/* Nút Micro */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleMicClick}
          className={`h-10 w-10 transition-colors ${
            isListening
              ? "text-red-600 hover:text-red-700 bg-red-100"
              : "text-muted-foreground"
          }`}
          title="Nhập bằng giọng nói"
        >
          {isListening ? (
            <MicOff className="h-5 w-5 animate-pulse" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        {/* Nút Gửi */}
        <Button
          size="icon"
          onClick={onSend}
          disabled={disabled || (!value.trim() && !isListening)}
          className="h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
