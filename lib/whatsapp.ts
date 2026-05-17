type WhatsAppPartyInfo = {
  mobileNo: string;
};

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Format for VertexSuite: Indian 10-digit numbers often need 91 prefix. */
function formatMobileForProvider(cleaned: string): string {
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return `91${cleaned}`;
  }
  return cleaned;
}

function getWhatsAppApiUrl(): string {
  return (
    process.env.WHATSAPP_API_URL ??
    "https://whatsappapi.vertexsuite.in/v1/sendmsg/divy"
  );
}

function getWhatsAppAuthorizationHeader(): string | null {
  const token = process.env.WHATSAPP_TOKEN ?? "9ac3f0a1-2b6d-4e4a-93f1-f379cb4993d1";
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

async function postWhatsAppPayload(payload: Record<string, unknown>) {
  const authorization = getWhatsAppAuthorizationHeader();
  if (!authorization) {
    throw new Error("Missing WHATSAPP_TOKEN");
  }

  const url = getWhatsAppApiUrl();

  console.log("[WhatsApp] POST", url);
  console.log("[WhatsApp] payload:", JSON.stringify(payload, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  console.log("[WhatsApp] response status:", res.status);
  console.log("[WhatsApp] response body:", responseText);

  return new Response(responseText, {
    status: res.status,
    headers: res.headers,
  });
}

/**
 * Send OTP via VertexSuite WhatsApp.
 */
export async function sendOtpViaWhatsApp(phone: string, otp: string): Promise<void> {
  const cleaned = cleanPhoneNumber(phone);
  if (cleaned.length !== 10) {
    throw new Error("Phone must be 10 digits");
  }
  const mobileNo = formatMobileForProvider(cleaned);

  const payload = {
    apiInfo: "divy_otp",
    partyInfo: [{ mobileNo }],
    otp,
  };

  const res = await postWhatsAppPayload(payload as unknown as Record<string, unknown>);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[WhatsApp OTP] ${res.status} from provider: ${text}`);
    throw new Error(`WhatsApp OTP failed (${res.status}): ${text}`);
  }
}

export async function sendOrderCreatedWhatsAppMessage(params: {
  mobileNo: string;
  loginUrl?: string;
}) {
  const cleanPhone = cleanPhoneNumber(params.mobileNo);
  if (cleanPhone.length !== 10) {
    throw new Error("Customer phone number must be 10 digits");
  }
  const mobileNo = formatMobileForProvider(cleanPhone);

  const loginUrl =
    params.loginUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "divy-ecom.vercel.app";

  const payload: {
    apiInfo: string;
    partyInfo: WhatsAppPartyInfo[];
    login_url: string;
  } = {
    apiInfo: "divy_warranty",
    partyInfo: [{ mobileNo }],
    login_url: loginUrl,
  };

  const res = await postWhatsAppPayload(payload as unknown as Record<string, unknown>);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[WhatsApp warranty] ${res.status} from provider: ${text}`);
    throw new Error(`WhatsApp send failed (${res.status}): ${text}`);
  }
}

/**
 * Send referral invite via VertexSuite WhatsApp.
 * Template variables:
 *   {{1}} = referredToName  (recipient's name)
 *   {{2}} = referredByName  (referrer's name)
 *   {{3}} = referralLink    (dynamic link)
 */
export async function sendReferralWhatsAppMessage(params: {
  referredToPhone: string;
  referredToName: string;
  referredByName: string;
  referralLink: string;
}): Promise<void> {
  const cleaned = cleanPhoneNumber(params.referredToPhone);
  if (cleaned.length !== 10) {
    throw new Error("Phone must be 10 digits");
  }
  const mobileNo = formatMobileForProvider(cleaned);

  const payload = {
    apiInfo: "divy_referal",
    partyInfo: [{ mobileNo }],
    referredTo: params.referredToName,
    referredBy: params.referredByName,
    referralLink: params.referralLink,
  };

  const res = await postWhatsAppPayload(payload as unknown as Record<string, unknown>);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[WhatsApp referral] ${res.status} from provider: ${text}`);
    throw new Error(`WhatsApp referral failed (${res.status}): ${text}`);
  }
}