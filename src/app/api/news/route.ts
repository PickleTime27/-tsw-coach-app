import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.NEWS_API_KEY;
  if (!key) return NextResponse.json({ error: "No API key" }, { status: 500 });

  try {
    const res = await fetch(
      "https://newsapi.org/v2/everything?q=topical+steroid+withdrawal+OR+TSW+eczema+steroid&sortBy=publishedAt&pageSize=20&language=en",
      { headers: { "X-Api-Key": key }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
