import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// WEBHOOK VERIFY
// ========================================

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

// ========================================
// WHATSAPP WEBHOOK
// ========================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("INCOMING WHATSAPP:", JSON.stringify(body, null, 2));

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({
        success: true,
        message: "No WhatsApp message found",
      });
    }

    const phone = message.from || "";
    const text = message.text?.body || "";

    if (!text.trim()) {
      return NextResponse.json({
        success: true,
        message: "No text message found",
      });
    }

    // ========================================
    // GEWERK ERKENNEN
    // ========================================

    let trade = "Allgemein";
    const lower = text.toLowerCase();

    if (
      lower.includes("strom") ||
      lower.includes("licht") ||
      lower.includes("sicherung") ||
      lower.includes("steckdose")
    ) {
      trade = "Elektriker";
    } else if (
      lower.includes("wasser") ||
      lower.includes("heizung") ||
      lower.includes("bad")
    ) {
      trade = "Heizung";
    } else if (lower.includes("dach")) {
      trade = "Dachdecker";
    } else if (
      lower.includes("tür") ||
      lower.includes("fenster")
    ) {
      trade = "Schreiner";
    }

    // ========================================
    // SUPABASE INSERT
    // passend zu deiner leads-Tabelle:
    // customer_name, phone, email, city,
    // raw_message, trade, summary, urgency, status
    // ========================================

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          customer_name: "WhatsApp Kunde",
          phone: phone,
          email: "",
          city: "",
          raw_message: text,
          trade: trade,
          summary: text,
          urgency: "hoch",
          status: "neu",
        },
      ])
      .select();

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("WHATSAPP LEAD SAVED:", data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}