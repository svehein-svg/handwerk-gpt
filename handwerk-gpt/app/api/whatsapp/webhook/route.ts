import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "mein_verify_token";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("WHATSAPP GET VERIFIZIERUNG");
  console.log("mode:", mode);
  console.log("token:", token);
  console.log("challenge:", challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIZIERUNG ERFOLGREICH");
    return new Response(challenge || "", {
      status: 200,
    });
  }

  console.log("WEBHOOK VERIFIZIERUNG FEHLGESCHLAGEN");

  return new Response("Forbidden", {
    status: 403,
  });
}

export async function POST(req: NextRequest) {
  console.log("=================================");
  console.log("WHATSAPP POST ANGEKOMMEN");
  console.log("=================================");

  try {
    const body = await req.json();

    console.log("ROHER WHATSAPP BODY:");
    console.log(JSON.stringify(body, null, 2));

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) {
      console.log("KEINE MESSAGE IM WEBHOOK GEFUNDEN");
      return NextResponse.json({
        success: true,
        message: "Kein messages-Objekt vorhanden",
      });
    }

    const from = message.from || "";
    const text = message.text?.body || "";
    const name = contact?.profile?.name || from;

    console.log("NEUE WHATSAPP NACHRICHT");
    console.log("Name:", name);
    console.log("Von:", from);
    console.log("Text:", text);

    const newLead = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      customer_name: name,
      phone: from,
      email: "",
      city: "",
      raw_message: text,
      trade: "WhatsApp Anfrage",
      summary: text || "Neue WhatsApp Anfrage",
      urgency: "normal",
      site_visit_needed: false,
      missing_info: ["E-Mail-Adresse", "Ort / Adresse"],
      suggested_reply: `Hallo ${name},

vielen Dank für Ihre Anfrage.

Wir haben Ihre Nachricht erhalten und melden uns schnellstmöglich zurück.

Freundliche Grüße`,
      status: "neu",
    };

    console.log("ERSTELLTER LEAD:");
    console.log(JSON.stringify(newLead, null, 2));

    return NextResponse.json({
      success: true,
      received: true,
      lead: newLead,
    });
  } catch (error) {
    console.error("WHATSAPP WEBHOOK FEHLER:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Webhook Fehler",
      },
      {
        status: 500,
      }
    );
  }
}