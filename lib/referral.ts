// lib/referral.ts
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export function generateReferralCode() {
  return `HU-${nanoid()}`;
}
