"use server";

import { createHash, timingSafeEqual } from "node:crypto";

export async function sendWhatsAppTest(_previous: string, form: FormData) {
  const password = process.env.WHATSAPP_TEST_PASSWORD;
  const supplied = form.get("password");
  const digest = (value: string) => createHash("sha256").update(value).digest();

  if (!password || password.length < 24 || typeof supplied !== "string" ||
      !timingSafeEqual(digest(password), digest(supplied))) {
    return "Versand nicht autorisiert.";
  }

  const token = process.env.WHATSAPP_TEST_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_TEST_PHONE_NUMBER_ID ?? "";
  const recipient = process.env.WHATSAPP_TEST_RECIPIENT ?? "";
  if (!token || !/^\d+$/.test(phoneId) || !/^[1-9]\d{6,14}$/.test(recipient)) {
    return "Die WhatsApp-Testkonfiguration fehlt oder ist ungültig.";
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: { name: "hello_world", language: { code: "en_US" } },
      }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (!response.ok || !result.messages?.[0]?.id) {
      const code = result.error?.code;
      return typeof code === "number"
        ? `Meta hat den Versand abgelehnt (Fehler ${code}).`
        : `Meta hat den Versand nicht bestätigt (HTTP ${response.status}).`;
    }
    return "Meta hat die Nachricht angenommen. Prüfe die Zustellung in WhatsApp.";
  } catch {
    return "Keine Versandbestätigung erhalten. Prüfe WhatsApp vor einem erneuten Versuch.";
  }
}
