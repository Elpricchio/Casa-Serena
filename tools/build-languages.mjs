// Maakt de Engelse en Spaanse pagina's (public/en/index.html en public/es/index.html)
// uit de Nederlandse public/index.html en de vertalingen in public/js/i18n.js.
//
// Draai dit na elke tekstwijziging:   npm install   (eenmalig)   en dan   npm run build:lang
//
// Zo heeft elke taal een eigen adres dat Google kan vinden: /, /en/ en /es/.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { EN, ES } from '../public/js/i18n.js';

const SITE = 'https://casaserenacalpe.com';
const SRC = new URL('../public/index.html', import.meta.url);
const source = readFileSync(SRC, 'utf8');

const PAGES = {
  en: {
    dict: EN,
    path: '/en/',
    locale: 'en_GB',
    title: 'Holiday Home in Calpe with Pool | Casa Serena, Costa Blanca',
    description: 'Charming holiday home in Calpe on the Costa Blanca for 6 guests: 3 bedrooms, 2 bathrooms, shared pool, sunny terrace and roof terrace with mountain views. Ideal for families, peace seekers and cyclists. Book direct for the best price.',
    ogTitle: 'Casa Serena – holiday home in Calpe, Costa Blanca',
    ogDescription: '3 bedrooms · 6 guests · terrace with mountain views · pool · 6 min to the beach',
    ldDescription: 'Charming holiday home in Calpe on the Costa Blanca for 6 guests, with 3 bedrooms, 2 bathrooms, a sunny terrace with mountain views and a pool.',
    langLabel: 'Language',
  },
  es: {
    dict: ES,
    path: '/es/',
    locale: 'es_ES',
    title: 'Casa de vacaciones en Calpe con piscina | Casa Serena, Costa Blanca',
    description: 'Encantadora casa de vacaciones en Calpe, Costa Blanca, para 6 personas: 3 dormitorios, 2 baños, piscina compartida, terraza soleada y azotea con vistas a la montaña. Ideal para familias, descanso y ciclistas. Reserva directa al mejor precio.',
    ogTitle: 'Casa Serena – casa de vacaciones en Calpe, Costa Blanca',
    ogDescription: '3 dormitorios · 6 huéspedes · terraza con vistas a la montaña · piscina · a 6 min de la playa',
    ldDescription: 'Encantadora casa de vacaciones en Calpe, Costa Blanca, para 6 huéspedes, con 3 dormitorios, 2 baños, terraza soleada con vistas a la montaña y piscina.',
    langLabel: 'Idioma',
  },
};


