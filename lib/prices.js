import defaults from '../public/data/prices.json';

// Prijzen staan in Cloudflare KV (binding PRICES, sleutel "config") zodat je ze via /beheer kunt aanpassen.
// Zonder KV-koppeling wordt public/data/prices.json gebruikt.
export async function loadPrices(env) {
  if (env.PRICES) {
    try {
      const stored = await env.PRICES.get('config', 'json');
      if (stored) return stored;
    } catch { /* val terug op standaard */ }
  }
  return defaults;
}
