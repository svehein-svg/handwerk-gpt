"use client";

import { useActionState } from "react";
import { sendWhatsAppTest } from "./actions";

export default function WhatsAppTestPage() {
  const [status, action, pending] = useActionState(sendWhatsAppTest, "");

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold">WhatsApp-Testversand</h1>
      <form action={action} className="mt-6 grid gap-3">
        <label htmlFor="password">Testpasswort</label>
        <input id="password" name="password" type="password" required
          autoComplete="current-password" className="rounded border px-3 py-2" />
        <button disabled={pending} className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50">
          {pending ? "Wird gesendet …" : "WhatsApp-Testnachricht senden"}
        </button>
      </form>
      <p role="status" className="mt-4">{status}</p>
    </main>
  );
}