// Alt-teksten en knoplabels (voor Google Afbeeldingen en schermlezers), op basis van de Nederlandse tekst
const ATTRS = {
  'Hoofdmenu': ['Main menu', 'Menú principal'],
  'De Peñón de Ifach en de Middellandse Zee bij Calpe': ['The Peñón de Ifach and the Mediterranean Sea at Calpe', 'El Peñón de Ifach y el mar Mediterráneo en Calpe'],
  'Zonnig terras met loungeset': ['Sunny terrace with lounge set', 'Terraza soleada con sofás exteriores'],
  'Lichte woonkamer met balkon': ['Bright living room with balcony', 'Salón luminoso con balcón'],
  'Zwembad met bergzicht': ['Pool with mountain views', 'Piscina con vistas a la montaña'],
  'Hoogtepunten': ['Highlights', 'Lo más destacado'],
  'Zwembad met uitzicht op de bergen': ['Pool with mountain views', 'Piscina con vistas a la montaña'],
  'Het strand van Calpe vanuit de lucht': ['Aerial view of the beach in Calpe', 'Vista aérea de la playa de Calpe'],
  'Opgerolde handdoeken klaar voor aankomst': ['Rolled towels ready for your arrival', 'Toallas enrolladas listas para tu llegada'],
  'Woonkamer met eethoek en doorkijk naar de keuken': ['Living room with dining area and view into the kitchen', 'Salón con comedor y vista a la cocina'],
  'Dakterras met barkrukken en zonsondergang boven de bergen': ['Roof terrace with bar stools and sunset over the mountains', 'Azotea con taburetes y puesta de sol sobre las montañas'],
  'Grote slaapkamer met kingsize bed en houten wand': ['Main bedroom with king-size bed and wooden wall', 'Dormitorio principal con cama king size y pared de madera'],
  'Casa Serena met bloeiende bougainville bij de ingang': ['Casa Serena with blooming bougainvillea at the entrance', 'Casa Serena con buganvilla en flor en la entrada'],
  'Zonsondergang boven de bergen vanaf het balkon': ['Sunset over the mountains from the balcony', 'Puesta de sol sobre las montañas desde el balcón'],
  'Wielrenner op een bergweg aan de Middellandse Zee': ['Cyclist on a mountain road by the Mediterranean', 'Ciclista en una carretera de montaña junto al Mediterráneo'],
  'Vorige maand': ['Previous month', 'Mes anterior'],
  'Volgende maand': ['Next month', 'Mes siguiente'],
  'Jeanetta, gastvrouw van Casa Serena': ['Jeanetta, host of Casa Serena', 'Jeanetta, anfitriona de Casa Serena'],
  'Foto': ['Photo', 'Foto'],
  'Sluiten': ['Close', 'Cerrar'],
  'Vorige': ['Previous', 'Anterior'],
  'Volgende': ['Next', 'Siguiente'],
};

const setAttr = (doc, selector, attr, value) => {
  const el = doc.querySelector(selector);
  if (!el) throw new Error(`Niet gevonden: ${selector}`);
  el.setAttribute(attr, value);
};

for (const [lang, page] of Object.entries(PAGES)) {
  const { document } = parseHTML(source);
  const missing = [];

  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key in page.dict) el.innerHTML = page.dict[key];
    else missing.push(key);
  });
  const ph = document.querySelector('[data-i18n-ph]');
  if (ph && page.dict['form.msgph']) ph.setAttribute('placeholder', page.dict['form.msgph']);


  const idx = lang === 'en' ? 0 : 1;
  document.querySelectorAll('[alt],[aria-label],[title]').forEach(el => {
    for (const a of ['alt', 'aria-label', 'title']) {
      const v = el.getAttribute(a);
      if (v && ATTRS[v]) el.setAttribute(a, ATTRS[v][idx]);
    }
  });
  document.querySelectorAll('a.credit').forEach(a => {
    if (lang === 'en') a.textContent = a.textContent.replace(/^Foto:/, 'Photo:');
  });

  document.querySelector('title').textContent = page.title;
  setAttr(document, 'meta[name="description"]', 'content', page.description);
  setAttr(document, 'meta[property="og:title"]', 'content', page.ogTitle);
  setAttr(document, 'meta[property="og:description"]', 'content', page.ogDescription);
  setAttr(document, 'meta[property="og:url"]', 'content', SITE + page.path);
  setAttr(document, 'meta[property="og:locale"]', 'content', page.locale);
  setAttr(document, 'link[rel="canonical"]', 'href', SITE + page.path);

  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    const data = JSON.parse(ld.textContent);
    data.url = SITE + page.path;
    data.description = page.ldDescription;
    ld.textContent = JSON.stringify(data);
  }

  document.querySelectorAll('.lang button').forEach(b =>
    b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)));
  const group = document.querySelector('.lang');
  if (group) group.setAttribute('aria-label', page.langLabel);

  const out = new URL(`../public/${lang}/index.html`, import.meta.url);
  mkdirSync(new URL('.', out), { recursive: true });
  writeFileSync(out, '<!doctype html>\n' + document.documentElement.outerHTML + '\n');
  console.log(`${lang}: geschreven${missing.length ? `, ontbrekende vertalingen: ${missing.join(', ')}` : ''}`);
}
