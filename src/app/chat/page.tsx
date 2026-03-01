"use client";
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
      content: "Hi there. I'm BALM — your companion through TSW. I'm here whenever you need to talk, ask questions, or just have someone who understands. How are you doing today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPanic, setShowPanic] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Replace with actual Claude API call
    // For now, simulate BALM response
    setTimeout(() => {
      const balmResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getBalmResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, balmResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Temporary placeholder responses until Claude API is connected
  const getBalmResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes("itch") || lower.includes("scratch")) {
      return "I know the itching can feel unbearable. You're not weak for struggling with it — it's one of the hardest parts of TSW. Have you tried a cold compress or running cool water over the area? Sometimes distraction helps too. What usually gives you even a little relief?";
    }
    if (lower.includes("sleep") || lower.includes("can't sleep") || lower.includes("insomnia")) {
      return "Sleep deprivation makes everything harder. Your body is working so hard to heal, and not being able to rest feels cruel. A few things that some people find helpful: keeping the room cool, cotton sheets, and a consistent wind-down routine. Would you like to talk about what's keeping you up?";
    }
    if (lower.includes("give up") || lower.includes("can't do this") || lower.includes("hopeless")) {
      return "I hear you. This is one of the hardest things a person can go through, and feeling overwhelmed doesn't mean you're failing — it means you're human. You've already shown incredible strength by being here. Can you tell me more about what's hitting hardest right now?";
    }
    if (lower.includes("steroid") || lower.includes("cream") || lower.includes("ointment")) {
      return "⚠️ STEROID ALERT: I want to make sure you always know exactly what's going on with any product. Can you tell me the specific product name or active ingredient? I'll let you know if it contains corticosteroids so you can make an informed decision.";
    }
    if (lower.includes("doctor") || lower.includes("derm") || lower.includes("appointment")) {
      return "Dealing with doctors who don't understand TSW is incredibly frustrating. You deserve to be heard. Would you like help preparing for your next appointment? I can help you organize your symptoms, timeline, and questions to bring with you.";
    }
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      return "Hey! I'm glad you're here. How are you doing today — really? You don't have to put on a brave face with me.";
    }
    return "Thank you for sharing that with me. I'm listening, and I want to understand what you're going through. Can you tell me more about how you're feeling right now?";
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
          background: rgba(13,40,24,0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.3s ease;
        }
        .panic-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          max-width: 480px;
          width: 90%;
          text-align: center;
        }
        .breathing-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(145deg, #E8F5EC, #D4E8D9);
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: breathe 8s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1.3); }
          75% { transform: scale(1); }
        }
        .nav-link {
          font-size: 14px;
          color: #5BA68A;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #1B6B4A; }
      `}</style>

      {/* PANIC MODE OVERLAY */}
      {showPanic && (
        <div className="panic-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPanic(false); }}>
          <div className="panic-card">
            <div className="breathing-circle">
              <span style={{ fontSize: 32 }}>🫁</span>
            </div>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 600, marginBottom: 12, color: DEEP_FOREST }}>
              Breathe with me
            </h2>
            <p style={{ fontSize: 16, color: "#6B7D73", lineHeight: 1.7, marginBottom: 8 }}>
              Follow the circle. Breathe in as it grows, out as it shrinks.
            </p>
            <p style={{ fontSize: 14, color: MUTED_TEAL, marginBottom: 24 }}>
              4 seconds in... hold 4 seconds... 4 seconds out...
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <p style={{ fontSize: 15, color: "#4A5D52", fontWeight: 600 }}>You are safe. This will pass.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="tel:988" style={{ display: "block", padding: "14px", background: "#E8534A", color: "white", borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                Call 988 — Crisis Lifeline
              </a>
              <a href="sms:741741&body=HELLO" style={{ display: "block", padding: "14px", background: SAGE_LIGHT, color: DEEP_FOREST, borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                Text HOME to 741741
              </a>
              <button
                onClick={() => setShowPanic(false)}
                style={{ padding: "14px", background: "transparent", border: `2px solid #D4E8D9`, borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: MUTED_TEAL, cursor: "pointer" }}
              >
                I&apos;m feeling better — close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(27,107,74,0.1)", background: "rgba(253,248,240,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 18 }}>✦</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: DEEP_FOREST }}>BALM</div>
            <div style={{ fontSize: 12, color: MUTED_TEAL }}>Your TSW companion</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="panic-btn" onClick={() => setShowPanic(true)}>
            🆘 Panic Button
          </button>
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
                <span style={{ color: "white", fontSize: 12 }}>✦</span>
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
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: BALM_GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 12 }}>✦</span>
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