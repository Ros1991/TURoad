import React, { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import routeCitiesService from '../../services/routeCities.service';

interface AvailableCitySelectorProps {
  routeId: number;
  value: number | null;
  onChange: (cityId: number | null) => void;
  placeholder?: string;
  className?: string;
}

interface AvailableCity {
  city_id: number;
  name: string;
}

const AvailableCitySelector: React.FC<AvailableCitySelectorProps> = ({
  routeId,
  value,
  onChange,
  placeholder = "Selecione uma cidade",
  className = ""
}) => {
  const [cities, setCities] = useState<AvailableCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAvailableCities();
  }, [routeId]);

  const loadAvailableCities = async () => {
    setLoading(true);
    try {
      const data = await routeCitiesService.getAvailableCities(routeId);
      setCities(data);
    } catch (error) {
      console.error('Failed to load available cities:', error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cities;
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const selectedCity = cities.find(city => city.city_id === value);

  const handleCitySelect = (cityId: number) => {
    onChange(cityId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || cities.length === 0}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left text-white hover:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
        style={{ zIndex: 1000 }}
      >
        <span className={selectedCity ? 'text-white' : 'text-gray-400'}>
          {loading ? 'Carregando...' : selectedCity?.name || placeholder}
        </span>
        <FiChevronDown 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>

      {isOpen && cities.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden"
          style={{ zIndex: 9999 }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cidade..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.city_id}
                  type="button"
                  onClick={() => handleCitySelect(city.city_id)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  {city.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-center">
                {searchTerm ? 'Nenhuma cidade encontrada' : 'Todas as cidades já foram adicionadas'}
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

export default AvailableCitySelector;
