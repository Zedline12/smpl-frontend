/** Solid primary "REMIX" title with a small film-strip mark under it. */
export function RemixTitle() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <h1
        className="text-primary text-center text-xl font-black uppercase tracking-tight"
        style={{
          fontFamily: "var(--font-display)",
          textShadow: "0 0 18px color-mix(in srgb, var(--color-primary) 55%, transparent)",
        }}
      >
        Remix
      </h1>
      <span aria-hidden className="border-primary/70 flex gap-[3px] border-y px-[3px] py-[3px]">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-2 w-3 rounded-[1px] ${i === 2 ? "bg-primary" : "bg-primary/35"}`} />
        ))}
      </span>
    </div>
  );
}
