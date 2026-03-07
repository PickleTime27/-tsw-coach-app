import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: daily } = await supabase.from("usage_daily_summary").select("*").limit(30);
    const { data: monthly } = await supabase.from("usage_monthly_summary").select("*").limit(12);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { data: currentMonth } = await supabase.from("chat_usage").select("estimated_cost_usd, total_tokens, is_crisis").gte("created_at", startOfMonth.toISOString());
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data: today } = await supabase.from("chat_usage").select("estimated_cost_usd, total_tokens").gte("created_at", startOfDay.toISOString());
    const { data: settings } = await supabase.from("app_settings").select("*");
    const todayCost = today?.reduce((sum, r) => sum + Number(r.estimated_cost_usd), 0) || 0;
    const todayMessages = today?.length || 0;
    const monthCost = currentMonth?.reduce((sum, r) => sum + Number(r.estimated_cost_usd), 0) || 0;
    const monthMessages = currentMonth?.length || 0;
    const monthCrises = currentMonth?.filter(r => r.is_crisis).length || 0;
    return NextResponse.json({ today: { messages: todayMessages, cost_usd: Number(todayCost.toFixed(4)) }, currentMonth: { messages: monthMessages, cost_usd: Number(monthCost.toFixed(4)), crisis_messages: monthCrises }, daily: daily || [], monthly: monthly || [], settings: settings || [] });
  } catch (error) { console.error("Usage API error:", error); return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 }); }
}
