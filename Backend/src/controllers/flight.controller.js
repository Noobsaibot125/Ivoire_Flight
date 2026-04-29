const axios = require('axios');
const { SearchHistory } = require('../models');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search.json';

// 1 USD ≈ 656 XOF (gardé pour compatibilité, mais on utilise EUR par défaut)
const USD_TO_FCFA = 656;
// 1 EUR = 655.957 XOF (taux FIXE officiel, parité Trésor français)
const EUR_TO_FCFA = 655.957;

// Mapping code IATA → nom de compagnie (pour quand SerpApi ne le donne pas)
const AIRLINE_CODE_TO_NAME = {
    AF: 'Air France', ET: 'Ethiopian Airlines', TK: 'Turkish Airlines',
    AT: 'Royal Air Maroc', SN: 'Brussels Airlines', EK: 'Emirates',
    HF: "Air Côte d'Ivoire", KQ: 'Kenya Airways', SS: 'Corsair',
    KP: 'Asky Airlines', MS: 'EgyptAir', QR: 'Qatar Airways',
    TU: 'Tunisair', WB: 'Rwandair', SA: 'South African Airways',
    AH: 'Air Algérie', TO: 'Transavia', HC: 'Air Sénégal',
    IB: 'Iberia', KL: 'KLM', LH: 'Lufthansa', BA: 'British Airways',
    LX: 'Swiss', X3: 'TUI fly',
};

// ── Cache compagnies 24 h ────────────────────────────────────────────────────
let airlinesCache = null;
let airlinesCacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ── Fallback statique ────────────────────────────────────────────────────────
const FALLBACK_AIRLINES = [
    { name: "Toutes les compagnies",  code: "all", bookingUrl: "" },
    { name: "Ethiopian Airlines",     code: "ET",  bookingUrl: "https://www.ethiopianairlines.com/booking/flight-booking" },
    { name: "Air France",             code: "AF",  bookingUrl: "https://www.airfrance.fr" },
    { name: "Turkish Airlines",       code: "TK",  bookingUrl: "https://www.turkishairlines.com" },
    { name: "Royal Air Maroc",        code: "AT",  bookingUrl: "https://www.royalairmaroc.com" },
    { name: "Brussels Airlines",      code: "SN",  bookingUrl: "https://www.brusselsairlines.com" },
    { name: "Emirates",               code: "EK",  bookingUrl: "https://www.emirates.com" },
    { name: "Air Côte d'Ivoire",      code: "HF",  bookingUrl: "https://www.aircotedivoire.com" },
    { name: "Kenya Airways",          code: "KQ",  bookingUrl: "https://www.kenya-airways.com" },
    { name: "Corsair",                code: "SS",  bookingUrl: "https://www.corsair.fr" },
    { name: "Asky Airlines",          code: "KP",  bookingUrl: "https://www.flyasky.com" },
    { name: "EgyptAir",               code: "MS",  bookingUrl: "https://www.egyptair.com" },
    { name: "Qatar Airways",          code: "QR",  bookingUrl: "https://www.qatarairways.com" },
    { name: "Tunisair",               code: "TU",  bookingUrl: "https://www.tunisair.com" },
    { name: "Rwandair",               code: "WB",  bookingUrl: "https://www.rwandair.com" },
    { name: "South African Airways",  code: "SA",  bookingUrl: "https://www.flysaa.com" },
    { name: "Air Algérie",            code: "AH",  bookingUrl: "https://www.airalgerie.dz" },
    { name: "Transavia",              code: "TO",  bookingUrl: "https://www.transavia.com" },
    { name: "Air Sénégal",            code: "HC",  bookingUrl: "https://www.airsenegal.com" },
    { name: "Iberia",                 code: "IB",  bookingUrl: "https://www.iberia.com" },
];

