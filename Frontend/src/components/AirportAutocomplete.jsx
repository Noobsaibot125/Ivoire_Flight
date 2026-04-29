import { useState, useEffect, useRef } from 'react';
import { MapPin, Plane } from 'lucide-react';
import { fetchAirports } from '../services/flightService';

/**
 * Champ de saisie avec autocomplete d'aéroports via IA (Gemini).
 * L'utilisateur peut taper librement OU sélectionner un aéroport suggéré.
 *
 * Props:
 * - label: string                      → libellé affiché au-dessus du champ
 * - value: string                      → valeur actuelle (ville ou "Ville (IATA)")
 * - onChange: (value: string) => void  → appelé quand l'utilisateur tape ou sélectionne
 * - placeholder: string
 * - iconColor: 'green' | 'orange'      → couleur de l'icône MapPin
 */
const AirportAutocomplete = ({ label, value, onChange, placeholder, iconColor = 'green' }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    // Fermer le dropdown si clic à l'extérieur
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Debounced fetch quand value change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const trimmed = (value || '').trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }
        // Si la valeur ressemble déjà à "Ville (IATA)" sélectionnée, ne pas relancer
        if (/\([A-Z]{3}\)$/.test(trimmed)) return;

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            const data = await fetchAirports(trimmed);
            setSuggestions(data);
            setIsLoading(false);
            setIsOpen(data.length > 0);
            setActiveIndex(-1);
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value]);

    const selectSuggestion = (s) => {
        onChange(`${s.city} (${s.iata})`);
        setSuggestions([]);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const iconClass = iconColor === 'orange' ? 'text-secondary' : 'text-green-500';

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-gray-700 mb-2 tracking-wider">{label}</label>
            <div className="relative">
                <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${iconClass}`} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                        <li
                            key={`${s.iata}-${idx}`}
                            onClick={() => selectSuggestion(s)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${
                                activeIndex === idx ? 'bg-primary/5' : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Plane className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 truncate">{s.city}</span>
                                    {s.country && (
                                        <span className="text-xs text-gray-500 truncate">· {s.country}</span>
                                    )}
                                </div>
                                {s.airport && (
                                    <div className="text-sm text-gray-600 truncate">{s.airport}</div>
                                )}
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mt-1 flex-shrink-0">
                                {s.iata}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AirportAutocomplete;
