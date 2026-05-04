import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, UserCircle, LogOut, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import logoBlanc from '../assets/IvoireFlightsBlanc.png';

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
            <Link to="/#vols" className={navLinkClass}>Vols</Link>
            <Link to="/#hotels" className={navLinkClass}>Hôtels</Link>
            <Link to="/#assurances" className={navLinkClass}>Assurances</Link>
            <Link to="/#business" className={navLinkClass}>Entrepreneuriat</Link>
            {user && <Link to="/#historique" className={navLinkClass}>Historique</Link>}
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
          <Link to="/#vols" onClick={() => setOpen(false)} className="block text-base font-bold text-gray-700 hover:text-primary">Vols</Link>
          <Link to="/#hotels" onClick={() => setOpen(false)} className="block text-base font-bold text-gray-700 hover:text-primary">Hôtels</Link>
          <Link to="/#assurances" onClick={() => setOpen(false)} className="block text-base font-bold text-gray-700 hover:text-primary">Assurances</Link>
          <Link to="/#business" onClick={() => setOpen(false)} className="block text-base font-bold text-gray-700 hover:text-primary">Entrepreneuriat</Link>
          {user && <Link to="/#historique" onClick={() => setOpen(false)} className="block text-base font-bold text-gray-700 hover:text-primary">Historique</Link>}
          <div className="flex flex-col gap-3 pt-4">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="w-full text-center px-4 py-3 text-sm font-bold text-primary border border-primary rounded-xl">Mon profil</Link>
                <button onClick={handleLogout} className="w-full text-center px-4 py-3 text-sm font-bold text-white bg-red-500 rounded-xl">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/register" onClick={() => setOpen(false)} className="w-full text-center px-4 py-3 text-sm font-bold text-primary border border-primary rounded-xl">Inscription</Link>
                <Link to="/login" onClick={() => setOpen(false)} className="w-full text-center px-4 py-3 text-sm font-bold text-white bg-secondary rounded-xl">Connexion</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
