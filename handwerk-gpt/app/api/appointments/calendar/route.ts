import { NextResponse } from "next/server";

const TIMEZONE = "Europe/Berlin";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatFloatingDateForIcs(dateString: string) {
  const cleaned = dateString.trim();

  const match = cleaned.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (!match) return null;

  const [, year, month, day, hour, minute, second = "00"] = match;

  return `${year}${month}${day}T${hour}${minute}${second}`;
}

function addOneHourToFloatingDate(dateString: string) {
  const cleaned = dateString.trim();

  const match = cleaned.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (!match) return null;

  const [, year, month, day, hour, minute, second = "00"] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  date.setHours(date.getHours() + 1);

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(
    date.getSeconds()
  )}`;
}

function formatDateStampForIcs(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") || "Handwerker Termin";
  const description = searchParams.get("description") || "";
  const appointmentDate = searchParams.get("appointment_date");

  if (!appointmentDate) {
    return NextResponse.json(
      {
        error: "appointment_date fehlt im Kalenderlink",
      },
      { status: 400 }
    );
  }

  const start = formatFloatingDateForIcs(appointmentDate);
  const end = addOneHourToFloatingDate(appointmentDate);

  if (!start || !end) {
    return NextResponse.json(
      {
        error: "appointment_date ist ungültig",
        appointmentDate,
      },
      { status: 400 }
    );
  }

  const safeTitle = escapeIcsText(title);
  const safeDescription = escapeIcsText(description);
  const now = new Date();

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HandwerkerGPT//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@handwerkergpt.de
DTSTAMP:${formatDateStampForIcs(now)}
DTSTART;TZID=${TIMEZONE}:${start}
DTEND;TZID=${TIMEZONE}:${end}
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
