"use client";

import { useState } from "react";

export default function AnfragePage() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [trade, setTrade] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!phone.trim()) {
      setError("Bitte geben Sie eine Telefonnummer ein.");
      return;
    }

    if (!email.trim()) {
      setError("Bitte geben Sie eine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          phone,
          email,
          city,
          trade,
          message,
        }),
      });

      if (!res.ok) {
        throw new Error("Die Anfrage konnte nicht gesendet werden.");
      }

      setSuccess(true);
      setCustomerName("");
      setPhone("");
      setEmail("");
      setCity("");
      setTrade("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="badge">✨ KI Anfrage Assistent</div>
        <h1>Ihre Anfrage</h1>
        <p>
          Beschreiben Sie kurz Ihr Anliegen. Wir analysieren die Anfrage und
          melden uns schnellstmöglich.
        </p>
      </section>

      <section className="card">
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Max Mustermann"
              required
            />
          </label>

          <label>
            Telefonnummer *
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="z. B. 0176 12345678"
              required
            />
          </label>

          <label>
            E-Mail-Adresse *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@example.de"
              required
            />
          </label>

          <label>
            Ort / Adresse
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="z. B. Freiburg"
            />
          </label>

          <label>
            Gewerk
            <input
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              placeholder="z. B. Heizung, Sanitär, Elektro"
            />
          </label>

          <label>
            Ihre Nachricht
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Beschreiben Sie kurz, worum es geht..."
              required
            />
          </label>

          {error && <div className="error">{error}</div>}
          {success && (
            <div className="success">
              Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Wird gesendet..." : "Anfrage senden"}
          </button>
        </form>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f3f6fb;
          font-family: Arial, sans-serif;
          padding: 30px 20px;
        }

        .hero {
          max-width: 760px;
          margin: 0 auto 30px;
          text-align: center;
        }

        .badge {
          display: inline-block;
          background: #145cff;
          color: white;
          padding: 10px 16px;
          border-radius: 14px;
          font-weight: bold;
          margin-bottom: 18px;
        }

        h1 {
          font-size: 46px;
          margin: 0 0 14px;
          color: #0f172a;
        }

        p {
          color: #64748b;
          font-size: 18px;
          line-height: 1.5;
        }

        .card {
          max-width: 760px;
          margin: 0 auto;
          background: white;
          border-radius: 30px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        form {
          display: grid;
          gap: 18px;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: bold;
          color: #0f172a;
        }

        input,
        textarea {
          width: 100%;
          border: 1px solid #dbe3ef;
          border-radius: 16px;
          padding: 16px;
          font-size: 16px;
          outline: none;
          background: #f8fafc;
        }

        textarea {
          min-height: 150px;
          resize: vertical;
        }

        input:focus,
        textarea:focus {
          border-color: #145cff;
          background: white;
        }

        button {
          margin-top: 10px;
          border: none;
          border-radius: 18px;
          padding: 18px;
          background: #145cff;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 14px 16px;
          border-radius: 14px;
          font-weight: bold;
        }

        .success {
          background: #dcfce7;
          color: #166534;
          padding: 14px 16px;
          border-radius: 14px;
          font-weight: bold;
        }

        @media (max-width: 700px) {
          h1 {
            font-size: 36px;
          }

          .card {
            padding: 22px;
            border-radius: 24px;
          }
        }
      `}</style>
    </main>
  );
}