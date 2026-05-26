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

  console.log("VERIFY REQUEST:", {
    mode,
    token,
    challenge,
  });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", {
    status: 403,
  });
}

// ========================================
// WHATSAPP MESSAGES
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
      console.log("NO MESSAGE FOUND");

      return NextResponse.json({
        success: true,
        message: "No message",
      });
    }

    const phone = message.from || "Unbekannt";

    const text = message.text?.body || "";

    console.log("NEW MESSAGE:", {
      phone,
      text,
    });

    // ========================================
    // GEWERK ERKENNUNG
    // ========================================

    let trade = "Unklar";

    const lower = text.toLowerCase();

    if (
      lower.includes("strom") ||
      lower.includes("licht") ||
      lower.includes("steckdose") ||
      lower.includes("sicherung")
    ) {
      trade = "Elektriker";
    }

    if (
      lower.includes("wasser") ||
      lower.includes("heizung") ||
      lower.includes("rohr") ||
      lower.includes("bad")
    ) {
      trade = "Sanitär";
    }

    if (
      lower.includes("dach") ||
      lower.includes("ziegel")
    ) {
      trade = "Dachdecker";
    }

    if (
      lower.includes("tür") ||
      lower.includes("fenster") ||
      lower.includes("holz")
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
          description: text,
          trade: trade,
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
        {
          status: 500,
        }
      );
    }

    console.log("SUCCESSFULLY SAVED:", data);

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