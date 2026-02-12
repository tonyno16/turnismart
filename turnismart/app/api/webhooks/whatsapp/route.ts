import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import twilio from "twilio";
import { db } from "@/lib/db";
import { notifications } from "@/drizzle/schema";

const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function POST(request: Request) {
  if (!authToken) {
    return NextResponse.json({ error: "Twilio non configurato" }, { status: 500 });
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  const url = new URL(request.url);
  const fullUrl = `${url.origin}${url.pathname}${url.search}`;

  let body: Record<string, string>;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = (await request.json()) as Record<string, string>;
  } else {
    const formData = await request.formData();
    body = Object.fromEntries(
      [...formData.entries()].map(([k, v]) => [k, String(v)])
    ) as Record<string, string>;
  }

  const isValid = twilio.validateRequest(authToken, signature, fullUrl, body);
  if (!isValid) {
    return NextResponse.json({ error: "Signature invalid" }, { status: 403 });
  }

  const messageSid = body.MessageSid;
  const messageStatus = body.MessageStatus;

  if (!messageSid || !messageStatus) {
    return NextResponse.json({ received: true });
  }

  const statusMap: Record<string, "delivered" | "failed" | "sent"> = {
    delivered: "delivered",
    failed: "failed",
    sent: "sent",
    undelivered: "failed",
  };

  const newStatus = statusMap[messageStatus];
  if (newStatus) {
    await db
      .update(notifications)
      .set({
        delivery_status: newStatus,
        sent_at: newStatus === "sent" ? new Date() : undefined,
      })
      .where(eq(notifications.external_id, messageSid));
  }

  return NextResponse.json({ received: true });
}
