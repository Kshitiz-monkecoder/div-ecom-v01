type WhatsAppPartyInfo = {
  mobileNo: string;
};

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
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

  const res = await fetch(getWhatsAppApiUrl(), {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res;
}

export async function sendOrderCreatedWhatsAppMessage(params: {
  mobileNo: string;
  loginUrl?: string;
}) {
  const cleanPhone = cleanPhoneNumber(params.mobileNo);
  if (cleanPhone.length !== 10) {
    throw new Error("Customer phone number must be 10 digits");
  }

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
    partyInfo: [{ mobileNo: cleanPhone }],
    login_url: loginUrl,
  };

  const res = await postWhatsAppPayload(payload as unknown as Record<string, unknown>);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WhatsApp send failed (${res.status}): ${text}`);
  }
}

