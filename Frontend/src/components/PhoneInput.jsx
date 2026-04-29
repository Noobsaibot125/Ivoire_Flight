import React, { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';

const countries = [
  { code: 'CI', name: 'Côte d\'Ivoire', dial: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫' },
  { code: 'GN', name: 'Guinée', dial: '+224', flag: '🇬🇳' },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', dial: '+229', flag: '🇧🇯' },
  { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪' },
  { code: 'CM', name: 'Cameroun', dial: '+237', flag: '🇨🇲' },
  { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦' },
  { code: 'CG', name: 'Congo', dial: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'RD Congo', dial: '+243', flag: '🇨🇩' },
  { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', dial: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', dial: '+41', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'US', name: 'États-Unis', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', dial: '+44', flag: '🇬🇧' },
];

const PhoneInput = ({ value, onChange, placeholder = '07 00 00 00 00' }) => {
  const [selected, setSelected] = useState(countries[0]); // Default: Côte d'Ivoire
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Extract local number (strip dial code if present)
  const getLocalNumber = () => {
    if (!value) return '';
    // If the value starts with any dial code, strip it
    for (const c of countries) {
      if (value.startsWith(c.dial)) {
        return value.slice(c.dial.length).trim();
      }
    }
    return value;
  };

  const handleNumberChange = (e) => {
    const localNum = e.target.value.replace(/[^\d\s]/g, '');
    onChange(selected.dial + localNum);
  };

  const handleSelectCountry = (country) => {
    setSelected(country);
    const localNum = getLocalNumber();
    onChange(country.dial + localNum);
    setDropdownOpen(false);
    setSearch('');
  };

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center border border-gray-100 bg-white rounded-2xl focus-within:ring-2 focus-within:ring-[#0ea5e9]/20 focus-within:border-[#0ea5e9] transition-all">
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 pl-4 pr-2 py-5 border-r border-gray-100 hover:bg-gray-50 rounded-l-2xl transition-colors flex-shrink-0"
        >
          <span className="text-xl leading-none">{selected.flag}</span>
          <span className="text-xs font-bold text-gray-500">{selected.dial}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Phone input */}
        <input
          type="tel"
          placeholder={placeholder}
          value={getLocalNumber()}
          onChange={handleNumberChange}
          className="flex-1 pl-4 pr-6 py-5 bg-transparent text-sm text-gray-900 placeholder-gray-300 focus:outline-none font-medium"
        />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-50">
            <input
              type="text"
              placeholder="Rechercher un pays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-100 transition-colors font-medium"
              autoFocus
            />
          </div>
          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code + c.dial}
                type="button"
                onClick={() => handleSelectCountry(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${selected.code === c.code ? 'bg-[#0ea5e9]/5 text-[#0ea5e9]' : 'text-gray-700'}`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="font-medium flex-1 text-left">{c.name}</span>
                <span className="text-xs font-bold text-gray-400">{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">Aucun pays trouvé</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
