import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, RefreshCw, Heart } from 'lucide-react';
// We need to import FlightCard, but it's currently defined in Home.jsx.
// I'll create a simple fallback here or we can extract FlightCard later if needed.
// For now, I'll copy the FlightCard component here or just render it inline.
import { Plane, Star, ArrowRight, Building2, MapPin } from 'lucide-react';

const FavoriteHotelCard = ({ hotel, onRemove }) => {
  const handleBook = () => {
    if (hotel.bookingUrl) window.open(hotel.bookingUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-[2rem] border-2 border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all">
      <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-10 w-10 text-gray-200" />
          </div>
        )}
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{hotel.badge || 'Hôtel'}</p>
        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">{hotel.name}</h3>
        <div className="flex items-center justify-center md:justify-start gap-1 text-gray-400 text-xs mb-4">
          <MapPin className="h-3.5 w-3.5 text-primary/60" />
          <span className="line-clamp-1">{hotel.location}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-auto w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
        <div className="text-right flex-1 md:flex-none">
          <p className="text-2xl font-bold text-primary tracking-tight">
            {hotel.priceDisplay} <span className="text-sm">F CFA</span>
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">par nuit</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onRemove(hotel)} className="text-red-400 transition-colors" title="Retirer des favoris">
            <Heart className="h-6 w-6 fill-red-400" />
          </button>
          <button onClick={handleBook} className="bg-secondary hover:bg-secondary-dark text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-secondary/20 flex-shrink-0">
            Réserver <ArrowRight className="h-4 w-4 stroke-[3px]" />
          </button>
        </div>
      </div>
    </div>
  );
};


const FavoriteFlightCard = ({ flight, onRemove }) => {
  const handleChoose = () => {
    if (!flight.bookingUrl) return;
    let url = flight.bookingUrl;
    if (url.startsWith('/api')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const origin = apiBase.replace(/\/api\/?$/, '');
      url = `${origin}${url}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className={`relative bg-white rounded-[2rem] border-2 ${flight.isBestPrice ? 'border-primary shadow-lg shadow-primary/5' : 'border-gray-100 shadow-sm'} p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8 transition-all hover:shadow-md`}>
      {flight.isBestPrice && (
        <div className="absolute -top-4 left-8 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg z-10">
          Meilleur Prix
        </div>
      )}

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

      <div className="flex flex-1 items-center justify-between gap-4 w-full">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{flight.departureTime}</p>
          <p className="text-xs text-gray-400 font-bold">{flight.departureAirport}</p>
        </div>

        <div className="flex-1 flex flex-col items-center relative py-4">
          <p className="text-[10px] font-bold text-gray-300 mb-1">{flight.duration}</p>
          <div className="relative flex items-center w-full">
            <div className="flex-1 h-[1.5px] bg-gray-200" />
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${flight.stops === 0 ? 'bg-green-500' : 'bg-orange-500'}`} />
            <div className="flex-1 h-[1.5px] bg-gray-200" />
          </div>
          <p className={`text-[10px] font-bold mt-1 ${flight.stops === 0 ? 'text-green-500' : 'text-orange-500'}`}>
            {flight.stopInfo || (flight.stops === 0 ? 'Direct' : `${flight.stops} escale`)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{flight.arrivalTime}</p>
          <p className="text-xs text-gray-400 font-bold">{flight.arrivalAirport}</p>
        </div>
      </div>

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
          <button onClick={() => onRemove(flight)} className="text-yellow-400 transition-colors" title="Retirer des favoris">
            <Star className="h-6 w-6 fill-yellow-400" />
          </button>
          <button onClick={handleChoose} className="bg-secondary hover:bg-secondary-dark text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-secondary/20 flex-shrink-0">
            Choisir <ArrowRight className="h-4 w-4 stroke-[3px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flight'); // 'flight' | 'hotel'
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBase}/dashboard/favorite`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const handleRemoveFavorite = async (item, type = 'flight') => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const itemId = type === 'flight' ? (item.bookingToken || item.flightNumber) : item.name;
      
      await fetch(`${apiBase}/dashboard/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, itemId, data: item })
      });
      // Update state locally
      setFavorites(favorites.filter(fav => fav.itemId !== itemId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="h-5 w-5" /> Retour à l'accueil
          </Link>
          <div className="font-black text-gray-900 text-lg">Mes Favoris</div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Vos éléments sauvegardés</h1>
            <p className="text-gray-500 font-medium mb-8">Retrouvez ici tous les vols et hôtels que vous avez ajoutés à vos favoris.</p>
            
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100 shadow-inner">
                <button
                  onClick={() => setActiveTab('flight')}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'flight' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Plane className={`h-4 w-4 ${activeTab === 'flight' ? 'fill-white' : ''}`} />
                  Vols Favoris
                </button>
                <button
                  onClick={() => setActiveTab('hotel')}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'hotel' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Building2 className={`h-4 w-4 ${activeTab === 'hotel' ? 'fill-white' : ''}`} />
                  Hôtels Favoris
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <RefreshCw className="h-10 w-10 animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Chargement...</p>
              </div>
            ) : favorites.filter(f => f.type === activeTab).length > 0 ? (
              favorites.filter(f => f.type === activeTab).map((fav, i) => (
                fav.type === 'flight' ? (
                  <FavoriteFlightCard key={i} flight={fav.data} onRemove={(f) => handleRemoveFavorite(f, 'flight')} />
                ) : (
                  <FavoriteHotelCard key={i} hotel={fav.data} onRemove={(h) => handleRemoveFavorite(h, 'hotel')} />
                )
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                <Heart className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Aucun favori trouvé</p>
                <p className="text-xs mt-2 text-gray-400">Cliquez sur l'étoile lors de votre recherche pour ajouter des favoris ici.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
