import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("WhatsApp Webhook POST:", JSON.stringify(body, null, 2));

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) {
      return NextResponse.json({ ok: true, message: "No WhatsApp message" });
    }

    const from = message.from || "";
    const customerName = contact?.profile?.name || "WhatsApp Kontakt";

    const text =
      message?.text?.body ||
      message?.button?.text ||
      message?.interactive?.button_reply?.title ||
      message?.interactive?.list_reply?.title ||
      "";

    const leadData = {
      customer_name: customerName,
      phone: from,
      email: "",
      message: text,
      status: "neu",
      urgency: "hoch",
      source: "whatsapp",
    };

    console.log("Speichere WhatsApp Lead:", leadData);

    const { data, error } = await supabase
      .from("leads")
      .insert([leadData])
      .select();

    if (error) {
      console.error("Supabase Insert Fehler:", error);

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("WhatsApp Lead gespeichert:", data);

    return NextResponse.json({
      ok: true,
      lead: data?.[0] || null,
    });
  } catch (error) {
    console.error("WhatsApp Webhook Fehler:", error);

    return NextResponse.json(
      { ok: false, error: "Webhook error" },
      { status: 500 }
    );
  }
}