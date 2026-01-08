import { NextRequest, NextResponse } from "next/server";
import { getOTP, setOTP } from "@/lib/otp-store";

// OTP expires in 10 minutes
const OTP_EXPIRY = 10 * 60 * 1000;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters
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

    // Clean and validate phone number
    const cleanPhone = cleanPhoneNumber(phone);
    
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    // Store OTP
    setOTP(cleanPhone, otp, expiresAt);

    // Send OTP via WhatsApp API
    const response = await fetch("https://whatsappapi.vertexsuite.in/v1/sendmsg/divy", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 9ac3f0a1-2b6d-4e4a-93f1-f379cb4993d1",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiInfo: "divy_otp",
        partyInfo: [{ mobileNo: cleanPhone }],
        otp: otp,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send OTP via WhatsApp:", await response.text());
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

