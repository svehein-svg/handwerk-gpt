"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const analyze = async () => {
    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <>
      <main className="request-page">
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <div className="app-badge">✨ KI-ANFRAGE-ASSISTENT</div>

              <h1>Kundenanfrage</h1>

              <p>
                Anfrage eingeben, KI analysiert automatisch Gewerk,
                Dringlichkeit und Antwortvorschlag.
              </p>
            </div>

            <a href="/dashboard" className="dashboard-button">
              Dashboard öffnen
            </a>
          </div>
        </section>

        <section className="content">
          <div className="container grid">
            <div className="card">
              <div className="card-header">
                <div className="icon">📝</div>
                <div>
                  <h2>Kundenanfrage eingeben</h2>
                  <p>Kontaktdaten und Beschreibung erfassen</p>
                </div>
              </div>

              <div className="form-grid">
                <Input
                  label="Name"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Max Mustermann"
                />

                <Input
                  label="Telefon"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="017612345678"
                />

                <Input
                  label="E-Mail"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="kunde@email.de"
                />

                <Input
                  label="Ort"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Freiburg"
                />

                <div className="field full">
                  <label>Anfrage / Beschreibung</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Der Strom im ganzen Haus ist ausgefallen..."
                  />
                </div>

                <button onClick={analyze} className="primary-button">
                  {loading ? "Analysiere..." : "Anfrage analysieren"}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="icon">🤖</div>
                <div>
                  <h2>KI-Analyse</h2>
                  <p>Strukturierte Auswertung der Anfrage</p>
                </div>
              </div>

              {!result && (
                <div className="empty-state">
                  <div className="empty-icon">⚡</div>
                  <h3>Noch keine Analyse</h3>
                  <p>
                    Nach dem Klick auf „Anfrage analysieren“ erscheint hier die
                    automatisch vorbereitete Auswertung.
                  </p>
                </div>
              )}

              {result && (
                <div className="analysis-list">
                  <AnalysisItem label="Kunde" value={result.customer_name} />
                  <AnalysisItem label="Telefon" value={result.phone} />
                  <AnalysisItem label="E-Mail" value={result.email} />
                  <AnalysisItem label="Ort" value={result.city} />
                  <AnalysisItem label="Gewerk" value={result.trade} />
                  <AnalysisItem label="Zusammenfassung" value={result.summary} />
                  <AnalysisItem label="Dringlichkeit" value={result.urgency} />
                  <AnalysisItem
                    label="Vor Ort nötig"
                    value={result.site_visit_needed ? "Ja" : "Nein"}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .request-page {
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
          color: rgba(255, 255, 255, 0.9);
          font-size: 20px;
          max-width: 720px;
        }

        .dashboard-button {
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

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 26px;
        }

        .card {
          background: white;
          border-radius: 32px;
          padding: 30px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5eaf2;
        }

        .card-header {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-bottom: 28px;
        }

        .icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 950;
          color: #0f172a;
        }

        .card-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-weight: 650;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        label {
          color: #475569;
          font-size: 14px;
          font-weight: 900;
        }

        input,
        textarea {
          width: 100%;
          border: 1px solid #d8e0ec;
          background: #f8fafc;
          color: #0f172a;
          padding: 16px 18px;
          border-radius: 18px;
          font-size: 16px;
          font-weight: 650;
          outline: none;
        }

        input:focus,
        textarea:focus {
          border-color: #145cff;
          background: white;
          box-shadow: 0 0 0 4px rgba(20, 92, 255, 0.12);
        }

        textarea {
          resize: vertical;
        }

        .primary-button {
          grid-column: 1 / -1;
          border: 0;
          background: #145cff;
          color: white;
          padding: 19px 24px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(21, 93, 252, 0.25);
        }

        .empty-state {
          background: #f8fafc;
          border-radius: 26px;
          padding: 34px;
          text-align: center;
          border: 1px dashed #cbd5e1;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 14px;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 950;
          color: #0f172a;
        }

        .empty-state p {
          margin: 12px 0 0;
          color: #64748b;
          font-weight: 650;
          line-height: 1.5;
        }

        .analysis-list {
          display: grid;
          gap: 14px;
        }

        .analysis-item {
          background: #f8fafc;
          border: 1px solid #e5eaf2;
          border-radius: 20px;
          padding: 18px;
        }

        .analysis-label {
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 950;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .analysis-value {
          color: #0f172a;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.45;
          word-break: break-word;
        }

        @media (max-width: 900px) {
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

          .dashboard-button {
            width: 100%;
            text-align: center;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 22px;
          }
        }
      `}</style>
    </>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function AnalysisItem({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="analysis-item">
      <div className="analysis-label">{label}</div>
      <div className="analysis-value">{value || "-"}</div>
    </div>
  );
}