import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "TurniSmart <onboarding@resend.dev>";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function isResendConfigured(): boolean {
  return !!apiKey;
}

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<SendEmailResult> {
  const c = getResendClient();
  if (!c) return { ok: false, error: "Resend non configurato" };

  try {
    const { data, error } = await c.emails.send({
      from: params.from ?? fromEmail,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? "sent" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Errore Resend",
    };
  }
}
