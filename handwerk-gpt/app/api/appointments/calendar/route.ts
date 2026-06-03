import { NextResponse } from "next/server";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDateForIcs(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") || "Handwerker Termin";
  const description = searchParams.get("description") || "";
  const appointmentDate = searchParams.get("appointment_date");

  const now = new Date();

  let start: Date;

  if (appointmentDate) {
    start = new Date(appointmentDate);
  } else {
    start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  if (Number.isNaN(start.getTime())) {
    start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const safeTitle = escapeIcsText(title);
  const safeDescription = escapeIcsText(description);

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HandwerkerGPT//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@handwerkergpt.de
DTSTAMP:${formatDateForIcs(now)}
DTSTART:${formatDateForIcs(start)}
DTEND:${formatDateForIcs(end)}
SUMMARY:${safeTitle}
DESCRIPTION:${safeDescription}
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="termin.ics"',
    },
  });
}