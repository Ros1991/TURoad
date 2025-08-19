import React, { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import { userFavoriteCitiesService, AvailableCity } from '../../services/userFavoriteCities.service';

interface UserFavoriteCitySelectorProps {
  userId: number;
  value: number | null;
  onChange: (cityId: number | null) => void;
  placeholder?: string;
  className?: string;
  refreshTrigger?: number;
}

const UserFavoriteCitySelector: React.FC<UserFavoriteCitySelectorProps> = ({
  userId,
  value,
  onChange,
  placeholder = "Selecione uma cidade",
  className = "",
  refreshTrigger
}) => {
  const [cities, setCities] = useState<AvailableCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAvailableCities();
  }, [userId, refreshTrigger]);

  const loadAvailableCities = async () => {
    setLoading(true);
    try {
      const data = await userFavoriteCitiesService.getAvailableCities(userId);
      console.log('Available cities loaded:', data); // Debug log
      console.log('Cities array length:', data?.length); // Debug log
      console.log('First city:', data?.[0]); // Debug log
      setCities(data || []);
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

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ zIndex: 1000 }}
      >
        <span className={selectedCity ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {loading ? 'Carregando...' : selectedCity?.localized_name || placeholder}
        </span>
        <FiChevronDown 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={16} 
        />
      </button>

      {isOpen && !loading && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-hidden"
          style={{ zIndex: 9999 }}
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

          {/* Cities List */}
          <div className="max-h-48 overflow-y-auto">
            {cities.length > 0 ? (
              filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city.city_id}
                    type="button"
                    onClick={() => handleCitySelect(city.city_id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-gray-900 dark:text-white"
                  >
                    <div>
                      <div className="font-medium">{city.localized_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{city.state}, {city.country}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                  Nenhuma cidade encontrada
                </div>
              )
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                Todas as cidades já foram adicionadas
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

export default UserFavoriteCitySelector;
