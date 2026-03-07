"use client";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/profile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const BALM_GREEN = "#1B6B4A";
export default function Settings() {
  const router = useRouter();
  const [myId, setMyId] = useState<string | null>(null);
  const [checkin, setCheckin] = useState("daily");
  const [research, setResearch] = useState(true);
  const [newMember, setNewMember] = useState(true);
  const [friendReq, setFriendReq] = useState(true);
  const [dm, setDm] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    const p = getProfile();
    if (!(p && p.firstName)) { router.push("/auth"); return; }
    supabase.from("profiles").select("id").eq("first_name", p.firstName).limit(1).then(function(res) { if (res.data && res.data[0]) { const pid = res.data[0].id; setMyId(pid); supabase.from("notification_prefs").select("*").eq("profile_id", pid).limit(1).then(function(r) { if (r.data && r.data[0]) { setCheckin(r.data[0].checkin_frequency); setResearch(r.data[0].research_alerts); setNewMember(r.data[0].new_member_alerts); setFriendReq(r.data[0].friend_request_alerts); setDm(r.data[0].dm_alerts); } }); } });
  }, [router]);
  const savePrefs = async () => { if (!myId) return; await supabase.from("notification_prefs").upsert({ profile_id: myId, checkin_frequency: checkin, research_alerts: research, new_member_alerts: newMember, friend_request_alerts: friendReq, dm_alerts: dm }); setSaved(true); setTimeout(function() { setSaved(false); }, 2000); };
  const toggleStyle = function(on: boolean) { return { width: 48, height: 26, borderRadius: 13, background: on ? BALM_GREEN : "#ccc", position: "relative" as const, cursor: "pointer", border: "none", padding: 0, transition: "background 0.2s" }; };
  const dotStyle = function(on: boolean) { return { width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute" as const, top: 2, left: on ? 24 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }; };
  return (<div style={{ minHeight: "100vh", background: "#FDF8F0", fontFamily: "DM Sans, sans-serif" }}>
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Notification Settings</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => router.push("/chat")} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Back to BALM</button>
        <button onClick={() => setShowMenu(!showMenu)} style={{ width: 40, height: 40, background: "white", border: "1px solid rgba(27,107,74,0.2)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{"\u2630"}</button>
      </div>
    </div>
    {showMenu && (<div style={{ position: "absolute", top: 60, right: 24, background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 200, overflow: "hidden" }}>
      {[{ label: "Talk to BALM", path: "/chat", icon: "\uD83D\uDCAC" }, { label: "Symptom Tracker", path: "/tracker", icon: "\uD83D\uDCCA" }, { label: "Progress", path: "/progress", icon: "\uD83D\uDCC8" }, { label: "Community", path: "/community", icon: "\uD83E\uDD1D" }, { label: "News & Research", path: "/news", icon: "\uD83D\uDCF0" }, { label: "Safety Circle", path: "/safety-circle", icon: "\uD83D\uDEE1\uFE0F" }, { label: "Settings", path: "/settings", icon: "\u2699\uFE0F" }].map(function(item) { return <button key={item.path} onClick={() => { setShowMenu(false); router.push(item.path); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 20px", background: "transparent", border: "none", borderBottom: "1px solid rgba(27,107,74,0.06)", cursor: "pointer", fontSize: 15, color: "#1a1a1a", fontFamily: "DM Sans, sans-serif" }}><span>{item.icon}</span><span>{item.label}</span></button>; })}
    </div>)}
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1a1a1a" }}>BALM Check-ins</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["daily","weekly","off"].map(function(opt) { return <button key={opt} onClick={() => setCheckin(opt)} style={{ padding: "8px 20px", borderRadius: 8, border: checkin === opt ? "2px solid " + BALM_GREEN : "1px solid #ddd", background: checkin === opt ? "rgba(27,107,74,0.08)" : "white", color: checkin === opt ? BALM_GREEN : "#888", fontWeight: 600, fontSize: 14, cursor: "pointer", textTransform: "capitalize" }}>{opt}</button>; })}
        </div>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>New Research Alerts</span><p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Get notified about new TSW studies and articles</p></div><button onClick={() => setResearch(!research)} style={toggleStyle(research)}><div style={dotStyle(research)}></div></button></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>New Member Alerts</span><p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Know when someone new joins the community</p></div><button onClick={() => setNewMember(!newMember)} style={toggleStyle(newMember)}><div style={dotStyle(newMember)}></div></button></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Friend Request Alerts</span><p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Get notified when someone wants to connect</p></div><button onClick={() => setFriendReq(!friendReq)} style={toggleStyle(friendReq)}><div style={dotStyle(friendReq)}></div></button></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Direct Message Alerts</span><p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Get notified when a friend sends you a message</p></div><button onClick={() => setDm(!dm)} style={toggleStyle(dm)}><div style={dotStyle(dm)}></div></button></div>
      </div>
      <button onClick={savePrefs} style={{ width: "100%", padding: 14, marginTop: 24, background: BALM_GREEN, color: "white", border: "none", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>{saved ? "Saved!" : "Save Preferences"}</button>
    </div>
  </div>);
}
