import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    routeWorks: true,
    id: params.id,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("leads")
      .update({
        status: "erledigt",
      })
      .eq("id", params.id)
      .select();

    if (error) {
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
      updated: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}