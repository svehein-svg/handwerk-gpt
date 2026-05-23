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

  async function loadLeads() {
    try {
      const res = await fetch("/api/leads");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Leads konnten nicht geladen werden.");
      }

      const data = await res.json();

      // NUR offene Leads anzeigen
      const filtered = data.filter(
        (lead: Lead) =>
          lead.status?.toLowerCase() !== "erledigt"
      );

      setLeads(filtered);
    } catch (err: any) {
      setError(err.message || "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function updateStatus(id: number, status: string) {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error("Status konnte nicht geändert werden.");
      }

      // SOFORT aus Dashboard entfernen
      setLeads((prev) =>
        prev.filter((lead) => lead.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren.");
    }
  }

  function mailtoLink(lead: Lead) {
    const subject = `Ihre Anfrage${
      lead.trade ? ` - ${lead.trade}` : ""
    }`;

    const body =
      lead.suggested_reply ||
      `Hallo ${lead.customer_name || ""},

vielen Dank für Ihre Anfrage.

Wir melden uns schnellstmöglich bei Ihnen.

Viele Grüße`;

    return `mailto:${lead.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  const urgentCount = leads.filter(
    (lead) => lead.urgency?.toLowerCase() === "hoch"
  ).length;

  const newCount = leads.filter(
    (lead) => lead.status?.toLowerCase() === "neu"
  ).length;

  return (
    <>
      <main className="dashboard-page">
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <div className="app-badge">
                ✨ KI-ANFRAGE-ASSISTENT
              </div>

              <h1>Dashboard</h1>

              <p>
                Neue Kundenanfragen automatisch analysiert
                und vorbereitet.
              </p>
            </div>

            <a href="/" className="new-button">
              + Neue Anfrage
            </a>
          </div>
        </section>

        <section className="content">
          <div className="container">
            <div className="stats-grid">
              <StatCard
                icon="👥"
                label="Leads"
                value={leads.length}
                sub="Offene Leads"
              />

              <StatCard
                icon="📞"
                label="Dringend"
                value={urgentCount}
                sub="Hohe Priorität"
              />

              <StatCard
                icon="⚡"
                label="Neu"
                value={newCount}
                sub="Neue Anfragen"
              />
            </div>

            {loading && (
              <div className="message-card">
                Lade Leads...
              </div>
            )}

            {error && (
              <div className="message-card error">
                {error}
              </div>
            )}

            {!loading && !error && leads.length === 0 && (
              <div className="message-card">
                Keine offenen Leads vorhanden.
              </div>
            )}

            {!loading && !error && leads.length > 0 && (
              <div className="lead-list">
                {leads.map((lead) => (
                  <article
                    key={lead.id}
                    className="lead-card"
                    onClick={() => {
                      window.location.href = `/dashboard/${lead.id}`;
                    }}
                  >
                    <div className="lead-head">
                      <div className="lead-person">
                        <div className="avatar">
                          {(lead.customer_name || "?").charAt(0)}
                        </div>

                        <div>
                          <h2>
                            {lead.customer_name ||
                              "Unbekannter Kunde"}
                          </h2>

                          <p>
                            📍{" "}
                            {lead.city ||
                              "Kein Ort angegeben"}
                          </p>
                        </div>
                      </div>

                      <div className="priority">
                        ● {lead.urgency || "normal"}
                      </div>
                    </div>

                    <div className="lead-body">
                      <InfoBlock
                        icon="🔧"
                        title="Gewerk"
                        value={lead.trade || "-"}
                      />

                      <InfoBlock
                        icon="📄"
                        title="Zusammenfassung"
                        value={lead.summary || "-"}
                      />

                      <div className="info-block">
                        <div className="info-icon">
                          ☎️
                        </div>

                        <div>
                          <div className="info-title">
                            Kontakt
                          </div>

                          <div className="info-value">
                            {lead.phone ||
                              "Keine Telefonnummer"}
                          </div>

                          <div className="info-value email">
                            {lead.email ||
                              "Keine E-Mail"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lead-footer">
                      <div className="status-row">
                        <span className="status-pill">
                          {lead.status || "neu"}
                        </span>

                        <span className="date-text">
                          {lead.created_at
                            ? new Date(
                                lead.created_at
                              ).toLocaleString("de-DE")
                            : ""}
                        </span>
                      </div>

                      <div className="actions">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="call-button"
                          >
                            📞 Anrufen
                          </a>
                        ) : (
                          <span className="disabled-button">
                            Keine Nummer
                          </span>
                        )}

                        {lead.email ? (
                          <a
                            href={mailtoLink(lead)}
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="mail-button"
                          >
                            ✉️ E-Mail
                          </a>
                        ) : (
                          <span className="disabled-button">
                            Keine Mail
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(
                              lead.id,
                              "erledigt"
                            );
                          }}
                          className="done-button"
                        >
                          ✅ Erledigt
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: #f4f7fb;
          color: #0f172a;
          font-family: Inter, system-ui, sans-serif;
        }

        .container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          background: radial-gradient(
            circle at top right,
            #123b7a 0,
            #071226 45%,
            #050b16 100%
          );

          color: white;
          padding: 34px 22px 125px;
        }

        .hero-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .app-badge {
          display: inline-flex;
          background: #145cff;
          padding: 10px 16px;
          border-radius: 14px;
          font-weight: 900;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 56px;
          font-weight: 950;
          margin: 0;
          color: white;
        }

        .hero p {
          margin-top: 16px;
          color: rgba(255,255,255,0.9);
          font-size: 20px;
        }

        .new-button {
          background: #145cff;
          color: white;
          text-decoration: none;
          padding: 22px 34px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: 900;
          white-space: nowrap;
        }

        .content {
          margin-top: -72px;
          padding: 0 22px 50px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
          margin-bottom: 36px;
        }

        .stat-card {
          background: white;
          border-radius: 26px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 18px;
          box-shadow: 0 20px 50px rgba(15,23,42,0.08);
        }

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .stat-label {
          color: #64748b;
          font-size: 15px;
          font-weight: 700;
        }

        .stat-value {
          font-size: 40px;
          font-weight: 950;
          color: #0f172a;
        }

        .stat-sub {
          color: #94a3b8;
          font-size: 14px;
        }

        .lead-list {
          display: grid;
          gap: 26px;
        }

        .lead-card {
          background: white;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(15,23,42,0.08);
        }

        .lead-head {
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .lead-person {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .avatar {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #e8efff;
          color: #145cff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 950;
        }

        .lead-card h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 950;
        }

        .lead-card p {
          margin-top: 7px;
          color: #64748b;
          font-size: 17px;
        }

        .priority {
          background: #ffe5e7;
          color: #e11d28;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 900;
        }

        .lead-body {
          border-top: 1px solid #e5eaf2;
          border-bottom: 1px solid #e5eaf2;
          display: grid;
          grid-template-columns: 1fr 1.4fr 1.2fr;
        }

        .info-block {
          padding: 28px;
          display: flex;
          gap: 18px;
          border-right: 1px solid #e5eaf2;
        }

        .info-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .info-title {
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .info-value {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .email {
          margin-top: 8px;
          word-break: break-all;
        }

        .lead-footer {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-pill {
          background: #eef4ff;
          color: #145cff;
          padding: 11px 18px;
          border-radius: 999px;
          font-weight: 900;
        }

        .date-text {
          color: #64748b;
          font-weight: 700;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          min-width: 560px;
        }

        .call-button,
        .mail-button,
        .done-button,
        .disabled-button {
          border: 0;
          text-decoration: none;
          text-align: center;
          padding: 17px 24px;
          border-radius: 18px;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .call-button {
          background: #071226;
          color: white;
        }

        .mail-button {
          background: #145cff;
          color: white;
        }

        .done-button {
          background: #16a34a;
          color: white;
        }

        .disabled-button {
          background: #f1f5f9;
          color: #94a3b8;
        }

        .message-card {
          background: white;
          padding: 28px;
          border-radius: 28px;
          font-size: 18px;
          font-weight: 800;
        }

        .error {
          background: #fef2f2;
          color: #b91c1c;
        }

        @media (max-width: 900px) {
          .hero-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          h1 {
            font-size: 42px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .lead-body {
            grid-template-columns: 1fr;
          }

          .lead-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .actions {
            min-width: 0;
            width: 100%;
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <div className="stat-label">
          {label}
        </div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-sub">
          {sub}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="info-block">
      <div className="info-icon">
        {icon}
      </div>

      <div>
        <div className="info-title">
          {title}
        </div>

        <div className="info-value">
          {value}
        </div>
      </div>
    </div>
  );
}