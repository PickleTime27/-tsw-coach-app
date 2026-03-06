import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { profileId, userName } = await req.json();

  const { data: contacts } = await supabase
    .from("safety_circle")
    .select("*")
    .eq("profile_id", profileId);

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ message: "No safety circle contacts" });
  }

  const results = [];
  for (const contact of contacts) {
    if (!contact.contact_email) continue;
    try {
      await resend.emails.send({
        from: "BALM <onboarding@resend.dev>",
        to: contact.contact_email,
        subject: userName + " needs support right now",
        html: '<div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:32px;background:#FDF8F0;border-radius:16px;border-left:4px solid #E8534A;"><h2 style="color:#E8534A;margin-bottom:16px;">Safety Circle Alert</h2><p style="color:#555;line-height:1.6;">' + userName + ' just activated their Panic Button on TSW Coach. They may be experiencing a difficult moment and could use your support right now.</p><p style="color:#555;line-height:1.6;">As someone in their Safety Circle, please consider reaching out to them.</p><div style="margin-top:24px;padding:16px;background:rgba(232,83,74,0.05);border-radius:8px;"><p style="color:#888;font-size:13px;margin:0;">If you believe they are in immediate danger, please call 911.</p></div></div>',
      });
      results.push({ contact: contact.contact_name, status: "sent" });
    } catch (error) {
      results.push({ contact: contact.contact_name, status: "failed" });
    }
  }
  return NextResponse.json({ sent: results.length, results });
}
