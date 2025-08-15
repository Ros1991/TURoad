import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiMusic, FiPlay, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import routesService, { Route, StoryRoute } from '../../services/routes.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';

const RouteDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [stories, setStories] = useState<StoryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [deleteStoryId, setDeleteStoryId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    titleTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
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
      loadRoute();
      loadStories();
    } else if (id === 'new') {
      setLoading(false);
      setEditMode(true);
    }
  }, [id]);

  const loadRoute = async () => {
    if (!id || id === 'new') return;
    
    try {
      const data = await routesService.getRouteById(Number(id));
      setRoute(data);
      setEditForm({
        title: '',
        titleTextRefId: data.titleTextRefId || 0,
        description: '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        imageUrl: data.imageUrl || ''
      });
    } catch (error) {
      toast.error('Failed to load route');
      navigate('/routes');
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
      const data = await routesService.getStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
      setStories([]);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;
    
    try {
      await routesService.deleteRoute(Number(id));
      toast.success('Route deleted successfully');
      navigate('/routes');
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await routesService.updateRoute(Number(id), {
        titleTextRefId: editForm.titleTextRefId,
        descriptionTextRefId: editForm.descriptionTextRefId || undefined,
        imageUrl: editForm.imageUrl
      });
      toast.success('Route updated successfully');
      setEditMode(false);
      loadRoute();
    } catch (error) {
      toast.error('Failed to update route');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (route) {
      setEditForm({
        title: '',
        titleTextRefId: route.titleTextRefId || 0,
        description: '',
        descriptionTextRefId: route.descriptionTextRefId || 0,
        imageUrl: route.imageUrl || ''
      });
    }
  };

  const handleAddStory = async () => {
    try {
      await routesService.addStory(Number(id), storyForm);
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
      await routesService.deleteStory(Number(id), deleteStoryId);
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

  if (!route) {
    return (
      <div className="text-center text-gray-400">
        Route not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/routes"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Rotas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Detalhes da Rota</h1>
            <p className="text-gray-400">Gerenciar informações da rota e histórias</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Editar Rota
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Excluir Rota
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

      {/* Route Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações da Rota</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome da Rota - Coluna inteira */}
          <div className="mb-4">
            <label className="text-white text-sm mb-2 block">Nome da Rota</label>
            {editMode ? (
              <LocalizedTextInput
                value={editForm.title || ''}
                onChange={(value) => setEditForm(prev => ({ ...prev, title: value }))}
                onBothChange={(value, referenceId) => {
                  setEditForm(prev => ({ ...prev, title: value, titleTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  setEditForm(prev => ({ ...prev, titleTextRefId: referenceId }));
                }}
                fieldName="Nome da Rota"
                placeholder="Digite o nome da rota"
                referenceId={editForm.titleTextRefId || route?.titleTextRefId || 0}
              />
            ) : (
              <p className="text-white">{route?.titleTextRefId || 'N/A'}</p>
            )}
          </div>
          {/* Descrição - Coluna inteira */}
          <div className="mb-4">
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
                fieldName="Descrição da Rota"
                placeholder="Digite a descrição da rota"
                referenceId={editForm.descriptionTextRefId || route?.descriptionTextRefId || 0}
              />
            ) : (
              <p className="text-white">{route?.descriptionTextRefId || 'N/A'}</p>
            )}
          </div>
          {/* URL da Imagem */}
          <div>
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
              <p className="text-white">{route?.imageUrl || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stories Section - Only show when viewing existing route */}
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
                key={story.storyRouteId}
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
                    onClick={() => setDeleteStoryId(story.storyRouteId)}
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

      {/* Delete Route Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Excluir Rota</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir esta rota? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
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
                  Name Text Ref ID
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
                Cancel
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
                Cancel
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

export default RouteDetailsPage;
