// Temporary profile storage using cookies until Supabase is set up

export interface UserProfile {
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

export function saveProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    document.cookie = "tsw_profile=" + encodeURIComponent(JSON.stringify(profile)) + "; path=/; max-age=31536000";
  }
}

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

export function clearProfile(): void {
  if (typeof window !== "undefined") {
    document.cookie = "tsw_profile=; path=/; max-age=0";
  }
}