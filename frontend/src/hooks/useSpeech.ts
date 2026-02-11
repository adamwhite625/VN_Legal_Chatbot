import { useState, useEffect, useRef } from "react";

// --- HOOK 1: NGHE (Speech to Text) ---
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Kiểm tra trình duyệt có hỗ trợ không
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN"; // Quan trọng: Đặt ngôn ngữ tiếng Việt
      recognition.interimResults = false; // Chỉ lấy kết quả cuối cùng
      recognition.continuous = false; // Tắt tự động khi ngừng nói

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript(""); // Reset text cũ
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
  };
}

// --- HOOK 2: NÓI (Text to Speech) ---
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;

  const speak = (text: string) => {
    if (!synth) {
      alert("Trình duyệt không hỗ trợ đọc văn bản.");
      return;
    }

    // Nếu đang nói thì dừng lại (để nói câu mới hoặc toggle)
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN"; // Chọn giọng Việt Nam
    utterance.rate = 1.0; // Tốc độ nói bình thường

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const stop = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  return { isSpeaking, speak, stop };
}
