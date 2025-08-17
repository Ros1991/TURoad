import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import citiesService, { City, CityFilters } from '../../services/cities.service';

const CitiesPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CityFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    limit: 10
  });
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadCities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await citiesService.getAll(filters);
      setCities(response.items);
      setTotal(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load cities');
      console.error('Error loading cities:', error);
      setCities([]); // Set empty array on error to prevent undefined access
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const handleSearch = (value: string) => {
    setFilters((prev: CityFilters) => ({ ...prev, search: value, page: 1 }));
  };


  const handleDelete = async () => {
    if (!selectedCity) return;
    
    try {
      await citiesService.delete(selectedCity.cityId);
      toast.success('City deleted successfully');
      setShowDeleteModal(false);
      setSelectedCity(null);
      loadCities();
    } catch (error) {
      toast.error('Failed to delete city');
    }
  };

  const getLocalizedName = (city: City): string => {
    if (city.nameTranslations && city.nameTranslations.length > 0) {
      const ptTranslation = city.nameTranslations.find(t => t.language === 'pt');
      return ptTranslation?.text || city.nameTranslations[0].text || 'Sem nome';
    }
    return 'Sem nome';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cidades</h1>
          <p className="text-gray-400">Gerencie cidades e suas informações</p>
        </div>
        <Link
          to="/cities/new"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <FiPlus size={20} />
          Adicionar Cidade
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar cidades..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cities Table */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading cities...</p>
          </div>
        ) : cities.length === 0 ? (
          <div className="p-8 text-center">
            <FiMapPin size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-center py-8">Nenhuma cidade encontrada</p>
            <p className="text-gray-500 text-sm mt-2">Tente ajustar a busca ou adicionar uma nova cidade</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Coordenadas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rotas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cities.map((city) => (
                  <tr key={city.cityId}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">
                        {city.name || ''}
                      </span>
                    </td>
                    
                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {city.state || 'Não informado'}
                      </span>
                    </td>
                    
                    {/* Coordenadas */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-400">
                        <div>Lat: {Number(city.latitude).toFixed(4)}</div>
                        <div>Lng: {Number(city.longitude).toFixed(4)}</div>
                      </div>
                    </td>
                    
                    {/* Rotas */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        <div>{city.routesCount || 0} rotas</div>
                        <div className="text-xs text-gray-500">{city.storiesCount || 0} histórias</div>
                      </div>
                    </td>
                    
                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/cities/${city.cityId}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCity(city);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir cidade"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && cities.length > 0 && (
          <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, total)} of {total} cities
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((prev: CityFilters) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                disabled={filters.page === 1}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((prev: CityFilters) => ({ ...prev, page: prev.page! + 1 }))}
                disabled={filters.page! * filters.limit! >= total}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{getLocalizedName(selectedCity)}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCity(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesPage;
