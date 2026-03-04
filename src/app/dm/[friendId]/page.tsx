"use client";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/profile";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const BALM_GREEN = "#1B6B4A";

export default function DM() {
  const router = useRouter();
  const params = useParams();
  const friendId = params.friendId as string;
  const [messages, setMessages] = useState<{id: string; sender_id: string; content: string; created_at: string}[]>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getProfile();
    if (!(p && p.firstName)) { router.push("/auth"); return; }
    supabase.from("profiles").select("id").eq("first_name", p.firstName).limit(1).then(function(res) {
      if (res.data && res.data[0]) setMyId(res.data[0].id);
    });
    supabase.from("profiles").select("first_name").eq("id", friendId).limit(1).then(function(res) {
      if (res.data && res.data[0]) setFriendName(res.data[0].first_name);
    });
  }, [friendId, router]);

  const loadMessages = () => {
    if (!(myId && friendId)) return;
    supabase.from("dm_messages").select("*").or("and(sender_id.eq." + myId + ",receiver_id.eq." + friendId + "),and(sender_id.eq." + friendId + ",receiver_id.eq." + myId + ")").order("created_at", { ascending: true }).then(function(res) {
      if (res.data) { setMessages(res.data); setTimeout(function() { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100); }
    });
  };

  useEffect(() => { loadMessages(); const interval = setInterval(loadMessages, 5000); return () => clearInterval(interval); }, [myId, friendId]);

  const sendMessage = async () => {
    if (!(input.trim() && myId)) return;
    await supabase.from("dm_messages").insert({ sender_id: myId, receiver_id: friendId, content: input.trim() });
    setInput("");
    loadMessages();
  };

  return (<div style={{ minHeight: "100vh", background: "#FDF8F0", fontFamily: "DM Sans, sans-serif", display: "flex", flexDirection: "column" }}>
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/community")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>{"\u2190"}</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{friendName || "Chat"}</h1>
      </div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      {messages.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>No messages yet. Say hi!</p>}
      {messages.map(function(m) { return <div key={m.id} style={{ display: "flex", justifyContent: m.sender_id === myId ? "flex-end" : "flex-start", marginBottom: 12 }}><div style={{ maxWidth: "70%", padding: "12px 16px", borderRadius: 16, background: m.sender_id === myId ? BALM_GREEN : "white", color: m.sender_id === myId ? "white" : "#1a1a1a", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>{m.content}</div></div>; })}
      <div ref={endRef}></div>
    </div>
    <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(27,107,74,0.1)", display: "flex", gap: 12 }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder={"Message " + friendName + "..."} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.2)", fontSize: 15, outline: "none" }} />
      <button onClick={sendMessage} style={{ padding: "12px 24px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>Send</button>
    </div>
  </div>);
}
