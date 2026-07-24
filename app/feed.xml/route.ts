import { campusPosts, notes, site } from "../lib/content";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const base = site.siteUrl.replace(/\/$/, "");
  const entries = [
    ...campusPosts.map((entry) => ({ ...entry, kind: "campus" })),
    ...notes.map((entry) => ({ ...entry, kind: "note" })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const items = entries
    .map(
      (entry) => `<item>
  <title>${escapeXml(entry.title)}</title>
  <link>${base}/read/${entry.kind}/${entry.slug}/</link>
  <guid>${base}/read/${entry.kind}/${entry.slug}/</guid>
  <description>${escapeXml(entry.summary)}</description>
  <pubDate>${new Date(`${entry.date}T00:00:00+08:00`).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(`${site.networkId} 的个人空间`)}</title>
  <link>${base}/</link>
  <description>${escapeXml(site.intro)}</description>
  <language>zh-CN</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
