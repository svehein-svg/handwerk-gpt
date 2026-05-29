"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: number;
  created_at: string;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  raw_message: string | null;
  trade: string | null;
  summary: string | null;
  urgency: string | null;
  status: string | null;
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadLeads() {
    const res = await fetch("/api/leads", { cache: "no-store" });
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function markAsDone(id: number) {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status: "erledigt",
      }),
    });

    const data = await res.json();
    console.log("PATCH RESULT:", data);

    if (!res.ok) {
      alert(data.error || "Fehler beim Aktualisieren");
      return;
    }

    await loadLeads();
  }

  const activeLeads = leads.filter((lead) => lead.status !== "erledigt");

  return (
    <main className="page">
      <div className="leadList">
        {loading && <div>Lade Daten...</div>}

        {activeLeads.map((lead) => (
          <div className="leadCard" key={lead.id}>
            <h2>{lead.customer_name || "Unbekannter Kunde"}</h2>
            <p>📍 {lead.city || "Kein Ort"}</p>
            <p>Gewerk: {lead.trade || "-"}</p>
            <p>Telefon: {lead.phone || "-"}</p>
            <p>{lead.summary || lead.raw_message || "-"}</p>

            <button onClick={() => markAsDone(lead.id)}>
              ✅ Erledigt
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}