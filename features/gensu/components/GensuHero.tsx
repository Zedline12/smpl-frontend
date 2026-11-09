/** Gensu intro shown above the Explore templates: text on the left, a video on the right. */
export function GensuHero() {
  return (
    <section className="mb-14 flex flex-col items-center justify-between gap-8 md:flex-row md:gap-16">
      <div className="max-w-xl flex-1">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Turn one video into many</h2>
        <p className="mt-3 text-base leading-relaxed text-white/60">
          Take the motion and recast it with your characters, locations, and products, or swap specific elements
          while keeping the rest untouched.
        </p>
      </div>
      <div className="w-full flex-1 md:max-w-xl">
        <video
          src="https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Explore%20Visuals/genjutsu-intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="aspect-video w-full rounded-2xl border border-white/10 bg-black object-cover"
        />
      </div>
    </section>
  );
}
