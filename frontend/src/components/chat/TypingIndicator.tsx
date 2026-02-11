export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar Bot nhỏ */}
      <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center">
        🤖
      </div>
      <div className="bg-muted/50 dark:bg-zinc-900 p-4 rounded-lg rounded-tl-none">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
