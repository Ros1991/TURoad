import React, { useState, useEffect } from 'react';
import { FaRoute, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userFavoriteRoutesService, UserFavoriteRoute } from '../../services/userFavoriteRoutes.service';
import UserFavoriteRouteSelector from './UserFavoriteRouteSelector';

interface UserFavoriteRoutesCardProps {
  userId: number;
}

const UserFavoriteRoutesCard: React.FC<UserFavoriteRoutesCardProps> = ({ userId }) => {
  const [favoriteRoutes, setFavoriteRoutes] = useState<UserFavoriteRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadFavoriteRoutes();
  }, [userId]);

  const loadFavoriteRoutes = async () => {
    try {
      setLoading(true);
      const routes = await userFavoriteRoutesService.getUserFavoriteRoutes(userId);
      console.log('Favorite routes loaded:', routes); // Debug log
      setFavoriteRoutes(routes);
    } catch (error) {
      console.error('Error loading favorite routes:', error);
      toast.error('Erro ao carregar rotas favoritas');
    } finally {
      setLoading(false);
    }
  };


  const handleAddRoute = async () => {
    if (!selectedRouteId) return;

    try {
      setLoading(true);
      await userFavoriteRoutesService.addFavoriteRoute(userId, selectedRouteId);
      toast.success('Rota adicionada aos favoritos!');
      setShowAddForm(false);
      setSelectedRouteId(null);
      await loadFavoriteRoutes();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error adding favorite route:', error);
      toast.error('Erro ao adicionar rota aos favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRoute = async (routeId: number) => {
    try {
      setLoading(true);
      await userFavoriteRoutesService.removeFavoriteRoute(userId, routeId);
      toast.success('Rota removida dos favoritos');
      await loadFavoriteRoutes();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error removing favorite route:', error);
      toast.error('Erro ao remover rota dos favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaRoute className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rotas Favoritas</h3>
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
            <UserFavoriteRouteSelector
              userId={userId}
              value={selectedRouteId}
              onChange={setSelectedRouteId}
              placeholder="Selecione uma rota"
              refreshTrigger={refreshTrigger}
            />

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
          {favoriteRoutes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma rota favorita encontrada</p>
          ) : (
            favoriteRoutes.map((favoriteRoute) => (
              <div
                key={favoriteRoute.userFavoriteRouteId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{favoriteRoute.route.name}</h4>
                </div>
                <button
                  onClick={() => handleRemoveRoute(favoriteRoute.routeId)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                  title="Remover dos favoritos"
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

export default UserFavoriteRoutesCard;
