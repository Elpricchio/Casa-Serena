/* Casa Serena – site script: taal, galerij, reviews, beschikbaarheidskalender, prijzen en boekingsformulier */
import { quote, priceForNight, minNightsFor } from './pricing.js';
import { EN, ES } from './i18n.js';

(() => {
  const CONFIG = {
    maxMonthsAhead: 18,    // hoe ver vooruit gasten kunnen kijken
    availabilityUrl: '/api/availability',
    requestUrl: '/api/request',
    reviewsUrl: '/data/reviews.json',
    pricesUrl: '/api/prices',
    pricesFallbackUrl: '/data/prices.json',
  };

  /* ---------- Vertalingen (Nederlands staat in de HTML) ---------- */
  const T = {
    nl: {
      months: 'nl-NL', loading: 'Beschikbaarheid laden…', updated: 'Live gekoppeld aan Airbnb en Booking.com',
      noSync: 'Live beschikbaarheid volgt binnenkort. Je kunt alvast een aanvraag sturen.',
      pickIn: 'Kies je aankomstdatum', pickOut: 'Kies je vertrekdatum',
      minN: n => `In deze periode is het minimaal ${n} nachten`, blocked: 'Deze periode bevat bezette nachten',
      needDates: 'Kies eerst je aankomst- en vertrekdatum in de kalender.', needFields: 'Vul je naam en een geldig e-mailadres in.',
      tooMany: 'Maximaal 6 gasten.', sending: 'Versturen…',
      ok: 'Bedankt! Je aanvraag is verstuurd. Je hoort zo snel mogelijk van ons, meestal binnen 24 uur. Je ontvangt ook een bevestiging per e-mail; zie je die niet, kijk dan even in je spam of ongewenste e-mail.',
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
      ok: 'Thank you! Your request has been sent. We will get back to you as soon as possible, usually within 24 hours. You will also receive a confirmation email; if you can\'t find it, please check your spam or junk folder.',
      fail: 'Sending failed. Please try again later or book via Airbnb or Booking.com.',
      readMore: 'Read more', readLess: 'Less', via: 'via', viewOn: n => `See all reviews on ${n} →`,
      reviews: c => `${c} reviews`, noScore: 'Read what our guests say on this platform.',
      nightsX: (n, p) => `${n} ${n === 1 ? 'night' : 'nights'}`, cleaning: 'Final cleaning', total: 'Total',
      onRequest: 'Price on request for these dates', minHint: n => `min. ${n} nights`, deposit: n => `Deposit ${n}, refunded after your stay`, direct: 'Cheaper than via Airbnb and Booking.com',
    },
    es: {
      months: 'es-ES', loading: 'Cargando disponibilidad…', updated: 'Sincronizado en directo con Airbnb y Booking.com',
      noSync: 'La disponibilidad en directo estará disponible pronto. Ya puedes enviar una solicitud.',
      pickIn: 'Elige tu fecha de llegada', pickOut: 'Elige tu fecha de salida',
      minN: n => `En este periodo la estancia mínima es de ${n} noches`, blocked: 'Este periodo incluye noches ocupadas',
      needDates: 'Elige primero tus fechas de llegada y salida en el calendario.', needFields: 'Introduce tu nombre y un correo electrónico válido.',
      tooMany: 'Máximo 6 huéspedes.', sending: 'Enviando…',
      ok: '¡Gracias! Tu solicitud se ha enviado. Te responderemos lo antes posible, normalmente en menos de 24 horas. También recibirás un correo de confirmación; si no lo ves, revisa tu carpeta de spam o correo no deseado.',
      fail: 'No se ha podido enviar. Inténtalo más tarde o reserva a través de Airbnb o Booking.com.',
      readMore: 'Leer más', readLess: 'Menos', via: 'vía', viewOn: n => `Ver todas las opiniones en ${n} →`,
      reviews: c => `${c} opiniones`, noScore: 'Lee lo que opinan nuestros huéspedes en esta plataforma.',
      nightsX: n => `${n} ${n === 1 ? 'noche' : 'noches'}`, cleaning: 'Limpieza final', total: 'Total',
      onRequest: 'Precio a consultar para estas fechas', minHint: n => `mín. ${n} noches`, deposit: n => `Fianza ${n}, se devuelve tras tu estancia`, direct: 'Más barato que en Airbnb y Booking.com',
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
  const LANGS = ['nl', 'en', 'es'];
  const LOCALE = { nl: 'nl-NL', en: 'en-GB', es: 'es-ES' };
  const DICT = { en: EN, es: ES };
  // Elke taal heeft een eigen pagina: / (NL), /en/ en /es/. De taal volgt de pagina.
  const PATHS = { nl: '/', en: '/en/', es: '/es/' };
  let lang = LANGS.includes(document.documentElement.lang) ? document.documentElement.lang : 'nl';
  const t = () => T[lang];

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      el.innerHTML = (DICT[lang] && DICT[lang][k]) || NL[k];
    });
    if (ph) ph.placeholder = (DICT[lang] && DICT[lang]['form.msgph']) || NLph;
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderGallery(); renderReviews(); renderCalendar(); updateSummary();
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
    const to = b.dataset.lang;
    if (to === lang) return;
    store.set('cs-lang', to);
    location.href = PATHS[to] + location.hash;
  }));

  /* ---------- Galerij + lightbox ---------- */
  const PHOTOS = [
    ['terras', 'Terras met loungeset en bergzicht', 'Terrace with lounge set and mountain views', 'wide tall'],
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
    ['balkon-zonsondergang', 'Zonsondergang vanaf het dakterras', 'Sunset from the roof terrace', 'wide'],
    ['ligbedden', 'Ligbedden bij het zwembad', 'Sun loungers by the pool', 'wide'],
    ['voorgevel', 'Het huis', 'The house', ''],
  ].filter((p, i, arr) => arr.findIndex(q => q[0] === p[0]) === i);

  const gallery = document.getElementById('gallery');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let lbIndex = 0;
  const CAP_ES = {
    'terras': 'Terraza con conjunto lounge y vistas a la montaña', 'woonkamer-uitzicht': 'Salón con balcón', 'zwembad': 'Piscina con vistas a la montaña',
    'woonkamer': 'Salón y comedor', 'woonkamer-haard': 'Salón con chimenea decorativa', 'eettafel': 'Mesa de comedor para cuatro', 'keuken': 'Cocina',
    'slaapkamer-master': 'Dormitorio principal con cama king size', 'slaapkamer-master-zithoek': 'Zona de estar en el dormitorio principal',
    'badkamer': 'Baño con ducha de lluvia', 'slaapkamer-tweepersoons': 'Dormitorio con cama de matrimonio', 'slaapkamer-twin': 'Dormitorio con dos camas individuales',
    'zithoek': 'Rincón de lectura', 'speelkamer': 'Sala de juegos con PlayStation y juegos', 'balkon-zonsondergang': 'Atardecer desde la azotea',
    'ligbedden': 'Tumbonas junto a la piscina', 'voorgevel': 'La casa',
  };
  const cap = p => (lang === 'en' ? p[2] : lang === 'es' ? CAP_ES[p[0]] || p[2] : p[1]);

  function renderGallery() {
    gallery.innerHTML = PHOTOS.map((p, i) =>
      `<button type="button" class="${p[3]}" data-i="${i}" aria-label="${cap(p)}"><img src="/img/${p[0]}-sm.webp" alt="${cap(p)}" loading="lazy"></button>`
    ).join('');
  }
  gallery.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) openLb(+b.dataset.i);
  });
  function showLb() {
    const p = PHOTOS[lbIndex];
    lbImg.src = `/img/${p[0]}.webp`; lbImg.alt = cap(p);
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
  const num = (n, d = 2) => Number(n).toLocaleString(LOCALE[lang], { minimumFractionDigits: d, maximumFractionDigits: d });

  fetch(CONFIG.reviewsUrl).then(r => r.json()).then(d => { reviewData = d; renderReviews(); }).catch(() => {});

  function renderReviews() {
    if (!reviewData) return;
    document.getElementById('platforms').innerHTML = reviewData.platforms.map(p => {
      const hasScore = p.score != null;
      const cats = (p.categories || []).map(c => `
        <div class="cat"><span>${esc(c[lang] || c.en || c.nl)}</span>
        <span class="bar"><i style="width:${(c.score / p.max) * 100}%"></i></span><b>${num(c.score, 1)}</b></div>`).join('');
      return `<div class="platform">
        <div class="platform-top"><span class="platform-name">${esc(p.name)}</span>${p.badge ? `<span class="badge">${esc(typeof p.badge === 'object' ? p.badge[lang] || p.badge.nl : p.badge)}</span>` : ''}</div>
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
  const money = n => '€\u00a0' + Number(n).toLocaleString(LOCALE[lang], { maximumFractionDigits: 2 });
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
      const t0 = m.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
      const title = t0.charAt(0).toUpperCase() + t0.slice(1);
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

  /* Losse 'Boek nu'-knop verbergen zodra het boekingsformulier in beeld is */
  const fab = document.querySelector('.fab');
  const bookSec = document.getElementById('boeken');
  if (fab && bookSec && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => fab.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe(bookSec);
  }

  applyLang();
})();
