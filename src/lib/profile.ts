// Profile management - Supabase auth session primary, cookie fallback
import { supabase } from "./supabase";

export interface UserProfile {
  profileId: string;
  firstName: string;
  userRole: "self" | "parent" | "supporter" | null;
  affectedPersonName: string;
  affectedPersonAge: string;
  relationship: string;
  tswStage: "acute" | "fluctuation" | "stabilization" | "";
  monthsSinceWithdrawal: string;
  currentSymptoms: string[];
  spiritualEnabled: boolean;
  spiritualTradition: string;
}

// Save profile to cookie (kept for backward compat)
export function saveProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    document.cookie =
      "tsw_profile=" +
      encodeURIComponent(JSON.stringify(profile)) +
      "; path=/; max-age=31536000";
  }
}

// Get profile from cookie (synchronous)
export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/tsw_profile=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as UserProfile;
  } catch {
    return null;
  }
}

// Get profile from Supabase (async, authoritative)
export async function getProfileFromSupabase(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    const userProfile: UserProfile = {
      profileId: user.id,
      firstName: profile.first_name || "",
      userRole: profile.user_role || null,
      affectedPersonName: profile.affected_person_name || "",
      affectedPersonAge: profile.affected_person_age || "",
      relationship: profile.relationship || "",
      tswStage: profile.tsw_stage || "",
      monthsSinceWithdrawal: profile.months_since_withdrawal || "",
      currentSymptoms: profile.current_symptoms || [],
      spiritualEnabled: profile.spiritual_enabled || false,
      spiritualTradition: profile.spiritual_tradition || "",
    };

    saveProfile(userProfile); // sync to cookie
    return userProfile;
  } catch {
    return null;
  }
}

// Check if user has an active Supabase session
export async function hasSession(): Promise<boolean> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

// Sign out and clear everything
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  clearProfile();
}

export function clearProfile(): void {
  if (typeof window !== "undefined") {
    document.cookie = "tsw_profile=; path=/; max-age=0";
  }
}
