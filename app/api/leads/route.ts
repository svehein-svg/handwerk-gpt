import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/leads Fehler:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID und Status erforderlich.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/leads Fehler:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      lead: data,
    });
  } catch (err: any) {
    console.error("PATCH /api/leads Exception:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Fehler beim Aktualisieren.",
      },
      { status: 500 }
    );
  }
}