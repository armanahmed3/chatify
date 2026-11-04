/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseWs = supabaseUrl.replace(/^https:/, "wss:");

// Content-Security-Policy: blocks injected third-party scripts, plugins, base-tag hijacks & clickjacking.
// 'unsafe-inline' is required for Next.js 14 hydration scripts and the theme bootstrap script.
const csp = (frameAncestors) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseUrl} ${supabaseWs}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

// Public widget APIs are called cross-origin from customer websites. They use NO cookies/credentials,
// so a wildcard origin is safe here; everything else stays same-origin only (no CORS headers at all).
const widgetCors = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type" },
  { key: "Access-Control-Max-Age", value: "86400" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server bundle for Docker / any Node host.
  output: "standalone",
  // Never ship source maps to browsers in production.
  productionBrowserSourceMaps: false,
  compress: true,

  images: {
    // No open image proxy: only optimise images from our own storage.
    remotePatterns: supabaseUrl
      ? [{ protocol: "https", hostname: new URL(supabaseUrl).hostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  serverExternalPackages: ["pdf-parse"],

  async headers() {
    return [
      {
        source: "/((?!chat/).*)",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: csp("'none'") },
        ],
      },
      // Hosted chat page is designed to be embedded in customer sites via iframe.
      {
        source: "/chat/:path*",
        headers: [...securityHeaders, { key: "Content-Security-Policy", value: csp("*") }],
      },
      { source: "/api/chat/:path*", headers: widgetCors },
      { source: "/api/tracking/events", headers: widgetCors },
      // Private API responses must never be cached by shared caches / CDNs.
      {
        source: "/api/((?!health).*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      // CDN caching for the embeddable widget script
      {
        source: "/widget.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
      // Long-lived immutable caching for hashed build assets
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
