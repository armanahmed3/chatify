/** Builds the one-line website embed snippet for a bot. */
export function getEmbedSnippet(botId: string, color = "#2563eb"): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `<script src="${base}/widget.js" data-bot="${botId}" data-color="${color}" defer></script>`;
}
