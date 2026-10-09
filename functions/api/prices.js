import { loadPrices } from '../../lib/prices.js';
import { sanitizeConfig } from '../../public/js/pricing.js';

// GET  /api/prices  → huidige prijzen (openbaar, voor de kalender)
export async function onRequestGet({ env }) {
  const cfg = await loadPrices(env);
  return Response.json(cfg, { headers: { 'Cache-Control': 'no-store' } });
}

// POST /api/prices  → prijzen opslaan (alleen met wachtwoord, vanaf /beheer)
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'ADMIN_PASSWORD is nog niet ingesteld in Cloudflare.' }, { status: 500 });
  }
  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
    await new Promise(r => setTimeout(r, 800)); // vertraagt raden
    return Response.json({ ok: false, error: 'Onjuist wachtwoord.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ ok: false, error: 'Ongeldige gegevens.' }, { status: 400 });

  // Alleen wachtwoord controleren (bij inloggen)
  if (body.checkOnly) return Response.json({ ok: true });

  if (!env.PRICES) {
    return Response.json({ ok: false, error: 'De prijsopslag (KV-koppeling "PRICES") is nog niet ingesteld in Cloudflare.' }, { status: 500 });
  }
  const cfg = sanitizeConfig(body);
  await env.PRICES.put('config', JSON.stringify(cfg));
  return Response.json({ ok: true, config: cfg });
}
