import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, BookOpen, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Đảm bảo bạn có component Badge của shadcn
import type { Message } from "@/types";

export default function ChatMessageItem({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <Avatar className="h-8 w-8 border bg-background">
          <AvatarImage src="/bot-avatar.png" />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-2`}>
        <Card
          className={`p-4 shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card dark:bg-zinc-900/50"
          }`}
        >
          {/* MARKDOWN RENDERING */}
          <div
            className={`prose prose-sm max-w-none break-words leading-relaxed
            ${isUser ? "prose-invert" : "dark:prose-invert prose-neutral"}
            prose-p:my-1 prose-ul:my-1 prose-headings:my-2 prose-strong:font-bold
            `}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.message}</p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.message}
              </ReactMarkdown>
            )}
          </div>
        </Card>

        {/* NGUỒN THAM KHẢO (CHIPS STYLE) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-1 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium ml-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Nguồn tham khảo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="px-2 py-1 h-auto text-xs font-normal border bg-background hover:bg-accent transition-colors cursor-default flex items-center gap-1"
                >
                  <FileText className="h-3 w-3 opacity-70" />
                  {src}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="h-8 w-8 border bg-background">
          <AvatarFallback className="bg-blue-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
