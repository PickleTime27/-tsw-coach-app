import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  const days = req.nextUrl.searchParams.get("days") || "30";
  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }
  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));
  const { data, error } = await supabase
    .from("symptom_logs")
    .select("*")
    .eq("profile_id", profileId)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ logs: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    profileId, itching = 0, redness = 0, flaking = 0, oozing = 0,
    swelling = 0, sleep_quality = 0, pain = 0, dryness = 0,
    nerve_pain = 0, thermal_regulation = 0,
    overall_score = 0, notes = "",
  } = body;
  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("symptom_logs")
    .insert({
      profile_id: profileId,
      itching, redness, flaking, oozing, swelling,
      sleep_quality, pain, dryness, nerve_pain, thermal_regulation,
      overall_score, notes,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ log: data });
}
