"use client";
import { useRouter } from "next/navigation";

const BALM_GREEN = "#1B6B4A";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>{String.fromCodePoint(0x2190)}</button>
        <div style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>Privacy Policy</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px 60px" }}>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 28, fontWeight: 700, color: DEEP_FOREST, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: MUTED_TEAL, marginBottom: 32 }}>Last updated: March 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Section title="Overview">
            TSW Coach is a free support platform for people going through topical steroid withdrawal. We take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.
          </Section>

          <Section title="What We Collect">
            We collect only what is needed to provide the app experience: symptom severity scores (0-10 scale across 10 categories), optional text notes you write, basic profile information (TSW stage, months since withdrawal, user role), community posts and direct messages, and a nickname you choose for community features. We do not collect your full name, precise location, insurance information, medical records, or any data beyond what you provide in the app.
          </Section>

          <Section title="How We Use Your Data">
            Your individual data is used solely to provide app functionality to you: displaying your symptom history, powering your progress charts, enabling community features, and personalizing BALM responses. We may use anonymized, aggregate data (with no way to identify you) to support TSW advocacy and legislative efforts, including our work toward Washington State recognition of TSW. We will never use aggregate data without clearly communicating this to users.
          </Section>

          <Section title="What We Never Do">
            We do not sell your data. Ever. We do not share your individual data with third parties. We do not use your data for advertising. We do not require your real name. We do not collect data we do not need.
          </Section>

          <Section title="Data Storage & Security">
            Your data is stored in Supabase (PostgreSQL) with row-level security enabled. Data is encrypted in transit via HTTPS and encrypted at rest by our database provider. Access to the database is restricted to application functionality only.
          </Section>

          <Section title="BALM AI Companion">
            BALM is an AI companion, not a healthcare provider. Conversations with BALM are stored to provide message history within your account. BALM does not share your conversations with other users. BALM uses your profile information (TSW stage, symptoms) to personalize responses. BALM will never promote topical steroids as a treatment.
          </Section>

          <Section title="Community Features">
            Community posts and direct messages are visible to other users as designed. Your nickname (not your real name) is displayed in community features. You control what you share in community spaces.
          </Section>

          <Section title="Your Rights">
            You can request deletion of your account and all associated data at any time by contacting us. You can stop using the app at any time. You can choose not to log symptoms, write notes, or participate in community features.
          </Section>

          <Section title="Children">
            TSW Coach is designed for use by adults and by parents/caregivers of children with TSW. We do not knowingly collect data from children under 13. If you are a parent or caregiver logging on behalf of a child, no identifying information about the child is required.
          </Section>

          <Section title="Changes to This Policy">
            We may update this policy as the app evolves. Significant changes will be communicated through the app. Continued use after changes constitutes acceptance.
          </Section>

          <Section title="Contact">
            For privacy questions, data deletion requests, or concerns, reach out via GitHub or through the app settings page.
          </Section>
        </div>

        <div style={{ marginTop: 40, padding: "20px 24px", background: "white", borderRadius: 16, border: "1px solid rgba(27,107,74,0.08)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: MUTED_TEAL, fontStyle: "italic" }}>TSW Coach is built in Marysville, Washington. Your trust matters more than anything.</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={() => router.push("/chat")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.15)", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>{String.fromCodePoint(0x1F4AC)} Talk to BALM</button>
          <button onClick={() => router.push("/tracker")} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(27,107,74,0.15)", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: DEEP_FOREST, fontFamily: "'DM Sans', sans-serif" }}>{String.fromCodePoint(0x1F4CA)} Symptom Tracker</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 20, fontWeight: 600, color: "#0D2818", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#0D2818" }}>{children}</p>
    </div>
  );
}
