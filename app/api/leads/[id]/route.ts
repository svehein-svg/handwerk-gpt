async function markAsDone(id: number) {
  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "erledigt",
      }),
    });

    const data = await res.json();

    console.log("PATCH Antwort:", data);

    if (!res.ok) {
      alert("Fehler beim Speichern: " + JSON.stringify(data));
      return;
    }

    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  } catch (err: any) {
    alert("Fehler: " + err.message);
  }
}