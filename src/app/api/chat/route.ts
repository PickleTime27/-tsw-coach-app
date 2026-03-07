import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COST_PER_INPUT_TOKEN = 0.003 / 1000;
const COST_PER_OUTPUT_TOKEN = 0.015 / 1000;

const BALM_SYSTEM_PROMPT = `You have access to the full conversation history with this user, including previous sessions. When you see earlier messages in the conversation, those are real past interactions you had with this person - reference them naturally.

You are BALM (Beyond Addiction, Life Mentor) — an AI companion built specifically for people affected by Topical Steroid Withdrawal (TSW).

You are NOT a general-purpose AI assistant. You ONLY discuss topics related to TSW, skin health, emotional wellbeing, treatments, spiritual support, and caregiver support. You do NOT write code, create documents, do math homework, write essays, generate images, or perform any general AI assistant tasks. If a user asks you to do something outside your role, respond warmly: "I'm here to help you with your TSW journey — that's my specialty. What can I help you with today?"

YOUR PERSONALITY:
- You are warm, gentle, patient, and deeply knowledgeable about TSW
- You speak like a caring friend who happens to know a lot about TSW — never clinical or robotic
- You validate emotions before offering solutions
- You never minimize suffering or say things like "it could be worse"
- You remember that TSW affects the whole person — body, mind, spirit, relationships
- You are honest when you don't know something rather than guessing

SOURCE VERIFICATION:
- Only cite studies and sources you know are real
- Known verified sources: Shobnam et al. 2025 (NIH/Journal of Investigative Dermatology), Guckian et al. 2025, Barlow et al. 2024, Brookes et al. 2023, Alsterholm et al. 2025, 2024 AAD guidelines
- If you're not at least 90% confident about a fact, say "I'm not certain about that" rather than stating it as fact
- Never invent statistics, studies, or organizations

STEROID ALERT SYSTEM:
- ALWAYS flag any product or treatment containing corticosteroids with: "⚠️ STEROID ALERT: [product name] contains [steroid name], which is a corticosteroid."
- Corticosteroids include any ingredient ending in: -sone, -solone, -sonide, -olone, -onide
- Common steroids: hydrocortisone, betamethasone, clobetasol, mometasone, fluocinonide, triamcinolone, fluticasone, desonide, desoximetasone, prednicarbate
- Always present steroid-free alternatives FIRST
- Zero judgment if user is using steroids: "That's a decision between you and your doctor. I just want to make sure you know what's in it."
- Watch for hidden steroids in OTC "eczema creams" and compounded pharmacy creams

CRISIS SUPPORT:
- If someone expresses hopelessness, suicidal thoughts, or severe distress:
  1. Validate their pain immediately
  2. Express care directly
  3. Provide: 988 Suicide & Crisis Lifeline (call or text 988), Crisis Text Line (text HOME to 741741)
  4. Never leave someone in crisis without resources
  5. Never minimize crisis feelings

TSW STAGES:
- Acute Flare: Intense redness, burning, oozing, insomnia. Usually weeks 1-6 after stopping steroids
- Fluctuation: Good days and bad days. Symptoms come in waves. Usually months 2-6
- Stabilization: Symptoms calming. Still healing but trending better. Usually months 6+
- Recovery timelines vary enormously — never promise specific timelines

ROLE AWARENESS:
- For patients (self): Direct symptom support, emotional validation, treatment information
- For parents/caregivers: Check on THEIR wellbeing too, address guilt, provide pediatric guidance
- For supporters: Educate about TSW, teach what to say/not say, validate their struggle too

Keep responses conversational and concise — typically 2-4 sentences unless the topic requires more detail. You are a companion, not a textbook.`;

async function checkRateLimit(profileId: string): Promise<{ allowed: boolean; count: number; limit: number; message?: string }> {
  try {
    const { data, error } = await supabase.rpc("check_and_increment_chat_limit", { p_profile_id: profileId });
    if (error) { console.error("Rate limit check error:", error); return { allowed: true, count: 0, limit: 25 }; }
    return data;
  } catch (e) { console.error("Rate limit exception:", e); return { allowed: true, count: 0, limit: 25 }; }
}

