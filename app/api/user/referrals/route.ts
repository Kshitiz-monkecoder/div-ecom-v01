import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, product, referralCode } = body;

    if (!name || !phone || !product) {
      return NextResponse.json({ error: "Name, phone and product are required." }, { status: 400 });
    }

    await divyEngineFetch<{ message: string }>("/api/ecom/referrals", {
      method: "POST",
      body: JSON.stringify({ name, phone, email, product, referralCode }),
    });

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

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await divyEngineFetch<any[]>("/api/ecom/referrals", {
      actor: { id: user.id, role: user.role },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Fetch referrals error:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}
