import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Du bist ein Assistent für Handwerksbetriebe in Deutschland.

Analysiere die Anfrage und antworte ausschließlich als valides JSON.

Wichtig:
- Wenn Name, Telefon, E-Mail oder Ort bereits vom Formular mitgegeben wurden,
  dann übernimm diese Werte.
- Wenn sie leer sind, dann lasse sie leer.
- Erfinde keine Kontaktdaten.

Antworte exakt in diesem Format:

{
  "customer_name": "",
  "phone": "",
  "email": "",
  "city": "",
  "raw_message": "",
  "trade": "",
  "summary": "",
  "urgency": "",
  "site_visit_needed": true,
  "missing_info": [],
  "suggested_reply": "",
  "status": "neu"
}
`,
        },
        {
          role: "user",
          content: `
Formulardaten:
Name: ${body.customer_name || ""}
Telefon: ${body.phone || ""}
E-Mail: ${body.email || ""}
Ort: ${body.city || ""}

Kundenanfrage:
${body.message || ""}
`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: any;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err: any) {
      return NextResponse.json(
        {
          error: "GPT hat kein valides JSON geliefert",
          raw,
          cleaned,
        },
        { status: 500 }
      );
    }

    const finalData = {
      customer_name: parsed.customer_name || body.customer_name || "",
      phone: parsed.phone || body.phone || "",
      email: parsed.email || body.email || "",
      city: parsed.city || body.city || "",
      raw_message: body.message || "",
      trade: parsed.trade || "",
      summary: parsed.summary || "",
      urgency: parsed.urgency || "",
      site_visit_needed:
        typeof parsed.site_visit_needed === "boolean"
          ? parsed.site_visit_needed
          : false,
     missing_info: [] as string[],
      suggested_reply: parsed.suggested_reply || "",
      status: parsed.status || "neu",
    };

    if (!finalData.customer_name) finalData.missing_info.push("Kundenname");
    if (!finalData.phone) finalData.missing_info.push("Telefonnummer");
    if (!finalData.email) finalData.missing_info.push("E-Mail");
    if (!finalData.city) finalData.missing_info.push("Stadt");

    const supabaseRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(finalData),
      }
    );

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();

      return NextResponse.json(
        {
          error: "Supabase Fehler",
          details: errText,
          payload: finalData,
        },
        { status: 500 }
      );
    }

    const saved = await supabaseRes.json();

    return NextResponse.json(finalData);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Analyse Fehler",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

