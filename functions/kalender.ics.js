// GET /kalender.ics → agenda met de data die je in /beheer handmatig hebt dichtgezet.
// Importeer deze link in Booking.com en Airbnb, dan gaan die data daar ook dicht.
// (Bewust alleen de handmatige blokkades, zodat er geen kringloop met Airbnb/Booking ontstaat.)
const fmt = d => d.replace(/-/g, '');
export async function onRequestGet({ env }) {
  const blocks = env.PRICES ? (await env.PRICES.get('blocks', 'json')) || [] : [];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const events = blocks.map((b, i) => [
    'BEGIN:VEVENT',
    `UID:casaserena-${b.start}-${b.end}-${i}@casaserenacalpe.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${fmt(b.start)}`,
    `DTEND;VALUE=DATE:${fmt(b.end)}`,
    'SUMMARY:Niet beschikbaar (Casa Serena)',
    'END:VEVENT',
  ].join('\r\n'));
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Casa Serena//Beschikbaarheid//NL', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR', ''].join('\r\n');
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' } });
}
