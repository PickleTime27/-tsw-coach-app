import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://news.google.com/rss/search?q=topical+steroid+withdrawal+OR+TSW+eczema&hl=en-US&gl=US&ceid=US:en"
    );
    const xml = await res.text();
    const items: { title: string; url: string; source: string; sourceUrl: string; date: string }[] = [];
    const matches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    for (const item of matches.slice(0, 20)) {
      const title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const url = (item.match(/<link\/>([\s\S]*?)</) || [])[1] || (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
      const source = (item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || "";
      const sourceUrl = (item.match(/<source[^>]*url="([^"]*)"/) || [])[1] || "";
      const date = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
      items.push({ title: title.replace(/<!\[CDATA\[|\]\]>/g, ""), url: url.trim(), source, sourceUrl, date });
    }
    return NextResponse.json({ articles: items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
