/**
 * The browser's IP as seen by the Next server, forwarded to the backend as `X-Client-IP`.
 * Behind a proxy it comes from the proxy's headers. On localhost there is no proxy, so
 * set `DEV_CLIENT_IP` in `.env.local` to test IP lookups and blocks.
 */
export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    forwardedFor ||
    process.env.DEV_CLIENT_IP ||
    null
  );
}

/**
 * The browser's IP and User-Agent for the backend's activity log (the Next server's own
 * User-Agent would be Node's).
 */
export function clientContextHeaders(headers: Headers): Record<string, string> {
  const ua = headers.get("user-agent");
  return { ...clientIpHeader(headers), ...(ua ? { "X-Client-User-Agent": ua.slice(0, 512) } : {}) };
}

/** `{ "X-Client-IP": ip }` when the IP is known, otherwise `{}`. */
export function clientIpHeader(headers: Headers): Record<string, string> {
  const ip = getClientIp(headers);
  return ip ? { "X-Client-IP": ip } : {};
}
