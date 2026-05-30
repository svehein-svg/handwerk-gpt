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
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
Du bist ein erfahrener KI-Assistent für Handwerksbetriebe in Deutschland.

Deine Aufgabe:
Analysiere Kundenanfragen intelligent und praxisnah für einen Handwerksbetrieb.

Wichtig:
- Antworte ausschließlich als valides JSON.
- Nutze alle vorhandenen Informationen bestmöglich.
- Frage nicht unnötig nach, wenn die Anfrage bereits verständlich ist.
- Erstelle eine konkrete, hilfreiche Antwort an den Kunden.
- Wenn Informationen fehlen, nenne sie nur in "missing_info".
- Die "suggested_reply" soll natürlich, freundlich und professionell klingen.
- Erfinde keine Kontaktdaten.
- Wenn Name, Telefon, E-Mail oder Ort vom Formular mitgegeben wurden, übernimm sie.

Bewerte:
- trade = passendes Gewerk, z.B. Sanitär, Heizung, Elektro, Dachdecker, Maler, Schreiner, Gartenbau, Allgemein
- urgency = niedrig, mittel oder hoch
- site_visit_needed = true, wenn wahrscheinlich ein Vor-Ort-Termin nötig ist
- summary = kurze intelligente Zusammenfassung der Anfrage
- suggested_reply = fertige Antwort, die der Betrieb direkt an den Kunden senden könnte

Antworte exakt in diesem JSON-Format:

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

    const missingInfo: string[] = Array.isArray(parsed.missing_info)
      ? parsed.missing_info
      : [];

    const finalData = {
      customer_name: body.customer_name || parsed.customer_name || "",
      phone: body.phone || parsed.phone || "",
      email: body.email || parsed.email || "",
      city: body.city || parsed.city || "",
      raw_message: body.message || "",
      trade: parsed.trade || "Allgemein",
      summary: parsed.summary || "",
      urgency: parsed.urgency || "mittel",
      site_visit_needed:
        typeof parsed.site_visit_needed === "boolean"
          ? parsed.site_visit_needed
          : true,
      missing_info: missingInfo,
      suggested_reply:
        parsed.suggested_reply ||
        "Vielen Dank für Ihre Anfrage. Wir prüfen Ihr Anliegen und melden uns zeitnah bei Ihnen.",
      status: parsed.status || "neu",
    };

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