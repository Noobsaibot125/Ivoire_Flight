import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook générique : état persisté dans localStorage.
 */
export const useLocalStorage = (key, initialValue) => {
    const lastKeyRef = useRef(key);
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch { /* quota */ }
    }, [key, value]);

    useEffect(() => {
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        try {
            const raw = localStorage.getItem(key);
            setValue(raw ? JSON.parse(raw) : initialValue);
        } catch {
            setValue(initialValue);
        }
    }, [key, initialValue]);

    return [value, setValue];
};

const useUserScope = () => {
    const { user } = useAuth();
    if (!user) return null;
    return user.id || user.email || user.phone || 'anon';
};

/**
 * Favoris d'hôtels — Synchronisés avec le Backend si connecté.
 */
export const useHotelFavorites = () => {
    const { token } = useAuth();
    const userScope = useUserScope();
    const key = userScope ? `ivoireflights_hotel_favorites_${userScope}` : 'ivoireflights_hotel_favorites_guest';
    const [localFavorites, setLocalFavorites] = useLocalStorage(key, []);
    const [backendFavorites, setBackendFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Charger les favoris du backend
    const fetchBackendFavorites = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/hotels/favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.favorites)) {
                setBackendFavorites(data.favorites || []);
            }
        } catch (err) {
            console.error('Erreur fetch favoris:', err.message);
        } finally {
            setLoading(false);
        }
    }, [token, apiBase]);

    useEffect(() => {
        if (token) fetchBackendFavorites();
        else setBackendFavorites([]);
    }, [token, fetchBackendFavorites]);

    const favorites = (token && Array.isArray(backendFavorites)) ? backendFavorites : localFavorites;

    const isFavorite = useCallback(
        (hotel) => (favorites || []).some((f) => f.name === hotel?.name),
        [favorites]
    );

    const toggleFavorite = useCallback(async (hotel) => {
        if (token) {
            // Optimistic update
            const exists = backendFavorites.some(f => f.name === hotel.name);
            const newFavorites = exists 
                ? backendFavorites.filter(f => f.name !== hotel.name)
                : [hotel, ...backendFavorites];
            
            setBackendFavorites(newFavorites);

            try {
                const res = await fetch(`${apiBase}/hotels/favorites`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ hotel })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                // On rafraîchit pour être sûr de la cohérence avec le serveur
                fetchBackendFavorites();
            } catch (err) {
                console.error('Erreur toggle favori:', err.message);
                fetchBackendFavorites(); // Rollback
            }
        } else {
            // Local fallback
            setLocalFavorites((prev) => {
                const exists = prev.some((f) => f.name === hotel.name);
                if (exists) return prev.filter((f) => f.name !== hotel.name);
                return [{ ...hotel, addedAt: Date.now() }, ...prev].slice(0, 50);
            });
        }
    }, [token, backendFavorites, apiBase, fetchBackendFavorites, setLocalFavorites]);

    return {
        favorites: favorites || [],
        isFavorite,
        toggleFavorite,
        loading,
        refresh: fetchBackendFavorites,
        isAuthenticated: !!token,
    };
};

/**
 * Historique des recherches d'hôtels — Synchronisé avec le Backend.
 */
export const useHotelSearchHistory = () => {
    const { token } = useAuth();
    const userScope = useUserScope();
    const key = userScope ? `ivoireflights_hotel_history_${userScope}` : 'ivoireflights_hotel_history_guest';
    const [localHistory, setLocalHistory] = useLocalStorage(key, []);
    const [backendHistory, setBackendHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchBackendHistory = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/hotels/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.history)) {
                setBackendHistory(data.history || []);
            }
        } catch (err) {
            console.error('Erreur fetch historique:', err.message);
        } finally {
            setLoading(false);
        }
    }, [token, apiBase]);

    useEffect(() => {
        if (token) fetchBackendHistory();
        else setBackendHistory([]);
    }, [token, fetchBackendHistory]);

    const history = (token && Array.isArray(backendHistory))
        ? backendHistory.map(h => ({ ...(h.details || {}), searchedAt: h.createdAt })) 
        : localHistory;

    const addEntry = useCallback((entry) => {
        if (token) {
            // Si on est connecté, le backend gère déjà l'ajout via getNearbyHotels
            // On force juste un rafraîchissement de la liste locale
            fetchBackendHistory();
        } else {
            if (!entry?.city) return;
            setLocalHistory((prev) => {
                const key = `${entry.city}|${entry.checkin || ''}|${entry.checkout || ''}`;
                const filtered = prev.filter((e) =>
                    `${e.city}|${e.checkin || ''}|${e.checkout || ''}` !== key
                );
                return [{ ...entry, searchedAt: Date.now() }, ...filtered].slice(0, 10);
            });
        }
    }, [token, setLocalHistory, fetchBackendHistory]);

    const clearHistory = useCallback(async () => {
        if (token) {
            setBackendHistory([]);
            try {
                await fetch(`${apiBase}/hotels/history`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch {}
        } else {
            setLocalHistory([]);
        }
    }, [token, apiBase, setLocalHistory]);

    return {
        history: history || [],
        addEntry,
        clearHistory,
        loading,
        refresh: fetchBackendHistory,
        isAuthenticated: !!token,
    };
};

/**
 * Favoris de vols — Synchronisés avec le Backend.
 */
export const useFlightFavorites = () => {
    const { token } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchFavorites = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/dashboard/favorite`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.favorites)) {
                setFavorites(data.favorites.filter(f => f.type === 'flight').map(f => f.data));
            }
        } catch (err) {
            console.error('Erreur fetch favoris vols:', err.message);
        } finally {
            setLoading(false);
        }
    }, [token, apiBase]);

    useEffect(() => {
        if (token) fetchFavorites();
        else setFavorites([]);
    }, [token, fetchFavorites]);

    const isFavorite = useCallback(
        (flight) => (favorites || []).some((f) => f.flightNumber === flight?.flightNumber && f.departureTime === flight?.departureTime),
        [favorites]
    );

    const toggleFavorite = useCallback(async (flight) => {
        if (!token) return;
        
        const exists = favorites.some(f => f.flightNumber === flight.flightNumber && f.departureTime === flight.departureTime);
        if (exists) {
            setFavorites(prev => prev.filter(f => f.flightNumber !== flight.flightNumber));
        } else {
            setFavorites(prev => [flight, ...prev]);
        }

        try {
            const res = await fetch(`${apiBase}/dashboard/favorite`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    type: 'flight', 
                    itemId: `${flight.airlineCode}_${flight.flightNumber}_${flight.departureTime}`,
                    data: flight 
                })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            fetchFavorites();
        } catch (err) {
            fetchFavorites();
        }
    }, [token, favorites, apiBase, fetchFavorites]);

    return { favorites: favorites || [], isFavorite, toggleFavorite, loading, refresh: fetchFavorites, isAuthenticated: !!token };
};
