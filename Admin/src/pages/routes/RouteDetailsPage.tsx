import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import routesService, { Route, StoryRoute } from '../../services/routes.service';
import localizedTextsService from '../../services/localizedTexts.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';
import LocationPickerDialog from '../../components/common/LocationPickerDialog';
import StoriesCard from '../../components/common/StoriesCard';
import { CategoryAssociationCard } from '../../components/common/CategoryAssociationCard';

const RouteDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [stories, setStories] = useState<StoryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    titleTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    whatToObserve: '',
    whatToObserveTextRefId: 0,
    imageUrl: ''
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
        title: data.title || '',
        titleTextRefId: data.titleTextRefId || 0,
        description: data.description || '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        whatToObserve: data.whatToObserve || '',
        whatToObserveTextRefId: data.whatToObserveTextRefId || 0,
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
    console.log('=== SALVANDO ROTA ===');
    console.log('editForm completo:', editForm);
    console.log('editForm.title:', editForm.title);
    console.log('editForm.description:', editForm.description);
    try {
      // Check if it's a new route or existing one
      if (id === 'new') {
        // Auto-create text references for fields that have text but no referenceId
        let titleRefId = editForm.titleTextRefId;
        let descRefId = editForm.descriptionTextRefId;
        let whatToObserveRefId = editForm.whatToObserveTextRefId;

        // Create title reference if needed
        if (editForm.title && editForm.title.trim() && (!titleRefId || titleRefId === 0)) {
          console.log('Auto-creating title reference for:', editForm.title);
          try {
            titleRefId = await localizedTextsService.createReference(editForm.title.trim(), []);
            console.log('Created title reference:', titleRefId);
          } catch (error) {
            console.error('Error creating title reference:', error);
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
          titleTextRefId: titleRefId || 0,
          descriptionTextRefId: descRefId || 0,
          whatToObserveTextRefId: whatToObserveRefId || 0,
          imageUrl: editForm.imageUrl
        };
        console.log('Creating route with payload:', payload);
        
        await routesService.createRoute(payload);
        toast.success('Route created successfully');
        navigate('/routes'); // Navigate to list instead of detail
      } else {
        // Update existing route
        const payload = {
          titleTextRefId: editForm.titleTextRefId,
          descriptionTextRefId: editForm.descriptionTextRefId,
          whatToObserveTextRefId: editForm.whatToObserveTextRefId,
          imageUrl: editForm.imageUrl
        };
        console.log('Updating route with payload:', payload);
        
        await routesService.updateRoute(Number(id), payload);
        toast.success('Route updated successfully');
        setEditMode(false);
        loadRoute();
      }
    } catch (error) {
      console.error('Error saving route:', error);
      toast.error(id === 'new' ? 'Failed to create route' : 'Failed to update route');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (route) {
      setEditForm({
        title: route.title || '',
        titleTextRefId: route.titleTextRefId || 0,
        description: route.description || '',
        descriptionTextRefId: route.descriptionTextRefId || 0,
        whatToObserve: route.whatToObserve || '',
        whatToObserveTextRefId: route.whatToObserveTextRefId || 0,
        imageUrl: route.imageUrl || ''
      });
    }
  };

  const handleAddStory = async (storyData: { nameTextRefId: number; descriptionTextRefId: number; audioUrlRefId: number; }) => {
    if (!route) return;
    
    try {
      await routesService.addStory(route.routeId, {
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

  const handleEditStory = async (storyId: number, storyData: { name: string; nameTextRefId: number; description: string; descriptionTextRefId: number; audioUrl: string; audioUrlRefId: number; }) => {
    if (!route) return;
    
    try {
      await routesService.updateStory(route.routeId, storyId, {
        nameTextRefId: storyData.nameTextRefId,
        descriptionTextRefId: storyData.descriptionTextRefId,
        playCount: 0,
        audioUrlRefId: storyData.audioUrlRefId
      });
      toast.success('Story updated successfully');
      loadStories();
    } catch (error) {
      toast.error('Failed to update story');
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!route) return;
    
    try {
      await routesService.deleteStory(route.routeId, storyId);
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

  if (!route && id !== 'new') {
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
            <h1 className="text-3xl font-bold text-white mb-2">
              {id === 'new' ? 'Nova Rota' : 'Detalhes da Rota'}
            </h1>
            <p className="text-gray-400">
              {id === 'new' ? 'Criar uma nova rota' : 'Gerenciar informações da rota e histórias'}
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
                  Criar Rota
                </button>
                <button
                  onClick={() => navigate('/routes')}
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
              )
            )}
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações da Rota</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Título */}
          <div>
            <label className="text-white text-sm mb-2 block">Título da Rota</label>
            {editMode ? (
              <LocalizedTextInput
                value={editForm.title || ''}
                onChange={(value) => {
                  console.log('Title field changed to:', value);
                  setEditForm(prev => ({ ...prev, title: value }));
                }}
                onBothChange={(value, referenceId) => {
                  console.log('Title onBothChange:', value, referenceId);
                  setEditForm(prev => ({ ...prev, title: value, titleTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  console.log('Title onReferenceIdChange:', referenceId);
                  setEditForm(prev => ({ ...prev, titleTextRefId: referenceId }));
                }}
                fieldName="Título da Rota"
                placeholder="Digite o título da rota"
                referenceId={editForm.titleTextRefId || route?.titleTextRefId || 0}
              />
            ) : (
              <p className="text-white">{route?.title || 'N/A'}</p>
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
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            ) : (
              <p className="text-white">{route?.imageUrl || 'N/A'}</p>
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
              fieldName="Descrição da Rota"
              placeholder="Digite a descrição da rota"
              referenceId={editForm.descriptionTextRefId || route?.descriptionTextRefId || 0}
            />
          ) : (
            <p className="text-white">{route?.description || 'N/A'}</p>
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
              fieldName="O que Observar na Rota"
              placeholder="Digite o que observar na rota"
              referenceId={editForm.whatToObserveTextRefId || route?.whatToObserveTextRefId || 0}
            />
          ) : (
            <p className="text-white">{route?.whatToObserve || 'N/A'}</p>
          )}
        </div>
      </div>

      {/* Content sections - Only show when viewing existing route */}
      {id !== 'new' && (
        <>
          {/* Stories Section */}
          <StoriesCard
            stories={stories.map(story => ({
              storyRouteId: story.storyRouteId,
              nameTextRefId: story.nameTextRefId,
              descriptionTextRefId: story.descriptionTextRefId,
              playCount: story.playCount,
              audioUrlRefId: story.audioUrlRefId,
              routeId: story.routeId,
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
              entityType="routes"
              entityId={Number(id)}
              entityName={route?.title || 'Rota'}
              title="Categorias"
            />
          </div>
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Excluir Rota"
        message="Tem certeza que deseja excluir esta rota"
        itemName={route?.title || ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default RouteDetailsPage;
