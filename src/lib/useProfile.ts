import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getProfileFromSupabase, hasSession } from "./profile";
import type { UserProfile } from "./profile";

export function useProfile(options?: { requireAuth?: boolean }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const requireAuth = options?.requireAuth ?? true;

  useEffect(() => {
    async function loadProfile() {
      // First try cookie for instant display
      const cookieProfile = getProfile();
      if (cookieProfile) setProfile(cookieProfile);

      // Then verify with Supabase (authoritative)
      const sessionExists = await hasSession();

      if (!sessionExists) {
        if (requireAuth) { router.push("/auth?mode=login"); return; }
        setLoading(false);
        return;
      }

      // Load from Supabase and sync to cookie
      const supabaseProfile = await getProfileFromSupabase();

      if (supabaseProfile) {
        setProfile(supabaseProfile);
      } else if (requireAuth) {
        // Has session but no profile - needs onboarding
        router.push("/onboarding");
        return;
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, requireAuth]);

  return { profile, loading };
}
