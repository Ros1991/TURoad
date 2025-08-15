import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiMapPin, FiClock, FiImage } from 'react-icons/fi';
import routesService, { DifficultyLevel } from '../../services/routes.service';
import citiesService, { City } from '../../services/cities.service';
import categoriesService, { Category } from '../../services/categories.service';
import LocalizedTextInput from '../../components/LocalizedTextInput';

const CreateRoutePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    nameTextRefId: '',
    descriptionTextRefId: '',
    cityId: '',
    categoryId: '',
    difficultyLevel: DifficultyLevel.EASY,
    distance: '',
    estimatedDuration: '',
    startLatitude: '',
    startLongitude: '',
    endLatitude: '',
    endLongitude: '',
    elevationGain: '',
    maxElevation: '',
    minElevation: '',
    pathCoordinates: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    imageUrl: ''
  });

  useEffect(() => {
    loadCities();
    loadCategories();
    if (isEditing && id) {
      loadRoute(Number(id));
    }
  }, [id, isEditing]);

  const loadCities = async () => {
    try {
      const response = await citiesService.getCities({ limit: 100, sortBy: 'nameTextRefId', sortOrder: 'ASC' });
      setCities(response.items);
    } catch (error) {
      toast.error('Erro ao carregar cidades');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories({ limit: 100, sortBy: 'name', sortOrder: 'ASC' });
      setCategories(response.items);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    }
  };

  const loadRoute = async (routeId: number) => {
    try {
      setLoading(true);
      const route = await routesService.getRouteById(routeId);
      setFormData({
        nameTextRefId: route.nameTextRefId || '',
        descriptionTextRefId: route.descriptionTextRefId || '',
        cityId: route.cityId?.toString() || '',
        categoryId: route.categoryId?.toString() || '',
        difficultyLevel: route.difficultyLevel || DifficultyLevel.EASY,
        distance: route.distance?.toString() || '',
        estimatedDuration: route.estimatedDuration?.toString() || '',
        startLatitude: route.startLatitude?.toString() || '',
        startLongitude: route.startLongitude?.toString() || '',
        endLatitude: route.endLatitude?.toString() || '',
        endLongitude: route.endLongitude?.toString() || '',
        elevationGain: route.elevationGain?.toString() || '',
        maxElevation: route.maxAltitude?.toString() || '',
        minElevation: '',
        pathCoordinates: '',
        tags: '',
        isActive: route.isActive ?? true,
        isFeatured: route.isFeatured ?? false,
        imageUrl: route.imageUrl || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar rota');
      navigate('/routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameTextRefId.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (!formData.cityId) {
      toast.error('Cidade é obrigatória');
      return;
    }

    try {
      setLoading(true);
      
      const routeData = {
        nameTextRefId: formData.nameTextRefId.trim(),
        descriptionTextRefId: formData.descriptionTextRefId.trim() || undefined,
        cityId: Number(formData.cityId),
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        difficultyLevel: formData.difficultyLevel,
        distance: formData.distance ? Number(formData.distance) : undefined,
        estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : undefined,
        startLatitude: formData.startLatitude ? Number(formData.startLatitude) : undefined,
        startLongitude: formData.startLongitude ? Number(formData.startLongitude) : undefined,
        endLatitude: formData.endLatitude ? Number(formData.endLatitude) : undefined,
        endLongitude: formData.endLongitude ? Number(formData.endLongitude) : undefined,
        elevationGain: formData.elevationGain ? Number(formData.elevationGain) : undefined,
        maxElevation: formData.maxElevation ? Number(formData.maxElevation) : undefined,
        minElevation: formData.minElevation ? Number(formData.minElevation) : undefined,
        pathCoordinates: formData.pathCoordinates.trim() || undefined,
        tags: formData.tags.trim() || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        imageUrl: formData.imageUrl.trim() || undefined
      };

      if (isEditing && id) {
        await routesService.updateRoute(Number(id), routeData);
        toast.success('Rota atualizada com sucesso');
      } else {
        await routesService.createRoute(routeData);
        toast.success('Rota criada com sucesso');
      }
      
      navigate('/routes');
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar rota' : 'Erro ao criar rota');
    } finally {
      setLoading(false);
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

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    const labels: Record<DifficultyLevel, string> = {
      [DifficultyLevel.EASY]: 'Fácil',
      [DifficultyLevel.MODERATE]: 'Moderada',
      [DifficultyLevel.HARD]: 'Difícil',
      [DifficultyLevel.EXTREME]: 'Extrema'
    };
    return labels[difficulty] || difficulty;
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate('/routes')}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Rota' : 'Nova Rota'}
          </h1>
          <p className="text-gray-400">
            {isEditing ? 'Edite as informações da rota' : 'Crie uma nova rota turística'}
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Rota *
              </label>
              <LocalizedTextInput
                value={formData.nameTextRefId}
                onChange={(value) => setFormData({ ...formData, nameTextRefId: value })}
                placeholder="Digite o nome da rota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade *
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.cityId} value={city.cityId}>
                    {getCityName(city)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiImage className="inline mr-1" />
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dificuldade
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as DifficultyLevel })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {Object.values(DifficultyLevel).map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {getDifficultyLabel(difficulty)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descriptionTextRefId}
              onChange={(e) => setFormData({ ...formData, descriptionTextRefId: e.target.value })}
              placeholder="Descrição da rota"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Route Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiMapPin className="inline mr-1" />
                Distância (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiClock className="inline mr-1" />
                Duração Estimada (minutos)
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ganho de Elevação (m)
              </label>
              <input
                type="number"
                min="0"
                value={formData.elevationGain}
                onChange={(e) => setFormData({ ...formData, elevationGain: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="100"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Coordenadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude Inicial
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.startLatitude}
                  onChange={(e) => setFormData({ ...formData, startLatitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="-23.550520"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude Inicial
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.startLongitude}
                  onChange={(e) => setFormData({ ...formData, startLongitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="-46.633309"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude Final
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.endLatitude}
                  onChange={(e) => setFormData({ ...formData, endLatitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="-23.550520"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude Final
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.endLongitude}
                  onChange={(e) => setFormData({ ...formData, endLongitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="-46.633309"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Elevação Máxima (m)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxElevation}
                onChange={(e) => setFormData({ ...formData, maxElevation: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Elevação Mínima (m)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minElevation}
                onChange={(e) => setFormData({ ...formData, minElevation: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="aventura, natureza, caminhada"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coordenadas do Percurso (JSON)
            </label>
            <textarea
              value={formData.pathCoordinates}
              onChange={(e) => setFormData({ ...formData, pathCoordinates: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder='[{"lat": -23.550520, "lng": -46.633309}, ...]'
            />
          </div>

          {/* Status Options */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">Ativo</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">Em Destaque</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/routes')}
              className="px-6 py-3 text-gray-400 border border-gray-600 rounded-lg hover:text-white hover:border-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiSave />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Rota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoutePage;
