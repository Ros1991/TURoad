import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userFavoriteCitiesService, UserFavoriteCity } from '../../services/userFavoriteCities.service';
import UserFavoriteCitySelector from './UserFavoriteCitySelector';

interface UserFavoriteCitiesCardProps {
  userId: number;
}

const UserFavoriteCitiesCard: React.FC<UserFavoriteCitiesCardProps> = ({ userId }) => {
  const [favoriteCities, setFavoriteCities] = useState<UserFavoriteCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadFavoriteCities();
  }, [userId]);

  const loadFavoriteCities = async () => {
    try {
      setLoading(true);
      const cities = await userFavoriteCitiesService.getUserFavoriteCities(userId);
      console.log('Favorite cities loaded:', cities); // Debug log
      setFavoriteCities(cities);
    } catch (error) {
      console.error('Error loading favorite cities:', error);
      toast.error('Erro ao carregar cidades favoritas');
    } finally {
      setLoading(false);
    }
  };


  const handleAddCity = async () => {
    if (!selectedCityId) return;

    try {
      setLoading(true);
      await userFavoriteCitiesService.addFavoriteCity(userId, selectedCityId);
      toast.success('Cidade adicionada aos favoritos!');
      setShowAddForm(false);
      setSelectedCityId(null);
      await loadFavoriteCities();
      setRefreshTrigger(prev => prev + 1); // Trigger refresh of available cities
    } catch (error) {
      console.error('Error adding favorite city:', error);
      toast.error('Erro ao adicionar cidade aos favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCity = async (cityId: number) => {
    try {
      setLoading(true);
      await userFavoriteCitiesService.removeFavoriteCity(userId, cityId);
      toast.success('Cidade removida dos favoritos');
      await loadFavoriteCities();
      setRefreshTrigger(prev => prev + 1); // Trigger refresh of available cities
    } catch (error) {
      console.error('Error removing favorite city:', error);
      toast.error('Erro ao remover cidade dos favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" style={{ overflow: 'visible' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cidades Favoritas</h3>
        </div>
        <button
          onClick={handleShowAddForm}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 flex items-center gap-1"
        >
          <FaPlus size={12} />
          Adicionar
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" style={{ position: 'relative', zIndex: 1000, overflow: 'visible' }}>
          <div className="flex flex-col gap-3">
            <div style={{ position: 'relative', zIndex: 1001 }}>
              <UserFavoriteCitySelector
                userId={userId}
                value={selectedCityId}
                onChange={setSelectedCityId}
                placeholder="Selecione uma cidade"
                refreshTrigger={refreshTrigger}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddCity}
                disabled={loading || !selectedCityId}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedCityId(null);
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
          {favoriteCities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma cidade favorita encontrada</p>
          ) : (
            favoriteCities.map((favoriteCity) => (
              <div
                key={favoriteCity.userFavoriteCityId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{favoriteCity.city.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{favoriteCity.city.state}, Brasil</p>
                </div>
                <button
                  onClick={() => handleRemoveCity(favoriteCity.cityId)}
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

export default UserFavoriteCitiesCard;
