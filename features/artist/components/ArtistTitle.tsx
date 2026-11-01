/** The gradient page title with a small equalizer mark under it. */
export function ArtistTitle({ children }: { children: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <h1
        className="bg-clip-text text-center text-xl font-black uppercase tracking-tight text-transparent"
        style={{
          fontFamily: "var(--font-display)",
          backgroundImage: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
        }}
      >
        {children}
      </h1>
      <span aria-hidden className="flex h-3 items-end gap-[3px]">
        {[0.45, 0.8, 1, 0.65, 0.35].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: `${h * 100}%`,
              background: "linear-gradient(to top, var(--color-primary), var(--color-secondary))",
            }}
          />
        ))}
      </span>
    </div>
  );
}
