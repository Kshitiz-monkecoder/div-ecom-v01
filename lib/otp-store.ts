// In-memory OTP storage (in production, use Redis or a database)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function getOTP(phone: string): { otp: string; expiresAt: number } | undefined {
  return otpStore.get(phone);
}

export function setOTP(phone: string, otp: string, expiresAt: number): void {
  otpStore.set(phone, { otp, expiresAt });
}

export function deleteOTP(phone: string): void {
  otpStore.delete(phone);
}

// Cleanup expired OTPs periodically (optional)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [phone, data] of otpStore.entries()) {
      if (now > data.expiresAt) {
        otpStore.delete(phone);
      }
    }
  }, 60 * 1000); // Clean up every minute
}

