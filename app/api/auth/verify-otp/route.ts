import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { divyEngineFetch } from "@/lib/divy-engine-api";

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanPhone = cleanPhoneNumber(body.phone || "");
    const otp = String(body.otp || "");

    if (!cleanPhone || !otp) {
      return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 });
    }

    const user = await divyEngineFetch<{
      id: string;
      name: string;
      phone: string;
      email: string | null;
      role: "USER" | "ADMIN";
      referralCode: string;
    }>("/api/ecom/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone: cleanPhone, otp }),
    });

    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        token: sessionToken,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION / 1000,
        path: "/",
      }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      message.includes("Invalid OTP") || message.includes("expired") || message.includes("not found")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
