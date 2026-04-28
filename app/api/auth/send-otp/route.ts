import { NextRequest, NextResponse } from "next/server";
import { divyEngineFetch } from "@/lib/divy-engine-api";

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanPhone = cleanPhoneNumber(body.phone || "");

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Phone number must be 10 digits" }, { status: 400 });
    }

    await divyEngineFetch<{ success: true; message: string }>("/api/ecom/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone: cleanPhone }),
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
