import { loadBlockedRanges } from '../../lib/ical.js';

// GET /api/availability  →  { updated, ranges: [{start, end}] }
export async function onRequestGet({ env }) {
  try {
    const data = await loadBlockedRanges(env);
    return Response.json(
      { updated: new Date().toISOString(), ...data },
      { headers: { 'Cache-Control': 'public, max-age=120' } }
    );
  } catch (err) {
    return Response.json({ error: 'Kalender kon niet worden geladen' }, { status: 502 });
  }
}
