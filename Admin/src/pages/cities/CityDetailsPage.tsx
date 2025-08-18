import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import citiesService, { City, StoryCity } from '../../services/cities.service';
import localizedTextsService from '../../services/localizedTexts.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';
import LocationPickerDialog from '../../components/common/LocationPickerDialog';
import StoriesCard from '../../components/common/StoriesCard';

const CityDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [stories, setStories] = useState<StoryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    nameTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    latitude: 0,
    longitude: 0,
    state: '',
    imageUrl: '',
    whatToObserve: '',
    whatToObserveTextRefId: 0
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadCity();
      loadStories();
    } else if (id === 'new') {
      setLoading(false);
      setEditMode(true);
    }
  }, [id]);

  const loadCity = async () => {
    if (!id || id === 'new') return;
    
    try {
      const data = await citiesService.getCityById(Number(id));
      setCity(data);
      setEditForm({
        name: data.name || '',
        nameTextRefId: data.nameTextRefId || 0,
        description: data.description || '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        state: data.state || '',
        imageUrl: data.imageUrl || '',
        whatToObserve: data.whatToObserve || '',
        whatToObserveTextRefId: data.whatToObserveTextRefId || 0
      });
    } catch (error) {
      toast.error('Failed to load city');
      navigate('/cities');
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    if (!id || id === 'new') {
      setStories([]);
      return;
    }
    
    try {
      const data = await citiesService.getStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
      setStories([]);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;
    
    try {
      await citiesService.deleteCity(Number(id));
      toast.success('City deleted successfully');
      navigate('/cities');
    } catch (error) {
      toast.error('Failed to delete city');
    }
  };

  const handleSaveEdit = async () => {
    console.log('=== SALVANDO CIDADE ===');
    console.log('editForm completo:', editForm);
    console.log('editForm.name:', editForm.name);
    console.log('editForm.description:', editForm.description);
    try {
      // Check if it's a new city or existing one
      if (id === 'new') {
        // Auto-create text references for fields that have text but no referenceId
        let nameRefId = editForm.nameTextRefId;
        let descRefId = editForm.descriptionTextRefId;
        let whatToObserveRefId = editForm.whatToObserveTextRefId;

        // Create name reference if needed
        if (editForm.name && editForm.name.trim() && (!nameRefId || nameRefId === 0)) {
          console.log('Auto-creating name reference for:', editForm.name);
          try {
            nameRefId = await localizedTextsService.createReference(editForm.name.trim(), []);
            console.log('Created name reference:', nameRefId);
          } catch (error) {
            console.error('Error creating name reference:', error);
          }
        }

        // Create description reference if needed
        if (editForm.description && editForm.description.trim() && (!descRefId || descRefId === 0)) {
          console.log('Auto-creating description reference for:', editForm.description);
          try {
            descRefId = await localizedTextsService.createReference(editForm.description.trim(), []);
            console.log('Created description reference:', descRefId);
          } catch (error) {
            console.error('Error creating description reference:', error);
          }
        }

        // Create whatToObserve reference if needed
        if (editForm.whatToObserve && editForm.whatToObserve.trim() && (!whatToObserveRefId || whatToObserveRefId === 0)) {
          console.log('Auto-creating whatToObserve reference for:', editForm.whatToObserve);
          try {
            whatToObserveRefId = await localizedTextsService.createReference(editForm.whatToObserve.trim(), []);
            console.log('Created whatToObserve reference:', whatToObserveRefId);
          } catch (error) {
            console.error('Error creating whatToObserve reference:', error);
          }
        }

        const payload = {
          nameTextRefId: nameRefId || 0,
          descriptionTextRefId: descRefId || 0,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          state: editForm.state,
          imageUrl: editForm.imageUrl,
          whatToObserveTextRefId: whatToObserveRefId || 0
        };
        console.log('Creating city with payload:', payload);
        
        await citiesService.createCity(payload);
        toast.success('City created successfully');
        navigate('/cities'); // Navigate to list instead of detail
      } else {
        // Update existing city
        const payload = {
          nameTextRefId: editForm.nameTextRefId,
          descriptionTextRefId: editForm.descriptionTextRefId,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          state: editForm.state,
          imageUrl: editForm.imageUrl,
          whatToObserveTextRefId: editForm.whatToObserveTextRefId
        };
        console.log('Updating city with payload:', payload);
        
        await citiesService.updateCity(Number(id), payload);
        toast.success('City updated successfully');
        setEditMode(false);
        loadCity();
      }
    } catch (error) {
      console.error('Error saving city:', error);
      toast.error(id === 'new' ? 'Failed to create city' : 'Failed to update city');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (city) {
      setEditForm({
        name: city.name || '',
        nameTextRefId: city.nameTextRefId || 0,
        description: city.description || '',
        descriptionTextRefId: city.descriptionTextRefId || 0,
        latitude: city.latitude || 0,
        longitude: city.longitude || 0,
        state: city.state || '',
        imageUrl: city.imageUrl || '',
        whatToObserve: city.whatToObserve || '',
        whatToObserveTextRefId: city.whatToObserveTextRefId || 0
      });
    }
  };

  const handleAddStory = async (storyData: { nameTextRefId: number; descriptionTextRefId: number; audioUrlRefId: number; }) => {
    if (!city) return;
    
    try {
      await citiesService.addStory(city.cityId, {
        nameTextRefId: storyData.nameTextRefId,
        descriptionTextRefId: storyData.descriptionTextRefId,
        playCount: 0,
        audioUrlRefId: storyData.audioUrlRefId
      });
      toast.success('Story added successfully');
      loadStories();
    } catch (error) {
      toast.error('Failed to add story');
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!city) return;
    
    try {
      await citiesService.deleteStory(city.cityId, storyId);
      toast.success('Story deleted successfully');
      loadStories();
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!city && id !== 'new') {
    return (
      <div className="text-center text-gray-400">
        City not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/cities"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Cidades
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Detalhes da Cidade</h1>
            <p className="text-gray-400">Gerenciar informações da cidade e histórias</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Editar Cidade
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Excluir Cidade
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCheck />
                  Salvar Alterações
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FiX />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* City Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações da Cidade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="text-white text-sm mb-2 block">Nome da Cidade</label>
            {editMode ? (
              <LocalizedTextInput
                value={editForm.name || ''}
                onChange={(value) => {
                  console.log('Name field changed to:', value);
                  setEditForm(prev => ({ ...prev, name: value }));
                }}
                onBothChange={(value, referenceId) => {
                  console.log('Name onBothChange:', value, referenceId);
                  setEditForm(prev => ({ ...prev, name: value, nameTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  console.log('Name onReferenceIdChange:', referenceId);
                  setEditForm(prev => ({ ...prev, nameTextRefId: referenceId }));
                }}
                fieldName="Nome da Cidade"
                placeholder="Digite o nome da cidade"
                referenceId={editForm.nameTextRefId || city?.nameTextRefId || 0}
              />
            ) : (
              <p className="text-white">{city?.name || 'N/A'}</p>
            )}
          </div>
          
          {/* Estado */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Estado</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Estado"
              />
            ) : (
              <p className="text-white">{city?.state || 'N/A'}</p>
            )}
          </div>
        </div>
        
        {/* Descrição - Coluna inteira */}
        <div className="mt-4">
          <label className="text-white text-sm mb-2 block">Descrição</label>
          {editMode ? (
            <LocalizedTextInput
              value={editForm.description || ''}
              onChange={(value) => setEditForm(prev => ({ ...prev, description: value }))}
              onBothChange={(value, referenceId) => {
                setEditForm(prev => ({ ...prev, description: value, descriptionTextRefId: referenceId }));
              }}
              onReferenceIdChange={(referenceId) => {
                setEditForm(prev => ({ ...prev, descriptionTextRefId: referenceId }));
              }}
              fieldName="Descrição da Cidade"
              placeholder="Digite a descrição da cidade"
              referenceId={editForm.descriptionTextRefId || city?.descriptionTextRefId || 0}
            />
          ) : (
            <p className="text-white">{city?.description || 'N/A'}</p>
          )}
        </div>
        
        {/* O que Observar - Coluna inteira */}
        <div className="mt-4">
          <label className="text-white text-sm mb-2 block">O que Observar</label>
          {editMode ? (
            <LocalizedTextInput
              value={editForm.whatToObserve || ''}
              onChange={(value) => setEditForm(prev => ({ ...prev, whatToObserve: value }))}
              onBothChange={(value, referenceId) => {
                setEditForm(prev => ({ ...prev, whatToObserve: value, whatToObserveTextRefId: referenceId }));
              }}
              onReferenceIdChange={(referenceId) => {
                setEditForm(prev => ({ ...prev, whatToObserveTextRefId: referenceId }));
              }}
              fieldName="O que Observar na Cidade"
              placeholder="Digite o que observar na cidade"
              referenceId={editForm.whatToObserveTextRefId || city?.whatToObserveTextRefId || 0}
            />
          ) : (
            <p className="text-white">{city?.whatToObserve || 'N/A'}</p>
          )}
        </div>
        {/* URL da Imagem */}
        <div className="mt-4">
          <label className="text-gray-400 text-sm block mb-2">URL da Imagem</label>
          {editMode ? (
            <input
              type="url"
              value={editForm.imageUrl}
              onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          ) : (
            <p className="text-white">{city?.imageUrl || 'N/A'}</p>
          )}
        </div>
      </div>
      
      {/* Location Card */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Localização</h2>
          {editMode && (
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              <FiMapPin size={16} />
              Selecionar no Mapa
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Latitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.latitude}
                onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Latitude"
              />
            ) : (
              <p className="text-white">{city?.latitude || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Longitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.longitude}
                onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Longitude"
              />
            ) : (
              <p className="text-white">{city?.longitude || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stories Section - Only show when viewing existing city */}
      {id !== 'new' && (
        <StoriesCard
          stories={stories.map(story => ({
            storyCityId: story.storyCityId,
            nameTextRefId: story.nameTextRefId,
            descriptionTextRefId: story.descriptionTextRefId,
            playCount: story.playCount,
            audioUrlRefId: story.audioUrlRefId,
            cityId: story.cityId
          }))}
          onAddStory={handleAddStory}
          onDeleteStory={handleDeleteStory}
          title="Histórias"
          showAddButton={true}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Excluir Cidade"
        message="Tem certeza que deseja excluir esta cidade"
        itemName={city?.name || ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Location Picker Dialog */}
      {showLocationPicker && (
        <LocationPickerDialog
          latitude={editForm.latitude || -14.235}
          longitude={editForm.longitude || -51.9253}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={(lat, lng) => {
            console.log('Recebendo coordenadas do dialog:', lat, lng);
            setEditForm(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng
            }));
            setShowLocationPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default CityDetailsPage;
