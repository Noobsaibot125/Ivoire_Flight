import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Briefcase, RefreshCw, Search, ChevronRight, ArrowLeft } from 'lucide-react';

const HistoryPage = () => {
  const { user, getDashboardData } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flight'); // 'flight' | 'hotel'
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    getDashboardData().then(res => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, [user, navigate, getDashboardData]);

  if (!user) return null;

  const flightHistory = data?.flightHistory || [];
  const hotelHistory = data?.hotelHistory || [];
  const activeHistory = activeTab === 'flight' ? flightHistory : hotelHistory;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar simplifiée */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="h-5 w-5" /> Retour à l'accueil
          </Link>
          <div className="font-black text-gray-900 text-lg">Mon Historique</div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Historique complet des recherches</h1>
            <p className="text-gray-500 font-medium mb-8">Consultez l'ensemble de vos recherches et activités récentes.</p>
            
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100 shadow-inner">
                <button
                  onClick={() => setActiveTab('flight')}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'flight' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Plane className={`h-4 w-4 ${activeTab === 'flight' ? 'fill-white' : ''}`} />
                  Historique Vols
                </button>
                <button
                  onClick={() => setActiveTab('hotel')}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'hotel' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Briefcase className={`h-4 w-4 ${activeTab === 'hotel' ? 'fill-white' : ''}`} />
                  Historique Hôtels
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <RefreshCw className="h-10 w-10 animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Chargement...</p>
              </div>
            ) : activeHistory.length > 0 ? (
              activeHistory.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl border border-gray-50 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer group gap-4">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="w-14 h-14 shrink-0 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                      {item.type === 'flight' ? <Plane className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 leading-tight">{item.label}</p>
                      <p className="text-sm text-gray-400 font-bold mt-1 tracking-tight">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-black text-gray-900 leading-tight">{item.time || '--'}</p>
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-1.5 bg-gray-100 text-gray-500">
                        {item.status}
                      </span>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Aucun historique trouvé</p>
                <p className="text-xs mt-2 text-gray-400">Commencez une recherche pour voir vos activités ici.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