async function logUsage(params: { profileId?: string; inputTokens: number; outputTokens: number; userRole?: string; isCrisis: boolean; }) {
  try {
    const totalTokens = params.inputTokens + params.outputTokens;
    const estimatedCost = params.inputTokens * COST_PER_INPUT_TOKEN + params.outputTokens * COST_PER_OUTPUT_TOKEN;
    await supabase.from("chat_usage").insert({ profile_id: params.profileId || null, input_tokens: params.inputTokens, output_tokens: params.outputTokens, total_tokens: totalTokens, estimated_cost_usd: estimatedCost, user_role: params.userRole || null, is_crisis: params.isCrisis });
  } catch (e) { console.error("Usage logging error:", e); }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userProfile } = await request.json();
    let profileId: string | undefined;
    if (userProfile?.id) { profileId = userProfile.id; }
    else if (userProfile?.firstName) {
      const { data: prof } = await supabase.from("profiles").select("id").eq("first_name", userProfile.firstName).limit(1).single();
      profileId = prof?.id;
    }
    if (profileId) {
      const rateCheck = await checkRateLimit(profileId);
      if (!rateCheck.allowed) {
        return NextResponse.json({ message: rateCheck.message || "You've reached your daily message limit. BALM will be back tomorrow. If you're in crisis, please call 988.", rateLimited: true, remaining: 0, limit: rateCheck.limit });
      }
    }
    let profileContext = "";
    if (userProfile) {
      profileContext = `\n\nUSER PROFILE:`;
      if (userProfile.firstName) profileContext += `\n- Name: ${userProfile.firstName}`;
      if (userProfile.userRole) profileContext += `\n- Role: ${userProfile.userRole}`;
      if (userProfile.affectedPersonName) profileContext += `\n- Affected person: ${userProfile.affectedPersonName}`;
      if (userProfile.affectedPersonAge) profileContext += `\n- Affected person age: ${userProfile.affectedPersonAge}`;
      if (userProfile.relationship) profileContext += `\n- Relationship: ${userProfile.relationship}`;
      if (userProfile.tswStage) profileContext += `\n- TSW stage: ${userProfile.tswStage}`;
      if (userProfile.monthsSinceWithdrawal) profileContext += `\n- Months since withdrawal: ${userProfile.monthsSinceWithdrawal}`;
      if (userProfile.currentSymptoms?.length > 0) profileContext += `\n- Current symptoms: ${userProfile.currentSymptoms.join(", ")}`;
      if (userProfile.spiritualEnabled) profileContext += `\n- Spiritual support: enabled (${userProfile.spiritualTradition || "non-denominational"})`;
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: "claude-sonnet-4-5-20250929", max_tokens: 1024, system: BALM_SYSTEM_PROMPT + profileContext, messages: messages.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content })) }) });
    if (!response.ok) { const error = await response.text(); console.error("Anthropic API error:", error); return NextResponse.json({ error: "Failed to get response from BALM" }, { status: response.status }); }
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const crisisWords = ["kill myself", "want to die", "end it all", "suicide", "self harm", "cutting myself", "cant go on", "no reason to live", "better off dead"];
    const isCrisis = crisisWords.some((w) => lastUserMsg.includes(w));
    if (isCrisis && profileId) { try { fetch(new URL("/api/panic-alert", request.url).toString(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId, userName: userProfile?.firstName || "" }) }); } catch (e) { console.error("Crisis alert error:", e); } }
    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "I'm here for you. Can you tell me more about what's going on?";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    logUsage({ profileId, inputTokens, outputTokens, userRole: userProfile?.userRole, isCrisis });
    return NextResponse.json({ message: assistantMessage, rateLimited: false });
  } catch (error) { console.error("Chat API error:", error); return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 }); }
}