// ── Mapping ville/pays → code IATA principal ───────────────────────────────
const CITY_TO_IATA = {
    abidjan: 'ABJ', paris: 'CDG', londres: 'LHR', london: 'LHR',
    'new york': 'JFK', newyork: 'JFK', dubai: 'DXB', dubaï: 'DXB',
    bruxelles: 'BRU', brussels: 'BRU', casablanca: 'CMN', dakar: 'DSS',
    'addis-abeba': 'ADD', 'addis abeba': 'ADD', addis: 'ADD',
    istanbul: 'IST', doha: 'DOH', nairobi: 'NBO', johannesburg: 'JNB',
    lagos: 'LOS', accra: 'ACC', lome: 'LFW', lomé: 'LFW',
    cotonou: 'COO', ouagadougou: 'OUA', bamako: 'BKO', niamey: 'NIM',
    conakry: 'CKY', libreville: 'LBV', douala: 'DLA', yaounde: 'NSI',
    yaoundé: 'NSI', kinshasa: 'FIH', tunis: 'TUN', alger: 'ALG',
    'le caire': 'CAI', cairo: 'CAI', madrid: 'MAD', genève: 'GVA',
    geneva: 'GVA', francfort: 'FRA', frankfurt: 'FRA', amsterdam: 'AMS',
    montreal: 'YUL', montréal: 'YUL', washington: 'IAD',
};

const getIATA = (str) => {
    if (!str) return 'XXX';
    const m = str.match(/\(([A-Z]{3})\)/);
    if (m) return m[1];
    const key = str.trim().toLowerCase();
    if (CITY_TO_IATA[key]) return CITY_TO_IATA[key];
    // Si déjà un code 3 lettres
    if (/^[A-Za-z]{3}$/.test(key)) return key.toUpperCase();
    return str.substring(0, 3).toUpperCase();
};

// ── Constructeurs de deep links par compagnie ──────────────────────────────
const buildDeepLink = (airlineCode, dep, arr, depDate, retDate) => {
    switch (airlineCode) {
        case 'HF': // Air Côte d'Ivoire (pas de deep-link fiable → Google Flights filtré sur HF)
            return `https://www.google.com/travel/flights?q=Flights%20from%20${dep}%20to%20${arr}%20on%20${depDate}%20returning%20${retDate}%20Air%20Cote%20d%27Ivoire`;
        case 'AF': // Air France
            return `https://wwws.airfrance.fr/search/offers?bookingFlow=LEISURE&pax=1ADT&cabinClass=ECONOMY&activeConnection=0&connections=${dep}-${arr}-${depDate},${arr}-${dep}-${retDate}`;
        case 'ET': // Ethiopian Airlines
            return `https://book.ethiopianairlines.com/dx/EDX/dyn/air/booking/availability?TRIP_TYPE=R&CABIN_CLASS=Y&ADT=1&CHD=0&INF=0&O0=${dep}&D0=${arr}&DDATE0=${depDate}&O1=${arr}&D1=${dep}&DDATE1=${retDate}`;
        case 'TK': // Turkish Airlines
            return `https://www.turkishairlines.com/en-int/flights/booking/?currency=USD&dateOption=normal&adultCount=1&childCount=0&infantCount=0&ond_0=${dep}%2C${arr}%2C${depDate}&ond_1=${arr}%2C${dep}%2C${retDate}`;
        case 'EK': // Emirates
            return `https://www.emirates.com/english/book/flight-search-results.aspx?fromCity=${dep}&toCity=${arr}&departDate=${depDate}&returnDate=${retDate}&numAdult=1&cabinClass=Y`;
        case 'QR': // Qatar Airways
            return `https://booking.qatarairways.com/nsp/views/showBooking.action?bookingClass=E&tripType=R&fromStation=${dep}&toStation=${arr}&departing=${depDate}&returning=${retDate}&adults=1`;
        case 'AT': // Royal Air Maroc
            return `https://www.royalairmaroc.com/fr-fr/reservation?from=${dep}&to=${arr}&departureDate=${depDate}&returnDate=${retDate}&tripType=R&adults=1&cabin=ECONOMY`;
        case 'SN': // Brussels Airlines
            return `https://www.brusselsairlines.com/en/booking/flight-search?tripType=ROUND_TRIP&originCode=${dep}&destinationCode=${arr}&outboundDate=${depDate}&inboundDate=${retDate}&adults=1&cabinClass=ECONOMY`;
        case 'KQ': // Kenya Airways
            return `https://www.kenya-airways.com/booking/?from=${dep}&to=${arr}&depart=${depDate}&return=${retDate}&adults=1`;
        case 'MS': // EgyptAir
            return `https://book.egyptair.com/dx/EAdx/#/flight-selection?journeyType=ROUND_TRIP&origin=${dep}&destination=${arr}&departure=${depDate}&return=${retDate}&adults=1`;
        case 'AH': // Air Algérie
            return `https://reservations.airalgerie.dz/plnext/AH_PROD/?TripType=R&O1=${dep}&D1=${arr}&DD1=${depDate}&O2=${arr}&D2=${dep}&DD2=${retDate}&Adults=1&Cabin=Y`;
        case 'TU': // Tunisair
            return `https://www.tunisair.com/site/publish/content/flightbooking.asp?from=${dep}&to=${arr}&departure=${depDate}&return=${retDate}&adults=1`;
        case 'WB': // Rwandair
            return `https://book.rwandair.com/plnext/WBibe/Override.action?TripType=R&O1=${dep}&D1=${arr}&DD1=${depDate}&O2=${arr}&D2=${dep}&DD2=${retDate}&Adults=1&Cabin=Y`;
        case 'IB': // Iberia
            return `https://www.iberia.com/fr/vols/?market=fr&language=fr&origin=${dep}&destination=${arr}&departureDate=${depDate}&returnDate=${retDate}&adults=1&cabin=ECONOMY`;
        case 'SS': // Corsair
            return `https://flywith.flycorsair.com/Flight/InternalSelect?o1=${dep}&d1=${arr}&dd1=${depDate}&o2=${arr}&d2=${dep}&dd2=${retDate}&ADT=1&CHD=0&INF=0&CABIN=Y&TT=R`;
        default:
            // Fallback Google Flights pour compagnies inconnues
            return `https://www.google.com/travel/flights?q=Flights%20from%20${dep}%20to%20${arr}%20on%20${depDate}%20returning%20${retDate}`;
    }
};

