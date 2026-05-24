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
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      const res = await fetch("/api/leads");

      if (!res.ok) {
        throw new Error("Fehler beim Laden");
      }

      const data = await res.json();
      setLeads(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // AUTOMATISCHE KI-ANTWORT
  function createReply(lead: Lead) {
    const customer =
      lead.customer_name || "Guten Tag";

    const missingFields: string[] = [];

    // Telefonnummer prüfen
    if (
      !lead.phone ||
      lead.phone.trim() === ""
    ) {
      missingFields.push("Telefonnummer");
    }

    // E-Mail prüfen
    if (
      !lead.email ||
      lead.email.trim() === ""
    ) {
      missingFields.push("E-Mail-Adresse");
    }

    // Ort prüfen
    if (
      !lead.city ||
      lead.city.trim() === ""
    ) {
      missingFields.push("Ort / Adresse");
    }

    // Weitere fehlende Infos
    if (
      lead.missing_info &&
      Array.isArray(lead.missing_info)
    ) {
      lead.missing_info.forEach((info) => {
        if (!missingFields.includes(info)) {
          missingFields.push(info);
        }
      });
    }

    // FEHLENDE INFOS
    if (missingFields.length > 0) {
      return `Hallo ${customer},

vielen Dank für Ihre Anfrage.

Damit wir Ihre Anfrage schneller bearbeiten können, benötigen wir noch folgende Informationen:

${missingFields
  .map((f) => `• ${f}`)
  .join("\n")}

Vielen Dank.

Freundliche Grüße`;
    }

    // KI Antwort verwenden
    if (
      lead.suggested_reply &&
      lead.suggested_reply.trim() !== ""
    ) {
      return lead.suggested_reply;
    }

    // Standardantwort
    return `Hallo ${customer},

vielen Dank für Ihre Anfrage bezüglich ${
      lead.trade || "Ihres Anliegens"
    }.

Wir melden uns schnellstmöglich bei Ihnen.

Freundliche Grüße`;
  }

  // WHATSAPP LINK
  function createWhatsAppLink(
    lead: Lead
  ) {
    let phone = lead.phone || "";

    phone = phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone =
        "49" + phone.substring(1);
    }

    const message = createReply(lead);

    return `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;
  }

  // MAIL LINK
  function createMailLink(lead: Lead) {
    const subject = `Ihre Anfrage - ${
      lead.trade ||
      "Handwerkeranfrage"
    }`;

    return `mailto:${
      lead.email
    }?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      createReply(lead)
    )}`;
  }

  // ERLEDIGT
  async function markAsDone(id: number) {
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          status: "erledigt",
        }),
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id
            ? {
                ...lead,
                status: "erledigt",
              }
            : lead
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  const activeLeads = leads.filter(
    (lead) =>
      lead.status !== "erledigt"
  );

  const doneLeads = leads.filter(
    (lead) =>
      lead.status === "erledigt"
  );

  return (
    <main className="page">
      <section className="hero">
        <div className="heroContent">
          <div>
            <div className="badge">
              ✨ KI Anfrage Assistent
            </div>

            <h1>Handwerker Dashboard</h1>

            <p>
              KI Antworten,
              WhatsApp Integration und
              Kundenverwaltung.
            </p>
          </div>

          <a
            className="newButton"
            href="/"
          >
            + Neue Anfrage
          </a>
        </div>
      </section>

      <section className="content">
        <div className="statsGrid">
          <StatCard
            icon="📨"
            title="Anfragen"
            value={activeLeads.length}
          />

          <StatCard
            icon="⚡"
            title="Dringend"
            value={
              activeLeads.filter(
                (l) =>
                  l.urgency?.toLowerCase() ===
                  "hoch"
              ).length
            }
          />

          <StatCard
            icon="✅"
            title="Erledigt"
            value={doneLeads.length}
          />

          <StatCard
            icon="📅"
            title="Heute"
            value={
              leads.filter((lead) => {
                if (
                  !lead.created_at
                )
                  return false;

                return (
                  new Date(
                    lead.created_at
                  ).toDateString() ===
                  new Date().toDateString()
                );
              }).length
            }
          />
        </div>

        {loading && (
          <div className="messageCard">
            Lade Daten...
          </div>
        )}

        {error && (
          <div className="errorCard">
            {error}
          </div>
        )}

        {!loading &&
          activeLeads.map((lead) => (
            <div
              className="leadCard"
              key={lead.id}
            >
              <div className="leadHeader">
                <div className="avatar">
                  {lead.customer_name?.charAt(
                    0
                  ) || "?"}
                </div>

                <div className="leadInfo">
                  <h2>
                    {lead.customer_name ||
                      "Unbekannter Kunde"}
                  </h2>

                  <div className="subInfo">
                    📍{" "}
                    {lead.city ||
                      "Kein Ort"}
                  </div>
                </div>

                <div className="urgency">
                  {lead.urgency ||
                    "normal"}
                </div>
              </div>

              <div className="grid">
                <InfoBlock
                  title="Gewerk"
                  value={
                    lead.trade || "-"
                  }
                />

                <InfoBlock
                  title="Zusammenfassung"
                  value={
                    lead.summary || "-"
                  }
                />

                <InfoBlock
                  title="Telefon"
                  value={
                    lead.phone || "-"
                  }
                />
              </div>

              <div className="messageBox">
                <div className="messageTitle">
                  KI Antwortvorschlag
                </div>

                <div className="messageText">
                  {createReply(lead)}
                </div>
              </div>

              <div className="actions">
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="callButton"
                  >
                    📞 Anrufen
                  </a>
                )}

                {lead.phone && (
                  <a
                    href={createWhatsAppLink(
                      lead
                    )}
                    target="_blank"
                    className="whatsappButton"
                  >
                    💬 WhatsApp senden
                  </a>
                )}

                {lead.email && (
                  <a
                    href={createMailLink(
                      lead
                    )}
                    className="mailButton"
                  >
                    ✉️ E-Mail senden
                  </a>
                )}

                <button
                  onClick={() =>
                    markAsDone(lead.id)
                  }
                  className="doneButton"
                >
                  ✅ Erledigt
                </button>
              </div>
            </div>
          ))}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f3f6fb;
          font-family: Arial,
            sans-serif;
        }

        .hero {
          background: linear-gradient(
            135deg,
            #081224,
            #123c80
          );
          padding: 40px 20px 120px;
          color: white;
        }

        .heroContent {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .badge {
          display: inline-block;
          background: #145cff;
          padding: 10px 16px;
          border-radius: 14px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 54px;
          margin: 0;
        }

        p {
          font-size: 20px;
          opacity: 0.9;
        }

        .newButton {
          background: #145cff;
          color: white;
          padding: 18px 28px;
          border-radius: 18px;
          text-decoration: none;
          font-weight: bold;
        }

        .content {
          max-width: 1200px;
          margin: -70px auto 0;
          padding: 0 20px 50px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(220px, 1fr)
            );
          gap: 20px;
          margin-bottom: 30px;
        }

        .statCard {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 8px 20px
            rgba(0, 0, 0, 0.06);
        }

        .statIcon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .statTitle {
          color: #64748b;
          font-weight: bold;
        }

        .statValue {
          font-size: 40px;
          font-weight: bold;
          margin-top: 10px;
        }

        .leadCard {
          background: white;
          border-radius: 30px;
          padding: 28px;
          margin-bottom: 26px;
          box-shadow: 0 10px 30px
            rgba(0, 0, 0, 0.06);
        }

        .leadHeader {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #e7efff;
          color: #145cff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
        }

        .leadInfo {
          flex: 1;
        }

        .leadInfo h2 {
          margin: 0;
          font-size: 28px;
        }

        .subInfo {
          color: #64748b;
          margin-top: 6px;
        }

        .urgency {
          background: #fee2e2;
          color: #dc2626;
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: bold;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(240px, 1fr)
            );
          gap: 20px;
        }

        .infoBlock {
          background: #f8fafc;
          border-radius: 20px;
          padding: 20px;
        }

        .infoTitle {
          font-size: 13px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .infoValue {
          font-size: 18px;
          font-weight: bold;
          color: #0f172a;
        }

        .messageBox {
          background: #eff6ff;
          border-radius: 22px;
          padding: 24px;
          margin-top: 24px;
        }

        .messageTitle {
          font-weight: bold;
          margin-bottom: 12px;
          color: #145cff;
        }

        .messageText {
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .actions {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(180px, 1fr)
            );
          gap: 16px;
          margin-top: 26px;
        }

        .callButton,
        .whatsappButton,
        .mailButton,
        .doneButton {
          border: none;
          border-radius: 18px;
          padding: 18px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
        }

        .callButton {
          background: #111827;
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
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .errorCard {
          background: #fee2e2;
          color: #b91c1c;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 38px;
          }

          .heroContent {
            flex-direction: column;
            align-items: flex-start;
          }

          .newButton {
            width: 100%;
            text-align: center;
          }

          .leadHeader {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="statCard">
      <div className="statIcon">
        {icon}
      </div>

      <div className="statTitle">
        {title}
      </div>

      <div className="statValue">
        {value}
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="infoBlock">
      <div className="infoTitle">
        {title}
      </div>

      <div className="infoValue">
        {value}
      </div>
    </div>
  );
}