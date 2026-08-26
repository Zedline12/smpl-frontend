export const MAX_CLIP_NUMBER = 100;
export const MIN_CLIP_NUMBER = 1;

/** Note there is deliberately no 8 — it is not a valid videoType. */
export const VIDEO_TYPES: { value: number; label: string }[] = [
  { value: 1, label: "Remote video file" },
  { value: 2, label: "YouTube" },
  { value: 3, label: "Google Drive" },
  { value: 4, label: "Vimeo" },
  { value: 5, label: "StreamYard" },
  { value: 6, label: "TikTok" },
  { value: 7, label: "Twitter (X)" },
  { value: 9, label: "Twitch" },
  { value: 10, label: "Loom" },
  { value: 11, label: "Facebook" },
  { value: 12, label: "LinkedIn" },
  { value: 13, label: "Dropbox" },
  { value: 14, label: "Instagram" },
];

/** Fallback when a URL's host isn't recognised — it really is a remote file. */
export const DEFAULT_VIDEO_TYPE = 1;

/** What the form assumes before anything has been typed. */
export const INITIAL_VIDEO_TYPE = 2; // YouTube

/** Hostname suffix → videoType. Order matters only for readability. */
export const HOST_TO_VIDEO_TYPE: { host: string; value: number }[] = [
  { host: "youtube.com", value: 2 },
  { host: "youtu.be", value: 2 },
  { host: "drive.google.com", value: 3 },
  { host: "vimeo.com", value: 4 },
  { host: "streamyard.com", value: 5 },
  { host: "tiktok.com", value: 6 },
  { host: "twitter.com", value: 7 },
  { host: "x.com", value: 7 },
  { host: "twitch.tv", value: 9 },
  { host: "loom.com", value: 10 },
  { host: "facebook.com", value: 11 },
  { host: "fb.watch", value: 11 },
  { host: "linkedin.com", value: 12 },
  { host: "dropbox.com", value: 13 },
  { host: "instagram.com", value: 14 },
];

export const RATIOS: { value: number; label: string; hint: string }[] = [
  { value: 1, label: "9:16", hint: "Vertical" },
  { value: 2, label: "1:1", hint: "Square" },
  { value: 3, label: "4:5", hint: "Portrait" },
  { value: 4, label: "16:9", hint: "Horizontal" },
];

export const DEFAULT_RATIO = 1;

export const PREFER_LENGTHS: { value: number; label: string }[] = [
  { value: 0, label: "Auto" },
  { value: 1, label: "Under 30s" },
  { value: 2, label: "30–60s" },
  { value: 3, label: "60–90s" },
  { value: 4, label: "90s–3min" },
];

/** Single choice in the UI; sent to the API as a one-item array. */
export const DEFAULT_PREFER_LENGTH = 0;

export const DEFAULT_LANG = "en";

export const LANGUAGES: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic (عربي)" },
  { value: "bg", label: "Bulgarian (български)" },
  { value: "hr", label: "Croatian (Hrvatski)" },
  { value: "yue", label: "Cantonese (粤语)" },
  { value: "cs", label: "Czech (čeština)" },
  { value: "da", label: "Danish (Dansk)" },
  { value: "nl", label: "Dutch (Nederlands)" },
  { value: "fi", label: "Finnish (Suomi)" },
  { value: "fr", label: "French (Français)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "el", label: "Greek (Ελληνικά)" },
  { value: "iw", label: "Hebrew (עִברִית)" },
  { value: "hi", label: "Hindi (हिंदी)" },
  { value: "hu", label: "Hungarian (Magyar nyelv)" },
  { value: "id", label: "Indonesian (Bahasa Indonesia)" },
  { value: "it", label: "Italian (Italiano)" },
  { value: "ja", label: "Japanese (日本語)" },
  { value: "ko", label: "Korean (한국어)" },
  { value: "lt", label: "Lithuanian (Lietuvių kalba)" },
  { value: "mal", label: "Malay (Melayu)" },
  { value: "zh", label: "Mandarin – Simplified (简体)" },
  { value: "zh-TW", label: "Mandarin – Traditional (繁體)" },
  { value: "no", label: "Norwegian (Norsk)" },
  { value: "pl", label: "Polish (Polski)" },
  { value: "pt", label: "Portuguese (Português)" },
  { value: "ro", label: "Romanian (Limba română)" },
  { value: "ru", label: "Russian (Pусский)" },
  { value: "sr", label: "Serbian (Српски)" },
  { value: "sk", label: "Slovak (Slovenský)" },
  { value: "es", label: "Spanish (Español)" },
  { value: "sv", label: "Swedish (Svenska)" },
  { value: "tr", label: "Turkish (Türkçe)" },
  { value: "uk", label: "Ukrainian (Україна)" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
];
