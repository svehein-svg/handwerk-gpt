import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title =
    searchParams.get("title") || "Handwerker Termin";

  const description =
    searchParams.get("description") || "";

  const now = new Date();

  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  function formatDate(date: Date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HandwerkerGPT//DE
BEGIN:VEVENT
UID:${Date.now()}@handwerkergpt.de
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR
`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": 'attachment; filename="termin.ics"',
    },
  });
}