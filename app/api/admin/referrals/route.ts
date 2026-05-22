import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

const asTrimmedString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function GET() {
  const admin = await requireAdmin();

  const referrals = await divyEngineFetch<any[]>("/api/ecom/admin/referrals", {
    actor: { id: admin.id, role: admin.role },
  });

  return NextResponse.json(referrals);
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const name = asTrimmedString(body.name);
    const phone = asTrimmedString(body.phone);
    const email = asTrimmedString(body.email);
    const product = asTrimmedString(body.product);
    const referrerId = asTrimmedString(body.referrerId);
    let referralCode = asTrimmedString(body.referralCode);
    let referrerPhone = asTrimmedString(body.referrerPhone);

    if (!name || !phone || !product) {
      return NextResponse.json({ error: 'Name, phone and product are required.' }, { status: 400 });
    }
    if (!referrerId && !referralCode && !referrerPhone) {
      return NextResponse.json({ error: 'Referrer customer is required.' }, { status: 400 });
    }

    if (referrerId && !referralCode && !referrerPhone) {
      const users = await divyEngineFetch<any[]>("/api/ecom/admin/users-for-assignment", {
        actor: { id: admin.id, role: admin.role },
      });
      const referrer = users.find((user) => user?.id === referrerId);

      if (!referrer) {
        return NextResponse.json({ error: 'Selected referrer customer was not found.' }, { status: 404 });
      }

      referralCode = asTrimmedString(referrer.referralCode);
      referrerPhone = asTrimmedString(referrer.phone);
    }

    if (!referralCode && !referrerPhone) {
      return NextResponse.json({ error: 'Selected referrer customer has no phone or referral code.' }, { status: 400 });
    }

    const referral = await divyEngineFetch<any>('/api/ecom/admin/referrals', {
      method: 'POST',
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({
        name,
        phone,
        email: email || undefined,
        product,
        referralCode: referralCode || undefined,
        referrerPhone: referrerPhone || undefined,
      }),
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error('Create admin referral error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create referral';
    if (message.toLowerCase().includes('already has a referral')) {
      return NextResponse.json({ error: 'This phone number already has a referral on record.' }, { status: 409 });
    }
    if (message.toLowerCase().includes('referrer not found')) {
      return NextResponse.json({ error: 'No user found with that referral code or phone number.' }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
