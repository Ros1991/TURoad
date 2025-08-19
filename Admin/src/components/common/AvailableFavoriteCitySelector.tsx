import React, { useState, useMemo } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';

interface AvailableCity {
  city_id: number;
  name: string;
  state: string;
  country: string;
  localized_name: string;
}

interface AvailableFavoriteCitySelectorProps {
  cities: AvailableCity[];
  value: number | null;
  onChange: (cityId: number | null) => void;
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

const AvailableFavoriteCitySelector: React.FC<AvailableFavoriteCitySelectorProps> = ({
  cities,
  value,
  onChange,
  placeholder = "Selecione uma cidade",
  className = "",
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cities;
    return cities.filter(city => 
      city.localized_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const selectedCity = cities.find(city => city.city_id === value);

  const handleCitySelect = (cityId: number) => {
    onChange(cityId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || cities.length === 0}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedCity ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {loading ? 'Carregando...' : selectedCity?.localized_name || placeholder}
        </span>
        <FiChevronDown 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={16} 
        />
      </button>

      {isOpen && cities.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-hidden z-50"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cidade..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Clear option */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full px-3 py-2 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
            >
              Limpar seleção
            </button>
          )}

          {/* Cities List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.city_id}
                  type="button"
                  onClick={() => handleCitySelect(city.city_id)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                    city.city_id === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium">{city.localized_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{city.state}, {city.country}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                {searchTerm ? 'Nenhuma cidade encontrada' : 'Nenhuma cidade disponível'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AvailableFavoriteCitySelector;
