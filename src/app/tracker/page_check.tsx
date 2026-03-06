"use client";
import { getProfile } from "@/lib/profile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

const SYMPTOMS = [
  { key: "itching", label: "Itching", emoji: "ðŸ”¥", description: "Skin irritation & itch intensity" },
  { key: "redness", label: "Redness", emoji: "ðŸŸ¥", description: "Skin redness & inflammation" },
  { key: "flaking", label: "Flaking", emoji: "ðŸ«§", description: "Skin shedding & flaking" },
  { key: "oozing", label: "Oozing", emoji: "ðŸ’§", description: "Weeping or oozing areas" },
  { key: "swelling", label: "Swelling", emoji: "ðŸŽˆ", description: "Puffiness or swelling" },
  { key: "sleep_quality", label: "Sleep Quality", emoji: "ðŸŒ™", description: "10 = great sleep, 0 = no sleep" },
  { key: "pain", label: "Pain", emoji: "âš¡", description: "Skin pain or burning" },
  { key: "dryness", label: "Dryness", emoji: "ðŸœï¸", description: "Skin dryness & tightness" },
];

function getSeverityColor(value: number): string {
  if (value <= 2) return "#4CAF50";
  if (value <= 4) return "#8BC34A";
  if (value <= 6) return "#FFC107";
  if (value <= 8) return "#FF9800";
  return "#F44336";
}

function getSeverityLabel(value: number): string {
  if (value === 0) return "None";
  if (value <= 2) return "Mild";
  if (value <= 4) return "Moderate";
  if (value <= 6) return "Significant";
  if (value <= 8) return "Severe";
  return "Extreme";
}

