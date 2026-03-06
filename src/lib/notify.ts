import { Resend } from "resend";

const BALM_GREEN = "#1B6B4A";

export async function sendNotificationEmail(to: string, name: string, subject: string, message: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "BALM <onboarding@resend.dev>",
      to,
      subject,
      html: '<div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:32px;background:#FDF8F0;border-radius:16px;"><div style="text-align:center;margin-bottom:24px;"><div style="width:48px;height:48px;border-radius:50%;background:' + BALM_GREEN + ';display:inline-flex;align-items:center;justify-content:center;"><span style="color:white;font-size:24px;">&#10022;</span></div></div><h2 style="color:' + BALM_GREEN + ';text-align:center;margin-bottom:16px;">Hey ' + name + '</h2><p style="color:#555;line-height:1.6;text-align:center;">' + message + '</p><div style="text-align:center;margin-top:24px;"><a href="https://tsw-coach-app.vercel.app/auth?mode=login" style="display:inline-block;padding:14px 32px;background:' + BALM_GREEN + ';color:white;border-radius:12px;text-decoration:none;font-weight:600;">Open TSW Coach</a></div></div>',
    });
    return true;
  } catch (error) {
    return false;
  }
}
