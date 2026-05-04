import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Plane, Star, MapPin, ChevronLeft, Wifi, Utensils, Car, Heart, ChevronRight, Building2, Search } from 'lucide-react';
import { useHotelFavorites } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';

const getAmenityIcons = (amenities = []) => {
  return [<Wifi key="wifi" className="h-3 w-3" />, <Utensils key="food" className="h-3 w-3" />, <Car key="car" className="h-3 w-3" />];
};

const HotelCardMap = ({ hotel, isFavorite, onToggleFavorite, canFavorite, onOpenMap }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group cursor-pointer flex flex-col h-full"
      onClick={() => onOpenMap(hotel)}>
      <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
        {!imgError && hotel.image ? (
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Building2 className="h-10 w-10 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
          {hotel.badge || 'Hôtel'}
        </div>

        {/* Heart Favorite */}
        <button
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors shadow-sm z-10"
          onClick={(e) => {
            e.stopPropagation();
            if (!canFavorite) {
              alert('Connectez-vous pour ajouter cet hôtel à vos favoris.');
              return;
            }
            onToggleFavorite?.(hotel);
          }}
        >
          <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>

        {hotel.rating && (
          <div className="absolute bottom-3 left-3 bg-primary text-white text-sm font-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
            {hotel.rating}
          </div>
        )}

        {hotel.stars && (
          <div className="absolute bottom-3 right-3 flex gap-0.5">
            {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">{hotel.name}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0 text-primary/60" />
          <span className="line-clamp-1">{hotel.location}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {getAmenityIcons()}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Inclus</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">
              {hotel.priceDisplay} <span className="text-[10px] font-bold text-gray-500">F CFA</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1">par nuit</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(hotel.bookingUrl, '_blank');
            }}
            className="bg-secondary hover:bg-secondary-dark text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-secondary/20 flex items-center gap-1"
          >
            Voir <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const HotelMapModal = ({ hotel, onClose }) => {
  if (!hotel) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] max-h-[700px] border border-white/20" onClick={e => e.stopPropagation()}>
        {/* Left: Map */}
        <div className="flex-1 h-64 md:h-full relative bg-gray-100">
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            loading="lazy" 
            allowFullScreen 
            referrerPolicy="no-referrer-when-downgrade" 
            src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name + ' ' + hotel.location)}&output=embed`}
            title="Google Maps"
          ></iframe>
          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3">
               <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black">
                 {hotel.rating || '8.5'}
               </div>
               <div>
                 <p className="text-xs font-black text-gray-900">{hotel.name}</p>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{hotel.badge}</p>
               </div>
            </div>
          </div>
        </div>
        
        {/* Right: Info */}
        <div className="w-full md:w-[400px] p-8 flex flex-col bg-white overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">{hotel.name}</h2>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(hotel.stars || 4, 5) }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" /> 
            <span className="text-sm font-medium leading-relaxed">{hotel.location}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Note clients</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">{hotel.rating || 'N/A'}</span>
                <span className="text-xs font-bold text-blue-600/70">{hotel.reviews || 0} avis</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Catégorie</p>
              <span className="text-sm font-black text-gray-900">{hotel.badge || 'Hôtel'}</span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Équipements inclus</p>
            <div className="flex flex-wrap gap-2">
              {['WiFi gratuit', 'Petit-déjeuner', 'Parking', 'Piscine'].map((amen, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-[11px] font-bold rounded-lg border border-gray-100">
                  {amen}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tarif par nuit</p>
                <p className="text-3xl font-black text-gray-900">{hotel.priceDisplay} <span className="text-sm font-bold text-gray-500">F CFA</span></p>
              </div>
              <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">Meilleur prix garanti</p>
            </div>
            <button 
              onClick={() => window.open(hotel.bookingUrl, '_blank')}
              className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/30 text-center flex items-center justify-center gap-2 group"
            >
              Réserver maintenant
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function HotelsResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  const { token } = useAuth();
  const { isFavorite, toggleFavorite, isAuthenticated } = useHotelFavorites();

  const city = searchParams.get('city') || 'Abidjan';

  useEffect(() => {
    const fetchAllHotels = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiBase}/hotels/nearby?${searchParams.toString()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
          setHotels(data.hotels || []);
        }
      } catch (err) {
        console.error('Erreur chargement hôtels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHotels();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-primary pt-28 pb-12 px-4 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm font-bold group"
          >
            <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-white/20">
              <ChevronLeft className="h-4 w-4" />
            </div>
            Retour à l'accueil
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-xl shadow-lg shadow-secondary/20">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Hôtels à {city}</h1>
              </div>
              <p className="text-white/60 font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary fill-secondary" />
                {loading ? 'Recherche en cours...' : `${hotels.length} établissements trouvés pour votre séjour`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-sm font-bold">
                 {searchParams.get('adults') || 2} adultes
               </div>
               <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-sm font-bold">
                 {searchParams.get('checkin') || 'Dates flexibles'}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100">
                <div className="h-44 bg-gray-100 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-50 rounded-full w-1/2" />
                  <div className="h-8 bg-gray-50 rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Aucun hôtel trouvé</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Nous n'avons trouvé aucun établissement correspondant à vos critères pour {city}.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-primary text-white font-bold px-8 py-3 rounded-2xl hover:bg-primary-dark transition-all"
            >
              Modifier ma recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.map((h, i) => (
              <HotelCardMap 
                key={i} 
                hotel={h} 
                isFavorite={isFavorite(h)}
                onToggleFavorite={toggleFavorite}
                canFavorite={isAuthenticated}
                onOpenMap={setSelectedHotel} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <HotelMapModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />
    </div>
  );
}