// ── Fonction de génération de vols de secours (Fallback) ───────────────────
const generateFallbackFlights = (depart, destination, departIso) => {
    const depCode = getIATA(depart);
    const arrCode = getIATA(destination);
    const retIso = new Date(new Date(departIso).getTime() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const base = [
        { airline: "Air Côte d'Ivoire", airlineCode: "HF", flightNumber: "HF 101", departureTime: "08:00", arrivalTime: "14:30", duration: "6h30", stops: 0, stopInfo: "Direct", priceUSD: 450 },
        { airline: "Air France",        airlineCode: "AF", flightNumber: "AF 521", departureTime: "22:45", arrivalTime: "07:15", duration: "8h30", stops: 0, stopInfo: "Direct", priceUSD: 680 },
        { airline: "Ethiopian Airlines", airlineCode: "ET", flightNumber: "ET 934", departureTime: "11:20", arrivalTime: "21:40", duration: "10h20", stops: 1, stopInfo: "1 escale (Addis-Abeba)", priceUSD: 520 },
        { airline: "Turkish Airlines",  airlineCode: "TK", flightNumber: "TK 562", departureTime: "23:55", arrivalTime: "13:30", duration: "13h35", stops: 1, stopInfo: "1 escale (Istanbul)", priceUSD: 610 },
        { airline: "Royal Air Maroc",   airlineCode: "AT", flightNumber: "AT 569", departureTime: "15:40", arrivalTime: "23:50", duration: "8h10", stops: 1, stopInfo: "1 escale (Casablanca)", priceUSD: 575 },
    ];

    return base.map((f) => ({
        ...f,
        departureAirport: depCode,
        arrivalAirport: arrCode,
        cabin: "Economique",
        bookingUrl: buildDeepLink(f.airlineCode, depCode, arrCode, departIso, retIso),
    }));
};

/* ─────────────────────────────────────────────────────────────────────────────
   Utilitaire : appel Gemini avec timeout + retry
───────────────────────────────────────────────────────────────────────────── */
async function callGemini(prompt, timeoutMs = 25000, maxRetries = 3) {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY non configurée dans .env');

    let lastErr;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                GEMINI_URL,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 4096,
                    },
                },
                {
                    timeout: timeoutMs,
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Réponse Gemini vide ou inattendue');
            return text;
        } catch (err) {
            lastErr = err;
            const status = err.response?.status;
            const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'));
            // Retry seulement sur 503 (overload), 429 (rate limit) ou timeout
            if (status === 503 || status === 429 || isTimeout) {
                const delay = 1000 * attempt; // 1s, 2s, 3s
                console.log(`[Gemini] ${status || err.code || 'Timeout'} – retry ${attempt}/${maxRetries} dans ${delay}ms…`);
                if (attempt < maxRetries) {
                    await new Promise((r) => setTimeout(r, delay));
                    continue;
                }
            }
            throw err;
        }
    }
    throw lastErr;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Utilitaire : extraire le JSON d'une réponse Gemini
