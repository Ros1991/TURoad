import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaPlus, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userVisitedRoutesService, UserVisitedRoute } from '../../services/userVisitedRoutes.service';
import UserVisitedRouteSelector from './UserVisitedRouteSelector';

interface UserVisitedRoutesCardProps {
  userId: number;
}

const UserVisitedRoutesCard: React.FC<UserVisitedRoutesCardProps> = ({ userId }) => {
  const [visitedRoutes, setVisitedRoutes] = useState<UserVisitedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [visitedDate, setVisitedDate] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadVisitedRoutes();
  }, [userId]);

  const loadVisitedRoutes = async () => {
    try {
      setLoading(true);
      const routes = await userVisitedRoutesService.getUserVisitedRoutes(userId);
      console.log('Visited routes loaded:', routes); // Debug log
      setVisitedRoutes(routes);
    } catch (error) {
      console.error('Error loading visited routes:', error);
      toast.error('Erro ao carregar rotas visitadas');
    } finally {
      setLoading(false);
    }
  };


  const handleAddRoute = async () => {
    if (!selectedRouteId) return;

    try {
      setLoading(true);
      const visitDate = visitedDate ? new Date(visitedDate) : new Date();
      await userVisitedRoutesService.addVisitedRoute(userId, selectedRouteId, visitDate);
      toast.success('Rota adicionada às visitadas!');
      setShowAddForm(false);
      setSelectedRouteId(null);
      setVisitedDate('');
      await loadVisitedRoutes();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error adding visited route:', error);
      toast.error('Erro ao adicionar rota às visitadas');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRoute = async (routeId: number) => {
    try {
      setLoading(true);
      await userVisitedRoutesService.removeVisitedRoute(userId, routeId);
      toast.success('Rota removida das visitadas');
      await loadVisitedRoutes();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error removing visited route:', error);
      toast.error('Erro ao remover rota das visitadas');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaMapMarkedAlt className="text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rotas Visitadas</h3>
        </div>
        <button
          onClick={handleShowAddForm}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 disabled:opacity-50"
        >
          <FaPlus size={12} />
          Adicionar
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-col gap-3">
            <UserVisitedRouteSelector
              userId={userId}
              value={selectedRouteId}
              onChange={setSelectedRouteId}
              placeholder="Selecione uma rota"
              refreshTrigger={refreshTrigger}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data e hora da visita
              </label>
              <input
                type="datetime-local"
                value={visitedDate}
                onChange={(e) => setVisitedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddRoute}
                disabled={loading || !selectedRouteId}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedRouteId(null);
                  setVisitedDate('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !showAddForm ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visitedRoutes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma rota visitada encontrada</p>
          ) : (
            visitedRoutes.map((visitedRoute) => (
              <div
                key={visitedRoute.userVisitedRouteId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{visitedRoute.route.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <FaCalendarAlt />
                    <span>Visitada em {formatDate(visitedRoute.visitedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveRoute(visitedRoute.routeId)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                  title="Remover da lista de visitadas"
                >
                  <FaTimes />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserVisitedRoutesCard;
