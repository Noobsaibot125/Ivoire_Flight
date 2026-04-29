import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, ArrowLeft, User, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, loading: authLoading, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (password && password !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); setSaving(false); return; }
      const payload = { firstName, lastName, email: email || undefined, phone: phone || undefined };
      if (password) payload.password = password;
      const data = await updateProfile(payload);
      if (data.success) toast.success('Profil mis à jour.');
      else toast.error(data.message);
    } catch { toast.error('Erreur serveur.'); } finally { setSaving(false); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full" /></div>;

  const inputClass = "w-full pl-14 pr-6 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="IvoireFlights" className="h-10 w-auto" />
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Avatar */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-[#1C4CA5] to-[#0ea5e9] rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-xl shadow-[#1C4CA5]/20">
            {(firstName?.[0] || '').toUpperCase()}{(lastName?.[0] || '').toUpperCase()}
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{firstName} {lastName}</h1>
          <p className="text-sm text-gray-400 mt-1">{email || phone}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Modifier mon profil</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Nom</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Prénom</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">Téléphone</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">Nouveau mot de passe <span className="text-gray-300 font-medium">(laisser vide pour ne pas changer)</span></label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {password && (
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••" className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="h-5 w-5" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="px-8 py-5 border border-red-200 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-all text-sm">
              Déconnexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
