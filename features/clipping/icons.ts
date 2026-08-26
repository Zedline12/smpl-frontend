import {
  Cloud,
  Facebook,
  HardDrive,
  Instagram,
  Linkedin,
  LucideIcon,
  Twitch,
  Twitter,
  Video,
  Youtube,
} from "lucide-react";

/**
 * Brand mark per videoType. lucide ships no Vimeo, Loom, TikTok or StreamYard
 * icon, so those fall back to the generic Video mark.
 */
export const VIDEO_TYPE_ICONS: Record<number, LucideIcon> = {
  1: Video, // Remote video file
  2: Youtube,
  3: HardDrive, // Google Drive
  4: Video, // Vimeo
  5: Video, // StreamYard
  6: Video, // TikTok
  7: Twitter, // Twitter (X)
  9: Twitch,
  10: Video, // Loom
  11: Facebook,
  12: Linkedin,
  13: Cloud, // Dropbox
  14: Instagram,
};

export function videoTypeIcon(value: number): LucideIcon {
  return VIDEO_TYPE_ICONS[value] ?? Video;
}
