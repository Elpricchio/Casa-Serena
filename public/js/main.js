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
    'nav.house': 'The house', 'nav.photos': 'Photos', 'nav.reviews': 'Reviews', 'nav.area': 'Area', 'nav.book': 'Book now',
    'hero.eyebrow': 'Calpe · Costa Blanca · Spain',
    'hero.title': 'Your sunny home on the <em>Costa Blanca</em>',
    'hero.lead': 'Wake up to mountain views, have breakfast on your own sun terrace and be on the beach below the Peñón de Ifach within six minutes. Casa Serena has been lovingly furnished for six guests, with a pool, three bedrooms and two bathrooms. Every room has its own air conditioning, so the house stays pleasantly cool in summer and comfortably warm in winter.',
    'fact.guests': 'guests', 'fact.bedrooms': 'bedrooms', 'fact.bathrooms': 'bathrooms', 'fact.rating': 'on Airbnb', 'fact.booking': 'on Booking.com',
    'hero.cta': 'Book now', 'hero.cta2': 'All photos',
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
    'am.g3': 'Comfort', 'am.g3.1': 'Wi-Fi', 'am.g3.2': 'Air conditioning in every room (cooling and heating)', 'am.g3.3': 'Ceiling fan in the main bedroom', 'am.g3.4': 'Bed linen and towels included', 'am.g3.5': 'Self check-in with key box',
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
    'nav.who': 'Who it\'s for',
    'who.eyebrow': 'Who it\'s for',
    'who.title': 'Made for peace, families and active winters',
    'who1.t': 'Family holidays',
    'who1.p': 'Room for six, with three bedrooms, two bathrooms, a games room with PlayStation and board games, and the pool around the corner. The kids are entertained while you read a book on the terrace.',
    'who2.t': 'Peace and quiet',
    'who2.p': 'Casa Serena is in a quiet residential area in the hills. The house is not meant for parties or groups looking for nightlife. We ask our guests to respect the peace of the neighbours.',
    'who3.t': 'Winter cycling',
    'who3.p': 'From November to March, the Costa Blanca is Europe\'s training ground. Many professional teams hold their winter training camps here. Climbs like the Coll de Rates, the Cumbre del Sol and the Puerto de Bernia are close by, and temperatures are pleasant. Ideal for a cycling week with friends or a small team of up to six. Your bikes are stored safely inside the house.',
    'hero.badge': 'Guest favourite',
    'strip.1': 'Sun terrace with mountain views',
    'strip.2': 'Swimming pool',
    'strip.3': 'Bright living room',
    'strip.4': 'King-size bedroom',
    'am.g1.6': 'Secure indoor bike storage',
  };
  const ES = {
    'nav.house': 'La casa', 'nav.photos': 'Fotos', 'nav.reviews': 'Opiniones', 'nav.area': 'Entorno', 'nav.book': 'Reserva ahora',
    'hero.eyebrow': 'Calpe · Costa Blanca · España',
    'hero.title': 'Tu hogar soleado en la <em>Costa Blanca</em>',
    'hero.lead': 'Despierta con vistas a la montaña, desayuna en tu propia terraza al sol y en seis minutos estarás en la playa a los pies del Peñón de Ifach. Casa Serena está decorada con mucho cariño para seis huéspedes, con piscina, tres dormitorios y dos baños. Cada estancia tiene su propio aire acondicionado, para que la casa esté fresca en verano y agradablemente cálida en invierno.',
    'fact.guests': 'huéspedes', 'fact.bedrooms': 'dormitorios', 'fact.bathrooms': 'baños', 'fact.rating': 'en Airbnb', 'fact.booking': 'en Booking.com',
    'hero.cta': 'Reserva ahora', 'hero.cta2': 'Todas las fotos',
    'hl1.t': 'Terraza con vistas a la montaña', 'hl1.p': 'Conjunto lounge, guirnaldas de luces y sol todo el día en la primera planta.',
    'hl2.t': 'Piscina', 'hl2.p': 'Solo para residentes del complejo, con tumbonas y sombrilla (de temporada).',
    'hl3.t': 'Playa a 6 minutos', 'hl3.p': 'Las playas y el centro de Calpe están a pocos minutos en coche.',
    'hl4.t': 'Entrada autónoma', 'hl4.p': 'Llega a la hora que quieras gracias a la caja de llaves. Aparcamiento gratuito en la puerta.',
    'house.eyebrow': 'La casa', 'house.title': 'Tres plantas llenas de luz y materiales naturales',
    'house.lead': 'Ratán, lino, madera y cálidos tonos tierra: Casa Serena está decorada con mimo para que de verdad puedas desconectar. Hay espacio para estar juntos y también para retirarse un rato.',
    'f1.t': 'Planta baja', 'f1.p': 'Acogedor salón con chimenea decorativa, TV y balcón con vistas. Mesa redonda para cuatro, una cocina moderna y dos dormitorios con baño.',
    'f1.l1': 'Dormitorio con cama de matrimonio', 'f1.l2': 'Dormitorio con dos camas individuales', 'f1.l3': 'Baño',
    'f2.t': 'Primera planta', 'f2.p': 'La soleada terraza con conjunto lounge, guirnaldas de luces y amplias vistas a las montañas de Calpe. Ideal para desayunar al sol o tomar algo al atardecer.',
    'f3.t': 'Planta inferior', 'f3.p': 'Un espacio propio para relajarse: el dormitorio principal con cama king size y ventilador de techo, un baño de lujo con ducha de lluvia a ras de suelo y una sala de juegos con sofá, TV, PlayStation y juegos de mesa.',
    'f3.l1': 'Dormitorio con cama king size y zona de estar', 'f3.l2': 'Baño de lujo con ducha de lluvia', 'f3.l3': 'Sala de juegos',
    'photos.eyebrow': 'Fotos', 'photos.title': 'Echa un vistazo',
    'am.eyebrow': 'Equipamiento', 'am.title': 'Todo lo que necesitas',
    'am.g1': 'Exterior', 'am.g1.1': 'Piscina comunitaria exterior (de temporada)', 'am.g1.2': 'Tumbonas con sombrilla', 'am.g1.3': 'Terraza con conjunto lounge', 'am.g1.4': 'Balcón con vistas a la montaña', 'am.g1.5': 'Aparcamiento gratuito en la propiedad',
    'am.g2': 'Cocina', 'am.g2.1': 'Horno y microondas', 'am.g2.2': 'Placa de cocina y campana extractora', 'am.g2.3': 'Lavavajillas', 'am.g2.4': 'Cafetera y hervidor', 'am.g2.5': 'Mesa de comedor para cuatro',
    'am.g3': 'Confort', 'am.g3.1': 'Wifi', 'am.g3.2': 'Aire acondicionado en cada estancia (frío y calor)', 'am.g3.3': 'Ventilador de techo en el dormitorio principal', 'am.g3.4': 'Ropa de cama y toallas incluidas', 'am.g3.5': 'Entrada autónoma con caja de llaves',
    'am.g4': 'Ocio', 'am.g4.1': 'TV en el salón y en la sala de juegos', 'am.g4.2': 'PlayStation 4', 'am.g4.3': 'Juegos de mesa', 'am.g4.4': 'Chimenea decorativa',
    'rev.eyebrow': 'Opiniones', 'rev.title': 'Lo que dicen nuestros huéspedes', 'rev.lead': 'Valoraciones de huéspedes que se alojaron con nosotros a través de Airbnb y Booking.com.',
    'book.eyebrow': 'Disponibilidad', 'book.title': 'Elige tus fechas y envía una solicitud',
    'book.lead': 'El calendario está sincronizado con Airbnb y Booking.com. Elige tus fechas y verás al instante el precio total. Reservar directamente es más barato que a través de Airbnb o Booking.com, y recibirás una respuesta personal en menos de 24 horas.',
    'cal.free': 'Disponible', 'cal.busy': 'Ocupado', 'cal.sel': 'Tu selección',
    'form.in': 'Llegada', 'form.out': 'Salida', 'form.nights': 'Noches', 'form.clear': 'Borrar fechas',
    'form.adults': 'Adultos', 'form.children': 'Niños', 'form.name': 'Nombre', 'form.email': 'Correo electrónico', 'form.phone': 'Teléfono (opcional)',
    'form.msg': 'Mensaje (opcional)', 'form.msgph': 'Por ejemplo, tu hora prevista de llegada o preguntas sobre la casa',
    'form.submit': 'Enviar solicitud de reserva',
    'form.note': 'Una solicitud no es vinculante y todavía no es una reserva. ¿Prefieres reservar a través de una plataforma? Reserva en <a href="https://www.airbnb.es/rooms/1170760488935069985" target="_blank" rel="noopener">Airbnb</a> o <a href="https://www.booking.com/hotel/es/casa-sereno.es.html" target="_blank" rel="noopener">Booking.com</a>.',
    'area.eyebrow': 'Entorno', 'area.title': 'Entre las montañas y el Mediterráneo',
    'area.p1': 'Casa Serena se encuentra en una zona residencial tranquila y verde en las colinas de Calpe. De día contemplas las montañas; al atardecer ves cómo el sol se pone tras ellas.',
    'area.p2': 'En seis minutos en coche llegas a las playas y al centro de Calpe, con el famoso Peñón de Ifach, el puerto con pescado fresco y animadas terrazas. Altea, Benissa y Moraira también están muy cerca. Se recomienda tener coche.',
    'area.l1': 'Playas y centro de Calpe: aprox. 6 min en coche', 'area.l2': 'Aeropuerto de Alicante: aprox. 1 hora', 'area.l3': 'Aeropuerto de Valencia: aprox. 1,5 horas',
    'host.eyebrow': 'Tu anfitriona',
    'host.p': 'Vivo en Amersfoort (Países Bajos) y comparto Casa Serena con mucho gusto. En Airbnb tengo un 5,0 en comunicación y suelo responder en menos de una hora. ¿Tienes alguna pregunta? Escríbeme a través del formulario.',
    'foot.reg': 'Registro turístico de la Comunitat Valenciana', 'foot.nat': 'Número de registro nacional',
    'nav.who': 'Para quién',
    'who.eyebrow': 'Para quién',
    'who.title': 'Pensada para la calma, las familias y los inviernos activos',
    'who1.t': 'Vacaciones en familia',
    'who1.p': 'Espacio para seis, con tres dormitorios, dos baños, una sala de juegos con PlayStation y juegos de mesa, y la piscina a la vuelta de la esquina. Los niños se entretienen mientras tú lees un libro en la terraza.',
    'who2.t': 'Calma y descanso',
    'who2.p': 'Casa Serena está en una zona residencial tranquila en las colinas. La casa no está pensada para fiestas ni para grupos que buscan salir de noche. Pedimos a nuestros huéspedes que respeten la tranquilidad de los vecinos.',
    'who3.t': 'Ciclismo en invierno',
    'who3.p': 'De noviembre a marzo, la Costa Blanca es el terreno de entrenamiento de Europa. Muchos equipos profesionales celebran aquí sus concentraciones de invierno. Puertos como el Coll de Rates, la Cumbre del Sol y el Puerto de Bernia están muy cerca, y las temperaturas son agradables. Ideal para una semana de bici con amigos o un pequeño equipo de hasta seis personas. Tus bicis quedan guardadas de forma segura dentro de la casa.',
    'hero.badge': 'Favorito entre huéspedes',
    'strip.1': 'Terraza soleada con vistas',
    'strip.2': 'Piscina',
    'strip.3': 'Salón luminoso',
    'strip.4': 'Dormitorio king size',
    'am.g1.6': 'Guardabicis seguro dentro de la casa',
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
    es: {
      months: 'es-ES', loading: 'Cargando disponibilidad…', updated: 'Sincronizado en directo con Airbnb y Booking.com',
      noSync: 'La disponibilidad en directo estará disponible pronto. Ya puedes enviar una solicitud.',
      pickIn: 'Elige tu fecha de llegada', pickOut: 'Elige tu fecha de salida',
      minN: n => `En este periodo la estancia mínima es de ${n} noches`, blocked: 'Este periodo incluye noches ocupadas',
      needDates: 'Elige primero tus fechas de llegada y salida en el calendario.', needFields: 'Introduce tu nombre y un correo electrónico válido.',
      tooMany: 'Máximo 6 huéspedes.', sending: 'Enviando…',
      ok: '¡Gracias! Tu solicitud se ha enviado. Te responderemos lo antes posible, normalmente en menos de 24 horas.',
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
  const nav = (navigator.language || 'nl').toLowerCase().slice(0, 2);
  let lang = store.get('cs-lang');
  if (!LANGS.includes(lang)) lang = nav === 'nl' ? 'nl' : nav === 'es' ? 'es' : 'en';
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
  const CAP_ES = {
    'terras': 'Terraza con conjunto lounge y vistas a la montaña', 'woonkamer-uitzicht': 'Salón con balcón', 'zwembad': 'Piscina con vistas a la montaña',
    'woonkamer': 'Salón y comedor', 'woonkamer-haard': 'Salón con chimenea decorativa', 'eettafel': 'Mesa de comedor para cuatro', 'keuken': 'Cocina',
    'slaapkamer-master': 'Dormitorio principal con cama king size', 'slaapkamer-master-zithoek': 'Zona de estar en el dormitorio principal',
    'badkamer': 'Baño con ducha de lluvia', 'slaapkamer-tweepersoons': 'Dormitorio con cama de matrimonio', 'slaapkamer-twin': 'Dormitorio con dos camas individuales',
    'zithoek': 'Rincón de lectura', 'speelkamer': 'Sala de juegos con PlayStation y juegos', 'balkon-zonsondergang': 'Atardecer desde el balcón',
    'ligbedden': 'Tumbonas junto a la piscina', 'voorgevel': 'La casa',
  };
  const cap = p => (lang === 'en' ? p[2] : lang === 'es' ? CAP_ES[p[0]] || p[2] : p[1]);

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

  applyLang();
})();