export default function SymptomTracker() {
  const [values, setValues] = useState<Record<string, number>>({
    itching: 0, redness: 0, flaking: 0, oozing: 0,
    swelling: 0, sleep_quality: 5, pain: 0, dryness: 0,
    nerve_pain: 0, thermal_regulation: 0,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const profile = getProfile();
    if (!profile || !profile.profileId) {
      router.push("/onboarding");
      return;
    }
    fetch(`/api/symptoms?profileId=${profile.profileId}&days=1`)
      .then(r => r.json())
      .then(data => {
        if (data.logs && data.logs.length > 0) {
          const today = new Date().toDateString();
          const hasToday = data.logs.some((l: { logged_at: string }) =>
            new Date(l.logged_at).toDateString() === today
          );
          if (hasToday) setTodayLogged(true);
        }
      })
      .catch(() => {});
  }, [router]);

  const overallScore = Math.round(
    Object.values(values).reduce((sum, v) => sum + v, 0) / SYMPTOMS.length
  );

  const handleSave = async () => {
    const profile = getProfile();
    if (!profile || !profile.profileId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.profileId,
          ...values,
          overall_score: overallScore,
          notes,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTodayLogged(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: WARM_CREAM,
      color: DEEP_FOREST,
      minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; transition: background 0.2s; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: white; border: 3px solid #1B6B4A; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.15s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: white; border: 3px solid #1B6B4A; cursor: pointer; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .symptom-card { animation: fadeIn 0.4s ease forwards; opacity: 0; }
        @keyframes checkPop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .check-pop { animation: checkPop 0.4s ease; }
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 18 }}>ðŸ“Š</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>Symptom Tracker</div>
            <div style={{ fontSize: 12, color: MUTED_TEAL }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/progress")} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BALM_GREEN}`, background: "transparent", color: BALM_GREEN, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>ðŸ“ˆ Progress</button>
          <button onClick={() => setShowMenu(!showMenu)} style={{ padding: "8px 12px", background: "transparent", border: "1px solid rgba(27,107,74,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 18 }}>â˜°</button>
          {showMenu && <div style={{ position: "absolute", top: 60, right: 16, background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", padding: 8, zIndex: 100, minWidth: 180 }}>
            {[{ label: "Home", path: "/" }, { label: "Chat with BALM", path: "/chat" }, { label: "Community", path: "/community" }, { label: "Progress Chart", path: "/progress" }, { label: "News", path: "/news" }, { label: "Settings", path: "/settings" }].map(item => <button key={item.path} onClick={() => { router.push(item.path); setShowMenu(false); }} style={{ display: "block", width: "100%", padding: "12px 16px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1a1a1a", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</button>)}
          </div>}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 120px" }}>
        {todayLogged && <div style={{ background: SAGE_LIGHT, borderRadius: 16, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, border: `1px solid rgba(27,107,74,0.15)` }}>
          <span className="check-pop" style={{ fontSize: 24 }}>âœ…</span>
          <div><div style={{ fontWeight: 600, fontSize: 14, color: DEEP_FOREST }}>Already logged today</div><div style={{ fontSize: 13, color: MUTED_TEAL }}>You can still log again to update your entry.</div></div>
        </div>}

        <div style={{ background: "white", borderRadius: 20, padding: "28px", marginBottom: 24, textAlign: "center", boxShadow: "0 2px 12px rgba(13,40,24,0.06)", border: "1px solid rgba(27,107,74,0.08)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: MUTED_TEAL, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Today&apos;s Overall Score</div>
          <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", color: getSeverityColor(overallScore), lineHeight: 1 }}>{overallScore}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: getSeverityColor(overallScore), marginTop: 4 }}>{getSeverityLabel(overallScore)}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 16 }}>
            {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ width: i < overallScore ? 24 : 16, height: 6, borderRadius: 3, background: i < overallScore ? getSeverityColor(overallScore) : "rgba(27,107,74,0.1)", transition: "all 0.3s ease" }} />)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SYMPTOMS.map((symptom, idx) => <div key={symptom.key} className="symptom-card" style={{ background: "white", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(13,40,24,0.04)", border: "1px solid rgba(27,107,74,0.06)", animationDelay: `${idx * 0.06}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{symptom.emoji}</span>
                <div><div style={{ fontWeight: 600, fontSize: 15, color: DEEP_FOREST }}>{symptom.label}</div><div style={{ fontSize: 12, color: MUTED_TEAL }}>{symptom.description}</div></div>
              </div>
              <div style={{ minWidth: 44, height: 44, borderRadius: 12, background: `${getSeverityColor(values[symptom.key])}15`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: getSeverityColor(values[symptom.key]) }}>{values[symptom.key]}</div>
            </div>
            <input type="range" min="0" max="10" value={values[symptom.key]} onChange={(e) => setValues(prev => ({ ...prev, [symptom.key]: parseInt(e.target.value) }))} style={{ background: `linear-gradient(to right, ${getSeverityColor(values[symptom.key])} 0%, ${getSeverityColor(values[symptom.key])} ${values[symptom.key] * 10}%, rgba(27,107,74,0.1) ${values[symptom.key] * 10}%, rgba(27,107,74,0.1) 100%)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(27,107,74,0.4)" }}>
              <span>{symptom.key === "sleep_quality" ? "No sleep" : "None"}</span>
              <span>{symptom.key === "sleep_quality" ? "Great sleep" : "Extreme"}</span>
            </div>
          </div>)}
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", marginTop: 16, boxShadow: "0 2px 8px rgba(13,40,24,0.04)", border: "1px solid rgba(27,107,74,0.06)" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: DEEP_FOREST, marginBottom: 10 }}>ðŸ“ Notes (optional)</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How are you feeling today? Any triggers, changes, or wins..." rows={3} style={{ width: "100%", border: `2px solid rgba(27,107,74,0.1)`, borderRadius: 12, padding: "12px 16px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: DEEP_FOREST, background: WARM_CREAM, outline: "none", resize: "vertical", lineHeight: 1.6 }} />
        </div>

        <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "18px", borderRadius: 16, border: "none", fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans', sans-serif", cursor: saving ? "not-allowed" : "pointer", marginTop: 24, background: saved ? "#4CAF50" : BALM_GREEN, color: "white", transition: "all 0.3s ease", boxShadow: "0 4px 16px rgba(27,107,74,0.25)" }}>
          {saving ? "Saving..." : saved ? "âœ“ Saved!" : todayLogged ? "Update Today's Log" : "Save Today's Log"}
        </button>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={() => router.push("/progress")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid rgba(27,107,74,0.15)`, background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>ðŸ“ˆ View Progress</button>
          <button onClick={() => router.push("/chat")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid rgba(27,107,74,0.15)`, background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>ðŸ’¬ Talk to BALM</button>
        </div>
      </div>
    </div>
  );
}

