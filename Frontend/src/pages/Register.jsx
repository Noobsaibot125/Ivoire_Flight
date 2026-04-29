import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, Bell, Heart, Phone, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import { toast } from 'react-toastify';
import logoBlanc from '../assets/IvoireFlightsBlanc.png';
import planeImg from '../assets/2355cabb96b93cdeaceffa0a33bd8bb75ac10291.png';

const Register = () => {
  const navigate = useNavigate();
  const { registerByEmail, registerPhoneSendOtp, registerPhoneVerifyOtp, registerPhoneComplete, verifyEmailOtp } = useAuth();

  const [mode, setMode] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email flow
  const [emailStep, setEmailStep] = useState(1); // 1=form, 2=otp
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneOpt, setPhoneOpt] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  // Phone flow
  const [phoneStep, setPhoneStep] = useState(1); // 1=phone, 2=otp, 3=profile
  const [phone, setPhone] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [pFirstName, setPFirstName] = useState('');
  const [pLastName, setPLastName] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pConfirmPassword, setPConfirmPassword] = useState('');
  const [pEmail, setPEmail] = useState('');

  const inputClass = "w-full pl-14 pr-6 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium";
  const inputClassPlain = "w-full px-6 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium";

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) { toast.error('Remplissez tous les champs obligatoires.'); return; }
    if (password !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const data = await registerByEmail({ firstName, lastName, email, password, phone: phoneOpt || undefined });
      if (data.success) { setEmailStep(2); toast.success('Code OTP envoyé à votre email.'); }
      else toast.error(data.message);
    } catch { toast.error('Erreur serveur.'); } finally { setLoading(false); }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length !== 6) { toast.error('Entrez le code à 6 chiffres.'); return; }
    setLoading(true);
    try {
      const data = await verifyEmailOtp(email, emailOtp);
      if (data.success) { toast.success('Compte vérifié !'); navigate('/'); }
      else toast.error(data.message);
    } catch { toast.error('Code invalide.'); } finally { setLoading(false); }
  };

  const handlePhoneSend = async (e) => {
    e.preventDefault();
    if (!phone) { toast.error('Entrez votre numéro.'); return; }
    setLoading(true);
    try {
      const data = await registerPhoneSendOtp(phone);
      if (data.success) { setPhoneStep(2); toast.success('Code OTP envoyé.'); }
      else toast.error(data.message);
    } catch { toast.error('Erreur serveur.'); } finally { setLoading(false); }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    if (!phoneOtpCode || phoneOtpCode.length !== 6) { toast.error('Entrez le code à 6 chiffres.'); return; }
    setLoading(true);
    try {
      const data = await registerPhoneVerifyOtp(phone, phoneOtpCode);
      if (data.success) { setPhoneStep(3); toast.success('Numéro vérifié !'); }
      else toast.error(data.message);
    } catch { toast.error('Code invalide.'); } finally { setLoading(false); }
  };

  const handlePhoneComplete = async (e) => {
    e.preventDefault();
    if (!pFirstName || !pLastName || !pPassword || !pConfirmPassword) { toast.error('Remplissez les champs obligatoires.'); return; }
    if (pPassword !== pConfirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const data = await registerPhoneComplete({ phone, firstName: pFirstName, lastName: pLastName, password: pPassword, email: pEmail || undefined });
      if (data.success) { toast.success('Compte créé !'); navigate('/'); }
      else toast.error(data.message);
    } catch { toast.error('Erreur serveur.'); } finally { setLoading(false); }
  };

  // Step indicator calculation
  const currentStep = mode === 'email' ? emailStep : phoneStep;
  const totalSteps = mode === 'email' ? 2 : 3;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side – Brand */}
      <div className="w-full lg:w-[45%] relative overflow-hidden flex flex-col p-10 sm:p-16 xl:p-24 min-h-screen z-10 shadow-2xl">
        <img src={planeImg} alt="Avion" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-red-600/70 to-blue-900/80" />
        <div className="mb-auto pt-4 relative z-20">
          <Link to="/"><img src={logoBlanc} alt="IvoireFlights" className="h-14 w-auto" /></Link>
        </div>
        <div className="relative z-10 my-auto">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-12 tracking-tighter">
            Rejoignez la communauté des voyageurs malins
          </h1>
          <div className="space-y-4 max-w-md">
            {[
              { icon: <Shield className="h-6 w-6" />, title: 'Paiement sécurisé', desc: 'Vos données sont protégées', color: 'bg-blue-500' },
              { icon: <Bell className="h-6 w-6" />, title: 'Alertes prix', desc: 'Soyez informé des baisses', color: 'bg-sky-500' },
              { icon: <Heart className="h-6 w-6" />, title: 'Favoris illimités', desc: 'Sauvegardez vos recherches', color: 'bg-blue-400' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/20 transition-all">
                <div className={`${f.color} rounded-xl p-3 flex-shrink-0 shadow-lg`}>{f.icon}</div>
                <div>
                  <p className="font-black text-white text-base">{f.title}</p>
                  <p className="text-sm text-white/60 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-8 xl:gap-12 border-t border-white/10 pt-10 mt-12">
          {[{ value: '50k', label: 'Utilisateurs actifs' }, { value: '4.8', label: 'Note moyenne' }, { value: '35%', label: 'Économie moyenne' }].map((s, i) => (
            <div key={s.label} className="flex items-center gap-8 xl:gap-12">
              <div>
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
              {i < 2 && <div className="w-px h-12 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side – Form */}
      <div className="flex-1 bg-white flex flex-col justify-center px-10 sm:px-16 xl:px-24 py-12 min-h-screen relative z-0">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10 max-w-sm mx-auto w-full">
          {Array.from({ length: totalSteps }, (_, i) => (
            <React.Fragment key={i}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${i + 1 <= currentStep ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className="flex-1 mx-3 h-1 rounded-full bg-gray-100 relative">
                  <div className={`absolute top-0 left-0 h-full bg-[#0ea5e9] transition-all duration-500 rounded-full ${i + 1 < currentStep ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Toggle */}
        <div className="max-w-md mx-auto w-full">
          {((mode === 'email' && emailStep === 1) || (mode === 'phone' && phoneStep === 1)) && (
            <div className="flex items-center p-1.5 bg-gray-50 rounded-2xl mb-8">
              <button type="button" onClick={() => setMode('email')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all ${mode === 'email' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}>
                <Mail className="h-4 w-4" /> Email
              </button>
              <button type="button" onClick={() => setMode('phone')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all ${mode === 'phone' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}>
                <Phone className="h-4 w-4" /> Téléphone
              </button>
            </div>
          )}

          {/* ═══ EMAIL FLOW ═══ */}
          {mode === 'email' && emailStep === 1 && (
            <form onSubmit={handleEmailRegister} className="space-y-5">
              <h2 className="text-3xl xl:text-4xl font-black text-gray-900 mb-2 tracking-tighter">Créez votre compte</h2>
              <p className="text-gray-400 text-sm font-medium mb-6">Inscription par email — Tous les champs marqués * sont obligatoires.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-2">Nom *</label>
                  <input type="text" placeholder="Diabaté" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClassPlain} />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-2">Prénom *</label>
                  <input type="text" placeholder="Konan" value={lastName} onChange={e => setLastName(e.target.value)} className={inputClassPlain} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Téléphone <span className="text-gray-300 font-medium">(optionnel)</span></label>
                <PhoneInput value={phoneOpt} onChange={setPhoneOpt} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Inscription...' : 'Créer mon compte'} {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          )}

          {mode === 'email' && emailStep === 2 && (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="h-7 w-7 text-[#0ea5e9]" /></div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Vérifiez votre email</h2>
                <p className="text-sm text-gray-400">Un code a été envoyé à <span className="font-black text-gray-900">{email}</span></p>
              </div>
              <input type="text" maxLength={6} placeholder="000000" value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))} className="w-full px-6 py-5 border border-gray-100 bg-white rounded-2xl text-2xl text-center font-black text-gray-900 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all tracking-[0.5em]" />
              <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 disabled:opacity-50">
                {loading ? 'Vérification...' : 'Vérifier et continuer'}
              </button>
              <button type="button" onClick={() => setEmailStep(1)} className="w-full text-center text-sm font-bold text-[#0ea5e9] hover:underline">Retour</button>
            </form>
          )}

          {/* ═══ PHONE FLOW ═══ */}
          {mode === 'phone' && phoneStep === 1 && (
            <form onSubmit={handlePhoneSend} className="space-y-6">
              <h2 className="text-3xl xl:text-4xl font-black text-gray-900 mb-2 tracking-tighter">Créez votre compte</h2>
              <p className="text-gray-400 text-sm font-medium mb-4">Inscription par téléphone — Vous recevrez un code OTP par SMS.</p>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Numéro de téléphone</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Envoi...' : 'Recevoir le code OTP'} {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          )}

          {mode === 'phone' && phoneStep === 2 && (
            <form onSubmit={handlePhoneVerify} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-full flex items-center justify-center mx-auto mb-4"><Phone className="h-7 w-7 text-[#0ea5e9]" /></div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Vérification</h2>
                <p className="text-sm text-gray-400">Code envoyé au <span className="font-black text-gray-900">{phone}</span></p>
              </div>
              <input type="text" maxLength={6} placeholder="000000" value={phoneOtpCode} onChange={e => setPhoneOtpCode(e.target.value.replace(/\D/g, ''))} className="w-full px-6 py-5 border border-gray-100 bg-white rounded-2xl text-2xl text-center font-black text-gray-900 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all tracking-[0.5em]" />
              <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 disabled:opacity-50">
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
              <button type="button" onClick={() => setPhoneStep(1)} className="w-full text-center text-sm font-bold text-[#0ea5e9] hover:underline">Modifier le numéro</button>
            </form>
          )}

          {mode === 'phone' && phoneStep === 3 && (
            <form onSubmit={handlePhoneComplete} className="space-y-5">
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Complétez votre profil</h2>
              <p className="text-gray-400 text-sm font-medium mb-4">Quelques informations pour finaliser votre inscription.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-2">Nom *</label>
                  <input type="text" placeholder="Diabaté" value={pFirstName} onChange={e => setPFirstName(e.target.value)} className={inputClassPlain} />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-2">Prénom *</label>
                  <input type="text" placeholder="Konan" value={pLastName} onChange={e => setPLastName(e.target.value)} className={inputClassPlain} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={pPassword} onChange={e => setPPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={pConfirmPassword} onChange={e => setPConfirmPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 border border-gray-100 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-2">Email <span className="text-gray-300 font-medium">(optionnel)</span></label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type="email" placeholder="votre@email.com" value={pEmail} onChange={e => setPEmail(e.target.value)} className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black py-5 rounded-2xl text-base transition-all shadow-2xl shadow-[#0ea5e9]/30 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Création...' : 'Créer mon compte'} {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          )}

          <p className="text-center text-sm font-bold text-gray-400 mt-12">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-[#0ea5e9] font-black hover:underline ml-1">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
