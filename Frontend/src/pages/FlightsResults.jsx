import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plane } from 'lucide-react';
import FlightCard from '../components/FlightCard';
import { useFlightFavorites } from '../hooks/useLocalStorage';

const FlightsResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Si l'utilisateur arrive directement sur cette URL sans state, on le renvoie à l'accueil
  if (!location.state || !location.state.flights) {
    navigate('/');
    return null;
  }

  const { flights, searchQuery } = location.state;
  
  const { isFavorite, toggleFavorite, isAuthenticated } = useFlightFavorites();
  const [stopFilter, setStopFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');

  // Filtrer
  const filtered = flights.filter((f) => {
    if (stopFilter === 'direct') return f.stops === 0;
    if (stopFilter === '1max') return f.stops <= 1;
    return true;
  });

  // Trier
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.priceFCFA - b.priceFCFA;
    if (sortBy === 'duration') {
      const toMin = (d) => {
        const m = d?.match(/(\d+)h(\d+)?/);
        return m ? parseInt(m[1]) * 60 + parseInt(m[2] || 0) : 9999;
      };
      return toMin(a.duration) - toMin(b.duration);
    }
    return a.departureTime?.localeCompare(b.departureTime);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simplifiée */}
      <header className="bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> Retour à la recherche
          </Link>
          <div className="text-center hidden sm:block">
            <h1 className="font-extrabold text-gray-900 text-lg">Tous les vols disponibles</h1>
            {searchQuery && (
              <p className="text-xs text-gray-400 font-bold">
                {searchQuery.depart} → {searchQuery.destination}
                {searchQuery.date ? ` · ${new Date(searchQuery.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
              </p>
            )}
          </div>
          <div className="w-[150px]"></div> {/* spacer pour centrer le titre */}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-extrabold text-gray-900">
              {sorted.length} vol{sorted.length > 1 ? 's' : ''} trouvé{sorted.length > 1 ? 's' : ''}
            </h2>

            {/* Barre de filtres / tri (copiée de Home.jsx) */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <select
                  value={stopFilter}
                  onChange={(e) => setStopFilter(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-sm font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">Toutes escales</option>
                  <option value="direct">Direct seulement</option>
                  <option value="1max">1 escale max</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex items-center p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                {[
                  { key: 'price', label: 'Prix' },
                  { key: 'duration', label: 'Durée' },
                  { key: 'time', label: 'Horaire' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={`px-5 py-2 text-xs font-black rounded-[14px] transition-all ${
                      sortBy === s.key
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Liste des vols */}
          {sorted.length > 0 ? (
            <div className="space-y-5">
              {sorted.map((f, i) => (
                <FlightCard 
                  key={i} 
                  flight={f} 
                  isFavorite={isFavorite(f)}
                  onToggleFavorite={toggleFavorite}
                  canFavorite={isAuthenticated}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-[2rem] border border-gray-100">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Plane className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">Aucun vol ne correspond à ces filtres</p>
              <button 
                onClick={() => setStopFilter('all')}
                className="text-primary text-sm font-bold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
          
          <p className="text-center text-xs text-gray-400 mt-8">
            Données Google Flights en temps réel
          </p>
        </div>
      </main>
    </div>
  );
};

export default FlightsResults;
