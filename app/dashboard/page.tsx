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

    const interval = setInterval(() => {
      loadLeads();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function loadLeads() {
    try {
      const res = await fetch("/api/leads", {
        cache: "no-store",
      });

      const data = await res.json();

      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsDone(id: number) {
    try {
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

      await loadLeads();
    } catch (err) {
      console.error(err);
    }
  }

  const activeLeads = leads.filter(
    (lead) => lead.status !== "erledigt"
  );

  const doneLeads = leads.filter(
    (lead) => lead.status === "erledigt"
  );

  return (
    <main className="page">
      <div className="header">
        <div>
          <h1>Handwerker Dashboard</h1>
          <p>WhatsApp + KI Anfrage Assistent</p>
        </div>

        <button onClick={loadLeads} className="refreshButton">
          Aktualisieren
        </button>
      </div>

      <div className="stats">
        <div className="card">
          <div className="label">Offen</div>
          <div className="value">{activeLeads.length}</div>
        </div>

        <div className="card">
          <div className="label">Erledigt</div>
          <div className="value">{doneLeads.length}</div>
        </div>

        <div className="card">
          <div className="label">Gesamt</div>
          <div className="value">{leads.length}</div>
        </div>
      </div>

      {loading && (
        <div className="empty">
          Lade Daten...
        </div>
      )}

      {!loading && activeLeads.length === 0 && (
        <div className="empty">
          Keine offenen Leads vorhanden.
        </div>
      )}

      <div className="leadList">
        {activeLeads.map((lead) => (
          <div className="leadCard" key={lead.id}>
            <div className="topRow">
              <div>
                <h2>
                  {lead.customer_name || "Unbekannter Kunde"}
                </h2>

                <div className="small">
                  📞 {lead.phone || "-"}
                </div>

                <div className="small">
                  📍 {lead.city || "Kein Ort"}
                </div>
              </div>

              <div className="urgency">
                {lead.urgency || "normal"}
              </div>
            </div>

            <div className="box">
              <div className="title">
                Nachricht
              </div>

              <div>
                {lead.summary || lead.raw_message || "-"}
              </div>
            </div>

            <div className="actions">
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone}`}
                  target="_blank"
                  className="whatsapp"
                >
                  WhatsApp
                </a>
              )}

              <button
                onClick={() => markAsDone(lead.id)}
                className="done"
              >
                Erledigt
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #eef3f9;
          padding: 40px;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        h1 {
          margin: 0;
          font-size: 44px;
        }

        p {
          margin-top: 8px;
          color: #475569;
        }

        .refreshButton {
          background: #145cff;
          color: white;
          border: none;
          padding: 14px 22px;
          border-radius: 14px;
          font-weight: bold;
          cursor: pointer;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card {
          background: white;
          padding: 24px;
          border-radius: 22px;
        }

        .label {
          color: #64748b;
          margin-bottom: 12px;
        }

        .value {
          font-size: 42px;
          font-weight: bold;
        }

        .leadList {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .leadCard {
          background: white;
          border-radius: 24px;
          padding: 28px;
        }

        .topRow {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .small {
          margin-top: 6px;
          color: #475569;
        }

        .urgency {
          background: #fee2e2;
          color: #dc2626;
          padding: 10px 16px;
          border-radius: 999px;
          height: fit-content;
          font-weight: bold;
        }

        .box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 18px;
          margin-bottom: 24px;
        }

        .title {
          font-weight: bold;
          margin-bottom: 10px;
        }

        .actions {
          display: flex;
          gap: 14px;
        }

        .whatsapp,
        .done {
          border: none;
          padding: 14px 20px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: bold;
          cursor: pointer;
        }

        .whatsapp {
          background: #22c55e;
          color: white;
        }

        .done {
          background: #0f172a;
          color: white;
        }

        .empty {
          background: white;
          padding: 30px;
          border-radius: 22px;
        }

        @media (max-width: 768px) {
          .page {
            padding: 20px;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          h1 {
            font-size: 34px;
          }

          .topRow {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}