import React from 'react';
import { Plane, Star, ArrowRight } from 'lucide-react';

const FlightCard = ({ flight, isFavorite, onToggleFavorite, canFavorite }) => {
  const handleChoose = () => {
    if (!flight.bookingUrl) return;
    // Si c'est un chemin relatif (commence par /api), on préfixe avec l'origine du backend
    let url = flight.bookingUrl;
    if (url.startsWith('/api')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const origin = apiBase.replace(/\/api\/?$/, '');
      url = `${origin}${url}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div
      className={`relative bg-white rounded-[2rem] border-2 ${
        flight.isBestPrice ? 'border-primary shadow-lg shadow-primary/5' : 'border-gray-100 shadow-sm'
      } p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8 transition-all hover:shadow-md`}
    >
      {flight.isBestPrice && (
        <div className="absolute -top-4 left-8 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg z-10">
          Meilleur Prix
        </div>
      )}

      {/* Compagnie */}
      <div className="flex items-center gap-4 md:w-48 w-full">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden">
          {flight.airlineLogo ? (
            <img src={flight.airlineLogo} alt={flight.airline} className="w-9 h-9 object-contain" />
          ) : (
            <Plane className="h-6 w-6 text-gray-400 rotate-45" />
          )}
        </div>
        <div className="text-left">
          <p className="text-xs font-black text-gray-900 leading-tight">{flight.airline}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{flight.airlineCode} · {flight.flightNumber}</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex flex-1 items-center justify-between gap-4 w-full">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{flight.departureTime}</p>
          <p className="text-xs text-gray-400 font-bold">{flight.departureAirport}</p>
        </div>

        <div className="flex-1 flex flex-col items-center relative py-4">
          <p className="text-[10px] font-bold text-gray-300 mb-1">{flight.duration}</p>
          <div className="relative flex items-center w-full">
            <div className="flex-1 h-[1.5px] bg-gray-200" />
            <div
              className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                flight.stops === 0 ? 'bg-green-500' : 'bg-orange-500'
              }`}
            />
            <div className="flex-1 h-[1.5px] bg-gray-200" />
          </div>
          <p
            className={`text-[10px] font-bold mt-1 ${
              flight.stops === 0 ? 'text-green-500' : 'text-orange-500'
            }`}
          >
            {flight.stopInfo || (flight.stops === 0 ? 'Direct' : `${flight.stops} escale`)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{flight.arrivalTime}</p>
          <p className="text-xs text-gray-400 font-bold">{flight.arrivalAirport}</p>
        </div>
      </div>

      {/* Prix + Bouton */}
      <div className="flex items-center gap-6 ml-auto w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
        <div className="text-right flex-1 md:flex-none">
          <p className="text-2xl font-bold text-primary tracking-tight">
            {flight.priceDisplay} <span className="text-sm">F CFA</span>
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
            par personne · {flight.tripType === 'round_trip' ? 'Aller-retour' : 'Aller simple'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (!canFavorite) {
                alert('Connectez-vous pour ajouter ce vol à vos favoris.');
                return;
              }
              onToggleFavorite?.(flight);
            }}
            className={`transition-colors ${isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} 
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star className={`h-6 w-6 ${isFavorite ? 'fill-yellow-400' : ''}`} />
          </button>
          <button
            onClick={handleChoose}
            className="bg-secondary hover:bg-secondary-dark text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-secondary/20 flex-shrink-0"
          >
            Choisir <ArrowRight className="h-4 w-4 stroke-[3px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
