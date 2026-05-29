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
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
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

      if (!res.ok) {
        alert(data.error || "Fehler beim Aktualisieren.");
        return;
      }

      await loadLeads();
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
      alert("Fehler beim Aktualisieren.");
    }
  }

  const activeLeads = leads.filter((lead) => lead.status !== "erledigt");
  const doneLeads = leads.filter((lead) => lead.status === "erledigt");
  const urgentLeads = activeLeads.filter((lead) => lead.urgency === "hoch");

  return (
    <main className="page">
      <section className="hero">
        <div className="badge">✨ KI Anfrage Assistent</div>

        <div className="heroTop">
          <div>
            <h1>Handwerker Dashboard</h1>
            <p>KI Antworten, WhatsApp Integration und Kundenverwaltung.</p>
          </div>

          <button className="newButton">+ Neue Anfrage</button>
        </div>

        <div className="stats">
          <div>
            <div>📨</div>
            <span>Anfragen</span>
            <strong>{activeLeads.length}</strong>
          </div>

          <div>
            <div>⚡</div>
            <span>Dringend</span>
            <strong>{urgentLeads.length}</strong>
          </div>

          <div>
            <div>✅</div>
            <span>Erledigt</span>
            <strong>{doneLeads.length}</strong>
          </div>

          <div>
            <div>🧾</div>
            <span>Heute</span>
            <strong>0</strong>
          </div>
        </div>
      </section>

      <section className="content">
        {loading && <div className="empty">Lade Daten...</div>}

        {!loading && activeLeads.length === 0 && (
          <div className="empty">Keine offenen Anfragen vorhanden.</div>
        )}

        <div className="leadList">
          {activeLeads.map((lead) => (
            <article className="leadCard" key={lead.id}>
              <div className="topRow">
                <div className="avatar">
                  {(lead.customer_name || "K").charAt(0).toUpperCase()}
                </div>

                <div className="customer">
                  <h2>{lead.customer_name || "Unbekannter Kunde"}</h2>
                  <p>📍 {lead.city || "Kein Ort"}</p>
                </div>

                <div className="urgency">{lead.urgency || "normal"}</div>
              </div>

              <div className="infoGrid">
                <div>
                  <span>Gewerk</span>
                  <strong>{lead.trade || "Unklar"}</strong>
                </div>

                <div>
                  <span>Zusammenfassung</span>
                  <strong>{lead.summary || lead.raw_message || "-"}</strong>
                </div>

                <div>
                  <span>Telefon</span>
                  <strong>{lead.phone || "-"}</strong>
                </div>
              </div>

              <div className="answerBox">
                <h3>KI Antwortvorschlag</h3>

                <p>Hallo {lead.customer_name || "Kunde"},</p>

                <p>vielen Dank für Ihre Anfrage.</p>

                <p>
                  Damit wir Ihre Anfrage schneller bearbeiten können, benötigen
                  wir noch folgende Informationen:
                </p>

                <ul>
                  {!lead.email && <li>E-Mail-Adresse</li>}
                  {!lead.city && <li>Ort / Adresse</li>}
                </ul>

                <p>Vielen Dank.</p>

                <p>Freundliche Grüße</p>
              </div>

              <div className="actions">
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="call">
                    📞 Anrufen
                  </a>
                )}

                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone}`}
                    target="_blank"
                    className="whatsapp"
                  >
                    💬 WhatsApp senden
                  </a>
                )}

                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="email">
                    ✉️ E-Mail senden
                  </a>
                )}

                <button onClick={() => markAsDone(lead.id)} className="done">
                  ✅ Erledigt
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #eef3f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #061126;
        }

        .hero {
          background: linear-gradient(120deg, #0b2d6b, #155dfc);
          color: white;
          padding: 42px 7% 34px;
        }

        .badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.16);
          padding: 9px 18px;
          border-radius: 999px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
        }

        h1 {
          margin: 0;
          font-size: 58px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .hero p {
          font-size: 20px;
          margin-top: 18px;
          opacity: 0.95;
        }

        .newButton {
          background: white;
          color: #145cff;
          border: none;
          padding: 18px 30px;
          border-radius: 18px;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
          margin-top: 54px;
          max-width: 980px;
        }

        .stats span {
          display: block;
          margin-top: 8px;
          opacity: 0.9;
        }

        .stats strong {
          display: block;
          margin-top: 6px;
          font-size: 18px;
        }

        .content {
          padding: 34px 7% 60px;
        }

        .leadList {
          display: flex;
          flex-direction: column;
          gap: 28px;
          align-items: center;
        }

        .leadCard {
          width: min(1100px, 100%);
          background: white;
          border-radius: 28px;
          padding: 30px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .topRow {
          display: grid;
          grid-template-columns: 76px 1fr auto;
          gap: 20px;
          align-items: center;
          margin-bottom: 28px;
        }

        .avatar {
          width: 70px;
          height: 70px;
          border-radius: 999px;
          background: #dbeafe;
          color: #155dfc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 900;
        }

        .customer h2 {
          margin: 0;
          font-size: 36px;
          letter-spacing: -1px;
        }

        .customer p {
          margin: 8px 0 0;
          font-weight: 700;
        }

        .urgency {
          background: #fee2e2;
          color: #dc2626;
          padding: 14px 20px;
          border-radius: 999px;
          font-weight: 900;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 28px;
          margin-bottom: 28px;
        }

        .infoGrid span {
          display: block;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .infoGrid strong {
          font-size: 16px;
          font-weight: 500;
        }

        .answerBox {
          background: #e8f2ff;
          border: 1px solid #bfdbfe;
          border-radius: 22px;
          padding: 26px;
          margin-bottom: 28px;
          font-size: 18px;
          line-height: 1.65;
          font-weight: 700;
        }

        .answerBox h3 {
          color: #155dfc;
          margin-top: 0;
          font-size: 24px;
        }

        .actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .actions a,
        .actions button {
          border: none;
          text-decoration: none;
          text-align: center;
          padding: 20px 18px;
          border-radius: 18px;
          font-weight: 900;
          font-size: 18px;
          cursor: pointer;
        }

        .call {
          background: #0f172a;
          color: white;
        }

        .whatsapp {
          background: #22c55e;
          color: white;
        }

        .email {
          background: #155dfc;
          color: white;
        }

        .done {
          background: #e2e8f0;
          color: #0f172a;
        }

        .empty {
          width: min(1100px, 100%);
          margin: 0 auto;
          background: white;
          padding: 34px;
          border-radius: 24px;
          font-weight: 800;
        }

        @media (max-width: 850px) {
          h1 {
            font-size: 40px;
          }

          .heroTop {
            flex-direction: column;
          }

          .stats,
          .infoGrid,
          .actions {
            grid-template-columns: 1fr;
          }

          .topRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}