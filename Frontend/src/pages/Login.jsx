import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import loginBg from '../assets/2edf1e331b4680eb81aa78be0c1f7b5ca1b610f8.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { loginByEmail, loginByPhone } = useAuth();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone login state
  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');

  /* ─── Handle Email Login ─── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginByEmail(email, password);
      if (data.success) {
        toast.success('Connexion réussie !');
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Handle Phone Login ─── */
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (!phone || !phonePassword) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginByPhone(phone, phonePassword);
      if (data.success) {
        toast.success('Connexion réussie !');
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-14 pr-6 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans overflow-hidden">

      {/* ── Left Side – Form ── */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white flex flex-col px-10 sm:px-16 xl:px-24 py-12 min-h-screen relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="mb-auto pt-4">
          <Link to="/">
            <img src={logo} alt="IvoireFlights" className="h-14 w-auto" />
          </Link>
        </div>

        <div className="my-auto">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-4xl xl:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
              Bon retour parmi nous
            </h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
              Connectez-vous pour accéder à votre espace personnel et retrouver vos réservations.
            </p>
          </div>

          {/* Toggle Email / Phone */}
          <div className="flex items-center p-1.5 bg-gray-50 rounded-2xl mb-10">
            <button
              type="button"
              onClick={() => { setMode('email'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all ${mode === 'email' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => { setMode('phone'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all ${mode === 'phone' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Phone className="h-4 w-4" /> Téléphone
            </button>
          </div>

          {/* ──────── EMAIL MODE ──────── */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-black text-gray-800">Mot de passe</label>
                  <a href="#" className="text-xs font-black text-[#0ea5e9] hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ──────── PHONE MODE ──────── */}
          {mode === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Numéro de téléphone</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-black text-gray-800">Mot de passe</label>
                  <a href="#" className="text-xs font-black text-[#0ea5e9] hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={phonePassword}
                    onChange={(e) => setPhonePassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* Bottom link */}
          <p className="text-center text-sm font-bold text-gray-400 mt-12">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#0ea5e9] font-black hover:underline ml-1">
              Créer un compte gratuitement
            </Link>
          </p>
        </div>

        <div className="mt-auto" />
      </div>

      {/* ── Right Side – Image & Testimonial ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-100 min-h-screen">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={loginBg}
          alt="Vue d'avion"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-20 text-white z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-black border-2 border-white shadow-lg"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-white/80 tracking-wide">+12,000 voyageurs ce mois</p>
          </div>

          <blockquote className="text-5xl font-black leading-tight mb-12 max-w-2xl tracking-tighter">
            "IvoireFlights m'a permis d'économiser 40% sur mon vol Abidjan-Paris."
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-black text-lg border-2 border-white shadow-xl">
              SM
            </div>
            <div>
              <p className="font-black text-2xl leading-none mb-1">Soro Moussa</p>
              <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Voyageuse fréquente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
