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
        setLeads(await res.json());
      } catch (err: any) {
        setError(err.message || "Fehler beim Laden.");
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  function mailtoLink(lead: Lead) {
    const subject = `Ihre Anfrage${lead.trade ? ` - ${lead.trade}` : ""}`;
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

  const todayCount = leads.filter((lead) => {
    if (!lead.created_at) return false;
    return new Date(lead.created_at).toDateString() === new Date().toDateString();
  }).length;

  return (
    <>
      <main className="dashboard-page">
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <div className="app-badge">✨ KI-ANFRAGE-ASSISTENT</div>
              <h1>Dashboard</h1>
              <p>Neue Kundenanfragen, automatisch analysiert und vorbereitet.</p>
            </div>

            <a href="/" className="new-button">
              + Neue Anfrage
            </a>
          </div>
        </section>

        <section className="content">
          <div className="container">
            <div className="stats-grid">
              <StatCard icon="👥" label="Leads" value={leads.length} sub="Gesamt" />
              <StatCard icon="📞" label="Dringend" value={urgentCount} sub="Hohe Priorität" />
              <StatCard icon="⚡" label="Neu" value={newCount} sub="Ungelesene" />
              <StatCard icon="📅" label="Heute" value={todayCount} sub="Neue Leads" />
            </div>

            {loading && <div className="message-card">Lade Leads...</div>}
            {error && <div className="message-card error">{error}</div>}
            {!loading && !error && leads.length === 0 && (
              <div className="message-card">Noch keine Leads vorhanden.</div>
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
                          <h2>{lead.customer_name || "Unbekannter Kunde"}</h2>
                          <p>📍 {lead.city || "Kein Ort angegeben"}</p>
                        </div>
                      </div>

                      <div className="priority">
                        ● {lead.urgency || "normal"}
                      </div>
                    </div>

                    <div className="lead-body">
                      <InfoBlock icon="🔧" title="Gewerk" value={lead.trade || "-"} />
                      <InfoBlock icon="📄" title="Zusammenfassung" value={lead.summary || "-"} />

                      <div className="info-block">
                        <div className="info-icon">☎️</div>
                        <div>
                          <div className="info-title">Kontakt</div>
                          <div className="info-value">
                            {lead.phone || "Keine Telefonnummer"}
                          </div>
                          <div className="info-value email">
                            {lead.email || "Keine E-Mail"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lead-footer">
                      <div className="status-row">
                        <span className="status-pill">{lead.status || "neu"}</span>
                        <span className="date-text">
                          {lead.created_at
                            ? new Date(lead.created_at).toLocaleString("de-DE")
                            : "Gerade eben"}
                        </span>
                      </div>

                      <div className="actions">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="call-button"
                          >
                            📞 Anrufen
                          </a>
                        ) : (
                          <span className="disabled-button">Keine Nummer</span>
                        )}

                        {lead.email ? (
                          <a
                            href={mailtoLink(lead)}
                            onClick={(e) => e.stopPropagation()}
                            className="mail-button"
                          >
                            ✉️ E-Mail
                          </a>
                        ) : (
                          <span className="disabled-button">Keine Mail</span>
                        )}
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
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          background: radial-gradient(circle at top right, #123b7a 0, #071226 45%, #050b16 100%);
          color: white;
          padding: 34px 22px 125px;
        }

        .hero-inner {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
        }

        .app-badge {
          display: inline-flex;
          background: #145cff;
          color: white;
          font-weight: 900;
          padding: 10px 16px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 12px 30px rgba(21, 93, 252, 0.35);
        }

        h1 {
          font-size: 56px;
          line-height: 1;
          margin: 0;
          color: white;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .hero p {
          margin-top: 18px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 20px;
          font-weight: 500;
        }

        .new-button {
          background: #145cff;
          color: white;
          text-decoration: none;
          font-weight: 900;
          font-size: 19px;
          padding: 22px 34px;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(21, 93, 252, 0.38);
          white-space: nowrap;
        }

        .content {
          margin-top: -72px;
          padding: 0 22px 50px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 36px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5eaf2;
          border-radius: 26px;
          padding: 28px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.09);
          display: flex;
          gap: 18px;
          align-items: center;
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
          color: #475569;
          font-size: 16px;
          font-weight: 800;
        }

        .stat-value {
          color: #0f172a;
          font-size: 40px;
          font-weight: 950;
          line-height: 1.1;
        }

        .stat-sub {
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        .lead-list {
          display: grid;
          gap: 26px;
        }

        .lead-card {
          background: white;
          border: 1px solid #e5eaf2;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
          cursor: pointer;
        }

        .lead-head {
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
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
          color: #0f172a;
          margin: 0;
          font-size: 26px;
          font-weight: 950;
        }

        .lead-card p {
          color: #64748b;
          margin: 7px 0 0;
          font-size: 17px;
          font-weight: 650;
        }

        .priority {
          background: #ffe5e7;
          color: #e11d28;
          font-size: 16px;
          font-weight: 900;
          padding: 12px 18px;
          border-radius: 999px;
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

        .info-block:last-child {
          border-right: 0;
        }

        .info-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          flex-shrink: 0;
        }

        .info-title {
          color: #64748b;
          font-size: 13px;
          text-transform: uppercase;
          font-weight: 950;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }

        .info-value {
          color: #0f172a;
          font-size: 18px;
          font-weight: 850;
          line-height: 1.45;
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
          font-weight: 950;
          padding: 11px 18px;
          border-radius: 999px;
        }

        .date-text {
          color: #64748b;
          font-weight: 700;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          min-width: 390px;
        }

        .call-button,
        .mail-button,
        .disabled-button {
          text-decoration: none;
          text-align: center;
          padding: 17px 24px;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 950;
        }

        .call-button {
          background: #071226;
          color: white;
        }

        .mail-button {
          background: #145cff;
          color: white;
          box-shadow: 0 14px 30px rgba(21, 93, 252, 0.25);
        }

        .disabled-button {
          background: #f1f5f9;
          color: #94a3b8;
        }

        .message-card {
          background: white;
          color: #0f172a;
          padding: 28px;
          border-radius: 28px;
          font-size: 18px;
          font-weight: 800;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }

        .message-card.error {
          background: #fef2f2;
          color: #b91c1c;
        }

        @media (max-width: 800px) {
          .hero {
            padding: 26px 18px 105px;
          }

          .hero-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          h1 {
            font-size: 42px;
          }

          .hero p {
            font-size: 17px;
          }

          .new-button {
            width: 100%;
            text-align: center;
            padding: 18px 24px;
          }

          .content {
            padding: 0 18px 40px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          .stat-card {
            padding: 18px;
          }

          .stat-icon {
            width: 52px;
            height: 52px;
            font-size: 24px;
          }

          .stat-value {
            font-size: 30px;
          }

          .lead-head {
            padding: 22px;
          }

          .avatar {
            width: 56px;
            height: 56px;
            font-size: 24px;
          }

          .lead-card h2 {
            font-size: 22px;
          }

          .priority {
            font-size: 14px;
            padding: 10px 14px;
          }

          .lead-body {
            grid-template-columns: 1fr;
          }

          .info-block {
            border-right: 0;
            border-bottom: 1px solid #e5eaf2;
            padding: 22px;
          }

          .lead-footer {
            padding: 22px;
            flex-direction: column;
            align-items: stretch;
          }

          .status-row {
            justify-content: space-between;
          }

          .actions {
            min-width: 0;
            width: 100%;
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
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
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
      <div className="info-icon">{icon}</div>
      <div>
        <div className="info-title">{title}</div>
        <div className="info-value">{value}</div>
      </div>
    </div>
  );
}