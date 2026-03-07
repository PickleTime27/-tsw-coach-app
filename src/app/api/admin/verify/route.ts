import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return NextResponse.json({ message: "Admin not configured." }, { status: 500 });
    await new Promise(r => setTimeout(r, 500));
    if (password !== adminPassword) return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
    return NextResponse.json({ verified: true });
  } catch { return NextResponse.json({ message: "Server error." }, { status: 500 }); }
}