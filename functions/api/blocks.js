// Handmatig dichtgezette periodes (alleen voor de eigenaar, via /beheer)
// Opslag: KV "PRICES", sleutel "blocks" → [{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' (vertrekdag, exclusief), note }]

const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');

async function authorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  return (request.headers.get('Authorization') || '') === `Bearer ${env.ADMIN_PASSWORD}`;
}

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return Response.json({ ok: false, error: 'Onjuist wachtwoord.' }, { status: 401 });
  const blocks = env.PRICES ? (await env.PRICES.get('blocks', 'json')) || [] : [];
  return Response.json({ ok: true, blocks }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) {
    await new Promise(r => setTimeout(r, 800));
    return Response.json({ ok: false, error: 'Onjuist wachtwoord.' }, { status: 401 });
  }
  if (!env.PRICES) return Response.json({ ok: false, error: 'De opslag (KV-koppeling "PRICES") is niet ingesteld.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const list = Array.isArray(body?.blocks) ? body.blocks : null;
  if (!list) return Response.json({ ok: false, error: 'Ongeldige gegevens.' }, { status: 400 });
  const today = new Date().toISOString().slice(0, 10);
  const blocks = list
    .slice(0, 200)
    .map(b => ({ start: String(b.start || ''), end: String(b.end || ''), note: String(b.note || '').trim().slice(0, 80) }))
    .filter(b => isDate(b.start) && isDate(b.end) && b.end > b.start && b.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
  await env.PRICES.put('blocks', JSON.stringify(blocks));
  return Response.json({ ok: true, blocks });
}
