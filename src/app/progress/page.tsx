"use client";
import { getProfile } from "@/lib/profile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

const SYMPTOM_COLORS: Record<string, string> = {
  itching: "#F44336",
  redness: "#E91E63",
  flaking: "#9C27B0",
  oozing: "#2196F3",
  swelling: "#00BCD4",
  sleep_quality: "#4CAF50",
  pain: "#FF9800",
  dryness: "#795548",
  overall_score: "#1B6B4A",
  nerve_pain: "#E040FB",
  thermal_regulation: "#FF5722",
};

const SYMPTOM_LABELS: Record<string, string> = {
  itching: "\uD83D\uDD25 Itching",
  redness: "\uD83D\uDFE5 Redness",
  flaking: "\uD83E\uDEE7 Flaking",
  oozing: "\uD83D\uDCA7 Oozing",
  swelling: "\uD83C\uDF88 Swelling",
  sleep_quality: "\uD83C\uDF19 Sleep",
  pain: "\u26A1 Pain",
  dryness: "\uD83C\uDFDC\uFE0F Dryness",
  overall_score: "\uD83D\uDCCA Overall",
};

interface SymptomLog {
  id: string;
  logged_at: string;
  itching: number;
  redness: number;
  flaking: number;
  oozing: number;
  swelling: number;
  sleep_quality: number;
  pain: number;
  dryness: number;
  overall_score: number;
  notes: string;
}

function getSeverityColor(value: number): string {
  if (value <= 2) return "#4CAF50";
  if (value <= 4) return "#8BC34A";
  if (value <= 6) return "#FFC107";
  if (value <= 8) return "#FF9800";
  return "#F44336";
}

