// Kleine iCal-parser: haalt bezette periodes uit de iCal-exports van Airbnb / Booking.com.
// Elke periode is { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } waarbij `end` de vertrekdag is (exclusief).

function toISODate(value) {
  // Ondersteunt 20261012, 20261012T150000Z en 20261012T150000
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(value.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export function parseIcal(text) {
  // "Unfold" regels die over meerdere regels doorlopen (beginnen met spatie/tab)
  const lines = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const ranges = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) current = {};
    else if (line.startsWith('END:VEVENT')) {
      if (current && current.start) {
        if (!current.end || current.end <= current.start) {
          // Geen of ongeldige einddatum: behandel als één nacht
          const d = new Date(current.start + 'T00:00:00Z');
          d.setUTCDate(d.getUTCDate() + 1);
          current.end = d.toISOString().slice(0, 10);
        }
        ranges.push({ start: current.start, end: current.end });
      }
      current = null;
    } else if (current) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).split(';')[0].toUpperCase();
      const val = line.slice(idx + 1);
      if (key === 'DTSTART') current.start = toISODate(val);
      if (key === 'DTEND') current.end = toISODate(val);
    }
  }
  return ranges;
}

export function mergeRanges(ranges) {
  const sorted = ranges.filter(r => r.start && r.end).sort((a, b) => a.start.localeCompare(b.start));
  const out = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end) {
      if (r.end > last.end) last.end = r.end;
    } else out.push({ ...r });
  }
  return out;
}

export async function loadBlockedRanges(env) {
  const urls = [env.ICAL_AIRBNB, env.ICAL_BOOKING, env.ICAL_EXTRA].filter(Boolean);
  const results = await Promise.allSettled(
    urls.map(async url => {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CasaSerena-Calendar/1.0' },
        cf: { cacheTtl: 900, cacheEverything: true },
      });
      if (!res.ok) throw new Error(`iCal ${res.status}`);
      return parseIcal(await res.text());
    })
  );
  const ranges = [];
  let failed = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') ranges.push(...r.value);
    else failed++;
  }
  const today = new Date().toISOString().slice(0, 10);
  return {
    sources: urls.length,
    failed,
    ranges: mergeRanges(ranges).filter(r => r.end > today),
  };
}

export function overlaps(ranges, checkIn, checkOut) {
  // Nachten [checkIn, checkOut) mogen geen bezette nacht [start, end) raken
  return ranges.some(r => checkIn < r.end && checkOut > r.start);
}
