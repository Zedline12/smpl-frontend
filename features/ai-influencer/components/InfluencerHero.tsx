"use client";

/**
 * Photos for the hero, left to right. Paste image links here; empty slots show
 * a placeholder card.
 */
const HERO_IMAGES: string[] = ["https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Explore%20Visuals/burgundy-suit-dancer.mp4", "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Explore%20Visuals/cream-shirt.mp4", "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Explore%20Visuals/cream-tuxedo.mp4", "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Explore%20Visuals/green-suit.mp4", "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Explore%20Visuals/red-bob.mp4"];

const HEADLINE = ["Your influencer,", "your next viral hit"];
const SUBTITLE =
  "Build your AI influencer with the face, body, and style you want. Pick the traits on the left and get a close-up and full-body shot ready to use.";

/** Size and layer by distance from the centre: the middle video is biggest and on top. */
const SCALE = [1, 0.94, 0.88];
const LAYER = [30, 20, 10];

/** AI Influencer Explore hero: a row of 5 looping videos above a headline. */
export function InfluencerHero({ images = HERO_IMAGES }: { images?: string[] }) {
  const clips = images.slice(0, 5);
  const middle = (clips.length - 1) / 2;

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-6 text-center">
      <div className="flex w-full max-w-3xl items-center justify-center">
        {clips.map((url, i) => {
          const distance = Math.min(2, Math.round(Math.abs(i - middle)));
          return (
            <div
              key={i}
              style={{ transform: `scale(${SCALE[distance]})`, zIndex: LAYER[distance] }}
              // Each card slightly overlaps the edge of its neighbour.
              className={`relative aspect-[9/16] min-w-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-xl shadow-black/50 ${
                i > 0 ? "-ml-4 sm:-ml-6" : ""
              }`}
            >
              {url && (
                <video
                  src={url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mt-7 text-2xl leading-none font-extrabold tracking-tight text-white uppercase sm:text-3xl">
        {HEADLINE[0]}
        <br />
        {HEADLINE[1]}
      </h2>
      <p className="mt-3 max-w-md text-xs leading-relaxed text-white/50 sm:text-sm">
        {SUBTITLE}
      </p>
    </div>
  );
}
