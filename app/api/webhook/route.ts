// app/api/webhook/route.ts

import { NextRequest } from "next/server";

const VERIFY_TOKEN = "mein-whatsapp-token";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("VERIFY CALL:", mode, token, challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("WEBHOOK EVENT:", JSON.stringify(body, null, 2));
  return new Response("ok", { status: 200 });
}