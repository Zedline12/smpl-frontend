/**
 * Chart colors for the admin pages (dataviz reference palette, dark steps, validated on
 * #161616). Categorical hues go in this fixed order and are never cycled: a sixth series
 * folds into "Other" (OTHER).
 */
export const SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"]; // blue, orange, aqua, yellow, magenta
export const OTHER = "#6b6a66";
export const INK = "#f0efec";
export const MUTED = "#898781";
export const GRID = "#2c2c2a";
export const SURFACE = "#161616";
/** Sequential blue ramp, low → high (dark mode: higher values are brighter). */
export const RAMP = ["#184f95", "#1c5cab", "#256abf", "#2a78d6", "#3987e5", "#5598e7", "#6da7ec", "#86b6ef"];

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: MUTED, fontSize: 11 },
} as const;

export const cardClass = "rounded-2xl border border-white/[0.08] bg-[#161616]";
