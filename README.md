# Casa Serena – website

Website voor vakantiehuis Casa Serena in Calpe: foto's, reviews, beschikbaarheidskalender (gekoppeld aan Airbnb en Booking.com) en een formulier voor boekingsverzoeken.

**Kosten:** hosting €0 · e-mail €0 · alleen de domeinnaam (± €10 per jaar).

## Mappen

```
public/              de website zelf (HTML, CSS, JS, foto's)
  data/reviews.json  hier zet je je reviews en scores
functions/api/       twee kleine serverfuncties
  availability.js    leest je Airbnb- en Booking-kalender (iCal)
  request.js         mailt een boekingsverzoek naar jou
lib/ical.js          hulpcode voor het lezen van iCal-kalenders
```

## Waarom Cloudflare Pages (en niet Vercel of GitHub Pages)

- **Vercel (gratis Hobby-plan):** alleen voor niet-commercieel, persoonlijk gebruik. Een verhuursite is commercieel, dus dat mag niet gratis.
- **GitHub Pages:** geen serverfuncties (kalender en formulier werken dan niet) en ook niet bedoeld voor commerciële sites.
- **Cloudflare Pages:** gratis, commercieel gebruik toegestaan, onbeperkt verkeer, serverfuncties inbegrepen (100.000 verzoeken per dag). Je koppelt het aan GitHub, net als bij Vercel.

Supabase is niet nodig: de beschikbaarheid komt rechtstreeks uit Airbnb en Booking.com.

## Stap 1 – Code op GitHub zetten

1. Maak op github.com een nieuwe (privé) repository, bijvoorbeeld `casa-serena`.
2. Upload de inhoud van deze map (alles behalve `.dev.vars`).

## Stap 2 – Koppelen aan Cloudflare Pages

1. Maak een gratis account op dash.cloudflare.com.
2. **Workers & Pages → Create → Pages → Connect to Git** en kies je repository.
3. Instellingen:
   - Framework preset: **None**
   - Build command: *(leeg laten)*
   - Build output directory: **public**
4. Klik op **Save and Deploy**. Je site staat nu op `casa-serena.pages.dev`.

## Stap 3 – Kalenders koppelen (iCal-links)

1. **Airbnb:** Agenda → Beschikbaarheid → *Agenda's koppelen* → *Airbnb-agenda exporteren*. Kopieer de link (begint met `https://www.airbnb.nl/calendar/ical/...`).
2. **Booking.com:** Extranet → Tarieven & beschikbaarheid → *Agenda's synchroniseren* → *Agenda exporteren*. Kopieer de link.
3. In Cloudflare: je project → **Settings → Variables and Secrets** → voeg toe (type *Secret*):
   - `ICAL_AIRBNB` = de Airbnb-link
   - `ICAL_BOOKING` = de Booking-link
4. Deploy opnieuw (Deployments → ⋯ → Retry deployment). De kalender ververst automatisch elke ~15 minuten.

## Stap 4 – E-mail voor boekingsverzoeken (Resend, gratis)

1. Maak een gratis account op resend.com (3.000 mails per maand). Gebruik hetzelfde e-mailadres waarop je de verzoeken wilt ontvangen.
2. Maak een API key (*API Keys → Create*).
3. Voeg in Cloudflare toe:
   - `RESEND_API_KEY` = je API key
   - `OWNER_EMAIL` = je e-mailadres (hetzelfde als je Resend-account)
4. Deploy opnieuw en test het formulier.

Je ontvangt elk verzoek als e-mail. Klik op *Beantwoorden* om de gast direct te mailen. **Let op:** als je een boeking accepteert, blokkeer de data dan ook in Airbnb en Booking.com, anders kan er dubbel geboekt worden.

**Na het koppelen van je domein (optioneel):** verifieer het domein in Resend (*Domains → Add*) en voeg `FROM_EMAIL` toe, bijvoorbeeld `Casa Serena <boeking@casaserenacalpe.com>`. Dan krijgt de gast ook automatisch een bevestigingsmail.

## Stap 5 – Domeinnaam koppelen

Koop de domeinnaam (zie advies in de chat), dan in Cloudflare: project → **Custom domains → Set up a custom domain**. Volg de DNS-instructies; HTTPS wordt automatisch geregeld.

## Prijzen beheren

Ga naar **/beheer** op je site (bijv. casa-serena-6qv.pages.dev/beheer) en log in met je beheerwachtwoord. Daar stel je in:
- prijs per nacht en minimaal aantal nachten per seizoen (okt–mei min. 3, jun–sep min. 5)
- speciale periodes (Kerst, Pasen, aanbiedingen) met eigen prijs en minimum
- eindschoonmaak (wordt bij de totaalprijs opgeteld) en borg (alleen ter info)

Gasten zien de prijs per nacht in de kalender en de totaalprijs zodra ze data kiezen. De prijs staat ook in de e-mail met het boekingsverzoek.

Eenmalig instellen in Cloudflare (project → Settings):
1. **Bindings → Add → KV namespace**: variable name `PRICES`, maak een nieuwe namespace `casa-serena-prijzen`.
2. **Variables and Secrets → Add**: `ADMIN_PASSWORD` (type Secret) = een wachtwoord dat je zelf kiest.
3. Deployments → ⋯ → Retry deployment.

## Reviews toevoegen

Airbnb en Booking.com bieden geen gratis koppeling om reviews automatisch op je eigen site te tonen. Kopieer daarom je mooiste reviews naar `public/data/reviews.json`:

```json
"reviews": [
  { "name": "Sanne", "country": "Nederland", "date": "augustus 2026", "platform": "Airbnb", "rating": 5, "text": "Plak hier de tekst van de review." },
  { "name": "Thomas", "country": "Duitsland", "date": "juli 2026", "platform": "Booking.com", "rating": 9.6, "text": "..." }
]
```

- Airbnb-scores zijn op 5, Booking.com-scores op 10.
- Vul bij Booking.com ook `score` en `count` in bij `platforms` zodra je die wilt tonen.
- Werk de Airbnb-score (nu 4,83 uit 18 reviews) af en toe bij.

Na elke wijziging op GitHub zet Cloudflare de site binnen een minuut opnieuw online.

## Even controleren

Ik heb de teksten gebaseerd op je foto's en de Airbnb-advertentie. Kijk deze punten na in `public/index.html`:
- Airco in de woonkamer en bed-/badlinnen inbegrepen
- Reistijden naar de vliegvelden (Alicante ± 1 uur, Valencia ± 1,5 uur)
- Minimaal aantal nachten: staat nu op 1 (`minNights` bovenin `public/js/main.js`)

## Lokaal testen (optioneel)

```
npm install -g wrangler
cp .dev.vars.example .dev.vars   # vul je eigen waarden in
wrangler pages dev public
```
