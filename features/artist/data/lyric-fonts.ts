import { Anton, Bangers, Bebas_Neue, Noto_Sans, Pacifico, Permanent_Marker } from "next/font/google";
import type { ArtistVideoClipLyricsFont } from "@/features/generation/types/models/artist-video-clip.type";

// Only for the font picker's previews; the video's lyrics use the same fonts on the backend.
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], display: "swap" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], display: "swap" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], display: "swap" });
const noto = Noto_Sans({ weight: "700", subsets: ["latin"], display: "swap" });

/** The lyric fonts, in the order shown; the first is the default. */
export const CLIP_FONT_OPTIONS: {
  id: ArtistVideoClipLyricsFont;
  label: string;
  className: string;
  /**
   * The CSS font-size per ASS font size: libass sizes a font by its Windows ascent +
   * descent (unitsPerEm / (usWinAscent + usWinDescent)), checked against ffmpeg renders.
   */
  emPerAssSize: number;
}[] = [
  { id: "anton", label: "Bold", className: anton.className, emPerAssSize: 2048 / (2876 + 674) },
  { id: "bebas", label: "Poster", className: bebas.className, emPerAssSize: 1000 / (950 + 350) },
  { id: "marker", label: "Marker", className: marker.className, emPerAssSize: 1024 / (1136 + 325) },
  { id: "script", label: "Script", className: pacifico.className, emPerAssSize: 1000 / (1478 + 457) },
  { id: "comic", label: "Comic", className: bangers.className, emPerAssSize: 1000 / (1401 + 356) },
  { id: "classic", label: "Classic", className: noto.className, emPerAssSize: 1000 / (1124 + 395) },
];
