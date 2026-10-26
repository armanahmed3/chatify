/**
 * Server-Side Request Forgery (SSRF) Prevention Utility
 * Validates external URLs to prevent access to private IP ranges, cloud metadata endpoints, loopback, and local services.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "::",
  "metadata.google.internal",
  "instance-data",
]);

/**
 * Checks if an IPv4 address is in a private, loopback, link-local, or reserved range.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // Cloud metadata endpoint
  if (ip === "169.254.169.254") return true;

  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-local / Cloud metadata)
  if (a === 169 && b === 254) return true;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224) return true;

  return false;
}

/**
 * Validates a target URL against SSRF attack vectors.
 * Throws an error or returns false if the URL is dangerous.
 */
export function assertSafeUrl(rawUrl: string): { isValid: boolean; error?: string; safeUrl?: string } {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.includes("://")) {
      normalized = `https://${normalized}`;
    }

    const parsed = new URL(normalized);

    // Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Only HTTP and HTTPS protocols are allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames
    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return { isValid: false, error: `Access to hostname '${hostname}' is forbidden (SSRF protection).` };
    }

    // Check IP addresses
    if (isPrivateOrReservedIp(hostname)) {
      return { isValid: false, error: `Access to private or link-local IP '${hostname}' is forbidden (SSRF protection).` };
    }

    // Check port (only allow standard web ports 80, 443, 8080, 8443)
    const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
    const ALLOWED_PORTS = [80, 443, 8080, 8443];
    if (!ALLOWED_PORTS.includes(port)) {
      return { isValid: false, error: `Port ${port} is not permitted for remote fetching.` };
    }

    return { isValid: true, safeUrl: parsed.toString() };
  } catch (err: any) {
    return { isValid: false, error: `Invalid URL format: ${err?.message || "unparseable"}` };
  }
}
