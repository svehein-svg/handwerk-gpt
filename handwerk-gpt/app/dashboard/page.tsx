
"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: number;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  raw_message: string;
  trade: string;
  summary: string;
  urgency: string;
  site_visit_needed: boolean;
  missing_info: string[];
  suggested_reply: string;
  status: string;
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/leads");

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Leads konnten nicht geladen werden.");
        }

        const data = await res.json();
        setLeads(data);
      } catch (err: any) {
        setError(err.message || "Fehler beim Laden.");
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  function urgencyBadge(value: string) {
    const v = (value || "").toLowerCase();

    if (v === "hoch") {
      return "bg-red-100 text-red-700";
    }

    if (v === "mittel") {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-green-100 text-green-700";
  }

  function statusBadge(value: string) {
    const v = (value || "").toLowerCase();

    if (v === "neu") {
      return "bg-blue-100 text-blue-700";
    }

    if (v === "in bearbeitung") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (v === "erledigt") {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">
              Alle gespeicherten Handwerker-Leads
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl bg-black px-5 py-3 text-white shadow hover:bg-gray-800"
          >
            Neue Anfrage
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          {loading && (
            <p className="text-lg font-medium text-gray-700">
              Lade Leads...
            </p>
          )}

          {error && (
            <div className="rounded-xl bg-red-100 p-4 text-base font-medium text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && leads.length === 0 && (
            <p className="text-lg text-gray-500">
              Noch keine Leads vorhanden.
            </p>
          )}

          {!loading && !error && leads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Datum</th>
                    <th className="px-4 py-3">Kunde</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">Ort</th>
                    <th className="px-4 py-3">Gewerk</th>
                    <th className="px-4 py-3">Dringlichkeit</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Zusammenfassung</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="cursor-pointer rounded-2xl bg-gray-50 shadow-sm transition hover:bg-gray-100"
                      onClick={() => {
                        window.location.href = `/dashboard/${lead.id}`;
                      }}
                    >
                      <td className="px-4 py-4 font-semibold">{lead.id}</td>

                      <td className="px-4 py-4 text-sm">
                        {new Date(lead.created_at).toLocaleString("de-DE")}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold">
                          {lead.customer_name || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.email || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {lead.phone || "-"}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {lead.city || "-"}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {lead.trade || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${urgencyBadge(
                            lead.urgency
                          )}`}
                        >
                          {lead.urgency || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm leading-relaxed text-gray-700">
                        {lead.summary || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
