import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import locationsService, { Location, LocationFilters } from '../../services/locations.service';

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<LocationFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    limit: 10
  });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await locationsService.getLocations(filters);
      setLocations(response.items);
      setTotal(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load locations');
      console.error('Error loading locations:', error);
      setLocations([]); // Set empty array on error to prevent undefined access
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleSearch = (value: string) => {
    setFilters((prev: LocationFilters) => ({ ...prev, search: value, page: 1 }));
  };

  const handleDelete = async () => {
    if (!selectedLocation) return;
    
    try {
      await locationsService.deleteLocation(selectedLocation.locationId);
      toast.success('Location deleted successfully');
      setShowDeleteModal(false);
      setSelectedLocation(null);
      loadLocations();
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const getLocalizedName = (location: Location): string => {
    if (location.nameTranslations && location.nameTranslations.length > 0) {
      const ptTranslation = location.nameTranslations.find(t => t.language === 'pt');
      return ptTranslation?.text || location.nameTranslations[0].text || 'Sem nome';
    }
    return location.name || 'Sem nome';
  };

  const getCityName = (location: Location): string => {
    return location.cityId ? `Cidade ${location.cityId}` : 'Não informado';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Locais</h1>
          <p className="text-gray-400">Gerencie locais e suas informações</p>
        </div>
        <Link
          to="/locations/new"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <FiPlus size={20} />
          Adicionar Local
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar locais..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="p-8 text-center">
            <FiMapPin size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-center py-8">Nenhum local encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Tente ajustar a busca ou adicionar um novo local</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Coordenadas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {locations.map((location) => (
                  <tr key={location.locationId}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">
                        {getLocalizedName(location)}
                      </span>
                    </td>
                    
                    {/* Cidade */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {getCityName(location)}
                      </span>
                    </td>
                    
                    {/* Coordenadas */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-400">
                        <div>Lat: {Number(location.latitude || 0).toFixed(4)}</div>
                        <div>Lng: {Number(location.longitude || 0).toFixed(4)}</div>
                      </div>
                    </td>
                    
                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/locations/${location.locationId}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedLocation(location);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir local"
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
        {!loading && locations.length > 0 && (
          <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, total)} of {total} locations
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((prev: LocationFilters) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                disabled={filters.page === 1}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((prev: LocationFilters) => ({ ...prev, page: prev.page! + 1 }))}
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
      {showDeleteModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{getLocalizedName(selectedLocation)}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLocation(null);
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

export default LocationsPage;
