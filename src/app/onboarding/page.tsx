"use client";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

type UserRole = "self" | "parent" | "supporter" | null;
type TswStage = "acute" | "fluctuation" | "stabilization" | "" ;

interface ProfileData {
  firstName: string;
  userRole: UserRole;
  affectedPersonName: string;
  affectedPersonAge: string;
  relationship: string;
  tswStage: TswStage;
  monthsSinceWithdrawal: string;
  currentSymptoms: string[];
  spiritualEnabled: boolean;
  spiritualTradition: string;
}

const SYMPTOMS = [
  "Redness / Erythroderma",
  "Burning sensation",
  "Intense itching",
  "Oozing / Weeping skin",
  "Flaking / Peeling",
  "Edema / Swelling",
  "Insomnia",
  "Nerve pain",
  "Thermodysregulation",
  "Hair loss",
  "Eye problems",
  "Elephant skin",
  "Red sleeve pattern",
];

const TRADITIONS = [
  "Christianity",
  "Islam",
  "Judaism",
  "Buddhism",
  "Hinduism",
  "Non-denominational / Spiritual",
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    userRole: null,
    affectedPersonName: "",
    affectedPersonAge: "",
    relationship: "",
    tswStage: "",
    monthsSinceWithdrawal: "",
    currentSymptoms: [],
    spiritualEnabled: false,
    spiritualTradition: "",
  });

  const updateProfile = (field: keyof ProfileData, value: string | boolean | string[] | UserRole | TswStage) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (symptom: string) => {
    setProfile((prev) => ({
      ...prev,
      currentSymptoms: prev.currentSymptoms.includes(symptom)
        ? prev.currentSymptoms.filter((s) => s !== symptom)
        : [...prev.currentSymptoms, symptom],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return profile.firstName.trim() !== "";
      case 1: return profile.userRole !== null;
      case 2:
        if (profile.userRole === "self") return true;
        if (profile.userRole === "parent") return profile.affectedPersonName.trim() !== "" && profile.affectedPersonAge.trim() !== "";
        if (profile.userRole === "supporter") return profile.affectedPersonName.trim() !== "" && profile.relationship !== "";
        return false;
      case 3: return profile.tswStage !== "";
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .onboard-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #D4E8D9;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          color: #0D2818;
          background: white;
          outline: none;
          transition: border-color 0.3s ease;
        }
        .onboard-input:focus { border-color: #1B6B4A; }
        .onboard-input::placeholder { color: #A0B5A8; }
        .role-option {
          background: white;
          border: 2px solid #D4E8D9;
          border-radius: 16px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        .role-option:hover { border-color: #5BA68A; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(27,107,74,0.08); }
        .role-option.selected { border-color: #1B6B4A; background: #E8F5EC; }
        .symptom-tag {
          padding: 10px 18px;
          border: 2px solid #D4E8D9;
          border-radius: 50px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          display: inline-block;
        }
        .symptom-tag:hover { border-color: #5BA68A; }
        .symptom-tag.selected { background: #1B6B4A; color: white; border-color: #1B6B4A; }
        .tradition-option {
          padding: 14px 20px;
          border: 2px solid #D4E8D9;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          text-align: center;
        }
        .tradition-option:hover { border-color: #5BA68A; }
        .tradition-option.selected { background: #1B6B4A; color: white; border-color: #1B6B4A; }
        .btn-next {
          background: #1B6B4A;
          color: white;
          border: none;
          padding: 16px 48px;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-next:hover { background: #0D2818; transform: translateY(-2px); }
        .btn-next:disabled { background: #B0D4B8; cursor: not-allowed; transform: none; }
        .btn-back {
          background: transparent;
          color: #5BA68A;
          border: none;
          padding: 16px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .stage-option {
          background: white;
          border: 2px solid #D4E8D9;
          border-radius: 14px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .stage-option:hover { border-color: #5BA68A; }
        .stage-option.selected { border-color: #1B6B4A; background: #E8F5EC; }
        .select-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #D4E8D9;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          color: #0D2818;
          background: white;
          outline: none;
          appearance: none;
          cursor: pointer;
        }
        .select-input:focus { border-color: #1B6B4A; }
        @media (max-width: 768px) {
          .roles-row { flex-direction: column !important; }
          .stages-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: WARM_CREAM }}>
        <div style={{ height: 4, background: "#D4E8D9", width: "100%" }}>
          <div style={{ height: 4, background: BALM_GREEN, width: `${progress}%`, transition: "width 0.5s ease", borderRadius: "0 4px 4px 0" }} />
        </div>
        <div style={{ padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 16 }}>✦</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: DEEP_FOREST }}>TSW Coach</span>
          </div>
          <span style={{ fontSize: 13, color: MUTED_TEAL, fontWeight: 600 }}>Step {step + 1} of {totalSteps}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 40px 40px" }}>
        <div style={{ maxWidth: 560, width: "100%" }}>

          {/* STEP 0: Name */}
          {step === 0 && (
            <div>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: SAGE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 24 }}>👋</div>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>Welcome to TSW Coach</h1>
              <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                Let&apos;s get you set up so BALM can support you in the best way possible. First, what should we call you?
              </p>
              <input
                className="onboard-input"
                type="text"
                placeholder="Your first name"
                value={profile.firstName}
                onChange={(e) => updateProfile("firstName", e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                Hi {profile.firstName}. Tell us about your journey.
              </h1>
              <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                This helps BALM understand how to best support you.
              </p>
              <div className="roles-row" style={{ display: "flex", gap: 16 }}>
                <div
                  className={`role-option ${profile.userRole === "self" ? "selected" : ""}`}
                  onClick={() => updateProfile("userRole", "self")}
                  style={{ flex: 1 }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🤍</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>I have TSW</div>
                  <div style={{ fontSize: 13, color: "#6B7D73", lineHeight: 1.5 }}>I&apos;m going through topical steroid withdrawal myself</div>
                </div>
                <div
                  className={`role-option ${profile.userRole === "parent" ? "selected" : ""}`}
                  onClick={() => updateProfile("userRole", "parent")}
                  style={{ flex: 1 }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🤍</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>My child has TSW</div>
                  <div style={{ fontSize: 13, color: "#6B7D73", lineHeight: 1.5 }}>I&apos;m a parent or caregiver</div>
                </div>
                <div
                  className={`role-option ${profile.userRole === "supporter" ? "selected" : ""}`}
                  onClick={() => updateProfile("userRole", "supporter")}
                  style={{ flex: 1 }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🤍</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Someone I love has TSW</div>
                  <div style={{ fontSize: 13, color: "#6B7D73", lineHeight: 1.5 }}>I&apos;m supporting a partner, friend, or family member</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Role-specific details */}
          {step === 2 && (
            <div>
              {profile.userRole === "self" && (
                <>
                  <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                    You&apos;re not alone, {profile.firstName}.
                  </h1>
                  <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                    BALM is here for you. Let&apos;s move to the next step.
                  </p>
                  <div style={{ background: SAGE_LIGHT, borderRadius: 16, padding: 24, border: `1px solid #D4E8D9` }}>
                    <p style={{ fontSize: 15, color: "#4A5D52", lineHeight: 1.7, fontStyle: "italic" }}>
                      &quot;I know what you&apos;re going through is really hard. I&apos;m here whenever you need me — day or night.&quot;
                    </p>
                    <p style={{ fontSize: 13, color: MUTED_TEAL, fontWeight: 600, marginTop: 12 }}>— BALM</p>
                  </div>
                </>
              )}

              {profile.userRole === "parent" && (
                <>
                  <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                    You&apos;re an incredible parent, {profile.firstName}.
                  </h1>
                  <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                    The fact that you&apos;re here shows how much you care. Tell us about your child.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                      className="onboard-input"
                      type="text"
                      placeholder="Your child's name"
                      value={profile.affectedPersonName}
                      onChange={(e) => updateProfile("affectedPersonName", e.target.value)}
                      autoFocus
                    />
                    <input
                      className="onboard-input"
                      type="number"
                      placeholder="Your child's age"
                      value={profile.affectedPersonAge}
                      onChange={(e) => updateProfile("affectedPersonAge", e.target.value)}
                    />
                  </div>
                </>
              )}

              {profile.userRole === "supporter" && (
                <>
                  <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                    Your support matters, {profile.firstName}.
                  </h1>
                  <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                    Tell us about the person you&apos;re supporting.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                      className="onboard-input"
                      type="text"
                      placeholder="Their name"
                      value={profile.affectedPersonName}
                      onChange={(e) => updateProfile("affectedPersonName", e.target.value)}
                      autoFocus
                    />
                    <select
                      className="select-input"
                      value={profile.relationship}
                      onChange={(e) => updateProfile("relationship", e.target.value)}
                    >
                      <option value="">What is your relationship?</option>
                      <option value="partner">Partner / Spouse</option>
                      <option value="parent">Parent (Mom / Dad)</option>
                      <option value="child">Son / Daughter</option>
                      <option value="sibling">Sibling (Brother / Sister)</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="aunt_uncle">Aunt / Uncle</option>
                      <option value="niece_nephew">Niece / Nephew</option>
                      <option value="cousin">Cousin</option>
                      <option value="friend">Friend</option>
                      <option value="coworker">Coworker</option>
                      <option value="other">Other</option>
                    </select>






                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: TSW Stage */}
          {step === 3 && (
            <div>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                {profile.userRole === "self" ? "Where are you in your TSW journey?" :
                 profile.userRole === "parent" ? `Where is ${profile.affectedPersonName} in the TSW journey?` :
                 `Where is ${profile.affectedPersonName} in the TSW journey?`}
              </h1>
              <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                This helps BALM give you the most relevant support. Don&apos;t worry if you&apos;re not sure — you can change this later.
              </p>
              <div className="stages-row" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  className={`stage-option ${profile.tswStage === "acute" ? "selected" : ""}`}
                  onClick={() => updateProfile("tswStage", "acute")}
                >
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Acute Flare</div>
                  <div style={{ fontSize: 14, color: "#6B7D73", lineHeight: 1.5 }}>Early withdrawal — intense redness, burning, oozing, difficulty sleeping. Usually weeks 1-6.</div>
                </div>
                <div
                  className={`stage-option ${profile.tswStage === "fluctuation" ? "selected" : ""}`}
                  onClick={() => updateProfile("tswStage", "fluctuation")}
                >
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Fluctuation</div>
                  <div style={{ fontSize: 14, color: "#6B7D73", lineHeight: 1.5 }}>Good days and bad days — symptoms come in waves. Slow improvement with setbacks. Usually months 2-6.</div>
                </div>
                <div
                  className={`stage-option ${profile.tswStage === "stabilization" ? "selected" : ""}`}
                  onClick={() => updateProfile("tswStage", "stabilization")}
                >
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Stabilization</div>
                  <div style={{ fontSize: 14, color: "#6B7D73", lineHeight: 1.5 }}>Symptoms calming down — still healing but trending better. Usually months 6+.</div>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <label style={{ fontSize: 14, color: "#6B7D73", marginBottom: 8, display: "block" }}>
                  {profile.userRole === "self" ? "How many months since you stopped steroids?" :
                   `How many months since ${profile.affectedPersonName} stopped steroids?`}
                </label>
                <input
                  className="onboard-input"
                  type="number"
                  placeholder="Number of months (approximate is fine)"
                  value={profile.monthsSinceWithdrawal}
                  onChange={(e) => updateProfile("monthsSinceWithdrawal", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Symptoms */}
          {step === 4 && (
            <div>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                {profile.userRole === "self" ? "What symptoms are you experiencing?" :
                 `What symptoms is ${profile.affectedPersonName} experiencing?`}
              </h1>
              <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                Select all that apply. This helps BALM understand what you&apos;re dealing with right now.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {SYMPTOMS.map((symptom) => (
                  <div
                    key={symptom}
                    className={`symptom-tag ${profile.currentSymptoms.includes(symptom) ? "selected" : ""}`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Spiritual Support */}
          {step === 5 && (
            <div>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
                One more thing, {profile.firstName}.
              </h1>
              <p style={{ fontSize: 17, color: "#6B7D73", lineHeight: 1.7, marginBottom: 32 }}>
                Would you like BALM to include spiritual comfort in your conversations? This is completely optional and can be changed anytime.
              </p>

              <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                <div
                  className={`role-option ${profile.spiritualEnabled === true ? "selected" : ""}`}
                  onClick={() => updateProfile("spiritualEnabled", true)}
                  style={{ flex: 1, padding: "20px" }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🕊️</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Yes, include faith</div>
                  <div style={{ fontSize: 13, color: "#6B7D73", marginTop: 4 }}>Scripture and spiritual comfort woven naturally into conversations</div>
                </div>
                <div
                  className={`role-option ${profile.spiritualEnabled === false ? "selected" : ""}`}
                  onClick={() => updateProfile("spiritualEnabled", false)}
                  style={{ flex: 1, padding: "20px" }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💚</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>No thanks</div>
                  <div style={{ fontSize: 13, color: "#6B7D73", marginTop: 4 }}>BALM will focus on practical and emotional support only</div>
                </div>
              </div>

              {profile.spiritualEnabled && (
                <div>
                  <p style={{ fontSize: 15, color: "#6B7D73", marginBottom: 16 }}>Which tradition resonates with you?</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {TRADITIONS.map((tradition) => (
                      <div
                        key={tradition}
                        className={`tradition-option ${profile.spiritualTradition === tradition ? "selected" : ""}`}
                        onClick={() => updateProfile("spiritualTradition", tradition)}
                      >
                        {tradition}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
            {step > 0 ? (
              <button className="btn-back" onClick={() => setStep(step - 1)}>← Back</button>
            ) : (
              <div />
            )}
            {step < totalSteps - 1 ? (
              <button className="btn-next" disabled={!canProceed()} onClick={() => setStep(step + 1)}>
                Continue →
              </button>
            ) : (
              <button
                className="btn-next"
                onClick={() => {
                  supabase.auth.getUser().then(function(res) { if (res.data.user) { supabase.from("profiles").upsert({ id: res.data.user.id, email: res.data.user.email, first_name: profile.firstName, user_role: profile.userRole, affected_person_name: profile.affectedPersonName, affected_person_age: profile.affectedPersonAge, relationship: profile.relationship, tsw_stage: profile.tswStage, months_since_withdrawal: profile.monthsSinceWithdrawal, current_symptoms: profile.currentSymptoms, spiritual_enabled: profile.spiritualEnabled, spiritual_tradition: profile.spiritualTradition }).then(function(r) { console.log("profile saved", r); }); saveProfile({...profile, profileId: res.data.user.id}); } }); router.push("/chat");
                }}
              >
                Meet BALM →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}