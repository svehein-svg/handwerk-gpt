import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// GET -> Webhook Verifizierung
// ========================================
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("GET Webhook Verify:", {
    mode,
    token,
    challenge,
  });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

// ========================================
// POST -> Eingehende WhatsApp Nachrichten
// ========================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      "Incoming WhatsApp:",
      JSON.stringify(body, null, 2)
    );

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("Keine Nachricht gefunden");
      return NextResponse.json({
        success: true,
        message: "No message",
      });
    }

    const phone =
      message.from || "Unbekannt";

    const text =
      message.text?.body || "";

    console.log("Neue Nachricht:", {
      phone,
      text,
    });

    // ========================================
    // KI Gewerk-Erkennung
    // ========================================

    let gewerk = "Unklar";

    const lower = text.toLowerCase();

    if (
      lower.includes("strom") ||
      lower.includes("licht") ||
      lower.includes("steckdose")
    ) {
      gewerk = "Elektriker";
    }

    if (
      lower.includes("wasser") ||
      lower.includes("heizung") ||
      lower.includes("rohr")
    ) {
      gewerk = "Sanitär";
    }

    if (
      lower.includes("dach") ||
      lower.includes("ziegel")
    ) {
      gewerk = "Dachdecker";
    }

    if (
      lower.includes("tür") ||
      lower.includes("fenster")
    ) {
      gewerk = "Schreiner";
    }

    // ========================================
    // In Supabase speichern
    // ========================================

    const { error } = await supabase
      .from("requests")
      .insert([
        {
          customer_name: "WhatsApp Kunde",
          phone,
          email: "",
          description: text,
          trade: gewerk,
          urgency: "hoch",
          status: "neu",
        },
      ]);

    if (error) {
      console.error("Supabase Fehler:", error);

      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      );
    }

    console.log("Erfolgreich gespeichert");

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("POST Fehler:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}