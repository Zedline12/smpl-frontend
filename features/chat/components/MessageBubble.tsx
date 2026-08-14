"use client";

import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChatMessage } from "../types/chat";
import { safeDate } from "../utils/conversation";
import { MarkdownMessage } from "./MarkdownMessage";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const sentAt = safeDate(message.createdAt);

  return (
    <div
      className={cn(
        "flex items-end gap-2 px-4 py-1.5",
        isUser && "justify-end",
      )}
    >
      {!isUser && (
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #6b41ff, #ea4bff, #ff6b00)",
          }}
        >
          <Image src="/robot.png" alt="" width={16} height={16} />
        </span>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5",
          isUser
            ? "bg-gradient-primary rounded-br-sm text-white"
            : "bg-background-light text-foreground rounded-bl-sm",
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <MarkdownMessage content={message.content} />
        )}

        {sentAt && (
          <time
            dateTime={message.createdAt}
            className={cn(
              "mt-1 block text-[10px]",
              isUser ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {format(sentAt, "HH:mm")}
          </time>
        )}
      </div>
    </div>
  );
}
