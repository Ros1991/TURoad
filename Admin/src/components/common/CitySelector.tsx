import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import citiesService from '../../services/cities.service';

interface CityWithName {
  cityId: number;
  nameTextRefId: number;
  state: string;
  name: string;
  translatedName?: string;
}

interface CitySelectorProps {
  value: number;
  onChange: (cityId: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Selecione uma cidade"
}) => {
  const [cities, setCities] = useState<CityWithName[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityWithName[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityWithName | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    // Find selected city when value changes
    if (value && cities.length > 0) {
      const city = cities.find(c => c.cityId === value);
      setSelectedCity(city || null);
    } else {
      setSelectedCity(null);
    }
  }, [value, cities]);

  useEffect(() => {
    // Filter cities based on search term
    if (searchTerm) {
      const filtered = cities.filter(city => 
        city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.cityId.toString().includes(searchTerm)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchTerm, cities]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      // Load cities with pagination
      const response = await citiesService.getCities({ page: 1, limit: 1000 });
      // For now, use placeholder names - can be enhanced later with real translations
      const citiesWithNames = response.items.map(city => ({
        ...city,
        name: `${city.state} - ID: ${city.cityId}`,
        translatedName: `Cidade ${city.cityId}`
      }));
      
      setCities(citiesWithNames);
      setFilteredCities(citiesWithNames);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
      setFilteredCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (city: CityWithName) => {
    setSelectedCity(city);
    onChange(city.cityId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500 focus:outline-none focus:border-blue-500'}`}
      >
        <span className={selectedCity ? 'text-white' : 'text-gray-400'}>
          {selectedCity ? selectedCity.name : placeholder}
        </span>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cidade..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Carregando cidades...</div>
            ) : filteredCities.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? 'Nenhuma cidade encontrada' : 'Nenhuma cidade disponível'}
              </div>
            ) : (
              filteredCities.map(city => (
                <button
                  key={city.cityId}
                  onClick={() => handleSelect(city)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between
                    ${city.cityId === value ? 'bg-gray-700 text-blue-400' : 'text-white'}`}
                >
                  <span>{city.name}</span>
                  <span className="text-xs text-gray-500">ID: {city.cityId}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
