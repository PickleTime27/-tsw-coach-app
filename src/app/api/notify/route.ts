import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { type, recipientId, senderName } = await req.json();

  const { data: recipient } = await supabase.from("profiles").select("email, first_name").eq("id", recipientId).limit(1).single();
  if (!recipient || !recipient.email) return NextResponse.json({ error: "No recipient" }, { status: 400 });

  const { data: prefs } = await supabase.from("notification_prefs").select("*").eq("profile_id", recipientId).limit(1).single();

  let subject = "";
  let message = "";

  if (type === "friend_request") {
    if (prefs && !prefs.friend_request_alerts) return NextResponse.json({ skipped: true });
    subject = senderName + " wants to connect with you on TSW Coach";
    message = senderName + " sent you a friend request. Open the app to accept and start chatting.";
  } else if (type === "dm") {
    if (prefs && !prefs.dm_alerts) return NextResponse.json({ skipped: true });
    subject = "New message from " + senderName;
    message = senderName + " sent you a message on TSW Coach. Open the app to read and reply.";
  } else if (type === "new_member") {
    if (prefs && !prefs.new_member_alerts) return NextResponse.json({ skipped: true });
    subject = "Someone new joined TSW Coach";
    message = senderName + " just joined the TSW Coach community. Welcome them!";
  }

  try {
    await resend.emails.send({
      from: "BALM <onboarding@resend.dev>",
      to: recipient.email,
      subject,
      html: '<div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:32px;background:#FDF8F0;border-radius:16px;"><h2 style="color:#1B6B4A;text-align:center;margin-bottom:16px;">Hey ' + recipient.first_name + '</h2><p style="color:#555;line-height:1.6;text-align:center;">' + message + '</p><div style="text-align:center;margin-top:24px;"><a href="https://tsw-coach-app.vercel.app/auth?mode=login" style="display:inline-block;padding:14px 32px;background:#1B6B4A;color:white;border-radius:12px;text-decoration:none;font-weight:600;">Open TSW Coach</a></div></div>',
    });
    return NextResponse.json({ sent: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
