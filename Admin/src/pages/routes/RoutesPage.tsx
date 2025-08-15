import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin, FiClock, FiChevronLeft, FiChevronRight, FiToggleLeft, FiToggleRight, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import routesService, { Route, DifficultyLevel } from '../../services/routes.service';
import citiesService, { City } from '../../services/cities.service';

const RoutesPage = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadRoutes();
    loadCities();
  }, [currentPage, search, selectedCityId, selectedDifficulty]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        cityId: selectedCityId || undefined,
        difficultyLevel: selectedDifficulty || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const
      };
      
      const response = await routesService.getRoutes(params);
      setRoutes(response.items);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      toast.error('Erro ao carregar rotas');
      console.error('Failed to load routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const response = await citiesService.getCities({ limit: 100, sortBy: 'nameTextRefId', sortOrder: 'ASC' });
      setCities(response.items);
    } catch (error) {
      toast.error('Erro ao carregar cidades');
    }
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRoutes();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await routesService.toggleRouteStatus(id);
      toast.success('Status atualizado com sucesso');
      loadRoutes();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await routesService.toggleFeaturedStatus(id);
      toast.success('Status de destaque atualizado com sucesso');
      loadRoutes();
    } catch (error) {
      toast.error('Erro ao atualizar status de destaque');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota?')) {
      try {
        await routesService.deleteRoute(id);
        toast.success('Rota excluída com sucesso');
        loadRoutes();
      } catch (error) {
        toast.error('Erro ao excluir rota');
      }
    }
  };

  const getCityName = (city: City) => {
    if (city.nameTranslations && city.nameTranslations.length > 0) {
      const ptTranslation = city.nameTranslations.find(t => t.language === 'pt');
      if (ptTranslation) return ptTranslation.text;
      const enTranslation = city.nameTranslations.find(t => t.language === 'en');
      if (enTranslation) return enTranslation.text;
      return city.nameTranslations[0].text;
    }
    return city.nameTextRefId;
  };

  const getRouteName = (route: Route) => {
    if (route.nameTranslations && route.nameTranslations.length > 0) {
      const ptTranslation = route.nameTranslations.find(t => t.language === 'pt');
      if (ptTranslation) return ptTranslation.text;
      const enTranslation = route.nameTranslations.find(t => t.language === 'en');
      if (enTranslation) return enTranslation.text;
      return route.nameTranslations[0].text;
    }
    return route.nameTextRefId;
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    const labels: Record<DifficultyLevel, string> = {
      [DifficultyLevel.EASY]: 'Fácil',
      [DifficultyLevel.MODERATE]: 'Moderada',
      [DifficultyLevel.HARD]: 'Difícil',
      [DifficultyLevel.EXTREME]: 'Extrema'
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colors: Record<DifficultyLevel, string> = {
      [DifficultyLevel.EASY]: 'bg-green-500/20 text-green-400',
      [DifficultyLevel.MODERATE]: 'bg-yellow-500/20 text-yellow-400',
      [DifficultyLevel.HARD]: 'bg-orange-500/20 text-orange-400',
      [DifficultyLevel.EXTREME]: 'bg-red-500/20 text-red-400'
    };
    return colors[difficulty] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rotas</h1>
          <p className="text-gray-400">Gerencie rotas turísticas</p>
        </div>
        <Link
          to="/routes/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FiPlus />
          Nova Rota
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
              placeholder="Buscar rotas..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCityId}
            onChange={(e) => {
              setSelectedCityId(e.target.value ? Number(e.target.value) : '');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas as cidades</option>
            {cities.map(city => (
              <option key={city.cityId} value={city.cityId}>
                {getCityName(city)}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value as DifficultyLevel | '');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas as dificuldades</option>
            {Object.values(DifficultyLevel).map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {getDifficultyLabel(difficulty)}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Carregando...</div>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhuma rota encontrada
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Dificuldade</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Distância</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Cidade</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.routeId} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-white font-medium">{getRouteName(route)}</div>
                          {route.isFeatured && (
                            <FiStar className="text-yellow-400" size={16} />
                          )}
                        </div>
                        {route.descriptionTranslations && route.descriptionTranslations.length > 0 && (
                          <div className="text-sm text-gray-400 mt-1">
                            {route.descriptionTranslations.find(t => t.language === 'pt')?.text || 
                             route.descriptionTranslations[0].text}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-sm ${getDifficultyColor(route.difficultyLevel)}`}>
                          {getDifficultyLabel(route.difficultyLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          <FiMapPin size={14} />
                          <span className="text-sm">
                            {route.distance ? `${route.distance.toFixed(1)} km` : '-'}
                          </span>
                        </div>
                        {route.estimatedDuration && (
                          <div className="flex items-center gap-1 text-gray-400 mt-1">
                            <FiClock size={14} />
                            <span className="text-sm">{Math.round(route.estimatedDuration / 60)}h</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {route.city ? getCityName(route.city) : `Cidade ID: ${route.cityId}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleToggleStatus(route.routeId)}
                            className="text-gray-400 hover:text-white transition-colors text-left"
                          >
                            {route.isActive ? (
                              <FiToggleRight className="text-green-400" size={24} />
                            ) : (
                              <FiToggleLeft className="text-gray-400" size={24} />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(route.routeId)}
                            className={`text-sm ${route.isFeatured ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-300 transition-colors text-left`}
                          >
                            {route.isFeatured ? '★ Destaque' : '☆ Destacar'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/routes/${route.routeId}/edit`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(route.routeId)}
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
                  Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems} rotas
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

export default RoutesPage;
