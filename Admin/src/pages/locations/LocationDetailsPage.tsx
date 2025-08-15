import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiMusic, FiPlay, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import locationsService, { Location, StoryLocation } from '../../services/locations.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';

const LocationDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [stories, setStories] = useState<StoryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [deleteStoryId, setDeleteStoryId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    nameTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    latitude: 0,
    longitude: 0,
    typeId: undefined as number | undefined,
    imageUrl: ''
  });
  const [storyForm, setStoryForm] = useState({
    nameTextRefId: 0,
    descriptionTextRefId: 0,
    playCount: 0,
    audioUrlRefId: 0
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
        name: '',
        nameTextRefId: data.nameTextRefId || 0,
        description: '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        typeId: data.typeId,
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
      await locationsService.updateLocation(Number(id), {
        nameTextRefId: editForm.nameTextRefId,
        descriptionTextRefId: editForm.descriptionTextRefId,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        typeId: editForm.typeId,
        imageUrl: editForm.imageUrl
      });
      toast.success('Location updated successfully');
      setEditMode(false);
      loadLocation();
    } catch (error) {
      toast.error('Failed to update location');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (location) {
      setEditForm({
        name: '',
        nameTextRefId: location.nameTextRefId || 0,
        description: '',
        descriptionTextRefId: location.descriptionTextRefId || 0,
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        typeId: location.typeId,
        imageUrl: location.imageUrl || ''
      });
    }
  };

  const handleAddStory = async () => {
    try {
      await locationsService.addStory(Number(id), storyForm);
      toast.success('Story added successfully');
      setShowStoryModal(false);
      setStoryForm({
        nameTextRefId: 0,
        descriptionTextRefId: 0,
        playCount: 0,
        audioUrlRefId: 0
      });
      loadStories();
    } catch (error) {
      toast.error('Failed to add story');
    }
  };

  const handleDeleteStory = async () => {
    if (!deleteStoryId) return;
    
    try {
      await locationsService.deleteStory(Number(id), deleteStoryId);
      toast.success('Story deleted successfully');
      setDeleteStoryId(null);
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

  if (!location) {
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
          Voltar para Localizações
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Detalhes da Localização</h1>
            <p className="text-gray-400">Gerenciar informações da localização e histórias</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Editar Localização
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Excluir Localização
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

      {/* Location Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações da Localização</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="text-white text-sm mb-2 block">Nome da Localização</label>
            {editMode ? (
              <LocalizedTextInput
                value={editForm.name || ''}
                onChange={(value) => setEditForm(prev => ({ ...prev, name: value }))}
                onBothChange={(value, referenceId) => {
                  setEditForm(prev => ({ ...prev, name: value, nameTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  setEditForm(prev => ({ ...prev, nameTextRefId: referenceId }));
                }}
                fieldName="Nome da Localização"
                placeholder="Digite o nome da localização"
                referenceId={editForm.nameTextRefId || location?.nameTextRefId || 0}
              />
            ) : (
              <p className="text-white">{location?.nameTextRefId || 'N/A'}</p>
            )}
          </div>
          
          {/* Tipo de Localização */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Tipo</label>
            {editMode ? (
              <input
                type="number"
                value={editForm.typeId || ''}
                onChange={(e) => setEditForm({ ...editForm, typeId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="ID do tipo"
              />
            ) : (
              <p className="text-white">{location?.typeId || 'N/A'}</p>
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
              fieldName="Descrição da Localização"
              placeholder="Digite a descrição da localização"
              referenceId={editForm.descriptionTextRefId || location?.descriptionTextRefId || 0}
            />
          ) : (
            <p className="text-white">{location?.descriptionTextRefId || 'N/A'}</p>
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          ) : (
            <p className="text-white">{location?.imageUrl || 'N/A'}</p>
          )}
        </div>
      </div>
      
      {/* Location Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Localização</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Latitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.latitude}
                onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Longitude"
              />
            ) : (
              <p className="text-white">{location?.longitude || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">URL da Imagem</label>
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
      </div>

      {/* Stories Section - Only show when viewing existing location */}
      {id !== 'new' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Histórias ({stories.length})</h2>
            <button
              onClick={() => setShowStoryModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              Adicionar História
            </button>
          </div>

          <div className="space-y-4">
            {stories.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma história disponível</p>
            ) : (
              stories.map((story) => (
              <div
                key={story.storyLocationId}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">
                      Ref. Nome: {story.nameTextRefId}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiPlay />
                        {story.playCount} reproduções
                      </span>
                      {story.audioUrlRefId && (
                        <span className="flex items-center gap-1">
                          <FiMusic />
                          Áudio: {story.audioUrlRefId}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteStoryId(story.storyLocationId)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* Delete Location Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Excluir Localização</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir esta localização? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Adicionar História</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ID Referência Nome
                </label>
                <input
                  type="number"
                  value={storyForm.nameTextRefId}
                  onChange={(e) => setStoryForm({ ...storyForm, nameTextRefId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description Text Ref ID
                </label>
                <input
                  type="number"
                  value={storyForm.descriptionTextRefId}
                  onChange={(e) => setStoryForm({ ...storyForm, descriptionTextRefId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Audio URL Ref ID
                </label>
                <input
                  type="number"
                  value={storyForm.audioUrlRefId}
                  onChange={(e) => setStoryForm({ ...storyForm, audioUrlRefId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStoryModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStory}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Adicionar História
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Story Confirmation */}
      {deleteStoryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Excluir História</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir esta história? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteStoryId(null)}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteStory}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetailsPage;
