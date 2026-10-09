// Prijsberekening – gedeeld door de website (browser) en de server (boekingsverzoek).
//
// Config-vorm:
// {
//   currency: "EUR",
//   cleaningFee: 90,            // vaste eindschoonmaak per verblijf (of null)
//   deposit: 300,               // borg, alleen ter informatie (of null)
//   seasons: [ { name, from: "MM-DD", to: "MM-DD", price, minNights } ],   // mag over de jaarwisseling lopen
//   specials: [ { name, from: "YYYY-MM-DD", to: "YYYY-MM-DD", price, minNights } ] // 'to' = laatste nacht (t/m)
// }

const addDay = (s, n = 1) => {
  const d = new Date(s + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function inSeason(season, date) {
  const md = date.slice(5);
  return season.from <= season.to
    ? md >= season.from && md <= season.to
    : md >= season.from || md <= season.to; // loopt over de jaarwisseling
}

// Welke regel (speciale periode gaat vóór seizoen) geldt voor de nacht die op `date` begint?
export function ruleFor(config, date) {
  const special = (config.specials || []).find(s => s.from && s.to && date >= s.from && date <= s.to);
  const season = (config.seasons || []).find(s => s.from && s.to && inSeason(s, date));
  return {
    price: special && isNum(special.price) ? special.price : season && isNum(season.price) ? season.price : null,
    minNights: (special && isNum(special.minNights) && special.minNights) || (season && season.minNights) || 1,
    name: (special && special.name) || (season && season.name) || '',
  };
}

const isNum = v => typeof v === 'number' && isFinite(v) && v >= 0;

export function priceForNight(config, date) {
  return ruleFor(config, date).price;
}

export function minNightsFor(config, checkIn) {
  return ruleFor(config, checkIn).minNights;
}

// Volledige offerte voor [checkIn, checkOut)
export function quote(config, checkIn, checkOut) {
  const nights = [];
  for (let d = checkIn; d < checkOut; d = addDay(d)) nights.push({ date: d, price: priceForNight(config, d) });
  const complete = nights.length > 0 && nights.every(n => n.price !== null);
  const lodging = complete ? nights.reduce((a, n) => a + n.price, 0) : null;
  const cleaning = isNum(config.cleaningFee) ? config.cleaningFee : 0;
  return {
    nights: nights.length,
    perNight: nights,
    lodging,
    cleaning,
    total: complete ? lodging + cleaning : null,
    minNights: minNightsFor(config, checkIn),
    deposit: isNum(config.deposit) ? config.deposit : null,
  };
}

// Controleert en schoont een config op (gebruikt door de beheerpagina-API)
export function sanitizeConfig(input) {
  const num = v => (v === '' || v === null || v === undefined ? null : Number(v));
  const md = v => (/^\d{2}-\d{2}$/.test(v) ? v : null);
  const ymd = v => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  const clean = n => (n === null || !isFinite(n) || n < 0 ? null : Math.round(n * 100) / 100);
  const text = v => String(v || '').trim().slice(0, 60);
  const cfg = {
    currency: 'EUR',
    cleaningFee: clean(num(input.cleaningFee)),
    deposit: clean(num(input.deposit)),
    seasons: (Array.isArray(input.seasons) ? input.seasons : []).slice(0, 20).map(s => ({
      name: text(s.name), from: md(s.from), to: md(s.to),
      price: clean(num(s.price)), minNights: Math.max(1, Math.min(60, parseInt(s.minNights, 10) || 1)),
    })).filter(s => s.from && s.to),
    specials: (Array.isArray(input.specials) ? input.specials : []).slice(0, 50).map(s => ({
      name: text(s.name), from: ymd(s.from), to: ymd(s.to),
      price: clean(num(s.price)), minNights: num(s.minNights) ? Math.max(1, Math.min(60, parseInt(s.minNights, 10))) : null,
    })).filter(s => s.from && s.to && s.to >= s.from),
    updated: new Date().toISOString(),
  };
  return cfg;
}
