import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { getOTP, deleteOTP } from "@/lib/otp-store";

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = cleanPhoneNumber(phone);

    // Verify OTP
    const storedOtp = getOTP(cleanPhone);

    if (!storedOtp) {
      return NextResponse.json(
        { error: "OTP not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (Date.now() > storedOtp.expiresAt) {
      deleteOTP(cleanPhone);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // OTP verified, delete it
    deleteOTP(cleanPhone);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: `User ${cleanPhone}`,
          role: Role.USER,
        },
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();
    
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({
      userId: user.id,
      token: sessionToken,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

