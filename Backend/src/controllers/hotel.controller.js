const axios = require('axios');
const { SearchHistory, Favorite } = require('../models');

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search.json';

// Cache hôtels : 30 minutes
let hotelsCache = {};
const HOTELS_CACHE_TTL = 30 * 60 * 1000;

// Fallback hôtels si SerpApi échoue
const FALLBACK_HOTELS = [
    {
        name: "Sofitel Abidjan Hôtel Ivoire",
        location: "Cocody, Abidjan, Côte d'Ivoire",
        rating: 9.2,
        reviews: 1847,
        price: 85000,
        priceDisplay: "85 000",
        badge: "Coup de cœur",
        amenities: ["wifi", "pool", "restaurant", "parking"],
        image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/149550268.jpg?k=5e39e6fc88b0c22e84c498e79f88b8c3e89c4c22add5b8c9f9c57e7e765e55c&o=&hp=1",
        bookingUrl: "https://www.booking.com/hotel/ci/sofitel-abidjan-hotel-ivoire.html",
        stars: 5
    },
    {
        name: "Pullman Abidjan",
        location: "Plateau, Abidjan, Côte d'Ivoire",
        rating: 8.8,
        reviews: 963,
        price: 72000,
        priceDisplay: "72 000",
        badge: "Très bien",
        amenities: ["wifi", "pool", "restaurant", "spa"],
        image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/118205174.jpg?k=08b6fd1b7e9c4b4a1b6b4d31c92f2b8d4e8c7e2f8e6b4e7f8d6b5e4b3a2e1d&o=&hp=1",
        bookingUrl: "https://www.booking.com/hotel/ci/pullman-abidjan.html",
        stars: 5
    },
    {
        name: "Novotel Abidjan",
        location: "Plateau, Abidjan, Côte d'Ivoire",
        rating: 8.4,
        reviews: 1204,
        price: 55000,
        priceDisplay: "55 000",
        badge: "Bien",
        amenities: ["wifi", "pool", "restaurant"],
        image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/122156876.jpg?k=7a3e9e1d2b8c5a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a&o=&hp=1",
        bookingUrl: "https://www.booking.com/hotel/ci/novotel-abidjan.html",
        stars: 4
    },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers – construction params SerpApi à partir des filtres frontend
─────────────────────────────────────────────────────────────────────────────── */
function buildSerpApiParams(opts) {
    const {
        city, checkin, checkout, adults = 2,
        maxPrice, minRating, stars4or5,
        freeCancellation, ecoCertified,
        sortBy, // 'price' | 'rating' | 'reviews' | undefined
    } = opts;

    const params = {
        engine: 'google_hotels',
        q: `hotels in ${city}`,
        check_in_date: checkin,
        check_out_date: checkout,
        adults,
        currency: 'EUR',
        gl: 'ci',
        hl: 'fr',
        api_key: SERPAPI_KEY,
    };

    // maxPrice en FCFA → EUR
    if (maxPrice && maxPrice > 0) {
        params.max_price = Math.round(maxPrice / 655.957);
    }

    // Note minimum : 4/5 → SerpApi attend "8" (sur 10)
    if (minRating) {
        if (minRating >= 4.5) params.rating = '9';
        else if (minRating >= 4.0) params.rating = '8';
        else if (minRating >= 3.5) params.rating = '7';
    }

    if (stars4or5) params.hotel_class = '4,5';
    if (freeCancellation) params.free_cancellation = 'true';
    if (ecoCertified) params.eco_certified = 'true';

    // Tri SerpApi : 3=Prix, 8=Note, 13=Plus avis. Défaut = pertinence
    if (sortBy === 'price') params.sort_by = '3';
    else if (sortBy === 'rating') params.sort_by = '8';
    else if (sortBy === 'reviews') params.sort_by = '13';

    return params;
}

function mapHotel(h, fallbackCity) {
    const priceEUR = h.rate_per_night?.extracted_lowest || null;
    const priceFCFA = priceEUR ? Math.round(priceEUR * 655.957) : null;

    const rating = parseFloat(h.overall_rating) || null;
    const reviews = h.reviews || 0;
    // hotel_class peut être "Hôtel 5 étoiles" (FR), "5-star hotel" (EN) ou un nombre
    let stars = null;
    if (typeof h.hotel_class === 'number') {
        stars = h.hotel_class;
    } else if (typeof h.hotel_class === 'string') {
        const m = h.hotel_class.match(/(\d)/);
        if (m) stars = parseInt(m[1]);
    }

    let image = h.images?.[0]?.thumbnail || h.thumbnail || h.images?.[0]?.original_image || null;
    if (image && image.includes('googleusercontent.com') && image.includes('=s')) {
        image = image.replace(/=s\d+-w\d+-h\d+/, '=s600-w600-h400');
    }

    return {
        name: h.name,
        location: h.description || fallbackCity,
        rating,
        reviews: typeof reviews === 'string' ? parseInt(reviews.replace(/[^0-9]/g, '')) : reviews,
        price: priceFCFA,
        priceDisplay: priceFCFA ? priceFCFA.toLocaleString('fr-FR') : 'Sur demande',
        badge: getBadge(rating),
        amenities: (h.amenities || []).slice(0, 8),
        image,
        bookingUrl: h.link || `https://www.google.com/travel/hotels/entity/${encodeURIComponent(h.name || '')}`,
        stars,
        gps_coordinates: h.gps_coordinates,
    };
}

/* Filtre amenities côté serveur – SerpApi ne supporte pas tous les filtres natifs */
function applyAmenityFilters(hotels, opts) {
    const { hasPool, hasSpa, hasWifi, hasBreakfast, hasParking, hasGym, hasRestaurant } = opts;
    if (!hasPool && !hasSpa && !hasWifi && !hasBreakfast && !hasParking && !hasGym && !hasRestaurant) {
        return hotels;
    }
    return hotels.filter((h) => {
        const amen = (h.amenities || []).join(' ').toLowerCase();
        if (hasPool && !/(pool|piscine|swimming)/.test(amen)) return false;
        if (hasSpa && !/(spa|massage|wellness|hammam)/.test(amen)) return false;
        if (hasWifi && !/(wi.?fi|internet)/.test(amen)) return false;
        if (hasBreakfast && !/(breakfast|petit.?d[ée]j|d[ée]jeuner)/.test(amen)) return false;
        if (hasParking && !/(parking|park)/.test(amen)) return false;
        if (hasGym && !/(gym|fitness|salle.?de.?sport)/.test(amen)) return false;
        if (hasRestaurant && !/(restaurant)/.test(amen)) return false;
        return true;
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/hotels/nearby?city=Abidjan&checkin=…&checkout=…&adults=…
                       &maxPrice=…&minRating=…&hasPool=…&hasSpa=…&stars4or5=…
─────────────────────────────────────────────────────────────────────────────── */
const getNearbyHotels = async (req, res) => {
    const city = req.query.city || 'Abidjan';
    const checkin = req.query.checkin || getDefaultCheckin();
    const checkout = req.query.checkout || getDefaultCheckout();
    const adults = parseInt(req.query.adults) || 2;

    const truthy = (v) => v === 'true' || v === '1';
    const filters = {
        maxPrice: parseInt(req.query.maxPrice) || null,
        minRating: parseFloat(req.query.minRating) || null,
        stars4or5: truthy(req.query.stars4or5),
        hasPool: truthy(req.query.hasPool),
        hasSpa: truthy(req.query.hasSpa),
        hasWifi: truthy(req.query.hasWifi),
        hasBreakfast: truthy(req.query.hasBreakfast),
        hasParking: truthy(req.query.hasParking),
        hasGym: truthy(req.query.hasGym),
        hasRestaurant: truthy(req.query.hasRestaurant),
        freeCancellation: truthy(req.query.freeCancellation),
        ecoCertified: truthy(req.query.ecoCertified),
        sortBy: req.query.sortBy || null, // 'price' | 'rating' | 'reviews'
    };

    const cacheKey = JSON.stringify({ city, checkin, checkout, adults, ...filters });
    const now = Date.now();

    if (hotelsCache[cacheKey] && now - hotelsCache[cacheKey].time < HOTELS_CACHE_TTL) {
        console.log(`[Hotels] Cache hit: ${city}`);
        return res.json({ success: true, hotels: hotelsCache[cacheKey].data, cached: true });
    }

    try {
        const filterLog = Object.entries(filters)
            .filter(([_, v]) => v)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ') || 'aucun filtre';
        console.log(`[SerpApi Hotels] Recherche: ${city} du ${checkin} au ${checkout} (${adults} adultes) [${filterLog}]`);

        const response = await axios.get(SERPAPI_URL, {
            params: buildSerpApiParams({ city, checkin, checkout, adults, ...filters }),
            timeout: 25000,
        });

        const raw = response.data?.properties;

        if (!raw || raw.length === 0) {
            throw new Error('Aucun hôtel retourné par SerpApi');
        }

        let hotels = raw.map((h) => mapHotel(h, city));

        // Filtres côté serveur (amenities) que SerpApi ne supporte pas natifs
        hotels = applyAmenityFilters(hotels, filters);

        // On ne limite plus à 20/40, on renvoie tout ce qu'on trouve

        hotelsCache[cacheKey] = { data: hotels, time: now };

        // Enregistrer l'historique si l'utilisateur est connecté
        if (req.user) {
            try {
                await SearchHistory.create({
                    userId: req.user.id,
                    type: 'hotel',
                    query: city,
                    details: { city, checkin, checkout, adults, ...filters },
                    resultsCount: hotels.length
                });
            } catch (historyErr) {
                console.error('[History] Erreur sauvegarde:', historyErr.message);
            }
        }

        console.log(`[SerpApi Hotels] ${hotels.length} hôtels trouvés ✅`);
        return res.json({ success: true, hotels });

    } catch (err) {
        console.error('[SerpApi Hotels] Erreur – fallback utilisé:', err.response?.data?.error || err.message);
        
        // On enregistre quand même l'historique même pour le fallback si connecté
        if (req.user) {
            SearchHistory.create({
                userId: req.user.id,
                type: 'hotel',
                query: city,
                details: { city, checkin, checkout, adults, ...filters },
                resultsCount: FALLBACK_HOTELS.length
            }).catch(() => {});
        }

        return res.json({ success: true, hotels: FALLBACK_HOTELS, fallback: true });
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/hotels/search
   Body: { city, checkin, checkout, adults, maxPrice, minRating, stars4or5, hasPool, hasSpa }
─────────────────────────────────────────────────────────────────────────────── */
const searchHotels = async (req, res) => {
    const {
        city, checkin, checkout, adults = 2,
        maxPrice, minRating, stars4or5, hasPool, hasSpa,
    } = req.body;

    if (!city) {
        return res.status(400).json({ success: false, message: 'La destination est requise.' });
    }

    const checkinDate = checkin || getDefaultCheckin();
    const checkoutDate = checkout || getDefaultCheckout();
    const filters = {
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        minRating: minRating ? parseFloat(minRating) : null,
        stars4or5: !!stars4or5,
        hasPool: !!hasPool,
        hasSpa: !!hasSpa,
    };

    const cacheKey = JSON.stringify({ city, checkinDate, checkoutDate, adults, ...filters });
    const now = Date.now();

    if (hotelsCache[cacheKey] && now - hotelsCache[cacheKey].time < HOTELS_CACHE_TTL) {
        return res.json({ success: true, hotels: hotelsCache[cacheKey].data, cached: true });
    }

    try {
        const filterLog = Object.entries(filters)
            .filter(([_, v]) => v)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ') || 'aucun filtre';
        console.log(`[SerpApi Hotels] Recherche: ${city} du ${checkinDate} au ${checkoutDate} (${adults} adultes) [${filterLog}]`);

        const response = await axios.get(SERPAPI_URL, {
            params: buildSerpApiParams({
                city, checkin: checkinDate, checkout: checkoutDate, adults, ...filters,
            }),
            timeout: 25000,
        });

        const raw = response.data?.properties;

        if (!raw || raw.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Aucun hôtel trouvé pour "${city}" à ces dates.`
            });
        }

        let hotels = raw.map((h) => mapHotel(h, city));
        hotels = applyAmenityFilters(hotels, filters);
        // On renvoie tous les hôtels trouvés sans limite de 40

        hotelsCache[cacheKey] = { data: hotels, time: now };

        console.log(`[SerpApi Hotels] ${hotels.length} résultats pour ${city} ✅`);
        return res.json({
            success: true,
            hotels,
            city,
            checkin: checkinDate,
            checkout: checkoutDate,
            filters,
        });

    } catch (err) {
        console.error('[SerpApi Hotels Search] Erreur:', err.response?.data?.error || err.message);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche d\'hôtels. Réessayez dans quelques instants.',
        });
    }
};

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function getBadge(rating) {
    if (!rating) return 'Hôtel';
    if (rating >= 9.0) return 'Coup de cœur';
    if (rating >= 8.0) return 'Très bien';
    if (rating >= 7.0) return 'Bien';
    return 'Correct';
}

function getDefaultCheckin() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
}

function getDefaultCheckout() {
    const d = new Date();
    d.setDate(d.getDate() + 9);
    return d.toISOString().slice(0, 10);
}

/* ─────────────────────────────────────────────────────────────────────────────
   FAVORITES & HISTORY
─────────────────────────────────────────────────────────────────────────────── */

const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { hotel } = req.body;
        
        if (!hotel || !hotel.name) {
            return res.status(400).json({ success: false, message: 'Données de l\'hôtel manquantes.' });
        }

        const itemId = hotel.name; // On utilise le nom comme ID unique pour SerpApi (pas d'ID fixe)
        const type = 'hotel';

        const existing = await Favorite.findOne({ where: { userId, type, itemId } });
        if (existing) {
            await existing.destroy();
            return res.json({ success: true, message: 'Retiré des favoris', isFavorite: false });
        } else {
            await Favorite.create({ 
                userId, 
                type, 
                itemId, 
                data: hotel 
            });
            return res.status(201).json({ success: true, message: 'Ajouté aux favoris', isFavorite: true });
        }
    } catch (err) {
        console.error('[Hotels] toggleFavorite error:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.findAll({ 
            where: { userId: req.user.id, type: 'hotel' },
            order: [['createdAt', 'DESC']]
        });
        return res.json({ 
            success: true, 
            favorites: favorites.map(f => f.data) 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await SearchHistory.findAll({ 
            where: { userId: req.user.id, type: 'hotel' },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        return res.json({ success: true, history });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

const deleteHistory = async (req, res) => {
    try {
        await SearchHistory.destroy({ where: { userId: req.user.id, type: 'hotel' } });
        return res.json({ success: true, message: 'Historique effacé.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

module.exports = {
    getNearbyHotels,
    searchHotels,
    toggleFavorite,
    getFavorites,
    getHistory,
    deleteHistory
};
