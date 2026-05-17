import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { sendReferralWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, product, referralCode } = body;

    if (!name || !phone || !product) {
      return NextResponse.json({ error: "Name, phone and product are required." }, { status: 400 });
    }

    // Submit referral to engine
    await divyEngineFetch<{ message: string; referredByName?: string }>(
      "/api/ecom/referrals",
      {
        method: "POST",
        body: JSON.stringify({ name, phone, email, product, referralCode }),
      }
    );

    // Send WhatsApp to the referred person (non-blocking — don't fail the request if WA fails)
    if (referralCode && phone) {
      try {
        // Resolve referrer's name from their code
        const referrer = await divyEngineFetch<{ name: string }>(
          `/api/ecom/referral-code/resolve?code=${encodeURIComponent(referralCode)}`
        );

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ??
          process.env.APP_URL ??
          "https://divy-ecom.vercel.app";

        await sendReferralWhatsAppMessage({
          referredToPhone: phone,
          referredToName: name,
          referredByName: referrer.name,
          referralLink: `${appUrl}/refer?code=${referralCode}`,
        });
      } catch (waErr) {
        // Log but don't surface — WA failure shouldn't block the referral
        console.error("[WhatsApp referral] Non-fatal send error:", waErr);
      }
    }

    return NextResponse.json({ message: "Referral submitted successfully!" });
  } catch (error: unknown) {
    console.error("Referral API error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit referral";

    if (message.toLowerCase().includes("already referred")) {
      return NextResponse.json({ error: "This phone number has already been referred." }, { status: 409 });
    }
    if (message.toLowerCase().includes("invalid referral code")) {
      return NextResponse.json({ error: "Invalid referral code or referrer not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to submit referral" }, { status: 500 });
  }
}