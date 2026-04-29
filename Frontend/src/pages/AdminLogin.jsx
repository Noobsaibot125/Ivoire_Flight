import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginByEmail, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si déjà connecté en tant que superadmin, rediriger vers le dashboard
    if (!authLoading && user && user.role === 'superadmin') {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginByEmail(email, password);
      if (data.success) {
        if (data.user.role === 'superadmin') {
          toast.success('Bienvenue dans la console administration !');
          navigate('/admin');
        } else {
          toast.error('Accès refusé. Vous n\'êtes pas administrateur.');
        }
      } else {
        toast.error(data.message || 'Identifiants incorrects.');
      }
    } catch (err) {
      toast.error('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> Retour au site
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img src={logo} alt="IvoireFlights" className="h-12 w-auto" />
                <div className="absolute -top-2 -right-10 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase">
                  Console
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-2xl text-slate-900 mb-4 border border-slate-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">Administration</h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Accès restreint</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Administrateur</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input
                    type="email"
                    placeholder="admin@ivoireflights.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clé d'accès</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl text-base transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                {loading ? 'Authentification...' : 'Se connecter'}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
              Système de gestion sécurisé · Ivoire Flights v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
