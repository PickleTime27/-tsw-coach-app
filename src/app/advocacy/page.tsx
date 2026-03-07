"use client";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

const phases = [
  { number: "01", title: "Build", status: "Current", description: "Ship a production-quality app that TSW patients actually want to use. Partner with ITSAN for beta testing.", color: BALM_GREEN },
  { number: "02", title: "Gather", status: "Next", description: "Collect anonymized symptom data from consenting users. Build the largest real-world TSW symptom dataset in existence.", color: "#FF9800" },
  { number: "03", title: "Advocate", status: "Planned", description: "Use the data to support Washington State legislation requiring informed consent for long-term topical steroid prescriptions.", color: "#2196F3" },
  { number: "04", title: "Scale", status: "Vision", description: "Expand to other states. Partner with dermatology organizations. Make TSW impossible to ignore.", color: "#9C27B0" },
];

const stats = [
  { label: "Symptoms Tracked", value: "10", detail: "TSW-specific categories" },
  { label: "Recognition Gap", value: "0", detail: "US states formally recognize TSW" },
  { label: "Target State", value: "WA", detail: "Washington State first" },
  { label: "App Cost", value: "Free", detail: "Always, for patients" },
];

export default function Advocacy() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0; }
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>{String.fromCodePoint(0x2190)}</button>
        <div style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>Our Mission</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* HERO */}
        <div className="fade-in" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{String.fromCodePoint(0x1F3DB)}{String.fromCodePoint(0xFE0F)}</div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 700, color: DEEP_FOREST, marginBottom: 12, lineHeight: 1.3 }}>
            Making Washington State<br />recognize TSW
          </h1>
          <p style={{ fontSize: 16, color: MUTED_TEAL, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            Every symptom you log helps build the case. We're using real patient data to push for legislative recognition of topical steroid withdrawal.
          </p>
        </div>

        {/* STATS ROW */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32, animationDelay: "0.1s" }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ background: "white", borderRadius: 16, padding: "20px 16px", textAlign: "center", boxShadow: "0 2px 8px rgba(13,40,24,0.04)", border: "1px solid rgba(27,107,74,0.06)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", color: BALM_GREEN }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DEEP_FOREST, marginTop: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: MUTED_TEAL, marginTop: 2 }}>{stat.detail}</div>
            </div>
          ))}
        </div>

        {/* THE PROBLEM */}
        <div className="fade-in" style={{ background: "white", borderRadius: 20, padding: "28px 24px", marginBottom: 24, boxShadow: "0 2px 12px rgba(13,40,24,0.06)", border: "1px solid rgba(27,107,74,0.08)", animationDelay: "0.15s" }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 600, color: DEEP_FOREST, marginBottom: 12 }}>The Problem</h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: DEEP_FOREST, marginBottom: 12 }}>
            Thousands of patients followed their doctors' instructions and used prescribed topical steroids. When they stopped, their bodies revolted with months to years of debilitating withdrawal symptoms.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: DEEP_FOREST, marginBottom: 12 }}>
            Despite growing clinical evidence, TSW is not formally recognized in US medical guidelines. There is no standard informed consent for the risk of withdrawal from long-term topical steroid use.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: DEEP_FOREST, fontWeight: 600 }}>
            Patients bear the full burden of a condition caused by prescribed medication.
          </p>
        </div>

        {/* ROADMAP */}
        <div className="fade-in" style={{ marginBottom: 24, animationDelay: "0.2s" }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 600, color: DEEP_FOREST, marginBottom: 16 }}>The Roadmap</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phases.map((phase, idx) => (
              <div key={phase.number} style={{ background: "white", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(13,40,24,0.04)", borderLeft: `4px solid ${phase.color}`, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", color: phase.color, lineHeight: 1, minWidth: 36 }}>{phase.number}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>{phase.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: idx === 0 ? SAGE_LIGHT : "rgba(27,107,74,0.05)", color: idx === 0 ? BALM_GREEN : MUTED_TEAL }}>{phase.status}</span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED_TEAL }}>{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT WE'RE ASKING FOR */}
        <div className="fade-in" style={{ background: "white", borderRadius: 20, padding: "28px 24px", marginBottom: 24, boxShadow: "0 2px 12px rgba(13,40,24,0.06)", border: "1px solid rgba(27,107,74,0.08)", animationDelay: "0.25s" }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 600, color: DEEP_FOREST, marginBottom: 12 }}>What We're Asking For</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, marginTop: 2 }}>{String.fromCodePoint(0x2705)}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: DEEP_FOREST }}>Formal Recognition</div>
                <div style={{ fontSize: 14, color: MUTED_TEAL, lineHeight: 1.6 }}>Establish TSW as a recognized adverse effect of long-term topical corticosteroid use in Washington State health guidelines.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, marginTop: 2 }}>{String.fromCodePoint(0x2705)}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: DEEP_FOREST }}>Informed Consent</div>
                <div style={{ fontSize: 14, color: MUTED_TEAL, lineHeight: 1.6 }}>Require informed consent documentation when prescribing topical corticosteroids for use exceeding 4 consecutive weeks.</div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW YOU HELP */}
        <div className="fade-in" style={{ background: `linear-gradient(135deg, ${BALM_GREEN}, ${MUTED_TEAL})`, borderRadius: 20, padding: "28px 24px", marginBottom: 24, textAlign: "center", animationDelay: "0.3s" }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>{String.fromCodePoint(0x1F331)}</span>
          <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 20, fontWeight: 600, color: "white", marginBottom: 8 }}>How You Help</h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            Every time you log your symptoms, you contribute to an anonymized dataset that tells the real story of TSW. That data will be presented to Washington State legislators as evidence that TSW is real, widespread, and deserves recognition.
          </p>
        </div>

        {/* CTA BUTTONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => router.push("/tracker")} style={{ width: "100%", padding: "18px", borderRadius: 16, border: "none", fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", background: BALM_GREEN, color: "white", boxShadow: "0 4px 16px rgba(27,107,74,0.25)" }}>
            {String.fromCodePoint(0x1F4CA)} Log Your Symptoms
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => router.push("/chat")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.15)", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>{String.fromCodePoint(0x1F4AC)} Talk to BALM</button>
            <button onClick={() => router.push("/progress")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.15)", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>{String.fromCodePoint(0x1F4C8)} View Progress</button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 12, color: MUTED_TEAL, fontStyle: "italic" }}>Built in Marysville, Washington by Shawn Bullis</p>
        </div>
      </div>
    </div>
  );
}