───────────────────────────────────────────────────────────────────────────── */
function extractJSON(text) {
    // Nettoyer les blocs markdown
    let cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

    // Extraire uniquement le tableau JSON
    const start = cleaned.indexOf('[');
    const end   = cleaned.lastIndexOf(']');

    if (start === -1 || end === -1 || end <= start) {
        throw new Error('Aucun tableau JSON valide dans la réponse Gemini');
    }

    return JSON.parse(cleaned.slice(start, end + 1));
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/flights/airlines
───────────────────────────────────────────────────────────────────────────── */
const getAirlines = async (req, res) => {
    try {
        const now = Date.now();

        // Servir le cache
        if (airlinesCache && now - airlinesCacheTime < CACHE_TTL_MS) {
            return res.json({ success: true, airlines: airlinesCache });
        }

        console.log('[Gemini] Récupération des compagnies aériennes…');

        const prompt = `List exactly 30 major international airlines that operate regular flights to/from Côte d'Ivoire (Abidjan ABJ airport, West Africa).

CRITICAL: Return ONLY a raw JSON array. No markdown, no backticks, no code blocks, no explanation. Start with [ and end with ].

Format: [{"name":"Full Airline Name","code":"XX","bookingUrl":"https://booking-url.com"}]

Include: Ethiopian Airlines, Air France, Turkish Airlines, Royal Air Maroc, Brussels Airlines, Kenya Airways, Emirates, Air Cote d'Ivoire, Corsair, Transavia, Tunisair, Asky Airlines, EgyptAir, Qatar Airways, Rwandair, Air Algerie, Air Senegal, Iberia, KLM, Lufthansa, British Airways, Swiss, South African Airways, Air Burkina, Nouvelair, etc.`;

        const text = await callGemini(prompt, 20000, 2);
        const parsed = extractJSON(text);

        const valid = parsed.filter(
            (a) => a && typeof a.name === 'string' && a.name.trim() &&
                   typeof a.code === 'string' && a.code.trim()
        );

        if (valid.length === 0) throw new Error('Aucune compagnie valide retournée par Gemini');

        airlinesCache = [
            { name: 'Toutes les compagnies', code: 'all', bookingUrl: '' },
            ...valid,
        ];
        airlinesCacheTime = now;

        console.log(`[Gemini] ${valid.length} compagnies récupérées ✅`);
        return res.json({ success: true, airlines: airlinesCache });

    } catch (err) {
        console.error('[Gemini Airlines] Erreur – fallback utilisé:', err.message);
        return res.json({ success: true, airlines: FALLBACK_AIRLINES, fallback: true });
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/flights/search
   Body: { depart, destination, date?, airline? }
───────────────────────────────────────────────────────────────────────────── */
/* Convertit "Paris (CDG)" / "abidjan" / "ABJ" → code IATA */
async function resolveIATA(input) {
    const s = (input || '').toString().trim();
    if (!s) return null;
    // 1) "(XXX)" présent
    const m = s.match(/\(([A-Za-z]{3})\)/);
    if (m) return m[1].toUpperCase();
    // 2) Déjà un code 3 lettres
    if (/^[A-Za-z]{3}$/.test(s)) return s.toUpperCase();
    // 3) Map ville → IATA
    const key = s.toLowerCase();
    if (CITY_TO_IATA[key]) return CITY_TO_IATA[key];
    // 4) Demande à Gemini
    try {
        const text = await callGemini(
            `Return ONLY the 3-letter IATA airport code (uppercase, no quotes, no other text) for the main international airport of: ${s}`,
            8000, 1
        );
        const code = (text || '').match(/[A-Z]{3}/);
        if (code) return code[0];
    } catch { /* ignore */ }
    return null;
}

/* Formate un nombre de minutes en "8h45" */
function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
}

/* Formate "2026-04-30 22:15" → "22:15" */
function formatTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    return parts.length > 1 ? parts[1] : timeStr;
}

/* Construit l'URL Google Flights pour un vol précis */
function buildGoogleFlightsUrl(dep, arr, departDate, returnDate) {
    const base = 'https://www.google.com/travel/flights';
    const q = returnDate
        ? `Flights from ${dep} to ${arr} on ${departDate} returning ${returnDate}`
        : `Flights from ${dep} to ${arr} on ${departDate}`;
    return `${base}?q=${encodeURIComponent(q)}&hl=fr&curr=USD`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/flights/search  – via SerpApi Google Flights (vraies données)
───────────────────────────────────────────────────────────────────────────── */
const searchFlights = async (req, res) => {
    const { depart, destination, date, returnDate, tripType, airline } = req.body;
    try {
        if (!depart || !destination) {
            return res.status(400).json({
                success: false,
                message: 'Les champs "départ" et "destination" sont obligatoires.',
            });
        }

        const isRoundTrip = tripType === 'round_trip' || (returnDate && returnDate.trim() !== '');

        if (!SERPAPI_KEY) {
            return res.status(500).json({
                success: false,
                message: 'SERPAPI_KEY non configurée dans .env',
            });
        }

        // 1) Résoudre les codes IATA
        const [depIATA, arrIATA] = await Promise.all([
            resolveIATA(depart),
            resolveIATA(destination),
        ]);

        if (!depIATA || !arrIATA) {
            return res.status(400).json({
                success: false,
                message: `Impossible de résoudre les aéroports : "${depart}" → "${destination}". Précisez la ville ou utilisez un code IATA.`,
            });
        }

        // 2) Préparer dates
        const today = new Date();
        const default30Days = new Date(today.getTime() + 30 * 24 * 3600 * 1000);
        const outboundDate = date || default30Days.toISOString().slice(0, 10);
        // Date retour : utilisateur OU +7 jours par défaut si aller-retour
        const computedReturnDate = isRoundTrip
            ? (returnDate || new Date(new Date(outboundDate).getTime() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10))
            : null;

        // 3) Appel SerpApi en EUR (FCFA pegg à l'euro = conversion exacte)
        const tripLabel = isRoundTrip ? `aller-retour (retour ${computedReturnDate})` : 'aller simple';
        console.log(`[SerpApi] Recherche: ${depIATA} → ${arrIATA} le ${outboundDate} (${tripLabel})`);

        const params = {
            engine: 'google_flights',
            departure_id: depIATA,
            arrival_id: arrIATA,
            outbound_date: outboundDate,
            currency: 'EUR',
            hl: 'fr',
            gl: 'fr',
            type: isRoundTrip ? 1 : 2, // 1 = round trip, 2 = one way
            api_key: SERPAPI_KEY,
        };
        if (isRoundTrip) params.return_date = computedReturnDate;

        const response = await axios.get(SERPAPI_URL, {
            params,
            timeout: 30000,
        });

        const data = response.data;

        if (data.error) {
            console.error('[SerpApi] Erreur API:', data.error);
            return res.status(404).json({
                success: false,
                message: `Aucun vol trouvé : ${data.error}`,
            });
        }

        // 4) Fusionner best_flights et other_flights
        const rawFlights = [
            ...(data.best_flights || []),
            ...(data.other_flights || []),
        ];

        if (rawFlights.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Aucun vol trouvé de "${depart}" vers "${destination}" pour cette date.`,
            });
        }

        // 5) Filtrer par compagnie si demandé
        const airlineNorm = (airline || '').toString().trim().toLowerCase();
        const filterByAirline =
            airlineNorm &&
            airlineNorm !== 'all' &&
            airlineNorm !== 'toutes' &&
            airlineNorm !== 'toutes les compagnies';

        let filtered = rawFlights;
        if (filterByAirline) {
            filtered = rawFlights.filter((f) => {
                const segments = f.flights || [];
                return segments.some((s) =>
                    (s.airline || '').toLowerCase().includes(airlineNorm)
                );
            });
            if (filtered.length === 0) filtered = rawFlights; // Fallback : ne pas tout vider
        }

        // 6) Mapper vers le format attendu par le frontend
        const googleFlightsUrl = data.search_metadata?.google_flights_url ||
            buildGoogleFlightsUrl(depIATA, arrIATA, outboundDate, returnDate);

        let flights = filtered.map((entry) => {
            const segments = entry.flights || [];
            if (segments.length === 0) return null;

            const first = segments[0];
            const last = segments[segments.length - 1];
            const layovers = entry.layovers || [];
            const stops = segments.length - 1;

            // Code IATA de la compagnie depuis flight_number "AF 705" → "AF"
            const flightNum = (first.flight_number || '').trim();
            const codeMatch = flightNum.match(/^([A-Z0-9]{2,3})/);
            const airlineCode = codeMatch ? codeMatch[1] : '';

            // stopInfo
            let stopInfo = 'Direct';
            if (stops === 1 && layovers[0]) {
                stopInfo = `1 escale (${layovers[0].name || layovers[0].id || ''})`;
            } else if (stops > 1) {
                stopInfo = `${stops} escales`;
            }

            // Cabine en français
            const cabinMap = {
                'Economy': 'Economique',
                'Premium economy': 'Premium Eco',
                'Business': 'Business',
                'First': 'First',
            };

            return {
                airline: first.airline || AIRLINE_CODE_TO_NAME[airlineCode] || 'Compagnie',
                airlineCode,
                airlineLogo: entry.airline_logo || first.airline_logo || '',
                bookingUrl: '', // Rempli juste après avec l'URL vers /flights/book
                fallbackUrl: googleFlightsUrl,
                flightNumber: flightNum,
                departureTime: formatTime(first.departure_airport?.time),
                arrivalTime: formatTime(last.arrival_airport?.time),
                departureAirport: first.departure_airport?.id || depIATA,
                arrivalAirport: last.arrival_airport?.id || arrIATA,
                duration: formatDuration(entry.total_duration || 0),
                stops,
                stopInfo,
                priceEUR: entry.price || 0,
                priceUSD: Math.round((entry.price || 0) * 1.08), // estimation USD pour rétrocompat
                cabin: cabinMap[first.travel_class] || first.travel_class || 'Economique',
                bookingToken: entry.booking_token || '',
                tripType: isRoundTrip ? 'round_trip' : 'one_way',
            };
        }).filter((f) => f && f.priceEUR > 0 && f.departureTime && f.arrivalTime);

        if (flights.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Aucun vol exploitable trouvé de "${depart}" vers "${destination}".`,
            });
        }

        // 7) Conversion EUR → FCFA (taux fixe XOF/EUR = 655.957) + URL de réservation
        flights = flights.map((f) => {
            const priceFCFA = Math.round((f.priceEUR || 0) * EUR_TO_FCFA);
            const bookingParams = new URLSearchParams({
                token: f.bookingToken || '',
                dep: depIATA,
                arr: arrIATA,
                date: outboundDate,
            });
            if (isRoundTrip && computedReturnDate) {
                bookingParams.set('returnDate', computedReturnDate);
                bookingParams.set('tripType', 'round_trip');
            }
            const bookingUrl = f.bookingToken
                ? `/api/flights/book?${bookingParams.toString()}`
                : f.fallbackUrl;
            return {
                ...f,
                priceFCFA,
                priceDisplay: priceFCFA.toLocaleString('fr-FR'),
                isBestPrice: false,
                bookingUrl,
            };
        });

        // 8) Marquer le moins cher + trier
        const minPrice = Math.min(...flights.map((f) => f.priceEUR));
        flights = flights.map((f) => ({ ...f, isBestPrice: f.priceEUR === minPrice }));
        flights.sort((a, b) => a.priceEUR - b.priceEUR);

        console.log(`[SerpApi] ${flights.length} vols réels trouvés ✅`);

        // 9) Enregistrer dans l'historique si l'utilisateur est connecté
        if (req.user && req.user.id) {
            try {
                await SearchHistory.create({
                    userId: req.user.id,
                    type: 'flight',
                    query: `${depIATA} → ${arrIATA}`,
                    details: {
                        depart,
                        destination,
                        departIATA: depIATA,
                        arrivalIATA: arrIATA,
                        date: outboundDate,
                        returnDate: computedReturnDate,
                        tripType: isRoundTrip ? 'round_trip' : 'one_way',
                        airline: airline || 'Toutes'
                    },
                    resultsCount: flights.length
                });
            } catch (historyErr) {
                console.error('[SearchHistory] Erreur sauvegarde:', historyErr.message);
            }
        }

        return res.json({
            success: true,
            flights,
            meta: {
                depart,
                destination,
                departIATA: depIATA,
                arrivalIATA: arrIATA,
                date: outboundDate,
                returnDate: computedReturnDate,
                tripType: isRoundTrip ? 'round_trip' : 'one_way',
                count: flights.length,
                source: 'google_flights',
            },
        });

    } catch (err) {
        console.error('[SerpApi Search] Erreur:', err.response?.data || err.message);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche de vols. Veuillez réessayer dans quelques secondes.',
        });
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/flights/airports?q=abidj
   Autocomplete : retourne les aéroports correspondant à la requête
