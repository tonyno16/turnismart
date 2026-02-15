/**
 * Validates and sanitizes a redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with a single `/`.
 */
export function sanitizeRedirectPath(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!raw) return fallback;
  // Must start with exactly one slash, not two (protocol-relative)
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // Block any embedded protocol
  if (/^\/[a-z]+:/i.test(raw)) return fallback;
  try {
    const url = new URL(raw, "http://dummy");
    if (url.hostname !== "dummy") return fallback;
  } catch {
    return fallback;
  }
  return raw;
}
