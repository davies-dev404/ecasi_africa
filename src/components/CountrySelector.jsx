import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import countriesData from '@/data/countriesData.json';

export default function CountrySelector({
  value,
  onChange,
  name = 'country',
  required = false,
  className = '',
  placeholder = 'Select country',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected country
  const selectedCountry = useMemo(() => {
    if (!value) return countriesData.find((c) => c.country === 'Kenya') || countriesData[0];
    return (
      countriesData.find((c) => c.country.toLowerCase() === value.toLowerCase()) ||
      countriesData.find((c) => c.code === value) ||
      countriesData[0]
    );
  }, [value]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countriesData;
    return countriesData.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.iso && c.iso.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (c) => {
    onChange?.(c);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for form submission & validation */}
      <input
        type="hidden"
        name={name}
        value={selectedCountry?.country || ''}
        required={required}
      />

      {/* Trigger Button with Real Graphical Flag */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] flex items-center justify-between gap-2.5 focus:outline-none focus:border-[#008000] focus:ring-1 focus:ring-[#008000]/20 transition-all text-left cursor-pointer hover:border-slate-400"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedCountry?.flagUrl ? (
            <img
              src={selectedCountry.flagUrl}
              alt={selectedCountry.country}
              className="w-5 h-3.5 object-cover rounded-[2px] shadow-xs border border-slate-300 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="truncate font-medium text-slate-800">
            {selectedCountry?.country || placeholder}
          </span>
          {selectedCountry?.code && (
            <span className="text-slate-400 text-xs shrink-0 font-mono">
              ({selectedCountry.code})
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#008000]' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or dial code..."
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008000] focus:ring-1 focus:ring-[#008000]/20"
              />
            </div>
          </div>

          {/* List of Countries with Real SVG/PNG Flag Images */}
          <div
            role="listbox"
            className="max-h-56 overflow-y-auto divide-y divide-slate-50 text-xs"
          >
            {filteredCountries.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                No matching country found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.country === c.country;
                return (
                  <button
                    key={`${c.country}-${c.code}`}
                    type="button"
                    onClick={() => handleSelect(c)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full px-3 py-2 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {c.flagUrl ? (
                        <img
                          src={c.flagUrl}
                          alt=""
                          aria-hidden="true"
                          className="w-5 h-3.5 object-cover rounded-[2px] shadow-xs border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{c.country}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[11px] font-mono">
                        {c.code}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#008000] stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

