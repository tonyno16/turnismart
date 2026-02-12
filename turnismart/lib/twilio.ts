import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

let client: Twilio.Twilio | null = null;

export function getTwilioClient(): Twilio.Twilio | null {
  if (!accountSid || !authToken) return null;
  if (!client) client = Twilio(accountSid, authToken);
  return client;
}

export function isWhatsAppConfigured(): boolean {
  return !!(accountSid && authToken && whatsappFrom);
}

/** Normalize phone to E.164 for WhatsApp (e.g. +393331234567) */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("39") && digits.length >= 10) {
    return `+${digits}`;
  }
  if (digits.length >= 9 && digits.length <= 11) {
    return `+39${digits}`;
  }
  return `+${digits}`;
}

export type SendWhatsAppResult =
  | { ok: true; sid: string }
  | { ok: false; error: string };

export async function sendWhatsApp(
  to: string,
  body: string
): Promise<SendWhatsAppResult> {
  const c = getTwilioClient();
  if (!c) return { ok: false, error: "Twilio non configurato" };
  if (!whatsappFrom) return { ok: false, error: "TWILIO_WHATSAPP_FROM mancante" };

  try {
    const toFormatted = to.startsWith("+") ? to : normalizePhoneForWhatsApp(to);
    const toWhatsApp = toFormatted.startsWith("whatsapp:")
      ? toFormatted
      : `whatsapp:${toFormatted}`;
    const fromWhatsApp = whatsappFrom.startsWith("whatsapp:")
      ? whatsappFrom
      : `whatsapp:${whatsappFrom}`;

    const msg = await c.messages.create({
      body,
      from: fromWhatsApp,
      to: toWhatsApp,
    });
    return { ok: true, sid: msg.sid };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore Twilio",
    };
  }
}
