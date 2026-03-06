"use client";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/profile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";

interface Contact { id: string; contact_name: string; contact_email: string; contact_phone: string; relationship: string; }

export default function SafetyCircle() {
  const router = useRouter();
  const [myId, setMyId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rel, setRel] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (!(p && p.firstName)) { router.push("/auth"); return; }
    supabase.from("profiles").select("id").eq("first_name", p.firstName).limit(1).then(function(res) {
      if (res.data && res.data[0]) {
        const pid = res.data[0].id;
        setMyId(pid);
        supabase.from("safety_circle").select("*").eq("profile_id", pid).then(function(r) {
          if (r.data) setContacts(r.data);
        });
      }
    });
  }, [router]);

  const addContact = async () => {
    if (!(myId && name.trim())) return;
    const { data } = await supabase.from("safety_circle").insert({ profile_id: myId, contact_name: name, contact_email: email, contact_phone: phone, relationship: rel }).select();
    if (data) setContacts([...contacts, data[0]]);
    setName(""); setEmail(""); setPhone(""); setRel(""); setShowForm(false);
  };

  const removeContact = async (id: string) => {
    await supabase.from("safety_circle").delete().eq("id", id);
    setContacts(contacts.filter(function(c) { return c.id !== id; }));
  };

  return (<div style={{ minHeight: "100vh", background: "#FDF8F0", fontFamily: "DM Sans, sans-serif" }}>
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Safety Circle</h1>
      <button onClick={() => router.push("/chat")} style={{ padding: "8px 16px", background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Back to BALM</button>
    </div>
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>Your Safety Circle will be alerted when you use the Panic Button. Add trusted people who can support you during a crisis.</p>
      {contacts.length === 0 && <p style={{ color: "#888", textAlign: "center", padding: 32 }}>No contacts yet. Add someone you trust.</p>}
      {contacts.map(function(c) { return <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "white", borderRadius: 12, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}><div><span style={{ fontWeight: 600 }}>{c.contact_name}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>{c.relationship}</span><p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>{c.contact_email}{c.contact_phone ? " | " + c.contact_phone : ""}</p></div><button onClick={() => removeContact(c.id)} style={{ background: "none", border: "none", color: "#E8534A", cursor: "pointer", fontSize: 18 }}>X</button></div>; })}
      {showForm ? <div style={{ background: "white", borderRadius: 12, padding: 20, marginTop: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 8, fontSize: 14 }} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 8, fontSize: 14 }} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 8, fontSize: 14 }} />
        <input value={rel} onChange={(e) => setRel(e.target.value)} placeholder="Relationship (e.g. spouse, parent, friend)" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12, fontSize: 14 }} />
        <div style={{ display: "flex", gap: 8 }}><button onClick={addContact} style={{ flex: 1, padding: 12, background: BALM_GREEN, color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Save Contact</button><button onClick={() => setShowForm(false)} style={{ padding: 12, background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>Cancel</button></div>
      </div> : <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: 14, marginTop: 12, background: "transparent", border: "2px dashed rgba(27,107,74,0.3)", borderRadius: 12, color: BALM_GREEN, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>+ Add Emergency Contact</button>}
    </div>
  </div>);
}
