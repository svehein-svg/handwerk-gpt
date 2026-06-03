import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID und Status erforderlich." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("lead_appointments")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    appointment: data,
  });
}