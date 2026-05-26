import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("WhatsApp Webhook GET:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  console.log("Webhook verification failed", {
    receivedToken: token,
    expectedTokenExists: !!VERIFY_TOKEN,
  });

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("WhatsApp Webhook POST received:");
    console.log(JSON.stringify(body, null, 2));

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) {
      return NextResponse.json({ ok: true, message: "No message found" });
    }

    const from = message.from;
    const text =
      message?.text?.body ||
      message?.button?.text ||
      message?.interactive?.button_reply?.title ||
      message?.interactive?.list_reply?.title ||
      "";

    const customerName = contact?.profile?.name || "Unbekannt";

    console.log("Neue WhatsApp Nachricht:", {
      from,
      customerName,
      text,
    });

    return NextResponse.json({
      ok: true,
      received: {
        from,
        customerName,
        text,
      },
    });
  } catch (error) {
    console.error("WhatsApp Webhook POST error:", error);

    return NextResponse.json(
      { ok: false, error: "Webhook error" },
      { status: 500 }
    );
  }
}