import Image from "next/image";
import { cn } from "@/lib/utils";

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";

/**
 * Advertises the AI assistant on subscription plans. It ships with every plan,
 * so this is rendered unconditionally rather than driven by plan metadata.
 */
export function AiAssistantBadge({
  label = "AI Assistant included",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex rounded-full p-[1.5px]", className)}
      style={{ background: TRI_GRADIENT }}
    >
      <span className="bg-card flex items-center gap-1.5 rounded-full px-2.5 py-1">
        <Image src="/robot.png" alt="" width={14} height={14} />
        <span className="text-foreground text-[11px] font-semibold">
          {label}
        </span>
      </span>
    </span>
  );
}
