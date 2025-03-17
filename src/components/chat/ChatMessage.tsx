
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/utils/chat/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isPending = message.status === "pending";
  const isStreaming = message.isStreaming;

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-lg p-4",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
          isPending && "opacity-70"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full">
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div className="text-xs font-medium">
            {isUser ? "You" : "Assistant"}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </div>
          {isPending && (
            <div className="text-xs italic text-muted-foreground/70">Processing...</div>
          )}
        </div>
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
          {isStreaming && (
            <span className="inline-block ml-1 animate-pulse">▋</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
