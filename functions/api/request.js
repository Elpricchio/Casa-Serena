import { loadBlockedRanges, overlaps } from '../../lib/ical.js';

// POST /api/request  →  stuurt een boekingsverzoek per e-mail naar de eigenaar (via Resend)
//
// Benodigde omgevingsvariabelen (Cloudflare Pages → Settings → Variables and Secrets):
//   RESEND_API_KEY   API-sleutel van resend.com (gratis: 3.000 mails/maand)
//   OWNER_EMAIL      jouw e-mailadres (bij gebruik van onboarding@resend.dev moet dit
//                    het adres zijn waarmee je bij Resend bent ingelogd)
//   FROM_EMAIL       optioneel, bv. "Casa Serena <boeking@casaserenacalpe.com>" zodra je
//                    domein in Resend is geverifieerd. Dan krijgt de gast ook een bevestiging.

const MAX_GUESTS = 6;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00Z'));
const nightsBetween = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
const fmt = (d, lang) => new Date(d + 'T00:00:00Z').toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-NL', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function bad(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

async function sendMail(env, payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Ongeldig verzoek');
  }

  // Simpele spambescherming: verborgen veld moet leeg blijven en het formulier mag niet binnen 3 sec. verstuurd zijn
  if (body.website) return Response.json({ ok: true });
  if (body.startedAt && Date.now() - Number(body.startedAt) < 3000) return Response.json({ ok: true });

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 200);
  const phone = String(body.phone || '').trim().slice(0, 50);
  const message = String(body.message || '').trim().slice(0, 3000);
  const lang = body.lang === 'en' ? 'en' : 'nl';
  const adults = parseInt(body.adults, 10) || 0;
  const children = parseInt(body.children, 10) || 0;
  const { checkIn, checkOut } = body;

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Vul je naam en een geldig e-mailadres in');
  if (!isDate(checkIn) || !isDate(checkOut) || checkOut <= checkIn) return bad('Kies geldige aankomst- en vertrekdata');
  const today = new Date().toISOString().slice(0, 10);
  if (checkIn < today) return bad('De aankomstdatum ligt in het verleden');
  if (adults < 1 || adults + children > MAX_GUESTS) return bad(`Maximaal ${MAX_GUESTS} gasten`);

  // Controleer nogmaals of de periode vrij is
  try {
    const { ranges } = await loadBlockedRanges(env);
    if (overlaps(ranges, checkIn, checkOut)) return bad('Deze periode is helaas (deels) al bezet', 409);
  } catch {
    // Kalender niet bereikbaar: verzoek toch doorsturen, de eigenaar controleert handmatig
  }

  if (!env.RESEND_API_KEY || !env.OWNER_EMAIL) return bad('E-mail is nog niet ingesteld op de server', 500);

  const nights = nightsBetween(checkIn, checkOut);
  const rows = [
    ['Naam', name],
    ['E-mail', email],
    ['Telefoon', phone || '—'],
    ['Aankomst', fmt(checkIn, 'nl')],
    ['Vertrek', fmt(checkOut, 'nl')],
    ['Nachten', nights],
    ['Volwassenen', adults],
    ['Kinderen', children],
    ['Taal', lang.toUpperCase()],
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#2b2622">
      <h2 style="margin:0 0 12px">Nieuw boekingsverzoek – Casa Serena</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows.map(([k, v]) => `<tr><td style="color:#7a6f64">${k}</td><td><strong>${esc(v)}</strong></td></tr>`).join('')}
      </table>
      <p style="margin-top:16px;color:#7a6f64">Bericht:</p>
      <p style="white-space:pre-wrap">${esc(message) || '—'}</p>
      <p style="margin-top:20px;font-size:13px;color:#7a6f64">Beantwoord deze e-mail om direct de gast te mailen. Vergeet de data niet te blokkeren in Airbnb en Booking.com zodra de boeking rond is.</p>
    </div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nBericht:\n${message || '—'}`;

  const from = env.FROM_EMAIL || 'Casa Serena <onboarding@resend.dev>';
  try {
    await sendMail(env, {
      from,
      to: [env.OWNER_EMAIL],
      reply_to: email,
      subject: `Boekingsverzoek ${checkIn} → ${checkOut} (${nights} nachten) – ${name}`,
      html,
      text,
    });

    // Bevestiging naar de gast: alleen mogelijk met een eigen, geverifieerd afzenderdomein
    if (env.FROM_EMAIL) {
      const en = lang === 'en';
      await sendMail(env, {
        from,
        to: [email],
        reply_to: env.OWNER_EMAIL,
        subject: en ? 'We received your request – Casa Serena, Calpe' : 'We hebben je aanvraag ontvangen – Casa Serena, Calpe',
        text: en
          ? `Hi ${name},\n\nThank you for your interest in Casa Serena! We received your request for ${fmt(checkIn, 'en')} – ${fmt(checkOut, 'en')} (${nights} nights, ${adults + children} guests) and will get back to you as soon as possible, usually within 24 hours.\n\nThis is not yet a confirmed booking.\n\nWarm regards,\nJeanetta – Casa Serena`
          : `Hoi ${name},\n\nBedankt voor je interesse in Casa Serena! We hebben je aanvraag voor ${fmt(checkIn, 'nl')} t/m ${fmt(checkOut, 'nl')} (${nights} nachten, ${adults + children} gasten) ontvangen en nemen zo snel mogelijk contact met je op, meestal binnen 24 uur.\n\nLet op: dit is nog geen definitieve boeking.\n\nHartelijke groet,\nJeanetta – Casa Serena`,
      }).catch(() => {});
    }
  } catch (err) {
    return bad('Versturen mislukt, probeer het later opnieuw of mail ons direct', 502);
  }

  return Response.json({ ok: true });
}
