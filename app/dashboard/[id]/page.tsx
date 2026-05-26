"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLead() {
      try {
        const res = await fetch(`/api/leads/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Fehler");
        } else {
          setLead(data);
        }
      } catch (e: any) {
        setError(e.message);
      }

      setLoading(false);
    }

    loadLead();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-10 text-lg font-medium">
        Lade Anfrage...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg font-medium">
          {error}
        </div>
      </div>
    );
  }

  const missing = getMissingInfos(lead);

  return (
    <div className="p-10 max-w-6xl mx-auto text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Einzelansicht einer Anfrage
        </h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black"
        >
          Zurück zum Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="space-y-4 text-base">

          <Info label="ID" value={lead.id} />
          <Info label="Erstellt am" value={formatDate(lead.created_at)} />
          <Info label="Kunde" value={lead.customer_name || "-"} />
          <Info label="Telefon" value={lead.phone || "-"} />
          <Info label="E-Mail" value={lead.email || "-"} />
          <Info label="Ort" value={lead.city || "-"} />
          <Info label="Gewerk" value={lead.trade || "-"} />
          <Info label="Dringlichkeit" value={lead.urgency || "-"} />
          <Info label="Status" value={lead.status || "-"} />
          <Info
            label="Vor-Ort-Besuch nötig"
            value={lead.site_visit_needed ? "Ja" : "Nein"}
          />

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <Box title="Zusammenfassung">
            {lead.summary}
          </Box>

          <Box title="Originalnachricht">
            {lead.raw_message}
          </Box>

          <Box title="Fehlende Infos">

            {missing.length === 0 && (
              <div className="text-green-600 font-semibold">
                Keine fehlenden Informationen
              </div>
            )}

            {missing.map((i: string) => (
              <div key={i}>• {i}</div>
            ))}

          </Box>

          <Box title="Antwortvorschlag">
            {lead.suggested_reply}

            <button
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              onClick={() =>
                navigator.clipboard.writeText(
                  lead.suggested_reply
                )
              }
            >
              Antwort kopieren
            </button>
          </Box>

        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">
        {label}
      </div>
      <div className="font-semibold text-lg">
        {value}
      </div>
    </div>
  );
}

function Box({ title, children }: any) {
  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm">
      <div className="font-semibold text-lg mb-2">
        {title}
      </div>

      <div className="text-gray-800 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function getMissingInfos(lead: any) {
  const missing = [];

  if (!lead.customer_name) missing.push("Kundenname");
  if (!lead.phone) missing.push("Telefonnummer");
  if (!lead.email) missing.push("E-Mail");
  if (!lead.city) missing.push("Stadt");

  return missing;
}

function formatDate(date: string) {
  if (!date) return "-";
  return new Date(date).toLocaleString("de-DE");
}
