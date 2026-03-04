"use client";
import { useState, useEffect } from "react";

// TSW Coach Landing Page
// Warm, calming design that communicates safety and understanding
// No triggering imagery - uses soft illustrations and healing colors

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const SOFT_GOLD = "#C5A55A";
const MUTED_TEAL = "#5BA68A";

export default function Home() {
 
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
     
      setShowNav(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        
        .hero-gradient {
          background: linear-gradient(
            170deg,
            ${WARM_CREAM} 0%,
            ${SAGE_LIGHT} 40%,
            #D4E8D9 70%,
            ${WARM_CREAM} 100%
          );
        }
        
        .float-gentle {
          animation: floatGentle 6s ease-in-out infinite;
        }
        
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeUp 0.8s ease forwards;
        }
        
        .fade-in-delay-1 { animation-delay: 0.2s; }
        .fade-in-delay-2 { animation-delay: 0.4s; }
        .fade-in-delay-3 { animation-delay: 0.6s; }
        .fade-in-delay-4 { animation-delay: 0.8s; }
        
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        
        .glow-soft {
          box-shadow: 0 0 60px rgba(27, 107, 74, 0.08), 0 0 120px rgba(27, 107, 74, 0.04);
        }
        
        .btn-primary {
          background: ${BALM_GREEN};
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.3px;
        }
        .btn-primary:hover {
          background: ${DEEP_FOREST};
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(13, 40, 24, 0.2);
        }
        
        .btn-secondary {
          background: transparent;
          color: ${BALM_GREEN};
          border: 2px solid ${BALM_GREEN};
          padding: 14px 36px;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: ${BALM_GREEN};
          color: white;
          transform: translateY(-2px);
        }
        
        .role-card {
          background: white;
          border-radius: 20px;
          padding: 36px 28px;
          text-align: center;
          transition: all 0.4s ease;
          border: 2px solid transparent;
          cursor: pointer;
        }
        .role-card:hover {
          border-color: ${BALM_GREEN};
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(27, 107, 74, 0.1);
        }
        
        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(13, 40, 24, 0.08);
        }
        
        .testimonial-card {
          background: white;
          border-radius: 20px;
          padding: 36px;
          position: relative;
          border-left: 4px solid ${MUTED_TEAL};
        }
        
        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${MUTED_TEAL};
          margin-bottom: 16px;
        }
        
        .nav-fixed {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(253, 248, 240, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(27, 107, 74, 0.1);
          padding: 16px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .hero-flex { flex-direction: column !important; text-align: center !important; }
          .hero-text h1 { font-size: 36px !important; }
          .roles-grid { flex-direction: column !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .nav-fixed { padding: 12px 20px; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* FIXED NAV */}
      {showNav && (
        <div className="nav-fixed">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 16 }}>✦</span>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: DEEP_FOREST }}>TSW Coach</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-secondary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => window.location.href="/auth"}>Log In</button>
            <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => window.location.href="/auth"}>Get Started Free</button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="hero-gradient" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 20 }}>✦</span>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: DEEP_FOREST }}>TSW Coach</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="#about" className="hide-mobile" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: DEEP_FOREST, textDecoration: "none", opacity: 0.7 }}>About</a>
            <a href="#features" className="hide-mobile" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: DEEP_FOREST, textDecoration: "none", opacity: 0.7 }}>Features</a>
            <button className="btn-secondary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => window.location.href="/auth"}>Log In</button>
            <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => window.location.href="/auth"}>Get Started</button>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 40px 80px" }}>
          <div className="hero-flex" style={{ maxWidth: 1100, width: "100%", display: "flex", alignItems: "center", gap: 60 }}>
            <div className="hero-text" style={{ flex: 1 }}>
              <div className="fade-in" style={{ marginBottom: 24 }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: MUTED_TEAL,
                  background: "rgba(91, 166, 138, 0.1)",
                  padding: "6px 16px",
                  borderRadius: 20,
                }}>You are not alone in this</span>
              </div>

              <h1 className="fade-in fade-in-delay-1" style={{
                fontSize: 52,
                lineHeight: 1.15,
                fontWeight: 600,
                color: DEEP_FOREST,
                marginBottom: 24,
                letterSpacing: "-0.5px",
              }}>
                Your companion through <br />
                <span style={{ color: BALM_GREEN, fontStyle: "italic" }}>topical steroid withdrawal</span>
              </h1>

              <p className="fade-in fade-in-delay-2" style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 19,
                lineHeight: 1.7,
                color: "#4A5D52",
                marginBottom: 36,
                maxWidth: 520,
              }}>
                BALM is your AI coach who understands TSW — the science, the treatments, the emotional toll. Available 24/7 for the moments when you need someone who gets it.
              </p>

              <div className="fade-in fade-in-delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => window.location.href="/auth"}>Start Your Journey — Free</button>
                <button className="btn-secondary" onClick={() => document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" })}>Learn More ↓</button>
              </div>

              <div className="fade-in fade-in-delay-4" style={{ marginTop: 32, display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED_TEAL, fontWeight: 600 }}>✓ Free for patients & caregivers</span>
                </div>
                <div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED_TEAL, fontWeight: 600 }}>✓ Source-verified info</span>
                </div>
                <div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED_TEAL, fontWeight: 600 }}>✓ No steroids promoted</span>
                </div>
              </div>
            </div>

            {/* Hero illustration - abstract calming shape */}
            <div className="float-gentle hide-mobile" style={{ flex: "0 0 380px" }}>
              <div className="glow-soft" style={{
                width: 380,
                height: 380,
                borderRadius: "50%",
                background: `linear-gradient(145deg, ${SAGE_LIGHT}, white, #D4E8D9)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                {/* BALM conversation preview */}
                <div style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "20px 24px",
                  maxWidth: 280,
                  boxShadow: "0 8px 30px rgba(13, 40, 24, 0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontSize: 12 }}>✦</span>
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: BALM_GREEN }}>BALM</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6, color: "#4A5D52" }}>
                    I know last night was really hard. How are you feeling this morning? I'm here whenever you're ready to talk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section id="about" style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label">Who BALM is for</div>
          <h2 style={{ fontSize: 38, fontWeight: 600, marginBottom: 16, color: DEEP_FOREST }}>
            TSW doesn't just affect one person
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "#6B7D73", maxWidth: 600, margin: "0 auto 60px", lineHeight: 1.7 }}>
            Whether you're going through it yourself, watching your child suffer, or supporting someone you love — BALM adapts to your journey.
          </p>

          <div className="roles-grid" style={{ display: "flex", gap: 28, justifyContent: "center" }}>
            {/* Self */}
            <div className="role-card" style={{ flex: 1, maxWidth: 300 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: SAGE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
                🤍
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12, color: DEEP_FOREST }}>I have TSW</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                24/7 support from someone who understands your symptoms, your treatments, and what you're going through. You don't have to explain yourself here.
              </p>
            </div>

            {/* Parent */}
            <div className="role-card" style={{ flex: 1, maxWidth: 300 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: SAGE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
                🤍
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12, color: DEEP_FOREST }}>My child has TSW</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Help for your child and for you. Pediatric guidance, doctor prep, guilt-free support, and someone who checks on the caregiver too.
              </p>
            </div>

            {/* Supporter */}
            <div className="role-card" style={{ flex: 1, maxWidth: 300 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: SAGE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
                🤍
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12, color: DEEP_FOREST }}>Someone I love has TSW</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Learn what TSW really is, how to help without overstepping, and how to take care of yourself while supporting someone through this.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 40px", background: WARM_CREAM }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-label">What BALM does</div>
            <h2 style={{ fontSize: 38, fontWeight: 600, color: DEEP_FOREST }}>
              More than an app. A companion.
            </h2>
          </div>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>💬</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: DEEP_FOREST }}>Talk to BALM anytime</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                An AI coach trained on real TSW research. Not generic chatbot responses — BALM knows the NIH studies, the treatments, and what 3am with TSW feels like.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>📊</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: DEEP_FOREST }}>Track your healing</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Daily check-ins that track symptoms, sleep, mood, and treatments over time. See the progress that's invisible day to day.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: DEEP_FOREST }}>Steroid alert system</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Every treatment is clearly flagged: steroid-free or contains steroids. No hidden ingredients. You always know what you're putting on your body.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>🫁</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: DEEP_FOREST }}>Panic button</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Instant calming support when things get overwhelming. Breathing exercises, grounding techniques, comfort sounds, and the option to alert your safety circle.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔬</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: DEEP_FOREST }}>Verified information only</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Every study cited is real. Every statistic is sourced. BALM never makes things up. When evidence is limited, BALM says so honestly.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>🕊️</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color: DEEP_FOREST }}>Spiritual support</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7D73", lineHeight: 1.7 }}>
                Completely optional. If faith is part of your strength, BALM can weave scripture and spiritual comfort into your conversations. Six traditions supported.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BALM DIFFERENCE */}
      <section style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label">The BALM difference</div>
          <h2 style={{ fontSize: 38, fontWeight: 600, marginBottom: 40, color: DEEP_FOREST }}>
            Not a tracker. Not a chatbot.<br />
            <span style={{ color: BALM_GREEN, fontStyle: "italic" }}>A companion who cares.</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "left" }}>
            <div className="testimonial-card">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.8, color: "#4A5D52", fontStyle: "italic" }}>
                "At 3am when my skin is on fire and I can't sleep, I don't need a symptom tracker. I need someone to tell me I'm going to be okay."
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED_TEAL, fontWeight: 600, marginTop: 16 }}>
                — What BALM was built for
              </p>
            </div>

            <div className="testimonial-card">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.8, color: "#4A5D52", fontStyle: "italic" }}>
                "I feel so guilty for putting steroids on my baby. Every time I look at her skin I blame myself."
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED_TEAL, fontWeight: 600, marginTop: 16 }}>
                — BALM validates parents. "You followed your doctor's advice. This is not your fault."
              </p>
            </div>

            <div className="testimonial-card">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.8, color: "#4A5D52", fontStyle: "italic" }}>
                "I don't know how to help my girlfriend. She won't leave the house and I feel like I'm making it worse."
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED_TEAL, fontWeight: 600, marginTop: 16 }}>
                — BALM teaches supporters what TSW is, what to say, and what not to say.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ padding: "60px 40px", background: SAGE_LIGHT }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 40, textAlign: "center" }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: BALM_GREEN }}>Free</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#4A5D52", marginTop: 4 }}>For patients & caregivers</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: BALM_GREEN }}>24/7</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#4A5D52", marginTop: 4 }}>Always available</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: BALM_GREEN }}>0</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#4A5D52", marginTop: 4 }}>Steroids promoted</div>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: BALM_GREEN }}>NIH</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#4A5D52", marginTop: 4 }}>Research-backed</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 40px", background: `linear-gradient(170deg, ${DEEP_FOREST}, ${BALM_GREEN})`, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 38, fontWeight: 600, color: "white", marginBottom: 20 }}>
            You don't have to do this alone.
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 40 }}>
            BALM is here whenever you need — at 3am, after a bad doctor visit, on the good days and the hard ones.
          </p>
          <button className="btn-primary" style={{ background: "white", color: BALM_GREEN, fontSize: 18, padding: "18px 48px" }} onClick={() => window.location.href="/auth"}
            onMouseOver={(e) => { e.currentTarget.style.background = WARM_CREAM; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Start Your Journey — Free
          </button>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 20 }}>
            No credit card. No paywalls on the support that matters.
          </p>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about-section" style={{ padding: "80px 24px", background: "#F5F0E8" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Lora, Georgia, serif", fontSize: 32, fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginBottom: 40 }}>About TSW Coach</h2>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, fontWeight: 700, color: "#1B6B4A", marginBottom: 12 }}>What is BALM?</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#555", lineHeight: 1.7 }}>BALM (Beyond Addiction, Life Mentor) is an AI companion designed specifically for people navigating Topical Steroid Withdrawal. BALM remembers your conversations, understands your journey, and is available 24/7 when you need support.</p>
          </div>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, fontWeight: 700, color: "#1B6B4A", marginBottom: 12 }}>Your Privacy Matters</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#555", lineHeight: 1.7 }}>We will never sell your data. Period. Your conversations with BALM, your profile information, and your community interactions are yours. We do not run ads, solicit products, or share your information with third parties. TSW Coach exists to help people, not to profit from their pain.</p>
          </div>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, fontWeight: 700, color: "#1B6B4A", marginBottom: 12 }}>Medical Disclaimer</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#555", lineHeight: 1.7 }}>TSW Coach and BALM are not substitutes for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions you may have regarding a medical condition. If you are in crisis, please call 988 (Suicide and Crisis Lifeline) or text HOME to 741741.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "DM Sans, sans-serif", fontSize: 18, fontWeight: 700, color: "#1B6B4A", marginBottom: 12 }}>Our Mission</h3>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#555", lineHeight: 1.7 }}>TSW Coach was built by someone who understands what TSW families go through. Our goal is to provide free, accessible support for patients and caregivers, build community, and advocate for TSW-related legislation and research. We believe no one should face this alone.</p>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer style={{ padding: "40px", background: DEEP_FOREST, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 14 }}>✦</span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: "white" }}>TSW Coach</span>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          BALM — Beyond Addiction, Life Mentor
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          TSW Coach is not a substitute for medical advice. Always consult your healthcare provider.
        </p>
      </footer>
    </div>
  );
}