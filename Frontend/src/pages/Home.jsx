import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAirlines, searchFlights as apiSearchFlights } from '../services/flightService';
import AirportAutocomplete from '../components/AirportAutocomplete';
import {
  Plane, Building2, Shield, ChevronDown, Search, Heart, Star,
  MapPin, Check, ArrowRight, Phone, Mail, Globe,
  Menu, X, Wifi,
  Utensils, Car, Bell, FileText, Briefcase, TrendingUp,
  Calendar, ChevronRight, Users, Clock, Download, ExternalLink,
  RefreshCw, Lock, Smartphone, Headphones, ArrowLeftRight, BarChart3,
  LogOut, UserCircle
} from 'lucide-react';

/* Social SVG icons (lucide-react ne les exporte pas) */
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import logo from '../assets/logo.png';
import logoBlanc from '../assets/IvoireFlightsBlanc.png';
import planeImg from '../assets/2355cabb96b93cdeaceffa0a33bd8bb75ac10291.png';
import hotelImg from '../assets/24bb3a9e8766e9b198bed47726d976fe755f58eb.jpg';

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); setDropdownOpen(false); navigate('/'); };

  const navLinkClass = `text-sm font-bold transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white/80'}`;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-1' : 'bg-transparent py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0">
            <img src={isScrolled ? logo : logoBlanc} alt="IvoireFlights" className="h-10 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#vols" className={navLinkClass}>Vols</a>
            <a href="#hotels" className={navLinkClass}>Hôtels</a>
            <a href="#assurances" className={navLinkClass}>Assurances</a>
            <a href="#business" className={navLinkClass}>Entrepreneuriat</a>
            {user && <a href="#historique" className={navLinkClass}>Historique</a>}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isScrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${isScrolled ? 'bg-primary text-white' : 'bg-white/20 text-white border border-white/30'}`}>
                    {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                  </div>
                  <span className="text-sm font-bold">{user.firstName} {user.lastName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      <UserCircle className="h-5 w-5 text-gray-400" /> Mon profil
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="h-5 w-5" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/register" className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${isScrolled ? 'text-primary border border-primary hover:bg-primary/5' : 'text-white border border-white hover:bg-white/10'}`}>Inscription</Link>
                <Link to="/login" className="px-5 py-2 text-sm font-bold text-white bg-secondary rounded-lg hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/20">Connexion</Link>
              </>
            )}
          </div>

          <button className={`lg:hidden p-2 rounded-md transition-colors ${isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`} onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-6 space-y-4 shadow-xl">
          <a href="#vols" className="block text-base font-bold text-gray-700 hover:text-primary">Vols</a>
          <a href="#hotels" className="block text-base font-bold text-gray-700 hover:text-primary">Hôtels</a>
          <a href="#assurances" className="block text-base font-bold text-gray-700 hover:text-primary">Assurances</a>
          <a href="#business" className="block text-base font-bold text-gray-700 hover:text-primary">Entrepreneuriat</a>
          {user && <a href="#historique" className="block text-base font-bold text-gray-700 hover:text-primary">Historique</a>}
          <div className="flex flex-col gap-3 pt-4">
            {user ? (
              <>
                <Link to="/profile" className="w-full text-center px-4 py-3 text-sm font-bold text-primary border border-primary rounded-xl">Mon profil</Link>
                <button onClick={handleLogout} className="w-full text-center px-4 py-3 text-sm font-bold text-white bg-red-500 rounded-xl">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/register" className="w-full text-center px-4 py-3 text-sm font-bold text-primary border border-primary rounded-xl">Inscription</Link>
                <Link to="/login" className="w-full text-center px-4 py-3 text-sm font-bold text-white bg-secondary rounded-xl">Connexion</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

/* ─────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────── */
const HeroSection = ({ airlines, airlinesLoading, onSearch, onReset, isSearching }) => {
  const [activeTab, setActiveTab] = useState('vols');

  /* ── Champs de recherche ── */
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState('one_way'); // 'one_way' | 'round_trip'

  /* ── Select compagnies avec recherche ── */
  const [companySearch, setCompanySearch] = useState('');
  const [selectedAirline, setSelectedAirline] = useState({ name: 'Toutes les compagnies', code: 'all' });
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyRef = useRef(null);

  const filteredCompanies = (airlines || []).filter((a) =>
    a.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (companyRef.current && !companyRef.current.contains(e.target)) {
        setIsCompanyDropdownOpen(false);
        setCompanySearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!destination.trim()) return;
    onSearch({
      depart,
      destination,
      date,
      returnDate: tripType === 'round_trip' ? returnDate : '',
      tripType,
      airline: selectedAirline.code,
    });
  };

  const swapLocations = () => {
    const tmp = depart;
    setDepart(destination);
    setDestination(tmp);
  };

  const handleReset = () => {
    setDepart('');
    setDestination('');
    setDate('');
    setReturnDate('');
    setTripType('one_way');
    setCompanySearch('');
    setSelectedAirline({ name: 'Toutes les compagnies', code: 'all' });
    if (onReset) onReset();
  };

  return (
    <section className="relative min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={planeImg} alt="hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0d2048]/50 to-[#1C4CA5]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center pt-20 pb-10">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
          Voyagez plus loin,<br />
          <span className="text-secondary">dépensez moins</span>
        </h1>
        <p className="text-white text-lg md:text-xl mb-12 max-w-3xl mx-auto font-medium drop-shadow-md">
          Comparez des milliers d'offres de vols, hôtels et assurances pour trouver le meilleur prix au départ d'Abidjan.
        </p>

        {/* Search Widget */}
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex bg-gray-50/50">
            <button
              onClick={() => setActiveTab('vols')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 text-base font-bold transition-all ${activeTab === 'vols' ? 'text-primary bg-white shadow-[0_-4px_0_0_#1C4CA5_inset]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Plane className={`h-5 w-5 ${activeTab === 'vols' ? 'text-primary' : 'text-gray-400'}`} /> Vols
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 text-base font-bold transition-all ${activeTab === 'hotels' ? 'text-primary bg-white shadow-[0_-4px_0_0_#1C4CA5_inset]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Building2 className={`h-5 w-5 ${activeTab === 'hotels' ? 'text-primary' : 'text-gray-400'}`} /> Hôtels
            </button>
            <button
              onClick={() => setActiveTab('assurance')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 text-base font-bold transition-all ${activeTab === 'assurance' ? 'text-primary bg-white shadow-[0_-4px_0_0_#1C4CA5_inset]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Shield className={`h-5 w-5 ${activeTab === 'assurance' ? 'text-primary' : 'text-gray-400'}`} /> Assurance
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSearch}>
          <div className="p-8">
            {activeTab === 'vols' && (
              <div className="space-y-6">
                {/* Trip type toggle (Aller simple / Aller-retour) */}
                <div className="flex justify-start">
                  <div className="inline-flex bg-gray-100 rounded-full p-1 text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => setTripType('one_way')}
                      className={`px-5 py-2 rounded-full transition-all ${
                        tripType === 'one_way'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Aller simple
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('round_trip')}
                      className={`px-5 py-2 rounded-full transition-all ${
                        tripType === 'round_trip'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Aller-retour
                    </button>
                  </div>
                </div>

                {/* Locations Row */}
                <div className="flex flex-col md:flex-row items-start gap-4 relative">
                  <div className="flex-1 w-full">
                    <AirportAutocomplete
                      label="DÉPART"
                      value={depart}
                      onChange={setDepart}
                      placeholder="Ville ou aéroport de départ"
                      iconColor="green"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={swapLocations}
                    className="z-10 bg-white border border-gray-200 p-2.5 rounded-full shadow-md hover:shadow-lg transition-all text-primary md:mt-8 -my-2 md:my-0"
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                  </button>

                  <div className="flex-1 w-full">
                    <AirportAutocomplete
                      label="DESTINATION"
                      value={destination}
                      onChange={setDestination}
                      placeholder="Où allez-vous ?"
                      iconColor="orange"
                    />
                  </div>
                </div>

                {/* Date + Airlines Row */}
                <div className={`grid grid-cols-1 ${tripType === 'round_trip' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 text-left`}>
                  {/* Date de départ */}
                  <div className="w-full">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Date de départ</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Date de retour (aller-retour seulement) */}
                  {tripType === 'round_trip' && (
                    <div className="w-full">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Date de retour</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          min={date || new Date().toISOString().split('T')[0]}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Compagnies aériennes – select avec recherche */}
                  <div className="w-full relative" ref={companyRef}>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">
                      Compagnies Aériennes
                      {airlinesLoading && (
                        <span className="ml-2 text-[10px] font-medium text-gray-400 normal-case">chargement…</span>
                      )}
                    </label>
                    <div className="relative">
                      <Plane className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary z-10" />
                      <input
                        type="text"
                        placeholder={airlinesLoading ? 'Chargement des compagnies…' : 'Rechercher une compagnie…'}
                        value={isCompanyDropdownOpen ? companySearch : selectedAirline.name}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          if (!isCompanyDropdownOpen) setIsCompanyDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setIsCompanyDropdownOpen(true);
                          setCompanySearch('');
                        }}
                        disabled={airlinesLoading}
                        className="w-full pl-12 pr-10 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-60"
                      />
                      <ChevronDown
                        className={`absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 cursor-pointer ${isCompanyDropdownOpen ? 'rotate-180' : ''}`}
                        onClick={() => {
                          if (!airlinesLoading) {
                            setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
                            if (!isCompanyDropdownOpen) setCompanySearch('');
                          }
                        }}
                      />
                    </div>

                    {/* Dropdown */}
                    {isCompanyDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                        {filteredCompanies.length > 0 ? (
                          filteredCompanies.map((airline, i) => (
                            <div
                              key={i}
                              className={`px-6 py-3 text-sm font-bold cursor-pointer transition-colors hover:bg-gray-50 flex items-center gap-3 ${selectedAirline.code === airline.code ? 'text-primary bg-primary/5' : 'text-gray-700'}`}
                              onClick={() => {
                                setSelectedAirline(airline);
                                setIsCompanyDropdownOpen(false);
                                setCompanySearch('');
                              }}
                            >
                              {airline.code !== 'all' && (
                                <span className="text-[11px] font-black text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 w-8 text-center flex-shrink-0">
                                  {airline.code}
                                </span>
                              )}
                              {airline.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-4 text-sm text-gray-400 italic">Aucune compagnie trouvée</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex flex-col md:flex-row justify-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSearching || !destination.trim()}
                    className="w-full md:w-auto md:min-w-[280px] bg-secondary hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-5 px-10 rounded-2xl transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 text-lg"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        Recherche en cours…
                      </>
                    ) : (
                      <>
                        <Search className="h-6 w-6" />
                        Rechercher
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full md:w-auto md:min-w-[200px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-5 px-10 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <input type="text" placeholder="Ville ou hôtel..." className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Check-in</label>
                    <input type="text" placeholder="jj/mm/aaaa" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Check-out</label>
                    <input type="text" placeholder="jj/mm/aaaa" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-secondary hover:bg-secondary-dark text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" /> Rechercher
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'assurance' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Destination</label>
                  <input type="text" placeholder="Pays de destination" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Départ</label>
                  <input type="text" placeholder="jj/mm/aaaa" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 text-left">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Voyageurs</label>
                    <input type="number" defaultValue="1" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <button className="bg-secondary hover:bg-secondary-dark text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-secondary/20">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          </form>
        </div>

        {/* Integrated Stats Bar */}
        <div className="mt-12 w-full max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-8 text-white">
            <div className="flex items-center gap-4">
              <p className="text-4xl font-extrabold tracking-tighter">50K+</p>
              <p className="text-sm font-medium text-white/80 leading-tight">Voyageurs<br />satisfaits</p>
            </div>
            <div className="flex items-center gap-4">
              <Plane className="h-8 w-8 text-white/60" />
              <div className="text-left">
                <p className="text-4xl font-extrabold tracking-tighter">120+</p>
                <p className="text-sm font-medium text-white/80 leading-tight">Compagnies<br />aériennes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Headphones className="h-8 w-8 text-white/60" />
              <div className="text-left">
                <p className="text-4xl font-extrabold tracking-tighter">24/7</p>
                <p className="text-sm font-medium text-white/80 leading-tight">Support<br />client</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


/* ─────────────────────────────────────────
   TRUST SECTION
───────────────────────────────────────── */
const TrustSection = () => {
  const items = [
    { icon: <BarChart3 className="h-6 w-6 text-blue-500" />, title: 'Comparaison en temps réel', desc: 'Des milliers d\'offres actualisées à chaque recherche', bgColor: 'bg-blue-100' },
    { icon: <BarChart3 className="h-6 w-6 text-green-500" />, title: 'Paiement 100% sécurisé', desc: 'Transactions protégées par cryptage SSL', bgColor: 'bg-green-100' },
    { icon: <BarChart3 className="h-6 w-6 text-orange-500" />, title: 'Paiement mobile money', desc: 'Orange Money, MTN Money, Wave acceptés', bgColor: 'bg-orange-100' },
    { icon: <BarChart3 className="h-6 w-6 text-purple-500" />, title: 'Support 24h/24', desc: 'Notre équipe ivoirienne disponible à toute heure', bgColor: 'bg-purple-100' },
  ];
  return (
    <div className="bg-white border-b border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <div className={`flex-shrink-0 ${item.bgColor} p-4 rounded-xl`}>{item.icon}</div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   DESTINATIONS POPULAIRES
───────────────────────────────────────── */
const destinations = [
  { code: 'FR', flag: '🇫🇷', city: 'Paris', price: '285 000' },
  { code: 'AE', flag: '🇦🇪', city: 'Dubai', price: '285 000' },
  { code: 'SN', flag: '🇸🇳', city: 'Dakar', price: '205 000' },
  { code: 'MA', flag: '🇲🇦', city: 'Casablanca', price: '285 000' },
  { code: 'TR', flag: '🇹🇷', city: 'Istanbul', price: '285 000' },
  { code: 'GH', flag: '🇬🇭', city: 'Accra', price: '285 000' },
];

const DestinationsSection = () => (
  <section className="py-14 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-extrabold text-gray-900">Destinations populaires</h2>
        <a href="#" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
          Voir toutes les destinations <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <p className="text-sm text-gray-500 mb-8">Au départ d'Abidjan · Prix aller-retour en XOF</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((d) => (
          <div key={d.code} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group border border-gray-100">
            {/* Flag banner */}
            <div className="relative h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
              {d.flag}
              <span className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                {d.code}
              </span>
            </div>
            <div className="p-3">
              <p className="font-bold text-gray-900 text-sm">{d.city}</p>
              <p className="text-xs text-gray-400 mt-0.5">depuis</p>
              <p className="text-primary font-extrabold text-sm">{d.price} F CFA</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   VOLS DISPONIBLES
───────────────────────────────────────── */

/** Carte de vol – data provient de l'API Gemini */
const FlightCard = ({ flight }) => {
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
        <button
          onClick={handleChoose}
          className="bg-secondary hover:bg-secondary-dark text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-secondary/20 flex-shrink-0"
        >
          Choisir <ArrowRight className="h-4 w-4 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
};

/** Section résultats de vols – recoit les données du composant Home */
const FlightsSection = ({ flights, searchQuery, isSearching, searchError }) => {
  const [stopFilter, setStopFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');

  // Filtrer selon escales
  const filtered = (flights || []).filter((f) => {
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
    // horaire
    return a.departureTime?.localeCompare(b.departureTime);
  });

  // Ne rien afficher si pas encore de recherche et pas d'erreur
  if (!isSearching && !searchError && (!flights || flights.length === 0) && !searchQuery) {
    return null;
  }

  return (
    <section id="vols" className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Vols disponibles</h2>
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-6">
            {searchQuery.depart} → {searchQuery.destination}
            {searchQuery.date ? ` · ${new Date(searchQuery.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
            {' · '}1 adulte · {searchQuery?.tripType === 'round_trip' ? 'Aller-retour' : 'Aller simple'}
          </p>
        )}

        {/* ── Loading ── */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Plane className="h-8 w-8 text-primary animate-bounce" />
            </div>
            <p className="text-sm font-bold text-gray-600 mb-1">Recherche en cours via l'IA…</p>
            <p className="text-xs text-gray-400">Cela peut prendre quelques secondes</p>
          </div>
        )}

        {/* ── Erreur ── */}
        {!isSearching && searchError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <X className="h-7 w-7 text-red-400" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">{searchError}</p>
            <p className="text-xs text-gray-400">Vérifiez la destination et réessayez</p>
          </div>
        )}

        {/* ── Résultats ── */}
        {!isSearching && !searchError && sorted.length > 0 && (
          <>
            {/* Barre de filtres */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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

            <div className="space-y-5">
              {sorted.map((f, i) => (
                <FlightCard key={i} flight={f} />
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              {sorted.length} vol{sorted.length > 1 ? 's' : ''} trouvé{sorted.length > 1 ? 's' : ''} · Données Google Flights en temps réel
            </p>
          </>
        )}

        {/* ── Aucun résultat ── */}
        {!isSearching && !searchError && flights && flights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Plane className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-600">Aucun vol trouvé pour cette route</p>
            <p className="text-xs text-gray-400 mt-1">Essayez avec une destination différente</p>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────
   HÔTELS SECTION
───────────────────────────────────────── */
const hotels = [
  { name: 'Sofitel Abidjan Hôtel Ivoire', location: 'Cocody, Abidjan', rating: 9.2, price: '85 000', badge: 'Coup de cœur' },
  { name: 'Sofitel Abidjan Hôtel Ivoire', location: 'Cocody, Abidjan', rating: 9.1, price: '85 000', badge: 'Coup de cœur' },
  { name: 'Sofitel Abidjan Hôtel Ivoire', location: 'Cocody, Abidjan', rating: 9.3, price: '85 000', badge: 'Coup de cœur' },
];

const HotelCard = ({ hotel }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group">
    <div className="relative h-48 overflow-hidden">
      <img src={hotelImg} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-700 px-3 py-1 rounded-full">
        {hotel.badge}
      </div>
      <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
        <Heart className="h-4 w-4 text-gray-500" />
      </button>
      <div className="absolute bottom-3 left-3 bg-primary text-white text-sm font-extrabold w-9 h-9 rounded-full flex items-center justify-center">
        {hotel.rating}
      </div>
    </div>
    <div className="p-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{hotel.badge}</p>
      <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{hotel.name}</h3>
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
        <MapPin className="h-3 w-3" />
        <span>{hotel.location}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
        <Wifi className="h-3 w-3" />
        <Utensils className="h-3 w-3" />
        <Car className="h-3 w-3" />
        <span className="ml-1">Inclus</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-extrabold text-gray-900">{hotel.price} <span className="text-sm font-bold text-gray-700">F CFA</span></p>
          <p className="text-xs text-gray-400">par nuit</p>
        </div>
        <button className="bg-secondary hover:bg-secondary-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
          Voir <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
);

const HotelsSection = () => (
  <section id="hotels" className="py-14 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Les meilleurs hôtels à Abidjan</h2>
        <p className="text-sm text-gray-500">Des hôtels triés sur le volet pour votre confort et votre budget, avec les meilleurs avis vérifiés.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((h, i) => <HotelCard key={i} hotel={h} />)}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   PRICING SECTION
───────────────────────────────────────── */
const pricingPlans = [
  {
    name: 'Essentiel',
    price: '8 500',
    color: 'border-gray-200',
    btnColor: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    highlighted: false,
    features: {
      'Accès mobile': true,
      'Assurance médicale': false,
      'Nombre de points': '100 pts',
      'Réservation vol': true,
      'Support prioritaire': false,
      'Commission totale': '3%',
      'Rapports avancés': false,
    },
  },
  {
    name: 'Confort',
    price: '10 500',
    color: 'border-primary',
    btnColor: 'bg-primary text-white hover:bg-primary-dark',
    highlighted: true,
    badge: '★ Populaire',
    features: {
      'Accès mobile': true,
      'Assurance médicale': true,
      'Nombre de points': '300 pts',
      'Réservation vol': true,
      'Support prioritaire': true,
      'Commission totale': '1.5%',
      'Rapports avancés': false,
    },
  },
  {
    name: 'Premium',
    price: '38 000',
    color: 'border-secondary',
    btnColor: 'bg-secondary text-white hover:bg-secondary-dark',
    highlighted: false,
    features: {
      'Accès mobile': true,
      'Assurance médicale': true,
      'Nombre de points': '1 000 pts',
      'Réservation vol': true,
      'Support prioritaire': true,
      'Commission totale': '0%',
      'Rapports avancés': true,
    },
  },
];

const PricingSection = () => {
  const featureList = ['Accès mobile', 'Assurance médicale', 'Nombre de points', 'Réservation vol', 'Support prioritaire', 'Commission totale', 'Rapports avancés'];
  return (
    <section className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Nos formules d'abonnement</h2>
          <p className="text-sm text-gray-500">Choisissez la formule adaptée à vos besoins de voyage.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 pr-4 w-48">
                  <span className="text-sm font-semibold text-gray-500">Fonctionnalités</span>
                </th>
                {pricingPlans.map((plan) => (
                  <th key={plan.name} className="px-2 pb-4 text-center">
                    <div className={`border-2 ${plan.color} rounded-2xl p-5 ${plan.highlighted ? 'bg-primary/5' : 'bg-white'} relative`}>
                      {plan.badge && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {plan.badge}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-gray-500 mb-1">{plan.name}</p>
                      <p className="text-3xl font-extrabold text-gray-900">{plan.price}</p>
                      <p className="text-xs text-gray-400 mb-4">F CFA / mois</p>
                      <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${plan.btnColor}`}>
                        S'inscrire
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {featureList.map((feature) => (
                <tr key={feature} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 text-sm text-gray-600 font-medium">{feature}</td>
                  {pricingPlans.map((plan) => {
                    const val = plan.features[feature];
                    return (
                      <td key={plan.name} className="py-3 px-2 text-center">
                        {typeof val === 'boolean' ? (
                          val
                            ? <Check className="h-5 w-5 text-green-500 mx-auto" />
                            : <X className="h-5 w-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-700">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────
   BUSINESS SECTION
───────────────────────────────────────── */
const articles = [
  {
    category: 'Création d\'entreprise',
    color: 'bg-blue-100 text-blue-600',
    title: 'Comment créer sa SARL en Côte d\'Ivoire : guide complet 2025',
    desc: 'Toutes les étapes clés pour lancer votre société en Côte d\'Ivoire : RCCM, capital social, fiscalité et conseils pratiques.',
    readTime: '8 min de lecture'
  },
  {
    category: 'Gestion financière',
    color: 'bg-orange-100 text-orange-600',
    title: 'Maîtrisez votre trésorerie : les outils essentiels pour PME africaines',
    desc: 'Toutes les étapes clés pour lancer votre société en Côte d\'Ivoire : RCCM, capital social, fiscalité et conseils pratiques.',
    readTime: '8 min de lecture'
  },
  {
    category: 'Réseau & Partenariats',
    color: 'bg-green-100 text-green-600',
    title: 'Les 10 événements business incontournables à Abidjan en 2025',
    desc: 'Toutes les étapes clés pour lancer votre société en Côte d\'Ivoire : RCCM, capital social, fiscalité et conseils pratiques.',
    readTime: '8 min de lecture'
  },
];

const BusinessSection = () => (
  <section id="business" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Développez votre <span className="text-primary italic">business</span> local
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Ressources, guides et modèles pour entrepreneurs ivoiriens.<br />
            Parce que voyager pour les affaires commence par un business solide.
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-full flex items-center gap-3 transition-all shadow-lg shadow-primary/20">
          Voir tous les articles <div className="bg-white/20 p-1 rounded-full"><ArrowRight className="h-4 w-4" /></div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Articles List */}
        <div className="lg:col-span-7 space-y-6">
          {articles.map((a, i) => (
            <div key={i} className="group bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all cursor-pointer">
              <div className={`w-20 h-20 shrink-0 ${a.color} rounded-2xl flex items-center justify-center`}>
                <Briefcase className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`text-sm font-black uppercase tracking-tight ${a.color.split(' ')[1]}`}>{a.category}</h4>
                  <span className="text-[10px] font-bold text-gray-400">· {a.readTime}</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 group-hover:text-primary transition-colors">{a.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Templates Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-primary rounded-[2.5rem] p-10 text-white h-full relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Download className="h-40 w-40" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4">Templates gratuits</h3>
              <p className="text-white/70 text-sm mb-10 leading-relaxed max-w-xs">
                Téléchargez nos modèles professionnels prêts à l'emploi pour démarrer vite.
              </p>

              <div className="space-y-4">
                {[
                  { name: 'Business Plan - SARL', type: 'PDF · Excel' },
                  { name: 'Contrat de prestation', type: 'Word' },
                  { name: 'Plan de trésorerie 12 mois', type: 'Excel' },
                  { name: 'Statuts de société', type: 'Word' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{t.name}</p>
                        <p className="text-[10px] text-white/50 mt-1 uppercase font-bold tracking-widest">{t.type}</p>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   DASHBOARD PREVIEW
───────────────────────────────────────── */
const DashboardPreview = () => {
  const { user, getDashboardData } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getDashboardData().then(res => {
        if (res.success) setData(res);
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) return null;

  const initials = `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;
  const stats = data?.stats || { voyages: 0, favoris: 0, alertes: 0 };
  const history = data?.history || [];

  return (
    <section id="historique" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Card Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50">
              {/* Top Blue section */}
              <div className="bg-primary p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 mx-auto mb-4 flex items-center justify-center bg-white/10 text-2xl font-black">
                    {initials}
                  </div>
                  <h3 className="text-xl font-black">{user.firstName} {user.lastName}</h3>
                  <p className="text-white/60 text-xs mb-3 font-bold">{user.email || user.phone}</p>
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Membre Premium
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 py-6 bg-primary/5">
                {[
                  { label: 'Voyages', val: stats.voyages },
                  { label: 'Favoris', val: stats.favoris },
                  { label: 'Alertes', val: stats.alertes }
                ].map((s) => (
                  <div key={s.label} className="text-center px-2">
                    <p className="text-2xl font-black text-primary">{s.val}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Side Menu */}
              <div className="p-4 space-y-1">
                {[
                  { label: 'Historique', icon: <Clock className="h-4 w-4" />, active: true },
                  { label: 'Favoris', icon: <Heart className="h-4 w-4" />, active: false },
                  { label: 'Alertes prix', icon: <Bell className="h-4 w-4" />, active: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${item.active ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${item.active ? 'text-primary' : 'text-gray-400'}`}>{item.icon}</div>
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${item.active ? 'text-primary' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search History content */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 h-full">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Historique des recherches</h3>
                <p className="text-sm text-gray-400 font-medium">Retrouvez toutes vos recherches et réservations récentes.</p>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <RefreshCw className="h-10 w-10 animate-spin mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">Chargement...</p>
                  </div>
                ) : history.length > 0 ? (
                  history.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-gray-50 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                          {item.type === 'flight' ? <Plane className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-base font-black text-gray-900 leading-tight">{item.label}</p>
                          <p className="text-xs text-gray-400 font-bold mt-1 tracking-tight">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-base font-black text-gray-900 leading-tight">--</p>
                          <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-1.5 bg-gray-100 text-gray-500">
                            {item.status}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
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
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────── */
const CTASection = () => (
  <section className="bg-[#0d1f3c] py-20">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Prêt à voyager ? Trouvez votre vol idéal.</h2>
        <p className="text-white/60 text-base font-medium italic">Comparaison gratuite · Meilleur prix garanti · Support 24/7</p>
      </div>
      <button className="flex-shrink-0 flex items-center gap-3 bg-secondary hover:bg-secondary-dark text-white font-black px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-secondary/20 text-lg">
        <Plane className="h-6 w-6 rotate-45" /> Rechercher un vol
      </button>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
const Footer = () => (
  <footer className="bg-[#0a1628] text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
        {/* Brand */}
        <div className="lg:col-span-4 space-y-8">
          <img src={logo} alt="IvoireFlights" className="h-16 w-auto" />
          <p className="text-sm text-white/50 leading-relaxed max-w-sm">
            Le premier comparateur de voyages dédié au marché ivoirien. Vols, hôtels, assurances et ressources entrepreneuriales réunis en une seule plateforme.
          </p>
          <div className="space-y-4 text-sm text-white/60">
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-secondary" /> Abidjan Plateau, Côte d'Ivoire</p>
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-secondary" /> +225 27 00 00 00 00</p>
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-secondary" /> contact@ivoireflights.ci</p>
          </div>
          <div className="flex gap-4">
            {[IconFacebook, IconTwitter, IconInstagram, IconLinkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all border border-white/5">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Links Columns */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Services</h4>
          <ul className="space-y-4">
            {['Vols', 'Hôtels', 'Assurances', 'Transferts aéroport', 'Packages voyage'].map((l) => (
              <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors font-medium">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Entrepreneuriat</h4>
          <ul className="space-y-4">
            {['Créer son entreprise', 'Gestion financière', 'Templates gratuits', 'Communauté', 'Partenaires'].map((l) => (
              <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors font-medium">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Support</h4>
          <ul className="space-y-4">
            {["Centre d'aide", 'Contactez-nous', 'Politique d\'annulation', 'Remboursements', 'Réclamations'].map((l) => (
              <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors font-medium">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">À Propos</h4>
          <ul className="space-y-4">
            {['Qui sommes-nous ?', 'Presse', 'Carrières', 'Blog', 'Conditions générales'].map((l) => (
              <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors font-medium">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">
        <p>© 2025 IvoireFlights. Tous droits réservés.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
          <a href="#" className="hover:text-white transition-colors">CGU</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────── */
const Home = () => {
  const { user } = useAuth();
  const flightResultsRef = useRef(null);

  /* ── Compagnies aériennes (chargées depuis Gemini au démarrage) ── */
  const [airlines, setAirlines] = useState([]);
  const [airlinesLoading, setAirlinesLoading] = useState(true);

  /* ── Résultats de recherche ── */
  const [flightResults, setFlightResults] = useState(null);   // null = pas encore cherché
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);

  /* ── Charger les compagnies au montage ── */
  useEffect(() => {
    fetchAirlines()
      .then((data) => {
        if (data.success && data.airlines?.length) {
          setAirlines(data.airlines);
        }
      })
      .catch(() => {
        // Les compagnies de fallback restent dans le backend, rien à faire ici
      })
      .finally(() => setAirlinesLoading(false));
  }, []);

  /* ── Lancer une recherche de vols ── */
  const handleSearch = useCallback(async ({ depart, destination, date, returnDate, tripType, airline }) => {
    setIsSearching(true);
    setSearchError(null);
    setFlightResults(null);
    setSearchQuery({ depart, destination, date, returnDate, tripType, airline });

    // Scroll vers les résultats
    setTimeout(() => {
      flightResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const data = await apiSearchFlights({ depart, destination, date, returnDate, tripType, airline });
      if (data.success) {
        setFlightResults(data.flights);
      } else {
        setSearchError(data.message || 'Aucun résultat trouvé.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur de connexion. Vérifiez que le serveur est démarré.';
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setFlightResults(null);
    setSearchError(null);
    setSearchQuery(null);
  }, []);

  return (
    <div className="font-sans">
      <Navbar />
      <HeroSection
        airlines={airlines}
        airlinesLoading={airlinesLoading}
        onSearch={handleSearch}
        onReset={handleReset}
        isSearching={isSearching}
      />
      <TrustSection />
      <DestinationsSection />

      {/* Résultats de vols (ancre pour le scroll) */}
      <div ref={flightResultsRef}>
        <FlightsSection
          flights={flightResults}
          searchQuery={searchQuery}
          isSearching={isSearching}
          searchError={searchError}
        />
      </div>

      <HotelsSection />
      {user && <DashboardPreview />}
      <Footer />
    </div>
  );
};

export default Home;
