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
    return new NextResponse(challenge, {
      status: 200,
    });
  }

  return new NextResponse("Verification failed", {
    status: 403,
  });
}

// ========================================
// WHATSAPP WEBHOOK
// ========================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      "INCOMING WHATSAPP:",
      JSON.stringify(body, null, 2)
    );

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({
        success: true,
        message: "No message found",
      });
    }

    const phone = message.from || "";
    const text = message.text?.body || "";

    // ========================================
    // GEWERK ERKENNUNG
    // ========================================

    let trade = "Unklar";

    const lower = text.toLowerCase();

    if (
      lower.includes("strom") ||
      lower.includes("licht") ||
      lower.includes("sicherung") ||
      lower.includes("steckdose")
    ) {
      trade = "Elektriker";
    }

    if (
      lower.includes("wasser") ||
      lower.includes("heizung") ||
      lower.includes("bad")
    ) {
      trade = "Heizung";
    }

    if (
      lower.includes("dach")
    ) {
      trade = "Dachdecker";
    }

    if (
      lower.includes("tür") ||
      lower.includes("fenster")
    ) {
      trade = "Schreiner";
    }

    // ========================================
    // SUPABASE INSERT
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
        {
          status: 500,
        }
      );
    }

    console.log("SUCCESS:", data);

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
      {
        status: 500,
      }
    );
  }
}