"use client";
import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        const profile = getProfile(); if (profile && profile.firstName) { router.push("/chat"); } else { router.push("/onboarding"); }
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setConfirmSent(true);
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (confirmSent) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>{"\u2709\uFE0F"}</div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 28, fontWeight: 600, marginBottom: 12 }}>Check your email</h1>
          <p style={{ fontSize: 16, color: "#6B7D73", lineHeight: 1.7 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then come back and sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .auth-input { width: 100%; padding: 16px 20px; border: 2px solid #D4E8D9; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 16px; color: #0D2818; background: white; outline: none; transition: border-color 0.3s ease; }
        .auth-input:focus { border-color: #1B6B4A; }
        .auth-input::placeholder { color: #A0B5A8; }
        .auth-btn { width: 100%; padding: 16px; border-radius: 50px; border: none; font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
        .auth-btn:hover { transform: translateY(-2px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .toggle-link { background: none; border: none; color: #5BA68A; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: underline; }
      `}</style>

      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ color: "white", fontSize: 24 }}>{"\u2726"}</span>
          </div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
            {isLogin ? "Welcome back" : "Join TSW Coach"}
          </h1>
          <p style={{ fontSize: 16, color: "#6B7D73" }}>
            
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        </div>

        {error && (
          <div style={{ background: "#FEE", border: "1px solid #E8534A", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#C0392B" }}>
            {error}
          </div>
        )}

        <button className="auth-btn" style={{ background: BALM_GREEN, color: "white" }} onClick={handleSubmit} disabled={loading || !email || !password}>
          {loading ? "..." : isLogin ? "Sign in" : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 15, color: "#6B7D73" }}>
            {isLogin ? "New here? " : "Already have an account? "}
          </span>
          <button className="toggle-link" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function Auth() { return <Suspense><AuthContent /></Suspense>; }

export default function Auth() { return <Suspense><AuthContent /></Suspense>; }
