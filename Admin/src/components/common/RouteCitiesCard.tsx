import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AvailableCitySelector from './AvailableCitySelector';

interface RouteCity {
  routeCityId: number;
  routeId: number;
  cityId: number;
  order: number;
  city?: {
    cityId: number;
    name: string;
  };
}

interface RouteCitiesCardProps {
  routeId: number;
  cities: RouteCity[];
  onAddCity: (cityId: number) => Promise<void>;
  onRemoveCity: (routeCityId: number) => Promise<void>;
  onReorderCities: (cities: RouteCity[]) => Promise<void>;
  title?: string;
}

const RouteCitiesCard: React.FC<RouteCitiesCardProps> = ({
  routeId,
  cities,
  onAddCity,
  onRemoveCity,
  onReorderCities,
  title = "Cidades da Rota"
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddCity = async () => {
    if (!selectedCityId) {
      toast.error('Selecione uma cidade');
      return;
    }

    // Check if city is already added
    if (cities.some(city => city.cityId === selectedCityId)) {
      toast.error('Esta cidade já foi adicionada à rota');
      return;
    }

    try {
      setLoading(true);
      await onAddCity(selectedCityId);
      setSelectedCityId(null);
      setShowAddForm(false);
      toast.success('Cidade adicionada à rota');
    } catch (error) {
      toast.error('Erro ao adicionar cidade');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCity = async (storyCityId: number) => {
    try {
      await onRemoveCity(storyCityId);
      toast.success('Cidade removida da rota');
    } catch (error) {
      toast.error('Erro ao remover cidade');
    }
  };

  const moveCity = async (index: number, direction: 'up' | 'down') => {
    const newCities = [...cities];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCities.length) return;

    // Swap cities
    [newCities[index], newCities[targetIndex]] = [newCities[targetIndex], newCities[index]];

    try {
      await onReorderCities(newCities);
      toast.success('Ordem das cidades atualizada');
    } catch (error) {
      toast.error('Erro ao reordenar cidades');
    }
  };

  const getCityName = (city: RouteCity): string => {
    return city.city?.name || `Cidade ${city.cityId}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FiMapPin className="text-blue-400" />
          {title}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FiPlus size={16} />
          Adicionar Cidade
        </button>
      </div>

      {/* Add City Form */}
      {showAddForm && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
          <h3 className="text-white font-medium mb-3">Adicionar Nova Cidade</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <AvailableCitySelector
              routeId={routeId}
              value={selectedCityId}
              onChange={setSelectedCityId}
              placeholder="Selecione uma cidade"
              className="flex-1"
            />
            <div className="flex gap-2 sm:flex-shrink-0">
              <button
                onClick={handleAddCity}
                disabled={loading || !selectedCityId}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedCityId(null);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cities List */}
      {cities.length === 0 ? (
        <div className="text-center py-8">
          <FiMapPin size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma cidade adicionada à rota</p>
          <p className="text-gray-500 text-sm mt-2">
            Adicione cidades para definir o percurso da rota
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cities.map((city, index) => (
            <div
              key={city.routeCityId}
              className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-400"># {city.order}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{getCityName(city)}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCity(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover para cima"
                    >
                      <FiChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveCity(index, 'down')}
                      disabled={index === cities.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover para baixo"
                    >
                      <FiChevronDown size={16} />
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveCity(city.routeCityId)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remover cidade"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            <strong>Dica:</strong> A ordem das cidades define o percurso da rota. 
            Use as setas para reordenar conforme necessário.
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteCitiesCard;