───────────────────────────────────────────────────────────────────────────── */
const airportsCache = new Map(); // clé: query lowercased → { time, data }
const AIRPORTS_TTL_MS = 60 * 60 * 1000; // 1h

const getAirports = async (req, res) => {
    try {
        const q = (req.query.q || '').toString().trim();
        if (q.length < 2) {
            return res.json({ success: true, airports: [] });
        }

        const key = q.toLowerCase();
        const cached = airportsCache.get(key);
        const now = Date.now();
        if (cached && now - cached.time < AIRPORTS_TTL_MS) {
            return res.json({ success: true, airports: cached.data });
        }

        const prompt = `List up to 5 real airports matching the search query "${q}". Match by city, country, or airport code. Order by relevance (main international airports first).

CRITICAL: Return ONLY a raw JSON array. No markdown, no backticks, no explanation. Start with [ and end with ].

Format: [{"city":"Abidjan","country":"Côte d'Ivoire","airport":"Aéroport Félix Houphouët-Boigny","iata":"ABJ"}]

Rules:
- Only real existing commercial airports
- "city": city name in French if commonly used in French
- "country": country name in French
- "airport": full airport name in French
- "iata": real 3-letter IATA code (uppercase)
- If query is a 3-letter code, return that airport first
- If query matches a country, return that country's main international airports`;

        const text = await callGemini(prompt, 12000, 2);
        const parsed = extractJSON(text);

        const valid = parsed.filter(
            (a) =>
                a &&
                typeof a.city === 'string' && a.city.trim() &&
                typeof a.iata === 'string' && /^[A-Z]{3}$/.test(a.iata.trim())
        ).map((a) => ({
            city: a.city.trim(),
            country: (a.country || '').toString().trim(),
            airport: (a.airport || '').toString().trim(),
            iata: a.iata.trim().toUpperCase(),
        }));

        airportsCache.set(key, { time: now, data: valid });
        return res.json({ success: true, airports: valid });

    } catch (err) {
        console.error('[Gemini Airports] Erreur:', err.message);
        return res.json({ success: true, airports: [] });
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/flights/book?token=…&dep=…&arr=…&date=…
   Récupère l'URL de réservation officielle de la compagnie via SerpApi
   et redirige automatiquement l'utilisateur (auto-submit POST si nécessaire)
───────────────────────────────────────────────────────────────────────────── */
const escHtml = (s) => String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const getBookingRedirect = async (req, res) => {
    const { token, dep, arr, date, returnDate, tripType } = req.query;
    const isRoundTrip = tripType === 'round_trip' || !!returnDate;

    const fallbackQ = isRoundTrip
        ? `Flights from ${dep || ''} to ${arr || ''} on ${date || ''} returning ${returnDate || ''}`
        : `Flights from ${dep || ''} to ${arr || ''} on ${date || ''}`;
    const fallback = `https://www.google.com/travel/flights?hl=fr&curr=EUR&q=${encodeURIComponent(fallbackQ)}`;

    if (!token || !dep || !arr || !date) {
        return res.redirect(fallback);
    }
    if (!SERPAPI_KEY) {
        return res.redirect(fallback);
    }

    try {
        console.log(`[SerpApi Booking] Récupération URL réservation pour ${dep}→${arr} ${date}${isRoundTrip ? ` (retour ${returnDate})` : ''}`);

        const params = {
            engine: 'google_flights',
            departure_id: dep,
            arrival_id: arr,
            outbound_date: date,
            currency: 'EUR',
            hl: 'fr',
            gl: 'fr',
            type: isRoundTrip ? 1 : 2,
            booking_token: token,
            api_key: SERPAPI_KEY,
        };
        if (isRoundTrip && returnDate) params.return_date = returnDate;

        const response = await axios.get(SERPAPI_URL, {
            params,
            timeout: 30000,
        });

        const options = response.data?.booking_options || [];
        if (options.length === 0) {
            console.log('[SerpApi Booking] Aucune option de réservation – fallback Google Flights');
            return res.redirect(fallback);
        }

        // Première option = "best/cheapest"
        const opt = options[0].together || options[0].separate_tickets?.[0];
        const br = opt?.booking_request;

        if (!br?.url) {
            return res.redirect(fallback);
        }

        const airlineName = opt.book_with || 'la compagnie';

        // Si pas de post_data → simple redirect GET
        if (!br.post_data) {
            console.log(`[SerpApi Booking] Redirection GET vers ${airlineName}: ${br.url}`);
            return res.redirect(br.url);
        }

        // Sinon : auto-submit POST via HTML
        const fields = br.post_data.split('&').map((pair) => {
            const idx = pair.indexOf('=');
            const key = idx >= 0 ? pair.slice(0, idx) : pair;
            const val = idx >= 0 ? pair.slice(idx + 1) : '';
            return `<input type="hidden" name="${escHtml(decodeURIComponent(key))}" value="${escHtml(decodeURIComponent(val))}">`;
        }).join('\n      ');

        console.log(`[SerpApi Booking] Auto-submit POST vers ${airlineName}: ${br.url}`);

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirection vers ${escHtml(airlineName)}…</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f4f6; color: #1f2937; }
    .box { text-align: center; padding: 2.5rem; background: white; border-radius: 1.5rem; shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); max-width: 400px; width: 90%; }
    .spinner { width: 56px; height: 56px; border: 4px solid #e5e7eb; border-top-color: #1C4CA5; border-radius: 50%; animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { color: #111827; font-size: 1.5rem; font-weight: 800; margin: 0 0 0.75rem; }
    p { color: #6b7280; font-size: 0.95rem; margin: 0 0 2rem; line-height: 1.5; }
    .btn { display: inline-block; background: #1C4CA5; color: white; font-weight: 700; padding: 1rem 2rem; border-radius: 1rem; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
    .btn:hover { background: #163a80; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(28, 76, 165, 0.2); }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h1>Redirection vers ${escHtml(airlineName)}…</h1>
    <p>Nous vous préparons l'accès à la page de réservation officielle. Cela ne prendra que quelques secondes.</p>
    
    <form id="redirectForm" action="${escHtml(br.url)}" method="POST">
        ${fields}
        <button type="submit" class="btn">Continuer vers la compagnie</button>
    </form>
  </div>

  <script>
    // Tentative de soumission automatique
    setTimeout(function() {
      try {
        document.getElementById('redirectForm').submit();
      } catch (e) {
        console.error('Auto-submit failed:', e);
      }
    }, 500);
  </script>
</body>
</html>`;

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (err) {
        console.error('[SerpApi Booking] Erreur:', err.response?.data?.error || err.message);
        return res.redirect(fallback);
    }
};

module.exports = { getAirlines, searchFlights, getAirports, getBookingRedirect };
