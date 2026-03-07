"use client";

import { getProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface SoundOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  frequencies: number[];
  type: "tone" | "binaural" | "ambient";
}

const HEALING_SOUNDS: SoundOption[] = [
  { id: "432hz", name: "432 Hz", emoji: "ð", description: "Earth's frequency â deep calm", frequencies: [432], type: "tone" },
  { id: "528hz", name: "528 Hz", emoji: "ð", description: "Love frequency â healing & peace", frequencies: [528], type: "tone" },
  { id: "174hz", name: "174 Hz", emoji: "ð«¶", description: "Pain relief â body relaxation", frequencies: [174], type: "tone" },
  { id: "binaural", name: "Deep Relax", emoji: "ð§ ", description: "Binaural beat â theta waves", frequencies: [200, 206], type: "binaural" },
  { id: "ocean", name: "Ocean Waves", emoji: "ð", description: "Gentle shoreline sounds", frequencies: [], type: "ambient" },
  { id: "rain", name: "Soft Rain", emoji: "ð§ï¸", description: "Peaceful rainfall", frequencies: [], type: "ambient" },
];

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
  const [showMenu, setShowMenu] = useState(false);
  const [breathPhase, setBreathPhase] = useState("ready");
  const [breathCount, setBreathCount] = useState(0);
  const [breathText, setBreathText] = useState("Tap to begin");
  const [breathActive, setBreathActive] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [panicMode, setPanicMode] = useState("breathe");
  const [groundStep, setGroundStep] = useState(0);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [soundVolume, setSoundVolume] = useState(0.3);

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<AudioNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      stopSound();
    };
  }, []);

  useEffect(() => {
    const p = getProfile();
    if (p && p.firstName) {
      supabase.from("profiles").select("id").eq("first_name", p.firstName).limit(1).then(function(res) {
        if (res.data && res.data[0]) {
          var pid = res.data[0].id;
          setProfileId(pid);
          supabase.from("messages").select("*").eq("profile_id", pid).order("created_at", { ascending: true }).then(function(msgRes) {
            if (msgRes.data && msgRes.data.length > 0) {
              setMessages(msgRes.data.map(function(m: { role: "user" | "assistant"; content: string; created_at: string }, i: number) {
                return { id: i.toString(), role: m.role, content: m.content, timestamp: new Date(m.created_at) };
              }));
            }
          });
        }
      });
    }
  }, []);

  // --- Sound Engine ---
  const stopSound = () => {
    audioNodesRef.current.forEach((node) => {
      try {
        if (node instanceof OscillatorNode) node.stop();
        if (node instanceof AudioBufferSourceNode) node.stop();
        node.disconnect();
      } catch { /* already stopped */ }
    });
    audioNodesRef.current = [];
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    setActiveSound(null);
  };

  const playTone = (freq: number) => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = soundVolume;
    gainNodeRef.current = gain;
    gain.connect(ctx.destination);

    // Main tone (sine wave for smoothness)
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start();
    audioNodesRef.current.push(osc);

    // Soft harmonic layer (one octave below, quieter)
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq / 2;
    const gain2 = ctx.createGain();
    gain2.gain.value = soundVolume * 0.3;
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    audioNodesRef.current.push(osc2, gain2);
  };

  const playBinaural = (freqs: number[]) => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = soundVolume;
    gainNodeRef.current = gain;

    // Left ear
    const merger = ctx.createChannelMerger(2);
    merger.connect(ctx.destination);

    const oscL = ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.value = freqs[0];
    const gainL = ctx.createGain();
    gainL.gain.value = soundVolume;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);
    oscL.start();

    // Right ear (slightly different frequency creates binaural beat)
    const oscR = ctx.createOscillator();
    oscR.type = "sine";
    oscR.frequency.value = freqs[1];
    const gainR = ctx.createGain();
    gainR.gain.value = soundVolume;
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);
    oscR.start();

    audioNodesRef.current.push(oscL, oscR, gainL, gainR, merger);
  };

  const playAmbient = (type: string) => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = soundVolume;
    gainNodeRef.current = gain;
    gain.connect(ctx.destination);

    // Generate noise-based ambient sounds
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      if (type === "ocean") {
        // Ocean: filtered brown noise with slow amplitude modulation
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          // Slow wave-like amplitude modulation
          const wave = Math.sin(i / (ctx.sampleRate * 3)) * 0.5 + 0.5;
          const wave2 = Math.sin(i / (ctx.sampleRate * 7)) * 0.3 + 0.7;
          data[i] = lastOut * 3.5 * wave * wave2;
        }
      } else if (type === "rain") {
        // Rain: pink noise with gentle variation
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          // Subtle droplet-like variation
          const droplet = Math.random() > 0.9997 ? (Math.random() * 0.3) : 0;
          data[i] = (pink * 0.11) + droplet;
        }
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    audioNodesRef.current.push(source);
  };

  const toggleSound = (sound: SoundOption) => {
    if (activeSound === sound.id) {
      stopSound();
      return;
    }
    stopSound();
    setActiveSound(sound.id);

    if (sound.type === "tone") {
      playTone(sound.frequencies[0]);
    } else if (sound.type === "binaural") {
      playBinaural(sound.frequencies);
    } else if (sound.type === "ambient") {
      playAmbient(sound.id);
    }
  };

  const updateVolume = (vol: number) => {
    setSoundVolume(vol);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = vol;
    }
  };

  // --- Breathing ---
  const startBreathing = () => {
    if (breathActive) return;
    setBreathActive(true);
    runBreathCycle(0);
  };

  const runBreathCycle = (count: number) => {
    setBreathPhase("in");
    setBreathText("Breathe in...");
    breathTimerRef.current = setTimeout(() => {
      setBreathPhase("hold");
      setBreathText("Hold...");
      breathTimerRef.current = setTimeout(() => {
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
    stopSound();
    setShowPanic(false);
  };

  // --- Chat ---
  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    var prof = getProfile();
    if (prof && prof.profileId) {
      supabase.from("messages").insert({ profile_id: prof.profileId, role: "user", content: userMessage.content }).then(function(x) { console.log("user msg saved", x); });
    }

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
        body: JSON.stringify({ messages: chatHistory, userProfile: getProfile() }),
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
        var prof2 = getProfile();
        if (prof2 && prof2.profileId) {
          supabase.from("messages").insert({ profile_id: prof2.profileId, role: "assistant", content: data.message }).then(function(x) { console.log("balm msg saved", x); });
        }
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
          flex: 1; border: none; outline: none; font-family: 'DM Sans', sans-serif;
          font-size: 16px; color: #0D2818; background: transparent; resize: none; line-height: 1.5; padding: 0;
        }
        .chat-textarea::placeholder { color: #A0B5A8; }
        .send-btn {
          width: 44px; height: 44px; border-radius: 50%; background: #1B6B4A; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .send-btn:hover { background: #0D2818; transform: scale(1.05); }
        .send-btn:disabled { background: #B0D4B8; cursor: not-allowed; transform: none; }
        .panic-btn {
          padding: 8px 16px; border-radius: 50px; border: 2px solid #E8534A; background: transparent;
          color: #E8534A; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
        }
        .panic-btn:hover { background: #E8534A; color: white; }
        .message-bubble {
          max-width: 75%; padding: 16px 20px; border-radius: 20px; line-height: 1.7;
          font-size: 15px; animation: fadeIn 0.3s ease; white-space: pre-wrap;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .typing-indicator span {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          background: #5BA68A; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
        .panic-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10,10,15,0.92); backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; animation: fadeIn 0.4s ease;
        }
        .panic-card {
          background: #1A1A2E; border-radius: 28px; padding: 48px 40px;
          max-width: 440px; width: 90%; text-align: center;
          max-height: 90vh; overflow-y: auto;
        }
        .breath-circle {
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px; cursor: pointer;
          transition: width 4s ease-in-out, height 4s ease-in-out, background 2s ease, box-shadow 2s ease;
        }
        .progress-dots { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; }
        .progress-dot { width: 10px; height: 10px; border-radius: 50%; transition: all 0.3s ease; }
        @keyframes sparkle { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        .sparkle-text { animation: sparkle 0.6s ease; }
        .sound-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 14px 16px; cursor: pointer;
          transition: all 0.3s ease; text-align: left;
          display: flex; align-items: center; gap: 12;
        }
        .sound-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .sound-card.active {
          background: rgba(91,166,138,0.2); border-color: rgba(91,166,138,0.5);
          box-shadow: 0 0 20px rgba(91,166,138,0.15);
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(91,166,138,0.3); }
          50% { box-shadow: 0 0 20px rgba(91,166,138,0.6); }
        }
        .sound-playing { animation: pulse-glow 2s ease-in-out infinite; }
        .volume-slider {
          -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
          border-radius: 2px; background: rgba(255,255,255,0.15); outline: none;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 16px; height: 16px;
          border-radius: 50%; background: #5BA68A; cursor: pointer;
        }
        .volume-slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: #5BA68A; cursor: pointer; border: none;
        }
      `}</style>

      {/* PANIC MODE OVERLAY */}
      {showPanic && (
        <div className="panic-overlay">
          <div className="panic-card">
            {/* Tab buttons */}
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              <button onClick={()=>setPanicMode("breathe")} style={{flex:1,padding:"10px",borderRadius:10,border:"none",fontWeight:600,fontSize:14,cursor:"pointer",background:panicMode==="breathe"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.05)",color:panicMode==="breathe"?"white":"rgba(255,255,255,0.4)"}}>Breathe</button>
              <button onClick={()=>{setPanicMode("ground");setGroundStep(0);}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",fontWeight:600,fontSize:14,cursor:"pointer",background:panicMode==="ground"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.05)",color:panicMode==="ground"?"white":"rgba(255,255,255,0.4)"}}>Ground</button>
              <button onClick={()=>setPanicMode("sounds")} style={{flex:1,padding:"10px",borderRadius:10,border:"none",fontWeight:600,fontSize:14,cursor:"pointer",background:panicMode==="sounds"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.05)",color:panicMode==="sounds"?"white":"rgba(255,255,255,0.4)"}}>Sounds</button>
            </div>

            {/* BREATHE TAB */}
            {panicMode === "breathe" && <>
              <div className="breath-circle" style={{ width: getCircleSize(), height: getCircleSize(), background: getCircleGradient(), boxShadow: getCircleGlow() }} onClick={!breathActive ? startBreathing : undefined}>
                <span style={{ fontSize: 28 }}>{breathPhase === "done" ? "\uD83D\uDC9A" : "\uD83E\uDEC1"}</span>
              </div>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: breathPhase === "done" ? 22 : 26, fontWeight: 600, marginBottom: 8, color: "white" }}>{breathText}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                {breathPhase === "ready" && "5 breaths. You can do this."}
                {breathPhase === "in" && "4 seconds... fill your lungs slowly"}
                {breathPhase === "hold" && "4 seconds... you\u2019re doing great"}
                {breathPhase === "out" && "4 seconds... let it all go"}
                {breathPhase === "done" && ""}
              </p>
              <div className="progress-dots">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="progress-dot" style={{ background: i < breathCount ? "linear-gradient(135deg, #FFD700, #F8B4C8)" : "rgba(255,255,255,0.15)", boxShadow: i < breathCount ? "0 0 8px rgba(255,215,0,0.5)" : "none" }} />
                ))}
              </div>
            </>}

            {/* GROUND TAB */}
            {panicMode === "ground" && <>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 48 }}>{["\uD83D\uDC41\uFE0F","\u270B","\uD83D\uDC42","\uD83D\uDC43","\uD83D\uDC45"][groundStep]}</span>
                <h2 style={{ fontFamily: "Lora, Georgia, serif", fontSize: 24, fontWeight: 600, color: "white", marginTop: 16, marginBottom: 8 }}>{["Name 5 things you can SEE","Name 4 things you can TOUCH","Name 3 things you can HEAR","Name 2 things you can SMELL","Name 1 thing you can TASTE"][groundStep]}</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{["Look around slowly. What catches your eye?","Feel textures near you. What do you notice?","Close your eyes. What sounds surround you?","Breathe in. What scents are nearby?","What taste lingers in your mouth?"][groundStep]}</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>{[5,4,3,2,1].map(function(n,i) { return <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i <= groundStep ? "linear-gradient(135deg, #FFD700, #F8B4C8)" : "rgba(255,255,255,0.15)" }}></div>; })}</div>
                {groundStep < 4 ? <button onClick={function() { setGroundStep(groundStep + 1); }} style={{ padding: "14px 32px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 14, color: "white", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Next</button> : <p style={{ fontSize: 18, color: "white", fontWeight: 600 }}>You did it. You are here. You are safe.</p>}
              </div>
            </>}

            {/* SOUNDS TAB */}
            {panicMode === "sounds" && <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 600, color: "white", marginBottom: 6 }}>Healing Sounds</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>Tap a sound to play. Use headphones for binaural beats.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {HEALING_SOUNDS.map((sound) => (
                  <div
                    key={sound.id}
                    className={`sound-card ${activeSound === sound.id ? "active sound-playing" : ""}`}
                    onClick={() => toggleSound(sound)}
                  >
                    <div style={{ fontSize: 28, flexShrink: 0, width: 40, textAlign: "center" }}>{sound.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "white", marginBottom: 2 }}>
                        {sound.name}
                        {activeSound === sound.id && <span style={{ marginLeft: 8, fontSize: 11, color: "#5BA68A" }}>&#9654; Playing</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sound.description}</div>
                    </div>
                    {activeSound === sound.id && (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(232,83,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: "#E8534A" }}>&#9632;</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Volume control */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 4px" }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>ð</span>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => updateVolume(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>ð</span>
              </div>

              {activeSound && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12, fontStyle: "italic" }}>
                  Sound continues while you use other tabs
                </p>
              )}
            </>}

            {/* Safety message */}
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 500, marginBottom: 28, fontStyle:&FÆ2"ÂÖ&våF÷¢#B×Óà¢÷R&R6fRâF2vÆÂ72à¢Â÷à ¢²ò¢7Föâ'WGFöç2¢÷Ð¢ÆFb7GÆS×·²F7Æ¢&fÆW"ÂfÆWF&V7Föã¢&6öÇVÖâ"Âv¢×Óà¢Æ&VcÒ'FVÃ£"7GÆS×·²F7Æ¢&&Æö6²"ÂFFæs¢#G"Â&6¶w&÷VæC¢&ÆæV"Öw&FVçB3VFVrÂ4SS3DÂ4CCC4"Â6öÆ÷#¢'vFR"Â&÷&FW%&FW3¢BÂföçEvVvC¢cÂföçE6¦S¢RÂFWDFV6÷&Föã¢&æöæR"ÂföçDfÖÇ¢"tDÒ6ç2rÂ6ç2×6W&b"×Óà¢6ÆÂfÖF6²7&62ÆfVÆæP¢Âöà¢Æ&VcÒ'6×3£sCsCf&öGÔTÄÄò"7GÆS×·²F7Æ¢&&Æö6²"ÂFFæs¢#G"Â&6¶w&÷VæC¢'&v&#SRÃ#SRÃ#SRÃã"Â6öÆ÷#¢'vFR"Â&÷&FW%&FW3¢BÂföçEvVvC¢cÂföçE6¦S¢RÂFWDFV6÷&Föã¢&æöæR"ÂföçDfÖÇ¢"tDÒ6ç2rÂ6ç2×6W&b"Â&÷&FW#¢#6öÆB&v&#SRÃ#SRÃ#SRÃãR"×Óà¢FWBôÔRFòsCsC¢Âöà¢Æ'WGFöâöä6Æ6³×¶æFÆT6Æ÷6Uæ7Ò7GÆS×·²FFæs¢#G"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢#6öÆB&v&#SRÃ#SRÃ#SRÃã"Â&÷&FW%&FW3¢BÂföçDfÖÇ¢"tDÒ6ç2rÂ6ç2×6W&b"ÂföçEvVvC¢cÂföçE6¦S¢RÂ6öÆ÷#¢'&v&#SRÃ#SRÃ#SRÃãB"Â7W'6÷#¢'öçFW""ÂÖ&våF÷¢B×Óà¢f÷3¶ÒfVVÆær&WGFW"fÖF6²&WGW&âFò$ÄÐ¢Âö'WGFöãà¢ÂöFcà¢ÂöFcà¢ÂöFcà¢Ð ¢²ò¢TDU"¢÷Ð¢ÆFb7GÆS×·²FFæs¢#g#G"Â&÷&FW$&÷GFöÓ¢#6öÆB&v&#rÃrÃsBÃã"Â&6¶w&÷VæC¢'&v&#S2Ã#CÃ#CÃãR"Â&6¶G&÷fÇFW#¢&&ÇW"#"ÂF7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Â§W7Fg6öçFVçC¢'76RÖ&WGvVVâ"Â÷6Föã¢'&VÆFfR"×Óà¢ÆFb7GÆS×·²F7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Âv¢"×Óà¢ÆFb7GÆS×·²vGF¢3bÂVvC¢3bÂ&÷&FW%&FW3¢#SR"Â&6¶w&÷VæC¢$ÄÕôu$TTâÂF7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Â§W7Fg6öçFVçC¢&6VçFW""×Óà¢Ç7â7GÆS×·²6öÆ÷#¢'vFR"ÂföçE6¦S¢×Óç²%ÇS#s#b'ÓÂ÷7ãà¢ÂöFcà¢ÆFcà¢ÆFb7GÆS×·²föçEvVvC¢sÂföçE6¦S¢bÂ6öÆ÷#¢DTUôdõ$U5B×Óä$ÄÓÂöFcà¢ÆFb7GÆS×·²föçE6¦S¢"Â6öÆ÷#¢ÕUDTEõDTÂ×Óå÷W"E5r6ö×æöãÂöFcà¢ÂöFcà¢ÂöFcà¢ÆFb7GÆS×·²F7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Âv¢b×Óà¢Æ'WGFöâöä6Æ6³×²Óâ6WE6÷tÖVçR6÷tÖVçRÒ7GÆS×·²FFæs¢#'"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢#6öÆB&v&#rÃrÃsBÃã""Â&÷&FW%&FW3¢Â7W'6÷#¢'öçFW""ÂföçE6¦S¢×Óç²%ÇS#c3'ÓÂö'WGFöãà¢·6÷tÖVçRbbÆFb7GÆS×·²÷6Föã¢&'6öÇWFR"ÂF÷¢cÂ&vC¢bÂ&6¶w&÷VæC¢'vFR"Â&÷&FW%&FW3¢"Â&÷6F÷s¢#G#&v&ÃÃÃãR"ÂFFæs¢Â¤æFW¢ÂÖåvGF¢×Óà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"ò"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3"Â&÷&FW%&FW3¢×ÓäöÖSÂö'WGFöãà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"ö6öÖ×VæG"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3"Â&÷&FW%&FW3¢×Óä6öÖ×VæGÂö'WGFöãà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"÷G&6¶W""²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3"Â&÷&FW%&FW3¢×Óå7×FöÒG&6¶W#Âö'WGFöãà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"÷&öw&W72"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3"Â&÷&FW%&FW3¢×Óå&öw&W726'CÂö'WGFöãà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"öæWw2"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3"Â&÷&FW%&FW3¢×ÓäæWw3Âö'WGFöãà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"÷6WGFæw2"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3"Â&÷&FW%&FW3¢×Óå6WGFæw3Âö'WGFöãà¢Æ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"÷&f7"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"3T$c"Â&÷&FW%&FW3¢×Óå&f7öÆ7Âö'WGFöãà¢µ²'6VÆb"Â'&VçB%Òææ6ÇVFW27G&ærvWE&öfÆRòçW6W%&öÆRbbÆ'WGFöâöä6Æ6³×²Óâ²&÷WFW"çW6"÷6fWGÖ6&6ÆR"²6WE6÷tÖVçRfÇ6R²×Ò7GÆS×·²F7Æ¢&&Æö6²"ÂvGF¢#R"ÂFFæs¢#'g"Â&6¶w&÷VæC¢'G&ç7&VçB"Â&÷&FW#¢&æöæR"ÂFWDÆvã¢&ÆVgB"Â7W'6÷#¢'öçFW""ÂföçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"4SS3D"Â&÷&FW%&FW3¢×Óå6fWG6&6ÆSÂö'WGFöãçÐ¢ÂöFcçÐ¢µ²'6VÆb"Â'&VçB%Òææ6ÇVFW27G&ærvWE&öfÆRòçW6W%&öÆRbbÆ'WGFöâ6Æ74æÖSÒ'æ2Ö'Fâ"öä6Æ6³×²Óâ²6WE6÷uæ2G'VR²f"ÒvWE&öfÆR²b&öfÆTB²fWF6"ö÷æ2ÖÆW'B"Â²ÖWFöC¢%õ5B"ÂVFW'3¢²$6öçFVçBÕGR#¢&Æ6Föâö§6öâ"ÒÂ&öG¢¥4ôâç7G&ævg²&öfÆTC¢&öfÆTBÂW6W$æÖS¢òæf'7DæÖR¢%6öÖVöæR"ÒÒ²Ò×Óà¢²%ÇTC45ÇTDC'Òæ2'WGFöà¢Âö'WGFöãçÐ¢ÂöFcà¢ÂöFcà ¢²ò¢ÔU54tU2¢÷Ð¢ÆFb7GÆS×·²fÆW¢Â÷fW&fÆ÷u¢&WFò"ÂFFæs¢##G"ÂF7Æ¢&fÆW"ÂfÆWF&V7Föã¢&6öÇVÖâ"Âv¢b×Óà¢¶ÖW76vW2æÖ×6rÓâ¢ÆFb¶W×¶×6ræGÒ7GÆS×·²F7Æ¢&fÆW"Â§W7Fg6öçFVçC¢×6rç&öÆRÓÓÒ'W6W""ò&fÆWÖVæB"¢&fÆW×7F'B"ÂÆväFV×3¢&fÆWÖVæB"Âv¢×Óà¢¶×6rç&öÆRÓÓÒ&767FçB"bb¢ÆFb7GÆS×·²vGF¢#ÂVvC¢#Â&÷&FW%&FW3¢#SR"Â&6¶w&÷VæC¢$ÄÕôu$TTâÂF7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Â§W7Fg6öçFVçC¢&6VçFW""ÂfÆW6&æ³¢×Óà¢Ç7â7GÆS×·²6öÆ÷#¢'vFR"ÂföçE6¦S¢"×Óç²%ÇS#s#b'ÓÂ÷7ãà¢ÂöFcà¢Ð¢ÆFb6Æ74æÖSÒ&ÖW76vRÖ'V&&ÆR"7GÆS×·²&6¶w&÷VæC¢×6rç&öÆRÓÓÒ'W6W""ò$ÄÕôu$TTâ¢'vFR"Â6öÆ÷#¢×6rç&öÆRÓÓÒ'W6W""ò'vFR"¢DTUôdõ$U5BÂ&÷&FW$&÷GFöÕ&vE&FW3¢×6rç&öÆRÓÓÒ'W6W""òB¢#Â&÷&FW$&÷GFöÔÆVgE&FW3¢×6rç&öÆRÓÓÒ&767FçB"òB¢#Â&÷6F÷s¢×6rç&öÆRÓÓÒ&767FçB"ò#'&v&2ÃCÃ#BÃãB"¢&æöæR"×Óà¢Ç7âFævW&÷W6Ç6WDææW$DÔÃ×·²õöFÖÃ¢×6ræ6öçFVçBç&WÆ6RõÂ¥Â¢â£òÂ¥Â¢örÂ#Ç7G&öæsâCÂ÷7G&öæsâ"ç&WÆ6RõÂ¢â£òÂ¢örÂ#ÆVÓâCÂöVÓâ"×Òóà¢ÂöFcà¢ÂöFcà¢Ð¢¶4ÆöFærbb¢ÆFb7GÆS×·²F7Æ¢&fÆW"ÂÆväFV×3¢&fÆWÖVæB"Âv¢×Óà¢ÆFb7GÆS×·²vGF¢#ÂVvC¢#Â&÷&FW%&FW3¢#SR"Â&6¶w&÷VæC¢$ÄÕôu$TTâÂF7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Â§W7Fg6öçFVçC¢&6VçFW""ÂfÆW6&æ³¢×Óà¢Ç7â7GÆS×·²6öÆ÷#¢'vFR"ÂföçE6¦S¢"×Óç²%ÇS#s#b'ÓÂ÷7ãà¢ÂöFcà¢ÆFb6Æ74æÖSÒ&ÖW76vRÖ'V&&ÆR"7GÆS×·²&6¶w&÷VæC¢'vFR"ÂFFæs¢#g#G"Â&÷6F÷s¢#'&v&2ÃCÃ#BÃãB"×Óà¢ÆFb6Æ74æÖSÒ'GærÖæF6F÷"#ãÇ7ããÂ÷7ããÇ7ããÂ÷7ããÇ7ããÂ÷7ããÂöFcà¢ÂöFcà¢ÂöFcà¢Ð¢ÆFb&Vc×¶ÖW76vW4VæE&VgÒóà¢ÂöFcà ¢²ò¢åUB¢÷Ð¢ÆFb7GÆS×·²FFæs¢#g#G"Â&÷&FW%F÷¢#6öÆB&v&#rÃrÃsBÃã"Â&6¶w&÷VæC¢'&v&#S2Ã#CÃ#CÃãR"×Óà¢ÆFb7GÆS×·²ÖvGF¢ÂÖ&vã¢#WFò"ÂF7Æ¢&fÆW"ÂÆväFV×3¢&fÆWÖVæB"Âv¢"Â&6¶w&÷VæC¢'vFR"Â&÷&FW%&FW3¢bÂFFæs¢#'g"Â&÷&FW#¢#'6öÆB4CDSC"×Óà¢ÇFWF&V&Vc×¶çWE&VgÒ6Æ74æÖSÒ&6B×FWF&V"&÷w3×³ÒÆ6VöÆFW#Ò%FÆ²Fò$ÄÒâââ"fÇVS×¶çWGÐ¢öä6ævS×²RÓâ²6WDçWBRçF&vWBçfÇVR²RçF&vWBç7GÆRæVvBÒ&WFò#²RçF&vWBç7GÆRæVvBÒÖFæÖâRçF&vWBç67&öÆÄVvBÂ#²'#²×Ð¢öä¶WF÷vã×¶æFÆT¶WF÷vçÐ¢óà¢Æ'WGFöâ6Æ74æÖSÒ'6VæBÖ'Fâ"F6&ÆVC×¶çWBçG&ÒÓÓÒ""ÇÂ4ÆöFæwÒöä6Æ6³×¶æFÆU6VæGÓà¢Ç7frvGFÒ##"VvCÒ##"fWt&÷Ò##B#B"fÆÃÒ&æöæR"7G&ö¶SÒ'vFR"7G&ö¶UvGFÒ#""7G&ö¶TÆæV6Ò'&÷VæB"7G&ö¶TÆæV¦öãÒ'&÷VæB#à¢ÆÆæRÒ##""Ò#""#Ò#"#Ò#2#ãÂöÆæSà¢ÇöÇvöâöçG3Ò##""R#"2"#""#ãÂ÷öÇvöãà¢Â÷7fsà¢Âö'WGFöãà¢ÂöFcà¢ÆFb7GÆS×·²FWDÆvã¢&6VçFW""ÂÖ&våF÷¢×Óà¢Ç7â7GÆS×·²föçE6¦S¢Â6öÆ÷#¢"4#T"×Óä$ÄÒ2â6ö×æöââæ÷B7V'7FGWFRf÷"ÖVF6ÂGf6RãÂ÷7ãà¢ÂöFcà¢ÂöFcà¢ÂöFcà¢°§Ð
