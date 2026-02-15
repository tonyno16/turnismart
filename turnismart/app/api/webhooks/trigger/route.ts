import { NextResponse } from "next/server";
import { webhooks, WebhookError } from "@trigger.dev/sdk/v3";

/** Trigger.dev webhook per callback su run status e deployment alerts. */
export async function POST(request: Request) {
  const secret = process.env.TRIGGER_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "TRIGGER_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  try {
    await webhooks.constructEvent(request, secret);
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof WebhookError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
