"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";

interface Article { title: string; description: string; url: string; urlToImage: string; publishedAt: string; source: { name: string }; }

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
      {articles.map(function(a, i) { return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "white", borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", textDecoration: "none", color: "inherit" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {a.urlToImage && <img src={a.urlToImage} alt="" style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>{a.title}</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{a.source.name} — {new Date(a.publishedAt).toLocaleDateString()}</p>
            {a.description && <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{a.description.slice(0, 150)}...</p>}
          </div>
        </div>
      </a>; })}
    </div>
  </div>);
}
