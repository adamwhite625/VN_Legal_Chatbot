import { Plus, MessageSquare, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SidebarProps {
  sessions: Session[];
  currentSessionId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelect,
  onNew,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-muted/10">
      {/* 1. Nút Chat Mới */}
      <div className="p-4 border-b">
        <Button
          onClick={onNew}
          className="w-full justify-start gap-2 bg-primary/90 hover:bg-primary shadow-sm"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Cuộc hội thoại mới</span>
        </Button>
      </div>

      {/* 2. Danh sách lịch sử */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Lịch sử tư vấn
        </div>

        <ScrollArea className="flex-1 px-2">
          {sessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8 px-4">
              Chưa có lịch sử chat nào. <br /> Hãy bắt đầu ngay!
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 group flex items-start gap-3 border border-transparent",
                    currentSessionId === session.id
                      ? "bg-background border-border shadow-sm font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0 transition-colors",
                      currentSessionId === session.id
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />

                  <div className="flex-1 overflow-hidden">
                    <div className="truncate pr-1">
                      {session.title || "Cuộc hội thoại không tên"}
                    </div>
                    {/* Hiển thị thời gian (VD: 2 giờ trước) */}
                    <div className="text-[10px] opacity-60 font-normal mt-0.5">
                      {session.created_at
                        ? formatDistanceToNow(new Date(session.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })
                        : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 3. Footer Sidebar (User Info hoặc Settings) */}
      <div className="p-4 border-t bg-background/50 text-xs text-center text-muted-foreground">
        © 2026 Legal AI Assistant
      </div>
    </div>
  );
}
