import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import locationsService, { Location, StoryLocation } from '../../services/locations.service';
import localizedTextsService from '../../services/localizedTexts.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';
import StoriesCard from '../../components/common/StoriesCard';
import { CategoryAssociationCard } from '../../components/common/CategoryAssociationCard';
import CitySelector from '../../components/common/CitySelector';

const LocationDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [stories, setStories] = useState<StoryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    nameTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    latitude: 0,
    longitude: 0,
    cityId: 0,
    typeId: 0,
    imageUrl: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadLocation();
      loadStories();
    } else if (id === 'new') {
      setLoading(false);
      setEditMode(true);
    }
  }, [id]);

  const loadLocation = async () => {
    if (!id || id === 'new') return;
    
    try {
      const data = await locationsService.getLocationById(Number(id));
      setLocation(data);
      setEditForm({
        name: data.name || '',
        nameTextRefId: data.nameTextRefId || 0,
        description: data.description || '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        cityId: data.cityId || 0,
        typeId: data.typeId || 0,
        imageUrl: data.imageUrl || ''
      });
    } catch (error) {
      toast.error('Failed to load location');
      navigate('/locations');
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
      const data = await locationsService.getStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
      setStories([]);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;
    
    try {
      await locationsService.deleteLocation(Number(id));
      toast.success('Location deleted successfully');
      navigate('/locations');
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (id === 'new') {
        let nameRefId = editForm.nameTextRefId;
        let descRefId = editForm.descriptionTextRefId;

        if (editForm.name && editForm.name.trim() && (!nameRefId || nameRefId === 0)) {
          try {
            nameRefId = await localizedTextsService.createReference(editForm.name.trim(), []);
          } catch (error) {
            console.error('Error creating name reference:', error);
          }
        }

        if (editForm.description && editForm.description.trim() && (!descRefId || descRefId === 0)) {
          try {
            descRefId = await localizedTextsService.createReference(editForm.description.trim(), []);
          } catch (error) {
            console.error('Error creating description reference:', error);
          }
        }

        const payload = {
          nameTextRefId: nameRefId || 0,
          descriptionTextRefId: descRefId || 0,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          cityId: editForm.cityId,
          typeId: editForm.typeId || undefined,
          imageUrl: editForm.imageUrl
        };
        
        await locationsService.createLocation(payload);
        toast.success('Location created successfully');
        navigate('/locations');
      } else {
        const payload = {
          nameTextRefId: editForm.nameTextRefId,
          descriptionTextRefId: editForm.descriptionTextRefId,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          cityId: editForm.cityId,
          typeId: editForm.typeId || undefined,
          imageUrl: editForm.imageUrl
        };
        
        await locationsService.updateLocation(Number(id), payload);
        toast.success('Location updated successfully');
        setEditMode(false);
        loadLocation();
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(id === 'new' ? 'Failed to create location' : 'Failed to update location');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (location) {
      setEditForm({
        name: location.name || '',
        nameTextRefId: location.nameTextRefId || 0,
        description: location.description || '',
        descriptionTextRefId: location.descriptionTextRefId || 0,
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        cityId: location.cityId || 0,
        typeId: location.typeId || 0,
        imageUrl: location.imageUrl || ''
      });
    }
  };

  const handleAddStory = async (storyData: { nameTextRefId: number; descriptionTextRefId: number; audioUrlRefId: number }) => {
    if (!location) return;
    
    try {
      await locationsService.addStory(location.locationId, {
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

  const handleEditStory = async (storyId: number, storyData: { name: string; nameTextRefId: number; description: string; descriptionTextRefId: number; audioUrl: string; audioUrlRefId: number }) => {
    if (!location) return;
    
    try {
      await locationsService.updateStory(location.locationId, storyId, {
        name: storyData.name,
        nameTextRefId: storyData.nameTextRefId,
        description: storyData.description,
        descriptionTextRefId: storyData.descriptionTextRefId,
        audioUrl: storyData.audioUrl,
        audioUrlRefId: storyData.audioUrlRefId,
        playCount: 0
      });
      toast.success('Story updated successfully');
      loadStories();
    } catch (error) {
      toast.error('Failed to update story');
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!location) return;
    
    try {
      await locationsService.deleteStory(location.locationId, storyId);
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

  if (!location && id !== 'new') {
    return (
      <div className="text-center text-gray-400">
        Location not found
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {id === 'new' ? 'Novo Local' : 'Detalhes do Local'}
            </h1>
            <p className="text-gray-400">
              {id === 'new' ? 'Criar um novo local' : 'Gerenciar informações do local e histórias'}
            </p>
          </div>
          <div className="flex gap-3">
            {id === 'new' ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCheck />
                  Criar Local
                </button>
                <button
                  onClick={() => navigate('/locations')}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FiX />
                  Cancelar
                </button>
              </>
            ) : (
              !editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 />
                    Editar Local
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 />
                    Excluir Local
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
              )
            )}
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações do Local</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="text-white text-sm mb-2 block">Nome do Local</label>
            {editMode ? (
              <LocalizedTextInput
                value={editForm.name || ''}
                onChange={(value) => {
                  setEditForm(prev => ({ ...prev, name: value }));
                }}
                onBothChange={(value, referenceId) => {
                  setEditForm(prev => ({ ...prev, name: value, nameTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  setEditForm(prev => ({ ...prev, nameTextRefId: referenceId }));
                }}
                fieldName="Nome do Local"
                placeholder="Digite o nome do local"
                referenceId={editForm.nameTextRefId || location?.nameTextRefId || 0}
              />
            ) : (
              <p className="text-white">{location?.name || 'N/A'}</p>
            )}
          </div>
          
          {/* Cidade */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Cidade</label>
            {editMode ? (
              <CitySelector
                value={editForm.cityId}
                onChange={(cityId) => setEditForm({ ...editForm, cityId })}
                placeholder="Selecione uma cidade"
              />
            ) : (
              <p className="text-white">Cidade ID: {location?.cityId || 'N/A'}</p>
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
              fieldName="Descrição do Local"
              placeholder="Digite a descrição do local"
              referenceId={editForm.descriptionTextRefId || location?.descriptionTextRefId || 0}
            />
          ) : (
            <p className="text-white">{location?.description || 'N/A'}</p>
          )}
        </div>
        
        {/* Coordenadas */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Latitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.latitude}
                onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Latitude"
              />
            ) : (
              <p className="text-white">{location?.latitude || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Longitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.longitude}
                onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Longitude"
              />
            ) : (
              <p className="text-white">{location?.longitude || 'N/A'}</p>
            )}
          </div>
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
            <p className="text-white">{location?.imageUrl || 'N/A'}</p>
          )}
        </div>
      </div>

      {/* Content sections - Only show when viewing existing location */}
      {id !== 'new' && (
        <>
          {/* Stories Section */}
          <StoriesCard
            stories={stories.map(story => ({
              storyLocationId: story.storyLocationId,
              nameTextRefId: story.nameTextRefId,
              descriptionTextRefId: story.descriptionTextRefId,
              playCount: story.playCount,
              audioUrlRefId: story.audioUrlRefId,
              locationId: story.locationId,
              name: (story as any).name || '',
              description: (story as any).description || '',
              audioUrl: (story as any).audioUrl || ''
            }))}
            onAddStory={handleAddStory}
            onEditStory={handleEditStory}
            onDeleteStory={handleDeleteStory}
            title="Histórias"
            showAddButton={true}
          />

          {/* Categories Section */}
          <div className="mt-6">
            <CategoryAssociationCard
              entityType="locations"
              entityId={Number(id)}
              entityName={location?.name || 'Local'}
              title="Categorias"
            />
          </div>
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Excluir Local"
        message="Tem certeza que deseja excluir este local"
        itemName={location?.name || ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default LocationDetailsPage;
