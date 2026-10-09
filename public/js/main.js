/* Casa Serena – site script: taal, galerij, reviews, beschikbaarheidskalender, prijzen en boekingsformulier */
import { quote, priceForNight, minNightsFor } from './pricing.js';

(() => {
  const CONFIG = {
    maxMonthsAhead: 18,    // hoe ver vooruit gasten kunnen kijken
    availabilityUrl: '/api/availability',
    requestUrl: '/api/request',
    reviewsUrl: 'data/reviews.json',
    pricesUrl: '/api/prices',
    pricesFallbackUrl: 'data/prices.json',
  };

  /* ---------- Vertalingen (Nederlands staat in de HTML) ---------- */
  const EN = {
    'nav.house': 'The house', 'nav.photos': 'Photos', 'nav.reviews': 'Reviews', 'nav.area': 'Area', 'nav.book': 'Availability',
    'hero.eyebrow': 'Calpe · Costa Blanca · Spain',
    'hero.title': 'Calm, light and mountain views, six minutes from the sea',
    'hero.lead': 'A beautifully styled holiday home for up to six guests, with a sunny roof terrace, shared pool and every comfort for a relaxed stay.',
    'fact.guests': 'guests', 'fact.bedrooms': 'bedrooms', 'fact.bathrooms': 'bathrooms', 'fact.rating': 'on Airbnb',
    'hero.cta': 'Check availability', 'hero.cta2': 'All photos',
    'hl1.t': 'Terrace with mountain views', 'hl1.p': 'Lounge set, string lights and sunshine all day on the first floor.',
    'hl2.t': 'Swimming pool', 'hl2.p': 'For residents of the complex only, with sun loungers and parasol (seasonal).',
    'hl3.t': 'Beach in 6 minutes', 'hl3.p': 'Beautiful beaches and Calpe town centre are a short drive away.',
    'hl4.t': 'Self check-in', 'hl4.p': 'Arrive when it suits you with a key box. Free parking at the door.',
    'house.eyebrow': 'The house', 'house.title': 'Three floors full of light and natural materials',
    'house.lead': 'Rattan, linen, wood and warm earthy tones: Casa Serena was furnished with care so you can truly unwind. There is space to be together, and just as much space to retreat.',
    'f1.t': 'Ground floor', 'f1.p': 'Cosy living room with fireplace, TV and a balcony with a view. A round dining table for four, a modern kitchen and two bedrooms with a bathroom.',
    'f1.l1': 'Bedroom with double bed', 'f1.l2': 'Bedroom with two single beds', 'f1.l3': 'Bathroom',
    'f2.t': 'First floor', 'f2.p': 'The sunny terrace with lounge set, string lights and wide views over the mountains around Calpe. Perfect for breakfast in the sun or a drink at sunset.',
    'f3.t': 'Lower floor', 'f3.p': 'A space of its own: the large bedroom with king-size bed and ceiling fan, a luxurious bathroom with walk-in rain shower and a games room with sofa, TV, PlayStation and board games.',
    'f3.l1': 'Bedroom with king-size bed and seating area', 'f3.l2': 'Luxury bathroom with rain shower', 'f3.l3': 'Games room',
    'photos.eyebrow': 'Photos', 'photos.title': 'Take a look around',
    'am.eyebrow': 'Amenities', 'am.title': 'Everything you need',
    'am.g1': 'Outdoors', 'am.g1.1': 'Shared outdoor pool (seasonal)', 'am.g1.2': 'Sun loungers with parasol', 'am.g1.3': 'Roof terrace with lounge set', 'am.g1.4': 'Balcony with mountain views', 'am.g1.5': 'Free on-site parking',
    'am.g2': 'Kitchen', 'am.g2.1': 'Oven and microwave', 'am.g2.2': 'Hob and extractor hood', 'am.g2.3': 'Dishwasher', 'am.g2.4': 'Coffee machine and kettle', 'am.g2.5': 'Dining table for four',
    'am.g3': 'Comfort', 'am.g3.1': 'Wi-Fi', 'am.g3.2': 'Air conditioning in the living room', 'am.g3.3': 'Ceiling fan in the main bedroom', 'am.g3.4': 'Bed linen and towels included', 'am.g3.5': 'Self check-in with key box',
    'am.g4': 'Relaxation', 'am.g4.1': 'TV in living room and games room', 'am.g4.2': 'PlayStation 4', 'am.g4.3': 'Board games', 'am.g4.4': 'Decorative fireplace',
    'rev.eyebrow': 'Reviews', 'rev.title': 'What our guests say', 'rev.lead': 'Ratings from guests who stayed with us via Airbnb and Booking.com.',
    'book.eyebrow': 'Availability', 'book.title': 'Pick your dates and send a request',
    'book.lead': 'The calendar is synced with Airbnb and Booking.com. Choose your dates to see the total price right away. Booking directly is cheaper than via Airbnb or Booking.com, and you will receive a personal reply within 24 hours.',
    'cal.free': 'Available', 'cal.busy': 'Booked', 'cal.sel': 'Your selection',
    'form.in': 'Arrival', 'form.out': 'Departure', 'form.nights': 'Nights', 'form.clear': 'Clear dates',
    'form.adults': 'Adults', 'form.children': 'Children', 'form.name': 'Name', 'form.email': 'Email', 'form.phone': 'Phone (optional)',
    'form.msg': 'Message (optional)', 'form.msgph': 'For example your expected arrival time or questions about the house',
    'form.submit': 'Send booking request',
    'form.note': 'A request is free of obligation and not yet a booking. Prefer to book through a platform? Book on <a href="https://www.airbnb.com/rooms/1170760488935069985" target="_blank" rel="noopener">Airbnb</a> or <a href="https://www.booking.com/hotel/es/casa-sereno.en-gb.html" target="_blank" rel="noopener">Booking.com</a>.',
    'area.eyebrow': 'Area', 'area.title': 'Between the mountains and the Mediterranean',
    'area.p1': 'Casa Serena lies in a quiet, green residential area in the hills of Calpe. By day you look out over the mountains; in the evening you watch the sun set behind them.',
    'area.p2': 'Within six minutes you drive to the beaches and the centre of Calpe, with the famous Peñón de Ifach rock, the harbour with fresh fish and lively terraces. Altea, Benissa and Moraira are close by too. A car is recommended.',
    'area.l1': 'Beaches and Calpe centre: approx. 6 min by car', 'area.l2': 'Alicante Airport: approx. 1 hour', 'area.l3': 'Valencia Airport: approx. 1.5 hours',
    'host.eyebrow': 'Your host',
    'host.p': 'I live in Amersfoort (the Netherlands) and love sharing Casa Serena with guests. On Airbnb I score 5.0 for communication and usually reply within an hour. Any questions? Just send a message through the form.',
    'foot.reg': 'Tourist registration Comunitat Valenciana', 'foot.nat': 'National registration number',
  };
  const T = {
    nl: {
      months: 'nl-NL', loading: 'Beschikbaarheid laden…', updated: 'Live gekoppeld aan Airbnb en Booking.com',
      noSync: 'Live beschikbaarheid volgt binnenkort. Je kunt alvast een aanvraag sturen.',
      pickIn: 'Kies je aankomstdatum', pickOut: 'Kies je vertrekdatum',
      minN: n => `In deze periode is het minimaal ${n} nachten`, blocked: 'Deze periode bevat bezette nachten',
      needDates: 'Kies eerst je aankomst- en vertrekdatum in de kalender.', needFields: 'Vul je naam en een geldig e-mailadres in.',
      tooMany: 'Maximaal 6 gasten.', sending: 'Versturen…',
      ok: 'Bedankt! Je aanvraag is verstuurd. Je hoort zo snel mogelijk van ons, meestal binnen 24 uur.',
      fail: 'Versturen is niet gelukt. Probeer het later opnieuw of boek via Airbnb of Booking.com.',
      readMore: 'Lees meer', readLess: 'Minder', via: 'via', viewOn: n => `Bekijk alle reviews op ${n} →`,
      reviews: c => `${c} reviews`, noScore: 'Lees de beoordelingen van onze gasten op dit platform.',
      nightsX: (n, p) => `${n} ${n === 1 ? 'nacht' : 'nachten'}`, cleaning: 'Eindschoonmaak', total: 'Totaal',
      onRequest: 'Prijs op aanvraag voor deze data', minHint: n => `min. ${n} nachten`, deposit: n => `Borg ${n}, je krijgt deze na vertrek terug`, direct: 'Voordeliger dan via Airbnb en Booking.com',
    },
    en: {
      months: 'en-GB', loading: 'Loading availability…', updated: 'Live synced with Airbnb and Booking.com',
      noSync: 'Live availability coming soon. You can already send a request.',
      pickIn: 'Choose your arrival date', pickOut: 'Choose your departure date',
      minN: n => `Minimum stay in this period is ${n} nights`, blocked: 'This period contains booked nights',
      needDates: 'Please choose your arrival and departure date in the calendar first.', needFields: 'Please enter your name and a valid email address.',
      tooMany: 'Maximum 6 guests.', sending: 'Sending…',
      ok: 'Thank you! Your request has been sent. We will get back to you as soon as possible, usually within 24 hours.',
      fail: 'Sending failed. Please try again later or book via Airbnb or Booking.com.',
      readMore: 'Read more', readLess: 'Less', via: 'via', viewOn: n => `See all reviews on ${n} →`,
      reviews: c => `${c} reviews`, noScore: 'Read what our guests say on this platform.',
      nightsX: (n, p) => `${n} ${n === 1 ? 'night' : 'nights'}`, cleaning: 'Final cleaning', total: 'Total',
      onRequest: 'Price on request for these dates', minHint: n => `min. ${n} nights`, deposit: n => `Deposit ${n}, refunded after your stay`, direct: 'Cheaper than via Airbnb and Booking.com',
    },
  };

  const NL = {};
  document.querySelectorAll('[data-i18n]').forEach(el => { NL[el.dataset.i18n] = el.innerHTML; });
  const ph = document.querySelector('[data-i18n-ph]');
  const NLph = ph ? ph.placeholder : '';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* opslag niet beschikbaar */ } },
  };
  let lang = store.get('cs-lang') || ((navigator.language || 'nl').toLowerCase().startsWith('nl') ? 'nl' : 'en');
  const t = () => T[lang];

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      el.innerHTML = lang === 'en' && EN[k] ? EN[k] : NL[k];
    });
    if (ph) ph.placeholder = lang === 'en' ? EN['form.msgph'] : NLph;
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderGallery(); renderReviews(); renderCalendar(); updateSummary();
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang; store.set('cs-lang', lang); applyLang();
  }));

  /* ---------- Galerij + lightbox ---------- */
  const PHOTOS = [
    ['terras', 'Dakterras met loungeset en bergzicht', 'Roof terrace with lounge set and mountain views', 'wide tall'],
    ['woonkamer-uitzicht', 'Woonkamer met balkon', 'Living room with balcony', ''],
    ['zwembad', 'Zwembad met uitzicht op de bergen', 'Pool with mountain views', 'tall'],
    ['woonkamer', 'Woonkamer en eethoek', 'Living and dining area', ''],
    ['woonkamer-haard', 'Woonkamer met sfeerhaard', 'Living room with fireplace', 'wide'],
    ['eettafel', 'Eettafel voor vier', 'Dining table for four', 'tall'],
    ['keuken', 'Keuken', 'Kitchen', ''],
    ['slaapkamer-master', 'Grote slaapkamer met kingsize bed', 'Main bedroom with king-size bed', 'wide'],
    ['slaapkamer-master-zithoek', 'Zithoek in de grote slaapkamer', 'Seating area in the main bedroom', ''],
    ['badkamer', 'Badkamer met regendouche', 'Bathroom with rain shower', ''],
    ['slaapkamer-tweepersoons', 'Slaapkamer met tweepersoonsbed', 'Bedroom with double bed', 'wide'],
    ['slaapkamer-twin', 'Slaapkamer met twee eenpersoonsbedden', 'Bedroom with two single beds', ''],
    ['zithoek', 'Zithoek', 'Reading corner', ''],
    ['speelkamer', 'Speelkamer met PlayStation en spellen', 'Games room with PlayStation and games', 'wide'],
    ['balkon-zonsondergang', 'Zonsondergang vanaf het balkon', 'Sunset from the balcony', 'wide'],
    ['ligbedden', 'Ligbedden bij het zwembad', 'Sun loungers by the pool', 'wide'],
    ['voorgevel', 'Het huis', 'The house', ''],
  ].filter((p, i, arr) => arr.findIndex(q => q[0] === p[0]) === i);

  const gallery = document.getElementById('gallery');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let lbIndex = 0;
  const cap = p => (lang === 'en' ? p[2] : p[1]);

  function renderGallery() {
    gallery.innerHTML = PHOTOS.map((p, i) =>
      `<button type="button" class="${p[3]}" data-i="${i}" aria-label="${cap(p)}"><img src="img/${p[0]}-sm.webp" alt="${cap(p)}" loading="lazy"></button>`
    ).join('');
  }
  gallery.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) openLb(+b.dataset.i);
  });
  function showLb() {
    const p = PHOTOS[lbIndex];
    lbImg.src = `img/${p[0]}.webp`; lbImg.alt = cap(p);
    lbCap.textContent = `${cap(p)} · ${lbIndex + 1}/${PHOTOS.length}`;
  }
  function openLb(i) { lbIndex = i; showLb(); if (lb.showModal) lb.showModal(); else lb.setAttribute('open', ''); }
  const step = d => { lbIndex = (lbIndex + d + PHOTOS.length) % PHOTOS.length; showLb(); };
  document.getElementById('lbPrev').onclick = () => step(-1);
  document.getElementById('lbNext').onclick = () => step(1);
  document.getElementById('lbClose').onclick = () => lb.close();
  lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
  document.addEventListener('keydown', e => {
    if (!lb.open) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ---------- Reviews ---------- */
  let reviewData = null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n, d = 2) => Number(n).toLocaleString(lang === 'en' ? 'en-GB' : 'nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });

  fetch(CONFIG.reviewsUrl).then(r => r.json()).then(d => { reviewData = d; renderReviews(); }).catch(() => {});

  function renderReviews() {
    if (!reviewData) return;
    document.getElementById('platforms').innerHTML = reviewData.platforms.map(p => {
      const hasScore = p.score != null;
      const cats = (p.categories || []).map(c => `
        <div class="cat"><span>${esc(lang === 'en' ? c.en : c.nl)}</span>
        <span class="bar"><i style="width:${(c.score / p.max) * 100}%"></i></span><b>${num(c.score, 1)}</b></div>`).join('');
      return `<div class="platform">
        <div class="platform-top"><span class="platform-name">${esc(p.name)}</span>${p.badge ? `<span class="badge">${lang === 'en' ? 'Guest favourite' : esc(p.badge)}</span>` : ''}</div>
        ${hasScore
          ? `<div class="score">${num(p.score, p.max === 10 ? 1 : 2)} <small>/ ${p.max}${p.count ? ` · ${t().reviews(p.count)}` : ''}</small></div>`
          : `<p style="color:var(--muted);margin:.6rem 0 1rem">${t().noScore}</p>`}
        ${cats ? `<div class="cats">${cats}</div>` : ''}
        <a href="${esc(p.url)}" target="_blank" rel="noopener">${t().viewOn(esc(p.name))}</a>
      </div>`;
    }).join('');

    const list = document.getElementById('reviewList');
    const items = (reviewData.reviews || []).filter(r => r.text);
    list.innerHTML = items.map((r, i) => {
      const max = r.platform === 'Booking.com' ? 10 : 5;
      const stars = r.rating != null
        ? (max === 5 ? '★'.repeat(Math.round(r.rating)) + '☆'.repeat(5 - Math.round(r.rating)) : `${num(r.rating, 1)} / 10`)
        : '';
      const long = r.text.length > 320;
      return `<article class="review">
        <div class="stars" aria-label="${r.rating ?? ''}">${stars}</div>
        <blockquote class="${long ? 'clamp' : ''}" id="rv${i}">${esc(r.text)}</blockquote>
        ${long ? `<button type="button" class="link" data-rv="${i}" style="align-self:flex-start;margin:-.5rem 0 .8rem">${t().readMore}</button>` : ''}
        <footer><b>${esc(r.name)}</b>${r.country ? `, ${esc(r.country)}` : ''} · ${esc(r.date || '')} ${r.platform ? `· ${t().via} ${esc(r.platform)}` : ''}</footer>
      </article>`;
    }).join('');
  }
  document.getElementById('reviewList').addEventListener('click', e => {
    const b = e.target.closest('[data-rv]');
    if (!b) return;
    const q = document.getElementById('rv' + b.dataset.rv);
    const clamped = q.classList.toggle('clamp');
    b.textContent = clamped ? t().readMore : t().readLess;
  });

  /* ---------- Kalender ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const nights = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);

  const todayIso = iso(new Date());
  const busy = new Set();          // bezette nachten (YYYY-MM-DD)
  let syncState = 'loading';       // loading | live | none
  let start = null, end = null;
  const first = new Date(); first.setDate(1);
  let viewY = first.getFullYear(), viewM = first.getMonth();
  const monthsEl = document.getElementById('calMonths');
  const statusEl = document.getElementById('calStatus');
  const mq = window.matchMedia('(max-width: 700px)');

  fetch(CONFIG.availabilityUrl)
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(d => {
      (d.ranges || []).forEach(r => { for (let x = r.start; x < r.end; x = addDays(x, 1)) busy.add(x); });
      syncState = d.sources > 0 ? 'live' : 'none';
      renderCalendar();
    })
    .catch(() => { syncState = 'none'; renderCalendar(); });

  let prices = null;
  const money = n => '€\u00a0' + Number(n).toLocaleString(lang === 'en' ? 'en-GB' : 'nl-NL', { maximumFractionDigits: 2 });
  fetch(CONFIG.pricesUrl)
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .catch(() => fetch(CONFIG.pricesFallbackUrl).then(r => r.json()))
    .then(p => { prices = p; renderCalendar(); updateSummary(); })
    .catch(() => {});
  const minFor = d => (prices ? minNightsFor(prices, d) : 1);

  const rangeFree = (a, b) => { for (let x = a; x < b; x = addDays(x, 1)) if (busy.has(x)) return false; return true; };

  function renderCalendar() {
    const count = mq.matches ? 1 : 2;
    const loc = t().months;
    const dows = [];
    for (let i = 0; i < 7; i++) dows.push(new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'short' }).replace('.', ''));
    let html = '';
    for (let k = 0; k < count; k++) {
      const m = new Date(viewY, viewM + k, 1);
      const title = m.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
      const offset = (m.getDay() + 6) % 7;  // maandag eerst
      const daysIn = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      let cells = dows.map(d => `<div class="dow">${d}</div>`).join('');
      for (let i = 0; i < offset; i++) cells += '<div></div>';
      for (let day = 1; day <= daysIn; day++) {
        const s = iso(new Date(m.getFullYear(), m.getMonth(), day));
        const past = s < todayIso;
        const isBusy = busy.has(s);
        // Een bezette dag kan wel vertrekdag zijn als de periode tot daar vrij is
        const canCheckout = start && !end && s > start && rangeFree(start, s);
        const cls = ['day'];
        if (past) cls.push('past');
        if (isBusy) cls.push(canCheckout ? 'checkout-only' : 'busy');
        if (s === todayIso) cls.push('today');
        if (s === start || s === end) cls.push('sel');
        else if (start && end && s > start && s < end) cls.push('in-range');
        const disabled = past || (isBusy && !canCheckout);
        const p = prices && !past && !isBusy ? priceForNight(prices, s) : null;
        const tag = p !== null ? `<small>€${Math.round(p)}</small>` : '';
        cells += `<button type="button" class="${cls.join(' ')}" data-d="${s}" ${disabled ? 'disabled' : ''} aria-label="${parse(s).toLocaleDateString(loc, { dateStyle: 'full' })}${isBusy ? ' (bezet)' : ''}${p !== null ? ` · ${money(p)}` : ''}"><span>${day}</span>${tag}</button>`;
      }
      html += `<div class="month"><h3>${title}</h3><div class="grid">${cells}</div></div>`;
    }
    monthsEl.innerHTML = html;

    const now = new Date(); now.setDate(1);
    document.getElementById('calPrev').disabled = viewY === now.getFullYear() && viewM === now.getMonth();
    const lastView = new Date(now.getFullYear(), now.getMonth() + CONFIG.maxMonthsAhead - count, 1);
    document.getElementById('calNext').disabled = new Date(viewY, viewM, 1) >= lastView;

    let msg = syncState === 'loading' ? t().loading : syncState === 'live' ? t().updated : t().noSync;
    if (syncState !== 'loading') msg = (!start || end) ? `${msg} · ${t().pickIn}` : `${t().pickOut} (${t().minHint(minFor(start))})`;
    statusEl.textContent = msg;
  }

  monthsEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b || b.disabled) return;
    const d = b.dataset.d;
    if (!start || end || d <= start) {
      if (busy.has(d)) return;
      start = d; end = null;
    } else if (rangeFree(start, d)) {
      if (nights(start, d) < minFor(start)) { statusEl.textContent = t().minN(minFor(start)); return; }
      end = d;
    } else {
      statusEl.textContent = t().blocked; return;
    }
    renderCalendar(); updateSummary();
  });
  document.getElementById('calPrev').onclick = () => { const d = new Date(viewY, viewM - 1, 1); viewY = d.getFullYear(); viewM = d.getMonth(); renderCalendar(); };
  document.getElementById('calNext').onclick = () => { const d = new Date(viewY, viewM + 1, 1); viewY = d.getFullYear(); viewM = d.getMonth(); renderCalendar(); };
  mq.addEventListener('change', renderCalendar);

  const outIn = document.getElementById('outIn'), outOut = document.getElementById('outOut'), outN = document.getElementById('outNights');
  const clearBtn = document.getElementById('clearDates');
  function updateSummary() {
    const f = s => parse(s).toLocaleDateString(t().months, { weekday: 'short', day: 'numeric', month: 'short' });
    outIn.textContent = start ? f(start) : '—';
    outOut.textContent = end ? f(end) : '—';
    outN.textContent = start && end ? nights(start, end) : '—';
    clearBtn.hidden = !start;
    const box = document.getElementById('priceBox');
    if (!start || !end || !prices) { box.hidden = true; return; }
    const q = quote(prices, start, end);
    box.hidden = false;
    if (q.total === null) { box.innerHTML = `<p class="pb-note">${t().onRequest}</p>`; return; }
    box.innerHTML = `
      <div class="pb-row"><span>${t().nightsX(q.nights)}</span><span>${money(q.lodging)}</span></div>
      ${q.cleaning ? `<div class="pb-row"><span>${t().cleaning}</span><span>${money(q.cleaning)}</span></div>` : ''}
      <div class="pb-row pb-total"><span>${t().total}</span><span>${money(q.total)}</span></div>
      <p class="pb-note">✓ ${t().direct}${q.deposit ? `<br>${t().deposit(money(q.deposit))}` : ''}</p>`;
  }
  clearBtn.onclick = () => { start = end = null; renderCalendar(); updateSummary(); };

  /* ---------- Boekingsformulier ---------- */
  const form = document.getElementById('requestForm');
  const msgEl = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');
  const startedAt = Date.now();
  const say = (text, kind) => { msgEl.textContent = text; msgEl.className = 'form-msg ' + (kind || ''); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (!start || !end) { say(t().needDates, 'err'); document.getElementById('boeken').scrollIntoView(); return; }
    if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) { say(t().needFields, 'err'); return; }
    if (+data.adults + +data.children > 6) { say(t().tooMany, 'err'); return; }

    submitBtn.disabled = true; say(t().sending);
    try {
      const res = await fetch(CONFIG.requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, checkIn: start, checkOut: end, lang, startedAt }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || 'fail');
      say(t().ok, 'ok');
      form.reset(); start = end = null; renderCalendar(); updateSummary();
    } catch (err) {
      say(lang === 'nl' && err.message && err.message !== 'fail' && !err.message.startsWith('Failed') ? err.message : t().fail, 'err');
    } finally {
      submitBtn.disabled = false;
    }
  });

  applyLang();
})();
