import Image from "next/image";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1.5">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(135deg, #6b41ff, #ea4bff, #ff6b00)",
        }}
      >
        <Image src="/robot.png" alt="" width={16} height={16} />
      </span>
      <span
        className="bg-background-light flex items-center gap-1 rounded-2xl rounded-bl-sm px-3.5 py-3"
        aria-label="Assistant is typing"
        role="status"
      >
        <i className="bg-muted-foreground size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <i className="bg-muted-foreground size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <i className="bg-muted-foreground size-1.5 animate-bounce rounded-full" />
      </span>
    </div>
  );
}
