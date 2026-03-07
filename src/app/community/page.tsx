"use client";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/profile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const BALM_GREEN = "#1B6B4A";
interface Member { id: string; first_name: string; user_role: string; }
interface FriendRequest { id: string; requester_id: string; receiver_id: string; status: string; requester?: Member; }
export default function Community() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Member[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [tab, setTab] = useState("members");
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    const p = getProfile();
    if (!(p && p.firstName)) { router.push("/auth"); return; }
    supabase.from("profiles").select("id").eq("first_name", p.firstName).limit(1).then(function(res) { if (res.data && res.data[0]) { const pid = res.data[0].id; setMyId(pid); supabase.from("profiles").select("id, first_name, user_role").then(function(r) { if (r.data) setMembers(r.data.filter(function(m) { return m.id !== pid; })); }); supabase.from("friendships").select("*").eq("receiver_id", pid).eq("status", "pending").then(function(r) { if (r.data && r.data.length > 0) { const reqIds = r.data.map(function(f) { return f.requester_id; }); supabase.from("profiles").select("id, first_name, user_role").in("id", reqIds).then(function(pr) { setRequests(r.data.map(function(f) { return { ...f, requester: pr.data?.find(function(p2) { return p2.id === f.requester_id; }) }; })); }); } }); supabase.from("friendships").select("*").or("requester_id.eq." + pid + ",receiver_id.eq." + pid).eq("status", "accepted").then(function(r) { if (r.data && r.data.length > 0) { const friendIds = r.data.map(function(f) { return f.requester_id === pid ? f.receiver_id : f.requester_id; }); supabase.from("profiles").select("id, first_name, user_role").in("id", friendIds).then(function(pr) { if (pr.data) setFriends(pr.data); }); } }); } });
  }, [router]);
  const sendRequest = async (receiverId: string) => { if (myId) { await supabase.from("friendships").insert({ requester_id: myId, receiver_id: receiverId, status: "pending" }); alert("Friend request sent"); var p = getProfile(); fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "friend_request", recipientId: receiverId, senderName: p ? p.firstName : "Someone" }) }); } };
  const respondRequest = async (requestId: string, status: string) => { await supabase.from("friendships").update({ status }).eq("id", requestId); setRequests(requests.filter(function(r) { return r.id !== requestId; })); if (status === "accepted") window.location.reload(); };
  return (<div style={{ minHeight: "100vh", background: "#FDF8F0", fontFamily: "DM Sans, sans-serif" }}>
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Community</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => router.push("/chat")} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Back to BALM</button>
        <button onClick={() => setShowMenu(!showMenu)} style={{ width: 40, height: 40, background: "white", border: "1px solid rgba(27,107,74,0.2)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{"\u2630"}</button>
      </div>
    </div>
    {showMenu && (<div style={{ position: "absolute", top: 60, right: 24, background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 200, overflow: "hidden" }}>
      {[{ label: "Talk to BALM", path: "/chat", icon: "\uD83D\uDCAC" }, { label: "Symptom Tracker", path: "/tracker", icon: "\uD83D\uDCCA" }, { label: "Progress", path: "/progress", icon: "\uD83D\uDCC8" }, { label: "Community", path: "/community", icon: "\uD83E\uDD1D" }, { label: "News & Research", path: "/news", icon: "\uD83D\uDCF0" }, { label: "Safety Circle", path: "/safety-circle", icon: "\uD83D\uDEE1\uFE0F" }, { label: "Settings", path: "/settings", icon: "\u2699\uFE0F" }].map(function(item) { return <button key={item.path} onClick={() => { setShowMenu(false); router.push(item.path); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 20px", background: "transparent", border: "none", borderBottom: "1px solid rgba(27,107,74,0.06)", cursor: "pointer", fontSize: 15, color: "#1a1a1a", fontFamily: "DM Sans, sans-serif" }}><span>{item.icon}</span><span>{item.label}</span></button>; })}
    </div>)}
    <div style={{ display: "flex", borderBottom: "1px solid rgba(27,107,74,0.1)" }}>
      {["members","friends","requests"].map(function(t) { return <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px", background: tab === t ? "rgba(27,107,74,0.08)" : "transparent", border: "none", borderBottom: tab === t ? "2px solid " + BALM_GREEN : "2px solid transparent", color: tab === t ? BALM_GREEN : "#888", fontWeight: 600, fontSize: 14, cursor: "pointer", textTransform: "capitalize" as const }}>{t}{t === "requests" && requests.length > 0 ? " (" + requests.length + ")" : ""}</button>; })}
    </div>
    <div style={{ padding: 24 }}>
      {tab === "members" && <div>{members.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>No other members yet.</p>}{members.map(function(m) { return <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "white", borderRadius: 12, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}><div><span style={{ fontWeight: 600 }}>{m.first_name}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#888", background: "rgba(27,107,74,0.08)", padding: "2px 8px", borderRadius: 8 }}>{m.user_role}</span></div><button onClick={() => sendRequest(m.id)} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Add Friend</button></div>; })}</div>}
      {tab === "friends" && <div>{friends.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>No friends yet.</p>}{friends.map(function(f) { return <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "white", borderRadius: 12, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}><div><span style={{ fontWeight: 600 }}>{f.first_name}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>{f.user_role}</span></div><button onClick={() => router.push("/dm/" + f.id)} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Message</button></div>; })}</div>}
      {tab === "requests" && <div>{requests.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>No pending requests.</p>}{requests.map(function(r) { return <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "white", borderRadius: 12, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}><div><span style={{ fontWeight: 600 }}>{r.requester?.first_name || "Someone"}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>wants to connect</span></div><div style={{ display: "flex", gap: 8 }}><button onClick={() => respondRequest(r.id, "accepted")} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Accept</button><button onClick={() => respondRequest(r.id, "declined")} style={{ padding: "8px 12px", background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Decline</button></div></div>; })}</div>}
    </div>
  </div>);
}
