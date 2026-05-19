
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

  const handleChange = (e: any) => {
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
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        KI-Anfrageassistent für Handwerksbetriebe
      </h1>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Kundenanfrage eingeben
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Name
              </label>
              <input
                name="customer_name"
                onChange={handleChange}
                className="w-full border border-gray-400 p-2 rounded text-gray-900 placeholder-gray-500"
                placeholder="Max Mustermann"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Telefon
              </label>
              <input
                name="phone"
                onChange={handleChange}
                className="w-full border border-gray-400 p-2 rounded text-gray-900 placeholder-gray-500"
                placeholder="017612345678"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                E-Mail
              </label>
              <input
                name="email"
                onChange={handleChange}
                className="w-full border border-gray-400 p-2 rounded text-gray-900 placeholder-gray-500"
                placeholder="kunde@email.de"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Ort
              </label>
              <input
                name="city"
                onChange={handleChange}
                className="w-full border border-gray-400 p-2 rounded text-gray-900 placeholder-gray-500"
                placeholder="Freiburg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Anfrage / Beschreibung
              </label>
              <textarea
                name="message"
                onChange={handleChange}
                rows={5}
                className="w-full border border-gray-400 p-2 rounded text-gray-900 placeholder-gray-500"
                placeholder="Der Strom im ganzen Haus ist ausgefallen..."
              />
            </div>

            <button
              onClick={analyze}
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black"
            >
              {loading ? "Analysiere..." : "Anfrage analysieren"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Analyse
          </h2>

          {!result && (
            <div className="text-gray-500">
              Hier erscheint die strukturierte Analyse
            </div>
          )}

          {result && (
            <div className="space-y-2 text-gray-900">
              <div>
                <b>Kunde:</b> {result.customer_name}
              </div>

              <div>
                <b>Telefon:</b> {result.phone}
              </div>

              <div>
                <b>E-Mail:</b> {result.email}
              </div>

              <div>
                <b>Ort:</b> {result.city}
              </div>

              <div>
                <b>Gewerk:</b> {result.trade}
              </div>

              <div>
                <b>Zusammenfassung:</b> {result.summary}
              </div>

              <div>
                <b>Dringlichkeit:</b> {result.urgency}
              </div>

              <div>
                <b>Vor Ort nötig:</b>{" "}
                {result.site_visit_needed ? "Ja" : "Nein"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
