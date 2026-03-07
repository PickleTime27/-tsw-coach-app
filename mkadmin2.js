const fs = require("fs");
fs.mkdirSync("src/app/admin", { recursive: true });
const page = `"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
const G = "#1B6B4A", C = "#FDF8F0", D = "#0D2818";
export default function AdminPage() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const s = sessionStorage.getItem("admin_verified");
    if (s === "true") { setAuthed(true); loadStats(); } else { setAuthed(false); }
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (res.ok && data.verified) { sessionStorage.setItem("admin_verified", "true"); setAuthed(true); loadStats(); }
      else { setError(data.message || "Access denied."); setPassword(""); }
    } catch { setError("Something went wrong."); } finally { setLoading(false); }
  };
  const loadStats = async () => {
    const [u, m] = await Promise.all([
      supabase.from("profiles").select("id,first_name,user_role,created_at,is_admin").order("created_at", { ascending: false }),
      supabase.from("messages").select("id", { count: "exact", head: true })
    ]);
    setStats({ totalUsers: u.data?.length || 0, totalMessages: m.count || 0, users: u.data || [] });
  };
  const handleLogout = () => { sessionStorage.removeItem("admin_verified"); setAuthed(false); setStats(null); };
  if (authed === null) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C, color: G, fontFamily: "sans-serif" }}>Loading...</div>;
  if (!authed) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C, fontFamily: "sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "48px 40px", maxWidth: 400, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "white", fontSize: 20 }}>&#9881;</span></div>
          <div><div style={{ fontWeight: 700, fontSize: 18, color: D }}>Admin Access</div><div style={{ fontSize: 12, color: "#5BA68A" }}>TSW Coach Dashboard</div></div>
        </div>
        <form onSubmit={handleLogin}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: D, marginBottom: 8 }}>Admin Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #D4E8D9", fontSize: 15, outline: "none", marginBottom: 16, boxSizing: "border-box" }} autoFocus />
          {error && <div style={{ background: "#FEE8E8", border: "1px solid #E8534A", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#C0392B", marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading || !password} style={{ width: "100%", padding: 14, background: loading ? "#B0D4B8" : G, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
        <button onClick={() => router.push("/chat")} style={{ width: "100%", marginTop: 12, padding: 12, background: "transparent", border: "none", color: "#5BA68A", fontSize: 14, cursor: "pointer" }}>Back to BALM</button>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", background: C, fontFamily: "sans-serif" }}>
      <div style={{ padding: "16px 32px", background: G, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "white" }}>TSW Coach Admin</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => router.push("/chat")} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 14 }}>Back to BALM</button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "rgba(232,83,74,0.8)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 14 }}>Log Out</button>
        </div>
      </div>
      <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 32 }}>
          {[{ label: "Total Users", value: stats?.totalUsers ?? "...", icon: "👥" }, { label: "Total Messages", value: stats?.totalMessages ?? "...", icon: "💬" }, { label: "Active Today", value: "—", icon: "🟢" }].map(c => (
            <div key={c.label} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: G }}>{c.value}</div>
              <div style={{ fontSize: 14, color: "#5BA68A", marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: D, marginBottom: 20 }}>Registered Users</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ borderBottom: "2px solid #E8F5EC" }}>
              {["Name", "Role", "Admin", "Joined"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#5BA68A", fontWeight: 600 }}>{h}</th>)}
            </tr></thead>
            <tbody>{stats?.users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #F0F8F2" }}>
                <td style={{ padding: 12, fontWeight: 600, color: D }}>{u.first_name || "—"}</td>
                <td style={{ padding: 12, color: "#5BA68A" }}>{u.user_role || "—"}</td>
                <td style={{ padding: 12 }}><span style={{ background: u.is_admin ? "#E8F5EC" : "#F5F5F5", color: u.is_admin ? G : "#999", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{u.is_admin ? "Admin" : "User"}</span></td>
                <td style={{ padding: 12, color: "#999" }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`;
fs.writeFileSync("src/app/admin/page.tsx", page);
console.log("Admin page written successfully!");
