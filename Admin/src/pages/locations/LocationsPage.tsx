import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin, FiChevronLeft, FiChevronRight, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import locationsService, { Location, LocationType } from '../../services/locations.service';

const LocationsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationType, setLocationType] = useState<LocationType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadLocations();
  }, [currentPage, search, locationType]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        locationType: locationType || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const
      };
      
      const response = await locationsService.getLocations(params);
      setLocations(response.items);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      toast.error('Erro ao carregar locais');
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await locationsService.toggleLocationStatus(id);
      toast.success('Status atualizado com sucesso');
      loadLocations();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este local?')) {
      try {
        await locationsService.deleteLocation(id);
        toast.success('Local excluído com sucesso');
        loadLocations();
      } catch (error) {
        toast.error('Erro ao excluir local');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadLocations();
  };

  const getLocationTypeLabel = (type: LocationType) => {
    const labels: Record<LocationType, string> = {
      [LocationType.VIEWPOINT]: 'Mirante',
      [LocationType.RESTAURANT]: 'Restaurante',
      [LocationType.HOTEL]: 'Hotel',
      [LocationType.ATTRACTION]: 'Atração',
      [LocationType.PARKING]: 'Estacionamento',
      [LocationType.RESTROOM]: 'Banheiro',
      [LocationType.GAS_STATION]: 'Posto',
      [LocationType.HOSPITAL]: 'Hospital',
      [LocationType.SHOPPING]: 'Shopping',
      [LocationType.OTHER]: 'Outro'
    };
    return labels[type] || type;
  };

  const getLocationName = (location: Location) => {
    if (location.nameTranslations && location.nameTranslations.length > 0) {
      const ptTranslation = location.nameTranslations.find(t => t.language === 'pt');
      if (ptTranslation) return ptTranslation.text;
      const enTranslation = location.nameTranslations.find(t => t.language === 'en');
      if (enTranslation) return enTranslation.text;
      return location.nameTranslations[0].text;
    }
    return location.nameTextRefId;
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Locais</h1>
          <p className="text-gray-400">Gerencie locais e pontos de interesse</p>
        </div>
        <Link
          to="/locations/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FiPlus />
          Novo Local
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar locais..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={locationType}
            onChange={(e) => {
              setLocationType(e.target.value as LocationType | '');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os tipos</option>
            {Object.values(LocationType).map(type => (
              <option key={type} value={type}>{getLocationTypeLabel(type)}</option>
            ))}
          </select>
        </form>
        
        <Link
          to="/locations/new"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <FiPlus size={18} />
          <span>Adicionar Local</span>
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Carregando...</div>
          </div>
        ) : locations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhum local encontrado
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Localização</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Avaliação</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.locationId} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{getLocationName(location)}</div>
                        {location.addressTranslations && location.addressTranslations.length > 0 && (
                          <div className="text-sm text-gray-400 mt-1">
                            {location.addressTranslations.find(t => t.language === 'pt')?.text || 
                             location.addressTranslations[0].text}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                          {getLocationTypeLabel(location.locationType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          <FiMapPin size={14} />
                          <span className="text-sm">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {location.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-white">{location.rating.toFixed(1)}</span>
                            <span className="text-gray-400 text-sm">({location.reviewsCount || 0})</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(location.locationId)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {location.isActive ? (
                            <FiToggleRight className="text-green-400" size={24} />
                          ) : (
                            <FiToggleLeft className="text-gray-400" size={24} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/locations/${location.locationId}/edit`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(location.locationId)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
                <div className="text-sm text-gray-400">
                  Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems} locais
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage - 2 + i;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }).filter(Boolean)}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;
