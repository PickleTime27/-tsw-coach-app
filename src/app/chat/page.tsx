"use client";
import { getProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";

const BALM_GREEN = "#1B6B4A";
const SAGE_LIGHT = "#E8F5EC";
const WARM_CREAM = "#FDF8F0";
const DEEP_FOREST = "#0D2818";
const MUTED_TEAL = "#5BA68A";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there. I\u2019m BALM \u2014 your companion through TSW. I\u2019m here whenever you need to talk, ask questions, or just have someone who understands. How are you doing today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPanic, setShowPanic] = useState(false);
  const [breathPhase, setBreathPhase] = useState("ready");
  const [breathCount, setBreathCount] = useState(0);
  const [breathText, setBreathText] = useState("Tap to begin");
  const [breathActive, setBreathActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, []);
  useEffect(() => {
  useEffect(() => {
    const p = getProfile();
    if (p && p.firstName) {
      supabase.from("profiles").select("id").eq("first_name", p.firstName).limit(1).then(function(res) {
        if (res.data && res.data[0]) {
          var pid = res.data[0].id;
          setProfileId(pid);
          supabase.from("messages").select("*").eq("profile_id", pid).order("created_at", { ascending: true }).then(function(msgRes) {
            if (msgRes.data && msgRes.data.length > 0) {
              setMessages(msgRes.data.map(function(m, i) { return { id: i.toString(), role: m.role, content: m.content, timestamp: new Date(m.created_at) }; }));
            }
          });
        }
      });
    }
  }, []);

  const startBreathing = () => {
    if (breathActive) return;
    setBreathActive(true);
    runBreathCycle(0);
  };

  const runBreathCycle = (count: number) => {
    // Breathe in - 4 seconds
    setBreathPhase("in");
    setBreathText("Breathe in...");

    breathTimerRef.current = setTimeout(() => {
      // Hold - 4 seconds
      setBreathPhase("hold");
      setBreathText("Hold...");

      breathTimerRef.current = setTimeout(() => {
        // Breathe out - 4 seconds
        setBreathPhase("out");
        setBreathText("Breathe out...");

        breathTimerRef.current = setTimeout(() => {
          const newCount = count + 1;
          setBreathCount(newCount);

          if (newCount < 5) {
            runBreathCycle(newCount);
          } else {
            setBreathPhase("done");
            setBreathText("You made it through. I\u2019m proud of you.");
            setBreathActive(false);
          }
        }, 4000);
      }, 4000);
    }, 4000);
  };

  const resetBreathing = () => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    setBreathPhase("ready");
    setBreathCount(0);
    setBreathText("Tap to begin");
    setBreathActive(false);
  };

  const handleClosePanic = () => {
    resetBreathing();
    setShowPanic(false);
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    var prof = getProfile(); if (prof && prof.profileId) { supabase.from("messages").insert({ profile_id: prof.profileId, role: "user", content: userMessage.content }).then(function(x) { console.log("user msg saved", x); }); }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage]
        .filter((m) => m.id !== "welcome" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          userProfile: getProfile(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const balmResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, balmResponse]);
      } else {
        var prof2 = getProfile(); if (prof2 && prof2.profileId) { supabase.from("messages").insert({ profile_id: prof2.profileId, role: "assistant", content: data.message }).then(function(x) { console.log("balm msg saved", x); }); }
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I\u2019m having a moment \u2014 something went wrong on my end. Can you try saying that again?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    } catch {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I\u2019m having trouble connecting right now. Please check your internet and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getCircleSize = () => {
    switch (breathPhase) {
      case "in": return 200;
      case "hold": return 200;
      case "out": return 100;
      case "done": return 160;
      default: return 120;
    }
  };

  const getCircleGradient = () => {
    switch (breathPhase) {
      case "in": return "radial-gradient(circle, #F8B4C8 0%, #E88FAA 40%, #D4728E 100%)";
      case "hold": return "radial-gradient(circle, #F8C4D4 0%, #E8A0B8 40%, #D4889E 100%)";
      case "out": return "radial-gradient(circle, #E8D4DC 0%, #D4B8C4 40%, #C49CAC 100%)";
      case "done": return "radial-gradient(circle, #98E8B0 0%, #5BA68A 40%, #1B6B4A 100%)";
      default: return "radial-gradient(circle, #F0D4DE 0%, #E8B8C8 40%, #D49CAE 100%)";
    }
  };

  const getCircleGlow = () => {
    switch (breathPhase) {
      case "in": return "0 0 40px rgba(232,143,170,0.5), 0 0 80px rgba(232,143,170,0.2)";
      case "hold": return "0 0 50px rgba(232,160,184,0.5), 0 0 100px rgba(232,160,184,0.25)";
      case "out": return "0 0 30px rgba(212,184,196,0.4)";
      case "done": return "0 0 50px rgba(91,166,138,0.5), 0 0 100px rgba(27,107,74,0.2)";
      default: return "0 0 20px rgba(232,184,200,0.3)";
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM_CREAM, color: DEEP_FOREST, height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .chat-textarea {
          flex: 1;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          color: #0D2818;
          background: transparent;
          resize: none;
          line-height: 1.5;
          padding: 0;
        }
        .chat-textarea::placeholder { color: #A0B5A8; }
        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #1B6B4A;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .send-btn:hover { background: #0D2818; transform: scale(1.05); }
        .send-btn:disabled { background: #B0D4B8; cursor: not-allowed; transform: none; }
        .panic-btn {
          padding: 8px 16px;
          border-radius: 50px;
          border: 2px solid #E8534A;
          background: transparent;
          color: #E8534A;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .panic-btn:hover { background: #E8534A; color: white; }
        .message-bubble {
          max-width: 75%;
          padding: 16px 20px;
          border-radius: 20px;
          line-height: 1.7;
          font-size: 15px;
          animation: fadeIn 0.3s ease;
          white-space: pre-wrap;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .typing-indicator span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5BA68A;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .panic-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10,10,15,0.92);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.4s ease;
        }
        .panic-card {
          background: #1A1A2E;
          border-radius: 28px;
          padding: 48px 40px;
          max-width: 440px;
          width: 90%;
          text-align: center;
        }
        .breath-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          cursor: pointer;
          transition: width 4s ease-in-out, height 4s ease-in-out, background 2s ease, box-shadow 2s ease;
        }
        .progress-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        @keyframes sparkle {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .sparkle-text {
          animation: sparkle 0.6s ease;
        }
      `}</style>

      {/* PANIC MODE OVERLAY */}
      {showPanic && (
        <div className="panic-overlay">
          <div className="panic-card">
            {/* Breathing circle */}
            <div
              className="breath-circle"
              style={{
                width: getCircleSize(),
                height: getCircleSize(),
                background: getCircleGradient(),
                boxShadow: getCircleGlow(),
              }}
              onClick={!breathActive ? startBreathing : undefined}
            >
              <span style={{ fontSize: 28 }}>
                {breathPhase === "done" ? "\uD83D\uDC9A" : "\uD83E\uDEC1"}
              </span>
            </div>

            {/* Breath instruction text */}
            <h2 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: breathPhase === "done" ? 22 : 26,
              fontWeight: 600,
              marginBottom: 8,
              color: "white",
            }}>
              {breathText}
            </h2>

            {/* Subtext */}
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              {breathPhase === "ready" && "5 breaths. You can do this."}
              {breathPhase === "in" && "4 seconds... fill your lungs slowly"}
              {breathPhase === "hold" && "4 seconds... you\u2019re doing great"}
              {breathPhase === "out" && "4 seconds... let it all go"}
              {breathPhase === "done" && ""}
            </p>

            {/* Progress dots */}
            <div className="progress-dots">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="progress-dot"
                  style={{
                    background: i < breathCount
                      ? "linear-gradient(135deg, #FFD700, #F8B4C8)"
                      : "rgba(255,255,255,0.15)",
                    boxShadow: i < breathCount ? "0 0 8px rgba(255,215,0,0.5)" : "none",
                    transform: "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Safety message */}
            <p style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              marginBottom: 28,
              fontStyle: "italic",
            }}>
              You are safe. This will pass.
            </p>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="tel:988" style={{
                display: "block",
                padding: "14px",
                background: "linear-gradient(135deg, #E8534A, #D4403A)",
                color: "white",
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Call 988 \u2014 Crisis Lifeline
              </a>
              <a href="sms:741741&body=HELLO" style={{
                display: "block",
                padding: "14px",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                Text HOME to 741741
              </a>
              <button
                onClick={handleClosePanic}
                style={{
                  padding: "14px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                I&apos;m feeling better — return to BALM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 18 }}>{"\u2726"}</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>BALM</div>
            <div style={{ fontSize: 12, color: MUTED_TEAL }}>Your TSW companion</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {getProfile()?.userRole !== "supporter" && <button className="panic-btn" onClick={() => setShowPanic(true)}>
            {"\uD83C\uDD98"} Panic Button
          </button>}
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {msg.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "white", fontSize: 12 }}>{"\u2726"}</span>
              </div>
            )}
            <div
              className="message-bubble"
              style={{
                background: msg.role === "user" ? BALM_GREEN : "white",
                color: msg.role === "user" ? "white" : DEEP_FOREST,
                borderBottomRightRadius: msg.role === "user" ? 4 : 20,
                borderBottomLeftRadius: msg.role === "assistant" ? 4 : 20,
                boxShadow: msg.role === "assistant" ? "0 2px 8px rgba(13,40,24,0.04)" : "none",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }} />
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 12 }}>{"\u2726"}</span>
            </div>
            <div className="message-bubble" style={{ background: "white", padding: "16px 24px", boxShadow: "0 2px 8px rgba(13,40,24,0.04)" }}>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 12, background: "white", borderRadius: 16, padding: "12px 16px", border: "2px solid #D4E8D9" }}>
          <textarea
            ref={inputRef}
            className="chat-textarea"
            rows={1}
            placeholder="Talk to BALM..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="send-btn"
            disabled={input.trim() === "" || isLoading}
            onClick={handleSend}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#A0B5A8" }}>BALM is an AI companion. Not a substitute for medical advice.</span>
        </div>
      </div>
    </div>
  );
}