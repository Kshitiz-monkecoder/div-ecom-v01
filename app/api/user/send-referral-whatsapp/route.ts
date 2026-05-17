import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendReferralWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone, referredToName } = await req.json();

    console.log("[send-referral-whatsapp] incoming:", {
      phone,
      referredToName,
      userName: user.name,
      referralCode: user.referralCode,
    });

    if (!phone || !referredToName) {
      return NextResponse.json(
        { error: "phone and referredToName are required" },
        { status: 400 }
      );
    }

    const referralCode = user.referralCode;
    if (!referralCode) {
      return NextResponse.json(
        { error: "You do not have a referral code yet" },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.APP_URL ??
      "https://divy-ecom.vercel.app";

    const referralLink = `${appUrl}/refer?code=${referralCode}`;

    await sendReferralWhatsAppMessage({
      referredToPhone: phone,
      referredToName,
      referredByName: user.name,
      referralLink,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-referral-whatsapp] error:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}