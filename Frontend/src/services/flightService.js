import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Récupère la liste des compagnies aériennes depuis le backend (Gemini + cache 24h).
 * @returns {Promise<{name, code, bookingUrl}[]>}
 */
export const fetchAirlines = async () => {
  const res = await axios.get(`${API_BASE}/flights/airlines`);
  return res.data; // { success, airlines, fallback? }
};

/**
 * Autocomplete aéroports via Gemini (cache backend 1h).
 * @param {string} query - Texte tapé par l'utilisateur (min 2 caractères)
 * @returns {Promise<{city, country, airport, iata}[]>}
 */
export const fetchAirports = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await axios.get(`${API_BASE}/flights/airports`, { params: { q: query.trim() } });
    return res.data?.airports || [];
  } catch {
    return [];
  }
};

/**
 * Lance une recherche de vols via Gemini.
 * @param {{ depart: string, destination: string, date?: string, airline?: string }} params
 * @returns {Promise<{success, flights, meta}>}
 */
export const searchFlights = async ({ depart, destination, date, returnDate, tripType, airline }) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await axios.post(`${API_BASE}/flights/search`, {
    depart,
    destination,
    date: date || undefined,
    returnDate: returnDate || undefined,
    tripType: tripType || 'one_way',
    airline: airline || 'all',
  }, { headers });
  return res.data; // { success, flights, meta }
};
