import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiMapPin, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import locationsService, { LocationType, CreateLocationDto, UpdateLocationDto } from '../../services/locations.service';
import citiesService, { City } from '../../services/cities.service';
import LocalizedTextInput from '../../components/LocalizedTextInput';

const CreateLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState<CreateLocationDto>({
    nameTextRefId: '',
    descriptionTextRefId: '',
    addressTextRefId: '',
    locationType: LocationType.OTHER,
    latitude: 0,
    longitude: 0,
    altitude: undefined,
    phoneNumber: '',
    email: '',
    website: '',
    openingHours: '',
    priceRange: '',
    amenities: [],
    isAccessible: false,
    isPetFriendly: false,
    hasParking: false,
    hasWifi: false,
    isActive: true,
    imageUrl: ''
  });
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');

  useEffect(() => {
    loadCities();
    if (isEditMode) {
      loadLocation();
    }
  }, [id]);

  const loadCities = async () => {
    try {
      const response = await citiesService.getCities({ limit: 100, sortBy: 'nameTextRefId', sortOrder: 'ASC' });
      setCities(response.items);
    } catch (error) {
      toast.error('Erro ao carregar cidades');
    } finally {
      setLoadingCities(false);
    }
  };

  const loadLocation = async () => {
    try {
      setLoading(true);
      const location = await locationsService.getLocationById(Number(id));
      setFormData({
        nameTextRefId: location.nameTextRefId,
        descriptionTextRefId: location.descriptionTextRefId || '',
        addressTextRefId: location.addressTextRefId || '',
        locationType: location.locationType,
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
        phoneNumber: location.phoneNumber || '',
        email: location.email || '',
        website: location.website || '',
        openingHours: location.openingHours || '',
        priceRange: location.priceRange || '',
        amenities: location.amenities || [],
        isAccessible: location.isAccessible || false,
        isPetFriendly: location.isPetFriendly || false,
        hasParking: location.hasParking || false,
        hasWifi: location.hasWifi || false,
        isActive: location.isActive,
        imageUrl: location.imageUrl || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar local');
      navigate('/locations');
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

    if (formData.latitude === 0 && formData.longitude === 0) {
      toast.error('Coordenadas são obrigatórias');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await locationsService.updateLocation(Number(id), formData as UpdateLocationDto);
        toast.success('Local atualizado com sucesso');
      } else {
        await locationsService.createLocation(formData);
        toast.success('Local criado com sucesso');
      }
      navigate('/locations');
    } catch (error) {
      toast.error(isEditMode ? 'Erro ao atualizar local' : 'Erro ao criar local');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateLocationDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/locations"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Locais
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEditMode ? 'Editar Local' : 'Criar Novo Local'}
        </h1>
        <p className="text-gray-400">
          {isEditMode ? 'Atualize as informações do local' : 'Adicione um novo ponto de interesse'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocalizedTextInput
              label="Nome"
              value={formData.nameTextRefId}
              onChange={(value) => handleInputChange('nameTextRefId', value)}
              placeholder="Digite o nome do local"
            />

            <LocalizedTextInput
              label="Descrição"
              value={formData.descriptionTextRefId || ''}
              onChange={(value) => handleInputChange('descriptionTextRefId', value)}
              placeholder="Digite a descrição do local"
            />

            <LocalizedTextInput
              label="Endereço"
              value={formData.addressTextRefId || ''}
              onChange={(value) => handleInputChange('addressTextRefId', value)}
              placeholder="Digite o endereço do local"
            />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tipo de Local
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => handleInputChange('locationType', e.target.value as LocationType)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {Object.values(LocationType).map(type => (
                  <option key={type} value={type}>{getLocationTypeLabel(type)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <FiImage className="inline mr-1" />
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Cidade Associada
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                disabled={loadingCities}
              >
                <option value="">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.cityId} value={city.cityId}>
                    {getCityName(city)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Localização</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <FiMapPin className="inline mr-1" />
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <FiMapPin className="inline mr-1" />
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Altitude (opcional)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.altitude || ''}
                onChange={(e) => handleInputChange('altitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Informações de Contato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={formData.phoneNumber || ''}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://www.exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={formData.openingHours || ''}
                onChange={(e) => handleInputChange('openingHours', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Seg-Sex: 9h-18h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Faixa de Preço
              </label>
              <input
                type="text"
                value={formData.priceRange || ''}
                onChange={(e) => handleInputChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="$$ - $$$"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Facilidades</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAccessible || false}
                onChange={(e) => handleInputChange('isAccessible', e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white">Acessível</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPetFriendly || false}
                onChange={(e) => handleInputChange('isPetFriendly', e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white">Pet Friendly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasParking || false}
                onChange={(e) => handleInputChange('hasParking', e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white">Estacionamento</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasWifi || false}
                onChange={(e) => handleInputChange('hasWifi', e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white">Wi-Fi</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white">Ativo</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/locations"
            className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave />
            {loading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Local')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLocationPage;
