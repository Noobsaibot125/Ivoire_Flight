import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Plane, BarChart3, Settings, LogOut, 
  Search, Bell, Menu, X, ShieldCheck, ChevronRight,
  TrendingUp, ArrowUpRight, ArrowDownRight, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Protection de la route admin
    if (!authLoading) {
      if (!user || user.role !== 'superadmin') {
        navigate('/admin/login');
      }
    }
  }, [user, authLoading, navigate]);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, active: true },
    { id: 'users', label: 'Gestion Utilisateurs', icon: Users, active: false },
    { id: 'flights', label: 'Vols & Compagnies', icon: Plane, active: false },
    { id: 'stats', label: 'Statistiques', icon: BarChart3, active: false },
    { id: 'settings', label: 'Configuration', icon: Settings, active: false },
  ];

  const stats = [
    { label: 'Utilisateurs Totaux', value: '1,284', trend: '+12%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Recherches (24h)', value: '456', trend: '+5.4%', isPositive: true, icon: Search, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Taux de conversion', value: '3.2%', trend: '-0.8%', isPositive: false, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Revenus générés', value: '1.2M FCFA', trend: '+18%', isPositive: true, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <img src={logo} alt="Logo" className="h-9 w-auto" />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-slate-900 leading-none">IVOIRE FLIGHTS</span>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Console Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  item.active 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile Mini */}
          <div className="mt-auto p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-black text-sm ring-4 ring-white shadow-sm">
                {(user?.firstName?.[0] || 'A').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">
                  {user?.firstName} {user?.lastName || 'Admin'}
                </p>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Superadmin</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-red-500 bg-white border border-red-100 hover:bg-red-50 transition-all shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> DECONNEXION
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-96 max-w-full">
            <Search className="h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur, un vol..." 
              className="bg-transparent border-none text-sm font-medium focus:ring-0 w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">Session Superadmin</p>
                <p className="text-[10px] font-bold text-slate-400 leading-none uppercase tracking-widest">Connecté</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/20 group">
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter leading-tight">Bonjour, {user?.firstName || 'Superadmin'} 👋</h2>
                  <p className="text-primary-foreground/80 font-medium text-lg">Bienvenue sur votre tableau de bord. Voici les dernières activités du projet Ivoire Flights.</p>
                </div>
                <button className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:bg-slate-50 transition-all flex items-center gap-2 w-fit">
                  Voir les rapports <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Activity Table */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Dernières Inscriptions</h3>
                  <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Voir tout</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4">Utilisateur</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[1, 2, 3, 4].map((i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-200">
                                U{i}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Utilisateur Test {i}</p>
                                <p className="text-[10px] font-bold text-slate-400">user{i}@example.com</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-green-50 text-green-600 border border-green-100">
                              Actif
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <p className="text-xs font-bold text-slate-500">Aujourd'hui, 14:2{i}</p>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                              <Settings className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side Content / Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-6">Alertes Système</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                      <div className="bg-orange-500 text-white p-2 rounded-xl h-fit">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase mb-1">Mise à jour requise</p>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Une nouvelle version du moteur de recherche Gemini est disponible.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                      <div className="bg-blue-500 text-white p-2 rounded-xl h-fit">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase mb-1">Rapport mensuel</p>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Le rapport d'activité d'avril est prêt à être téléchargé.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white">
                  <h4 className="text-lg font-black tracking-tight mb-2">Besoin d'aide ?</h4>
                  <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Consultez la documentation technique ou contactez le support développeur.</p>
                  <button className="w-full bg-white text-slate-900 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
                    Support Technique
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
