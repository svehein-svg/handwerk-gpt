import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "mein_verify_token";

// TEMPORÄRER SPEICHER
let leads: any[] = [];

// GET → WEBHOOK VERIFIZIERUNG
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {
    return new Response(challenge, {
      status: 200,
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}

// POST → WHATSAPP NACHRICHT EMPFANGEN
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      "WhatsApp Webhook:",
      JSON.stringify(body, null, 2)
    );

    const message =
      body?.entry?.[0]?.changes?.[0]?.value
        ?.messages?.[0];

    if (message) {
      const from = message.from;

      const text =
        message.text?.body || "";

      console.log("Neue Nachricht:");
      console.log("Von:", from);
      console.log("Text:", text);

      // LEAD ERSTELLEN
      const newLead = {
        id: Date.now(),

        created_at:
          new Date().toISOString(),

        customer_name: from,

        phone: from,

        email: "",

        city: "",

        raw_message: text,

        trade: "WhatsApp Anfrage",

        summary: text,

        urgency: "normal",

        site_visit_needed: false,

        missing_info: [
          "E-Mail-Adresse",
          "Ort / Adresse",
        ],

        suggested_reply: `Hallo,

vielen Dank für Ihre Anfrage.

Wir haben Ihre Nachricht erhalten und melden uns schnellstmöglich zurück.

Freundliche Grüße`,

        status: "neu",
      };

      // SPEICHERN
      leads.unshift(newLead);

      console.log(
        "Lead gespeichert:",
        newLead
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Webhook Fehler",
      },
      {
        status: 500,
      }
    );
  }
}