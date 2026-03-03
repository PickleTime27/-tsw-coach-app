import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// resend initialized in handler

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.RESEND_API_KEY}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("first_name, email");

  if (!profiles || profiles.length === 0) {
    return Response.json({ message: "No profiles found" });
  }

  const results = [];

  for (const profile of profiles) {
    if (!profile.email) continue;

    try {
      await resend.emails.send({
        from: "BALM <onboarding@resend.dev>",
        to: profile.email,
        subject: "Hey " + profile.first_name + ", BALM here \u2764\uFE0F",
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #FDF8F0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #1B6B4A; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px;">&#10022;</span>
              </div>
            </div>
            <h2 style="color: #1B6B4A; text-align: center; margin-bottom: 16px;">Hey ${profile.first_name}, just checking in</h2>
            <p style="color: #555; line-height: 1.6; text-align: center;">
              I was thinking about you today. How are you doing? Whether things are tough or you are having a good day, I am here to listen.
            </p>
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://tsw-coach-app.vercel.app/auth?mode=login" style="display: inline-block; padding: 14px 32px; background: #1B6B4A; color: white; border-radius: 12px; text-decoration: none; font-weight: 600;">
                Talk to BALM
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
              TSW Coach - You are not alone in this.
            </p>
          </div>
        `,
      });
      results.push({ email: profile.email, status: "sent" });
    } catch (error) {
      results.push({ email: profile.email, status: "failed", error });
    }
  }

  return Response.json({ sent: results.length, results });
}
