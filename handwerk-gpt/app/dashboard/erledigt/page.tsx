"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: number;
  customer_name: string;
  city: string;
  trade: string;
  summary: string;
  phone: string;
  email: string;
  created_at: string;
  status: string;
};

export default function ErledigtPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();

        const erledigt = data.filter(
          (lead: Lead) =>
            lead.status?.toLowerCase() === "erledigt"
        );

        setLeads(erledigt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white">
              ✅ ARCHIV
            </div>

            <h1 className="text-5xl font-black text-[#0f172a]">
              Erledigte Leads
            </h1>

            <p className="mt-3 text-lg text-slate-500">
              Abgeschlossene Kundenanfragen
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-2xl bg-[#145cff] px-6 py-4 text-lg font-black text-white"
          >
            ← Dashboard
          </a>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            Lade erledigte Leads...
          </div>
        )}

        {!loading && leads.length === 0 && (
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            Keine erledigten Leads vorhanden.
          </div>
        )}

        {!loading && leads.length > 0 && (
          <div className="grid gap-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-[2rem] bg-white p-6 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-[#0f172a]">
                      {lead.customer_name}
                    </h2>

                    <p className="mt-2 text-lg text-slate-500">
                      📍 {lead.city}
                    </p>
                  </div>

                  <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
                    ✅ Erledigt
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Gewerk
                    </p>

                    <p className="mt-2 text-lg font-black text-[#0f172a]">
                      {lead.trade || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Zusammenfassung
                    </p>

                    <p className="mt-2 text-lg font-bold text-[#0f172a]">
                      {lead.summary || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-slate-700">
                      📞 {lead.phone || "Keine Telefonnummer"}
                    </p>

                    <p className="mt-2 font-bold text-slate-700">
                      ✉️ {lead.email || "Keine E-Mail"}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-slate-400">
                    {lead.created_at
                      ? new Date(
                          lead.created_at
                        ).toLocaleString("de-DE")
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}