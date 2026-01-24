import { NextRequest, NextResponse } from "next/server";
import { setOTP } from "@/lib/otp-store";
import { sendOtpViaWhatsApp } from "@/lib/whatsapp";

// OTP expires in 10 minutes
const OTP_EXPIRY = 10 * 60 * 1000;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = cleanPhoneNumber(phone);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    setOTP(cleanPhone, otp, expiresAt);

    await sendOtpViaWhatsApp(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);

    // User-facing: generic so we don’t leak provider details
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}

