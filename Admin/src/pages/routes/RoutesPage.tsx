import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import routesService, { Route, RouteFilters } from '../../services/routes.service';

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<RouteFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    limit: 10
  });
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await routesService.getRoutes(filters);
      setRoutes(response.items);
      setTotal(response.pagination.total);
    } catch (error) {
      toast.error('Failed to load routes');
      console.error('Error loading routes:', error);
      setRoutes([]); // Set empty array on error to prevent undefined access
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleSearch = (value: string) => {
    setFilters((prev: RouteFilters) => ({ ...prev, search: value, page: 1 }));
  };

  const handleDelete = async () => {
    if (!selectedRoute) return;
    
    try {
      await routesService.deleteRoute(selectedRoute.routeId);
      toast.success('Route deleted successfully');
      setShowDeleteModal(false);
      setSelectedRoute(null);
      loadRoutes();
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  const getLocalizedTitle = (route: Route): string => {
    if (route.titleTranslations && route.titleTranslations.length > 0) {
      const ptTranslation = route.titleTranslations.find(t => t.language === 'pt');
      return ptTranslation?.text || route.titleTranslations[0].text || 'Sem título';
    }
    return route.title || 'Sem título';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rotas</h1>
          <p className="text-gray-400">Gerencie rotas e suas informações</p>
        </div>
        <Link
          to="/routes/new"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <FiPlus size={20} />
          Adicionar Rota
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar rotas..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-8 text-center">
            <FiMapPin size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-center py-8">Nenhuma rota encontrada</p>
            <p className="text-gray-500 text-sm mt-2">Tente ajustar a busca ou adicionar uma nova rota</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cidades</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Histórias</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {routes.map((route) => (
                  <tr key={route.routeId}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">
                        {getLocalizedTitle(route)}
                      </span>
                    </td>
                    
                    {/* Descrição */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300 line-clamp-2">
                        {route.description ? (route.description.length > 50 ? route.description.substring(0, 50) + '...' : route.description) : 'Sem descrição'}
                      </span>
                    </td>
                    
                    {/* Cidades */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        <div>{route.citiesCount || 0} cidades</div>
                      </div>
                    </td>
                    
                    {/* Histórias */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        <div>{route.storiesCount || 0} histórias</div>
                      </div>
                    </td>
                    
                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/routes/${route.routeId}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir rota"
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
        {!loading && routes.length > 0 && (
          <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, total)} of {total} routes
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((prev: RouteFilters) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                disabled={filters.page === 1}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((prev: RouteFilters) => ({ ...prev, page: prev.page! + 1 }))}
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
      {showDeleteModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{getLocalizedTitle(selectedRoute)}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRoute(null);
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

export default RoutesPage;
