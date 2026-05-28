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
  site_visit_needed: boolean | null;
  missing_info: string[] | null;
  suggested_reply: string | null;
  status: string | null;
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      if (!res.ok) {
        throw new Error("Fehler beim Laden der Anfragen");
      }

      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  function createReply(lead: Lead) {
    const customer = lead.customer_name || "Guten Tag";
    const missingFields: string[] = [];

    if (!lead.phone || lead.phone.trim() === "") missingFields.push("Telefonnummer");
    if (!lead.email || lead.email.trim() === "") missingFields.push("E-Mail-Adresse");
    if (!lead.city || lead.city.trim() === "") missingFields.push("Ort / Adresse");

    if (lead.missing_info && Array.isArray(lead.missing_info)) {
      lead.missing_info.forEach((info) => {
        if (!missingFields.includes(info)) missingFields.push(info);
      });
    }

    if (missingFields.length > 0) {
      return `Hallo ${customer},

vielen Dank für Ihre Anfrage.

Damit wir Ihre Anfrage schneller bearbeiten können, benötigen wir noch folgende Informationen:

${missingFields.map((f) => `• ${f}`).join("\n")}

Vielen Dank.

Freundliche Grüße`;
    }

    if (lead.suggested_reply && lead.suggested_reply.trim() !== "") {
      return lead.suggested_reply;
    }

    return `Hallo ${customer},

vielen Dank für Ihre Anfrage bezüglich ${lead.trade || "Ihres Anliegens"}.

Wir melden uns schnellstmöglich bei Ihnen.

Freundliche Grüße`;
  }

  function createWhatsAppLink(lead: Lead) {
    let phone = lead.phone || "";
    phone = phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = "49" + phone.substring(1);
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(createReply(lead))}`;
  }

  function createMailLink(lead: Lead) {
    const subject = `Ihre Anfrage - ${lead.trade || "Handwerkeranfrage"}`;

    return `mailto:${lead.email || ""}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(createReply(lead))}`;
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

      if (!res.ok) {
        throw new Error("Fehler beim Aktualisieren");
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status: "erledigt" } : lead
        )
      );

      await loadLeads();
    } catch (err) {
      console.error(err);
    }
  }

  const activeLeads = leads.filter((lead) => lead.status !== "erledigt");
  const doneLeads = leads.filter((lead) => lead.status === "erledigt");

  const todayCount = leads.filter((lead) => {
    if (!lead.created_at) return false;
    return new Date(lead.created_at).toDateString() === new Date().toDateString();
  }).length;

  const urgentCount = activeLeads.filter(
    (lead) => lead.urgency?.toLowerCase() === "hoch"
  ).length;

  return (
    <main className="page">
      <section className="hero">
        <div className="heroContent">
          <div>
            <div className="badge">✨ KI Anfrage Assistent</div>
            <h1>Handwerker Dashboard</h1>
            <p>KI Antworten, WhatsApp Integration und Kundenverwaltung.</p>
          </div>

          <button className="newButton" onClick={loadLeads}>
            Aktualisieren
          </button>
        </div>
      </section>

      <section className="content">
        <div className="statsGrid">
          <StatCard icon="📨" title="Offen" value={activeLeads.length} />
          <StatCard icon="⚡" title="Dringend" value={urgentCount} />
          <StatCard icon="✅" title="Erledigt" value={doneLeads.length} />
          <StatCard icon="📅" title="Heute" value={todayCount} />
        </div>

        {loading && <div className="messageCard">Lade Daten...</div>}
        {error && <div className="errorCard">{error}</div>}

        {!loading && activeLeads.length === 0 && !error && (
          <div className="messageCard">Aktuell keine offenen Anfragen.</div>
        )}

        {!loading &&
          activeLeads.map((lead) => (
            <div className="leadCard" key={lead.id}>
              <div className="leadHeader">
                <div className="avatar">{lead.customer_name?.charAt(0) || "?"}</div>

                <div className="leadInfo">
                  <h2>{lead.customer_name || "Unbekannter Kunde"}</h2>
                  <div className="subInfo">📍 {lead.city || "Kein Ort"}</div>
                </div>

                <div
                  className={
                    lead.urgency?.toLowerCase() === "hoch"
                      ? "urgency urgencyHigh"
                      : "urgency"
                  }
                >
                  {lead.urgency || "normal"}
                </div>
              </div>

              <div className="grid">
                <InfoBlock title="Gewerk" value={lead.trade || "-"} />
                <InfoBlock title="Zusammenfassung" value={lead.summary || "-"} />
                <InfoBlock title="Telefon" value={lead.phone || "-"} />
              </div>

              <div className="messageBox">
                <div className="messageTitle">KI Antwortvorschlag</div>
                <div className="messageText">{createReply(lead)}</div>
              </div>

              <div className="actions">
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="callButton">
                    📞 Anrufen
                  </a>
                )}

                {lead.phone && (
                  <a href={createWhatsAppLink(lead)} target="_blank" className="whatsappButton">
                    💬 WhatsApp senden
                  </a>
                )}

                {lead.email && (
                  <a href={createMailLink(lead)} className="mailButton">
                    ✉️ E-Mail senden
                  </a>
                )}

                <button onClick={() => markAsDone(lead.id)} className="doneButton">
                  ✅ Erledigt
                </button>
              </div>
            </div>
          ))}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #eef3f9;
          font-family: Inter, Arial, sans-serif;
          color: #0f172a;
        }

        .hero {
          background: linear-gradient(135deg, #07152d, #145cff);
          padding: 48px 24px 130px;
          color: white;
        }

        .heroContent {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.14);
          padding: 12px 18px;
          border-radius: 16px;
          font-weight: 800;
          margin-bottom: 24px;
          font-size: 16px;
        }

        h1 {
          font-size: 72px;
          line-height: 1;
          margin: 0;
          font-weight: 850;
          letter-spacing: -2px;
        }

        p {
          font-size: 24px;
          opacity: 0.96;
          margin-top: 18px;
          max-width: 760px;
          line-height: 1.5;
        }

        .newButton {
          background: white;
          color: #145cff;
          padding: 20px 30px;
          border-radius: 22px;
          border: none;
          font-weight: 850;
          font-size: 18px;
          cursor: pointer;
        }

        .content {
          max-width: 1280px;
          margin: -80px auto 0;
          padding: 0 20px 60px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 22px;
          margin-bottom: 34px;
        }

        .statCard {
          background: white;
          border-radius: 28px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          border: 1px solid #dbe3ee;
        }

        .statIcon {
          font-size: 34px;
          margin-bottom: 14px;
        }

        .statTitle {
          color: #334155;
          font-size: 17px;
          font-weight: 800;
        }

        .statValue {
          font-size: 46px;
          font-weight: 850;
          margin-top: 12px;
        }

        .leadCard {
          background: white;
          border-radius: 34px;
          padding: 34px;
          margin-bottom: 30px;
          border: 1px solid #dbe3ee;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.09);
        }

        .leadHeader {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-bottom: 28px;
        }

        .avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #145cff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 850;
          flex-shrink: 0;
        }

        .leadInfo {
          flex: 1;
        }

        .leadInfo h2 {
          margin: 0;
          font-size: 42px;
          font-weight: 850;
          line-height: 1.1;
        }

        .subInfo {
          color: #334155;
          margin-top: 10px;
          font-size: 19px;
          font-weight: 700;
        }

        .urgency {
          background: #e2e8f0;
          color: #0f172a;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 850;
          font-size: 16px;
          text-transform: lowercase;
        }

        .urgencyHigh {
          background: #fee2e2;
          color: #dc2626;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 22px;
        }

        .infoBlock {
          background: #f8fafc;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #dbe3ee;
        }

        .infoTitle {
          font-size: 14px;
          text-transform: uppercase;
          color: #334155;
          font-weight: 850;
          margin-bottom: 14px;
          letter-spacing: 1px;
        }

        .infoValue {
          font-size: 25px;
          font-weight: 750;
          line-height: 1.5;
        }

        .messageBox {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-radius: 26px;
          padding: 28px;
          margin-top: 28px;
          border: 1px solid #bfdbfe;
        }

        .messageTitle {
          font-weight: 850;
          margin-bottom: 16px;
          color: #145cff;
          font-size: 22px;
        }

        .messageText {
          white-space: pre-wrap;
          line-height: 1.8;
          font-size: 20px;
          font-weight: 550;
        }

        .actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 30px;
        }

        .callButton,
        .whatsappButton,
        .mailButton,
        .doneButton {
          border: none;
          border-radius: 22px;
          padding: 22px;
          font-size: 20px;
          font-weight: 850;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
        }

        .callButton {
          background: #0f172a;
          color: white;
        }

        .whatsappButton {
          background: #22c55e;
          color: white;
        }

        .mailButton {
          background: #145cff;
          color: white;
        }

        .doneButton {
          background: #e2e8f0;
          color: #0f172a;
        }

        .messageCard,
        .errorCard {
          background: white;
          padding: 28px;
          border-radius: 26px;
          margin-bottom: 24px;
          font-size: 20px;
          font-weight: 800;
          border: 1px solid #dbe3ee;
        }

        .errorCard {
          background: #fee2e2;
          color: #b91c1c;
        }

        @media (max-width: 768px) {
          .hero {
            padding: 34px 18px 110px;
          }

          .heroContent {
            flex-direction: column;
            align-items: flex-start;
          }

          h1 {
            font-size: 44px;
          }

          p {
            font-size: 18px;
          }

          .newButton {
            width: 100%;
          }

          .content {
            margin-top: -70px;
            padding: 0 14px 50px;
          }

          .leadCard {
            padding: 24px;
            border-radius: 28px;
          }

          .leadHeader {
            flex-direction: column;
            align-items: flex-start;
          }

          .leadInfo h2 {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({ icon, title, value }: { icon: string; title: string; value: number }) {
  return (
    <div className="statCard">
      <div className="statIcon">{icon}</div>
      <div className="statTitle">{title}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="infoBlock">
      <div className="infoTitle">{title}</div>
      <div className="infoValue">{value}</div>
    </div>
  );
}