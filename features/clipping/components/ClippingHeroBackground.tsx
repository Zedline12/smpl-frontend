import { CSSProperties } from "react";
import { Heart, MessageCircle, Play, Scissors, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/** Thumbnail gradients for the fake posts, all in the studio's blue family plus a few accents. */
const THUMBS = [
  "linear-gradient(160deg, #1d4ed8, #0ea5e9)",
  "linear-gradient(160deg, #312e81, #6366f1)",
  "linear-gradient(160deg, #0e7490, #22d3ee)",
  "linear-gradient(160deg, #6d28d9, #ec4899)",
  "linear-gradient(160deg, #1e3a8a, #38bdf8)",
  "linear-gradient(160deg, #0f172a, #3b82f6)",
  "linear-gradient(160deg, #4338ca, #06b6d4)",
];
const TAGS = ["Shorts", "Reels", "TikTok", null, "Shorts", null, "Reels"];
const LIKES = ["12.4K", "98K", "3.1K", "441K", "27K", "1.2M", "8.8K"];

/** Floating phones: position, size, tilt, bob speed, and how fast/which way their feed scrolls. */
const PHONES: {
  left: string;
  top: string;
  width: number;
  tilt: number;
  float: number;
  delay: number;
  feedUp: boolean;
  feedSpeed: number;
  opacity: number;
}[] = [
  { left: "2%", top: "8%", width: 118, tilt: -10, float: 7, delay: 0, feedUp: true, feedSpeed: 22, opacity: 0.85 },
  { left: "15%", top: "38%", width: 96, tilt: 6, float: 8.5, delay: 1.2, feedUp: false, feedSpeed: 26, opacity: 0.6 },
  { left: "28%", top: "2%", width: 84, tilt: -4, float: 9, delay: 2.4, feedUp: true, feedSpeed: 30, opacity: 0.45 },
  { left: "64%", top: "4%", width: 88, tilt: 5, float: 8, delay: 0.6, feedUp: false, feedSpeed: 28, opacity: 0.45 },
  { left: "76%", top: "36%", width: 100, tilt: -7, float: 7.5, delay: 1.8, feedUp: true, feedSpeed: 24, opacity: 0.6 },
  { left: "88%", top: "6%", width: 118, tilt: 10, float: 6.5, delay: 3, feedUp: false, feedSpeed: 20, opacity: 0.85 },
];

/** A phone with a social feed scrolling on its screen. */
function Phone({ phone, index }: { phone: (typeof PHONES)[number]; index: number }) {
  return (
    <div
      className="animate-phone-float absolute"
      style={
        {
          left: phone.left,
          top: phone.top,
          width: phone.width,
          opacity: phone.opacity,
          "--tilt": `${phone.tilt}deg`,
          "--float-speed": `${phone.float}s`,
          animationDelay: `${phone.delay}s`,
        } as CSSProperties
      }
    >
      <div className="relative aspect-[9/19] rounded-[22px] border-[3px] border-slate-700/90 bg-black p-[3px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_30px_-8px_rgba(59,130,246,0.6)]">
        <div className="relative h-full overflow-hidden rounded-[18px]">
          <div
            className={phone.feedUp ? "animate-feed-up" : "animate-feed-down"}
            style={{ "--feed-speed": `${phone.feedSpeed}s` } as CSSProperties}
          >
            {/* Doubled so the loop is seamless at -50%. */}
            {Array.from({ length: 8 }, (_, k) => (
              <PostCard key={k} index={(k % 4) + index * 2} />
            ))}
          </div>
        </div>
        {/* Notch */}
        <span className="absolute top-[7px] left-1/2 h-[6px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

const CHIPS: { label: string; left: string; top: string; delay: number }[] = [
  { label: "+12.4K views", left: "8%", top: "62%", delay: 0 },
  { label: "🔥 Viral 92", left: "80%", top: "58%", delay: 1.4 },
  { label: "0:34 clip", left: "22%", top: "40%", delay: 2.8 },
  { label: "9:16", left: "67%", top: "36%", delay: 4.1 },
  { label: "❤️", left: "44%", top: "70%", delay: 0.7 },
  { label: "❤️", left: "92%", top: "30%", delay: 3.3 },
  { label: "✂️ Auto-cut", left: "4%", top: "28%", delay: 5.2 },
  { label: "+3.2K shares", left: "54%", top: "64%", delay: 5.9 },
];

/** Clip segments on the timeline, as widths in %. */
const SEGMENTS = [9, 14, 7, 12, 10, 16, 8, 13, 11];

function PostCard({ index }: { index: number }) {
  const i = index % THUMBS.length;
  const tag = TAGS[i];
  return (
    <div
      className="relative mb-3 aspect-[9/16] w-full overflow-hidden rounded-xl border border-white/10"
      style={{ background: THUMBS[i] }}
    >
      {/* A soft "subject" blob so the thumbnail reads as a video frame */}
      <div className="absolute top-[22%] left-1/2 size-[55%] -translate-x-1/2 rounded-full bg-white/15 blur-md" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <Play className="size-3.5 translate-x-px fill-white text-white" />
        </span>
      </div>
      {tag && (
        <span className="absolute top-2 left-2 rounded-full bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white">
          {tag}
        </span>
      )}
      <div className="absolute right-1.5 bottom-6 flex flex-col items-center gap-2 text-white">
        <span className="flex flex-col items-center text-[7px]">
          <Heart className="size-3 fill-white" />
          {LIKES[i]}
        </span>
        <MessageCircle className="size-3" />
        <Send className="size-3" />
      </div>
      <div className="absolute inset-x-2 bottom-2 flex flex-col gap-1">
        <span className="h-1 w-3/4 rounded-full bg-white/50" />
        <span className="h-1 w-1/2 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

/** Decorative moving backdrop for the Clipping Studio hero. */
export function ClippingHeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Floating phones scrolling social feeds */}
      {PHONES.map((phone, i) => (
        <Phone key={i} phone={phone} index={i} />
      ))}

      {/* Floating stats */}
      {CHIPS.map((chip, k) => (
        <span
          key={k}
          className="animate-float-up absolute rounded-full border border-blue-300/30 bg-blue-500/20 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-blue-50 opacity-0 shadow-[0_0_16px_-4px_rgba(59,130,246,0.8)] backdrop-blur-sm"
          style={{ left: chip.left, top: chip.top, animationDelay: `${chip.delay}s` }}
        >
          {chip.label}
        </span>
      ))}

      {/* Editing timeline with a playhead cutting clips */}
      <div className="absolute inset-x-[6%] bottom-5 h-10">
        <div className="flex h-full items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-1.5 backdrop-blur-sm">
          {SEGMENTS.map((w, k) => (
            <div
              key={k}
              className="relative h-6 rounded-md"
              style={{
                width: `${w}%`,
                background:
                  k % 3 === 0
                    ? "linear-gradient(90deg, #2563eb, #38bdf8)"
                    : k % 3 === 1
                      ? "linear-gradient(90deg, #4f46e5, #60a5fa)"
                      : "linear-gradient(90deg, #0891b2, #22d3ee)",
                opacity: 0.75,
              }}
            >
              <span
                className="animate-cut-flash absolute inset-y-[-4px] -right-[3px] w-[2px] rounded bg-white shadow-[0_0_8px_white]"
                style={{ animationDelay: `${k * 0.35}s` }}
              />
            </div>
          ))}
        </div>
        <div className="animate-playhead absolute -top-3 -bottom-1 w-0">
          <span className="absolute inset-y-0 -left-px w-0.5 bg-cyan-300 shadow-[0_0_14px_3px_rgba(34,211,238,0.8)]" />
          <span className="absolute -top-6 -left-3 flex size-6 items-center justify-center rounded-full bg-cyan-400/90 shadow-[0_0_14px_rgba(34,211,238,0.9)]">
            <Scissors className="animate-snip size-3.5 text-slate-950" />
          </span>
        </div>
      </div>
    </div>
  );
}