export default function ProgressChart() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>(["overall_score"]);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const profile = getProfile();
    if (!profile || !profile.profileId) {
      router.push("/onboarding");
      return;
    }
    setLoading(true);
    fetch(`/api/symptoms?profileId=${profile.profileId}&days=${timeRange}`)
      .then(r => r.json())
      .then(data => { if (data.logs) setLogs(data.logs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [timeRange, router]);

  const toggleSymptom = (key: string) => {
    setActiveSymptoms(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(s => s !== key) : prev
        : [...prev, key]
    );
  };

  const chartWidth = 600;
  const chartHeight = 280;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const buildPath = (symptomKey: string): string => {
    if (logs.length === 0) return "";
    const points = logs.map((log, i) => {
      const x = padding.left + (i / Math.max(logs.length - 1, 1)) * innerWidth;
      const y = padding.top + innerHeight - ((log[symptomKey as keyof SymptomLog] as number) / 10) * innerHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const buildArea = (symptomKey: string): string => {
    if (logs.length === 0) return "";
    const points = logs.map((log, i) => {
      const x = padding.left + (i / Math.max(logs.length - 1, 1)) * innerWidth;
      const y = padding.top + innerHeight - ((log[symptomKey as keyof SymptomLog] as number) / 10) * innerHeight;
      return { x, y };
    });
    const baseline = padding.top + innerHeight;
    return `M ${points[0].x},${baseline} ${points.map(p => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${baseline} Z`;
  };

  const getAverage = (key: string): number => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + (log[key as keyof SymptomLog] as number), 0);
    return Math.round((sum / logs.length) * 10) / 10;
  };

  const getTrend = (key: string): "improving" | "stable" | "worsening" => {
    if (logs.length < 3) return "stable";
    const half = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, half).reduce((s, l) => s + (l[key as keyof SymptomLog] as number), 0) / half;
    const secondHalf = logs.slice(half).reduce((s, l) => s + (l[key as keyof SymptomLog] as number), 0) / (logs.length - half);
    const diff = secondHalf - firstHalf;
    if (key === "sleep_quality") {
      if (diff > 0.5) return "improving";
      if (diff < -0.5) return "worsening";
      return "stable";
    }
    if (diff < -0.5) return "improving";
    if (diff > 0.5) return "worsening";
    return "stable";
  };

  const getTrendEmoji = (trend: string): string => {
    if (trend === "improving") return "\uD83D\uDCC9";
    if (trend === "worsening") return "\uD83D\uDCC8";
    return "\u27A1\uFE0F";
  };

  const getTrendColor = (trend: string): string => {
    if (trend === "improving") return "#4CAF50";
    if (trend === "worsening") return "#F44336";
    return MUTED_TEAL;
  };

  const getDateLabels = () => {
    if (logs.length === 0) return [];
    const step = Math.max(1, Math.floor(logs.length / 5));
    return logs.filter((_, i) => i % step === 0 || i === logs.length - 1).map((log) => {
      const origIdx = logs.indexOf(log);
      const x = padding.left + (origIdx / Math.max(logs.length - 1, 1)) * innerWidth;
      const date = new Date(log.logged_at);
      return { x, label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-card { animation: fadeIn 0.4s ease forwards; opacity: 0; }
        .chip { transition: all 0.2s ease; cursor: pointer; user-select: none; }
        .chip:hover { transform: translateY(-1px); }
      `}</style>

      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 18 }}>{"\uD83D\uDCC8"}</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>My Progress</div>
            <div style={{ fontSize: 12, color: MUTED_TEAL }}>{logs.length} entries over {timeRange} days</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <button onClick={() => router.push("/tracker")} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BALM_GREEN}`, background: "transparent", color: BALM_GREEN, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Log Symptoms</button>
          <button onClick={() => setShowMenu(!showMenu)} style={{ padding: "8px 12px", background: "transparent", border: "1px solid rgba(27,107,74,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 18 }}>{"\u2630"}</button>
          {showMenu && <div style={{ position: "absolute", top: 44, right: 0, background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", padding: 8, zIndex: 100, minWidth: 180 }}>
            {[{ label: "Home", path: "/" }, { label: "Chat with BALM", path: "/chat" }, { label: "Symptom Tracker", path: "/tracker" }, { label: "Community", path: "/community" }, { label: "News", path: "/news" }, { label: "Settings", path: "/settings" }].map(item => <button key={item.path} onClick={() => { router.push(item.path); setShowMenu(false); }} style={{ display: "block", width: "100%", padding: "12px 16px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1a1a1a", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</button>)}
          </div>}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div className="fade-card" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[7, 14, 30, 60, 90].map(days => <button key={days} onClick={() => setTimeRange(days)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: timeRange === days ? `2px solid ${BALM_GREEN}` : "2px solid rgba(27,107,74,0.1)", background: timeRange === days ? SAGE_LIGHT : "white", color: timeRange === days ? BALM_GREEN : MUTED_TEAL, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease" }}>{days}d</button>)}
        </div>

        {loading && <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED_TEAL, fontSize: 15 }}>Loading your progress...</div>}

        {!loading && logs.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, boxShadow: "0 2px 12px rgba(13,40,24,0.06)" }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>{"\uD83D\uDCCA"}</span>
          <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 20, fontWeight: 600, color: DEEP_FOREST, marginBottom: 8 }}>No data yet</h3>
          <p style={{ fontSize: 14, color: MUTED_TEAL, marginBottom: 20 }}>Start tracking your symptoms to see your progress over time.</p>
          <button onClick={() => router.push("/tracker")} style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: BALM_GREEN, color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Log Your First Entry</button>
        </div>}

        {!loading && logs.length > 0 && <>
          <div className="fade-card" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, animationDelay: "0.1s" }}>
            {Object.keys(SYMPTOM_LABELS).map(key => <div key={key} className="chip" onClick={() => toggleSymptom(key)} style={{ padding: "6px 14px", borderRadius: 20, border: activeSymptoms.includes(key) ? `2px solid ${SYMPTOM_COLORS[key]}` : "2px solid rgba(27,107,74,0.1)", background: activeSymptoms.includes(key) ? `${SYMPTOM_COLORS[key]}15` : "white", color: activeSymptoms.includes(key) ? SYMPTOM_COLORS[key] : MUTED_TEAL, fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{SYMPTOM_LABELS[key]}</div>)}
          </div>

          <div className="fade-card" style={{ background: "white", borderRadius: 20, padding: "24px 16px 16px", boxShadow: "0 2px 12px rgba(13,40,24,0.06)", border: "1px solid rgba(27,107,74,0.08)", marginBottom: 24, overflowX: "auto", animationDelay: "0.15s" }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto" }}>
              {[0, 2, 4, 6, 8, 10].map(val => { const y = padding.top + innerHeight - (val / 10) * innerHeight; return <g key={val}><line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="rgba(27,107,74,0.07)" strokeWidth="1" /><text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill={MUTED_TEAL} fontFamily="DM Sans, sans-serif">{val}</text></g>; })}
              {getDateLabels().map((dl, i) => <text key={i} x={dl.x} y={chartHeight - 8} textAnchor="middle" fontSize="10" fill={MUTED_TEAL} fontFamily="DM Sans, sans-serif">{dl.label}</text>)}
              {activeSymptoms.map(key => <path key={`area-${key}`} d={buildArea(key)} fill={SYMPTOM_COLORS[key]} fillOpacity="0.08" />)}
              {activeSymptoms.map(key => <path key={`line-${key}`} d={buildPath(key)} fill="none" stroke={SYMPTOM_COLORS[key]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />)}
              {activeSymptoms.map(key => logs.map((log, i) => { const x = padding.left + (i / Math.max(logs.length - 1, 1)) * innerWidth; const y = padding.top + innerHeight - ((log[key as keyof SymptomLog] as number) / 10) * innerHeight; return <circle key={`dot-${key}-${i}`} cx={x} cy={y} r="3.5" fill="white" stroke={SYMPTOM_COLORS[key]} strokeWidth="2" />; }))}
            </svg>
          </div>

          <div className="fade-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, animationDelay: "0.2s" }}>
            {activeSymptoms.map(key => { const avg = getAverage(key); const trend = getTrend(key); const lastVal = logs.length > 0 ? (logs[logs.length - 1][key as keyof SymptomLog] as number) : 0; return <div key={key} style={{ background: "white", borderRadius: 16, padding: "18px 16px", boxShadow: "0 2px 8px rgba(13,40,24,0.04)", border: `1px solid ${SYMPTOM_COLORS[key]}20` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: SYMPTOM_COLORS[key], marginBottom: 8 }}>{SYMPTOM_LABELS[key]}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", color: DEEP_FOREST }}>{avg}</span><span style={{ fontSize: 12, color: MUTED_TEAL }}>avg</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 12, fontWeight: 600, color: getTrendColor(trend), display: "flex", alignItems: "center", gap: 4 }}><span>{getTrendEmoji(trend)}</span><span style={{ textTransform: "capitalize" }}>{trend}</span></div><div style={{ fontSize: 11, color: MUTED_TEAL, background: `${getSeverityColor(lastVal)}15`, padding: "2px 8px", borderRadius: 8 }}>Latest: {lastVal}</div></div>
            </div>; })}
          </div>

          <div className="fade-card" style={{ animationDelay: "0.25s" }}>
            <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 18, fontWeight: 600, color: DEEP_FOREST, marginBottom: 12 }}>Recent Entries</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logs.slice(-7).reverse().map(log => <div key={log.id} style={{ background: "white", borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 4px rgba(13,40,24,0.04)", border: "1px solid rgba(27,107,74,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div><div style={{ fontWeight: 600, fontSize: 14, color: DEEP_FOREST }}>{new Date(log.logged_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>{log.notes && <div style={{ fontSize: 12, color: MUTED_TEAL, marginTop: 2, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.notes}</div>}</div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getSeverityColor(log.overall_score)}15`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: getSeverityColor(log.overall_score) }}>{log.overall_score}</div>
              </div>)}
            </div>
          </div>

          {logs.length >= 3 && getTrend("overall_score") === "improving" && <div className="fade-card" style={{ background: `linear-gradient(135deg, ${BALM_GREEN}, ${MUTED_TEAL})`, borderRadius: 20, padding: "24px", marginTop: 20, textAlign: "center", animationDelay: "0.3s" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>{"\uD83C\uDF31"}</span>
            <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 18, fontWeight: 600, color: "white", marginBottom: 4 }}>Your healing is showing</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Your symptoms are trending down. Every small improvement counts. Keep going &mdash; you&apos;re doing amazing.</p>
          </div>}
        </>}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={() => router.push("/tracker")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.15)", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>{"\uD83D\uDCCA"} Log Symptoms</button>
          <button onClick={() => router.push("/chat")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.15)", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>{"\uD83D\uDCAC"} Talk to BALM</button>
        </div>
      </div>
    </div>
  );
}

