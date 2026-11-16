"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlayWhenVisible } from "@/features/templates/components/TemplateMedia";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { useStylesQuery } from "../api";
import {
  STYLES_HERO_VIDEO,
  STYLE_FALLBACK_GRADIENTS,
  STYLE_MODEL_IDS,
  type Style,
} from "../styles";

function StylesHero() {
  return (
    <section className="mb-10 mt-4 flex flex-col items-center justify-between gap-8 md:flex-row md:gap-16">
      <div className="max-w-xl flex-1">
        <h2 className="text-[34px] font-extrabold leading-none tracking-tight text-white md:text-[44px]">
          One idea, any style
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/60">
          Pick a style and every frame takes its look. Your prompt becomes optional, the style
          already describes it. Add a prompt to choose what&apos;s in the shot.
        </p>
      </div>
      <div className="w-full flex-1 md:max-w-xl">
        {STYLES_HERO_VIDEO ? (
          <video
            src={STYLES_HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            className="aspect-video w-full rounded-2xl border border-white/10 bg-black object-cover"
          />
        ) : (
          <div className="aspect-video w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#6b41ff]/40 via-[#1a1a1a] to-[#ea4bff]/25" />
        )}
      </div>
    </section>
  );
}

function StyleCard({
  style,
  index,
  selected,
  onClick,
}: {
  style: Style;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const ref = usePlayWhenVisible<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-2xl bg-black text-left transition-shadow",
        selected ? "ring-2 ring-white" : "ring-1 ring-white/10 hover:ring-white/30",
      )}
    >
      {style.videoUrl ? (
        <video
          src={style.videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : style.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={style.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            STYLE_FALLBACK_GRADIENTS[index % STYLE_FALLBACK_GRADIENTS.length],
          )}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
      {selected && (
        <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-white shadow">
          <Check className="size-3.5 stroke-[3px] text-black" />
        </span>
      )}
      <span
        className="absolute bottom-4 left-4 right-4 text-[16px] font-extrabold leading-tight tracking-tight text-white"
      >
        {style.name}
      </span>
    </button>
  );
}

/** The Styles tab: a hero, then every style as a looping card. Picking one applies it. */
export function StylesView() {
  const { styleId, setStyleId, model } = useAiGenerationControlStore();
  const { data: styles, isLoading, isError } = useStylesQuery();

  const pick = (style: Style) => {
    if (styleId === style.id || styleId === style.slug) {
      setStyleId(null);
      toast("Style removed");
      return;
    }
    setStyleId(style.id);
    toast.success(
      STYLE_MODEL_IDS.has(model)
        ? `${style.name} applied`
        : `${style.name} picked. Choose an image or video model that takes a prompt to use it.`,
    );
  };

  return (
    <div className="pb-8">
      <StylesHero />
      {isError ? (
        <p className="py-10 text-center text-sm text-white/50">Couldn&apos;t load styles. Please refresh.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !styles
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video animate-pulse rounded-2xl bg-white/5" />
              ))
            : styles.map((style, i) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  index={i}
                  selected={styleId === style.id || styleId === style.slug}
                  onClick={() => pick(style)}
                />
              ))}
        </div>
      )}
    </div>
  );
}
