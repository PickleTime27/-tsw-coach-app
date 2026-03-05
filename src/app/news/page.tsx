"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";

interface Article { title: string; url: string; source: string; sourceUrl: string; date: string; }

export default function News() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news").then(function(r) { return r.json(); }).then(function(data) {
      if (data.articles) setArticles(data.articles);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  return (<div style={{ minHeight: "100vh", background: "#FDF8F0", fontFamily: "DM Sans, sans-serif" }}>
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>TSW News & Research</h1>
      <button onClick={() => router.push("/chat")} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Back to BALM</button>
    </div>
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {loading && <p style={{ textAlign: "center", color: "#888" }}>Loading latest TSW news...</p>}
      {articles.length === 0 && !loading && <p style={{ textAlign: "center", color: "#888" }}>No articles found.</p>}
      {articles.map(function(a, i) { var domain = ""; try { domain = a.sourceUrl ? new URL(a.sourceUrl).hostname : a.sourceUrl ? new URL(a.sourceUrl).hostname : new URL(a.url).hostname; } catch(e) {} return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 16, alignItems: "center", background: "white", borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textDecoration: "none", color: "inherit", border: "1px solid rgba(27,107,74,0.06)" }}><img src={"https://www.google.com/s2/favicons?domain=" + domain + "\u0026sz=64"} alt="" style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: "#f0f0f0" }} /><div><h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.4 }}>{a.title}</h3><p style={{ fontSize: 12, color: "#1B6B4A", fontWeight: 500 }}>{a.source} u2022 {new Date(a.date).toLocaleDateString()}</p></div></a>; })}
    </div>
  </div>);
}
