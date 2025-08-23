import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import eventsService, { Event, StoryEvent } from '../../services/events.service';
import localizedTextsService from '../../services/localizedTexts.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';
import StoriesCard from '../../components/common/StoriesCard';
import { CategoryAssociationCard } from '../../components/common/CategoryAssociationCard';
import CitySelector from '../../components/common/CitySelector';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [stories, setStories] = useState<StoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    nameTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    location: '',
    locationTextRefId: 0,
    time: '',
    timeTextRefId: 0,
    eventDate: '',
    cityId: 0,
    imageUrl: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadEvent();
      loadStories();
    } else if (id === 'new') {
      setLoading(false);
      setEditMode(true);
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id || id === 'new') return;
    
    try {
      const data = await eventsService.getEvent(Number(id));
      setEvent(data);
      setEditForm({
        name: data.name || '',
        nameTextRefId: data.nameTextRefId || 0,
        description: data.description || '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        location: data.location || '',
        locationTextRefId: data.locationTextRefId || 0,
        time: data.time || '',
        timeTextRefId: data.timeTextRefId || 0,
        eventDate: data.eventDate || '',
        cityId: data.cityId || 0,
        imageUrl: data.imageUrl || ''
      });
    } catch (error) {
      toast.error('Failed to load event');
      navigate('/events');
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
      const data = await eventsService.getEventStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
      setStories([]);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;
    
    try {
      await eventsService.deleteEvent(Number(id));
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleSaveEdit = async () => {
    console.log('=== SALVANDO EVENTO ===');
    console.log('editForm completo:', editForm);
    console.log('editForm.name:', editForm.name);
    console.log('editForm.description:', editForm.description);
    try {
      // Check if it's a new event or existing one
      if (id === 'new') {
        // Auto-create text references for fields that have text but no referenceId
        let nameRefId = editForm.nameTextRefId;
        let descRefId = editForm.descriptionTextRefId;

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

        // Create location reference if needed
        let locationRefId = editForm.locationTextRefId;
        if (editForm.location && editForm.location.trim() && (!locationRefId || locationRefId === 0)) {
          console.log('Auto-creating location reference for:', editForm.location);
          try {
            locationRefId = await localizedTextsService.createReference(editForm.location.trim(), []);
            console.log('Created location reference:', locationRefId);
          } catch (error) {
            console.error('Error creating location reference:', error);
          }
        }

        // Create time reference if needed
        let timeRefId = editForm.timeTextRefId;
        if (editForm.time && editForm.time.trim() && (!timeRefId || timeRefId === 0)) {
          console.log('Auto-creating time reference for:', editForm.time);
          try {
            timeRefId = await localizedTextsService.createReference(editForm.time.trim(), []);
            console.log('Created time reference:', timeRefId);
          } catch (error) {
            console.error('Error creating time reference:', error);
          }
        }

        const payload = {
          nameTextRefId: nameRefId || 0,
          descriptionTextRefId: descRefId || 0,
          locationTextRefId: locationRefId || 0,
          timeTextRefId: timeRefId || 0,
          eventDate: editForm.eventDate,
          cityId: editForm.cityId,
          imageUrl: editForm.imageUrl
        };
        console.log('Creating event with payload:', payload);
        
        await eventsService.createEvent(payload);
        toast.success('Event created successfully');
        navigate('/events'); // Navigate to list instead of detail
      } else {
        // Update existing event
        const payload = {
          nameTextRefId: editForm.nameTextRefId,
          descriptionTextRefId: editForm.descriptionTextRefId,
          locationTextRefId: editForm.locationTextRefId,
          timeTextRefId: editForm.timeTextRefId,
          eventDate: editForm.eventDate,
          cityId: editForm.cityId,
          imageUrl: editForm.imageUrl
        };
        console.log('Updating event with payload:', payload);
        
        await eventsService.updateEvent(Number(id), payload);
        toast.success('Event updated successfully');
        setEditMode(false);
        loadEvent();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(id === 'new' ? 'Failed to create event' : 'Failed to update event');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (event) {
      setEditForm({
        name: event.name || '',
        nameTextRefId: event.nameTextRefId || 0,
        description: event.description || '',
        descriptionTextRefId: event.descriptionTextRefId || 0,
        location: event.location || '',
        locationTextRefId: event.locationTextRefId || 0,
        time: event.time || '',
        timeTextRefId: event.timeTextRefId || 0,
        eventDate: event.eventDate || '',
        cityId: event.cityId || 0,
        imageUrl: event.imageUrl || ''
      });
    }
  };

  const handleAddStory = async (storyData: { nameTextRefId: number; descriptionTextRefId: number; audioUrlRefId: number; }) => {
    if (!event) return;
    
    try {
      await eventsService.createEventStory(event.eventId!, {
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
    if (!event) return;
    
    try {
      await eventsService.updateEventStory(event.eventId!, storyId, {
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
    if (!event) return;
    
    try {
      await eventsService.deleteEventStory(event.eventId!, storyId);
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

  if (!event && id !== 'new') {
    return (
      <div className="text-center text-gray-400">
        Event not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Eventos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {id === 'new' ? 'Novo Evento' : 'Detalhes do Evento'}
            </h1>
            <p className="text-gray-400">
              {id === 'new' ? 'Criar um novo evento' : 'Gerenciar informações do evento e histórias'}
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
                  Criar Evento
                </button>
                <button
                  onClick={() => navigate('/events')}
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
                    Editar Evento
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 />
                    Excluir Evento
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

      {/* Event Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações do Evento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="text-white text-sm mb-2 block">Nome do Evento</label>
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
                fieldName="Nome do Evento"
                placeholder="Digite o nome do evento"
                referenceId={editForm.nameTextRefId || event?.nameTextRefId || 0}
              />
            ) : (
              <p className="text-white">{event?.name || 'N/A'}</p>
            )}
          </div>
          
          {/* Cidade */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Cidade</label>
            {editMode ? (
              <CitySelector
                value={editForm.cityId || null}
                onChange={(cityId) => setEditForm({ ...editForm, cityId: cityId || 0 })}
                placeholder="Selecione uma cidade"
              />
            ) : (
              <p className="text-white">{event?.city?.name || `Cidade ${event?.cityId}` || 'N/A'}</p>
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
              fieldName="Descrição do Evento"
              placeholder="Digite a descrição do evento"
              referenceId={editForm.descriptionTextRefId || event?.descriptionTextRefId || 0}
            />
          ) : (
            <p className="text-white">{event?.description || 'N/A'}</p>
          )}
        </div>
        
        {/* Localização - Coluna inteira */}
        <div className="mt-4">
          <label className="text-white text-sm mb-2 block">Localização do Evento</label>
          {editMode ? (
            <LocalizedTextInput
              value={editForm.location || ''}
              onChange={(value) => setEditForm(prev => ({ ...prev, location: value }))}
              onBothChange={(value, referenceId) => {
                setEditForm(prev => ({ ...prev, location: value, locationTextRefId: referenceId }));
              }}
              onReferenceIdChange={(referenceId) => {
                setEditForm(prev => ({ ...prev, locationTextRefId: referenceId }));
              }}
              fieldName="Localização do Evento"
              placeholder="Digite a localização do evento"
              referenceId={editForm.locationTextRefId || event?.locationTextRefId || 0}
            />
          ) : (
            <p className="text-white">{event?.location || 'N/A'}</p>
          )}
        </div>
        
        {/* Data e Hora do Evento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Data do Evento</label>
            {editMode ? (
              <input
                type="date"
                value={editForm.eventDate}
                onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{event?.eventDate || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Hora do Evento</label>
            {editMode ? (
              <LocalizedTextInput
                value={editForm.time || ''}
                onChange={(value) => setEditForm(prev => ({ ...prev, time: value }))}
                onBothChange={(value, referenceId) => {
                  setEditForm(prev => ({ ...prev, time: value, timeTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  setEditForm(prev => ({ ...prev, timeTextRefId: referenceId }));
                }}
                fieldName="Hora do Evento"
                placeholder="Digite a hora do evento (ex: 14:30, tarde, manhã)"
                referenceId={editForm.timeTextRefId || event?.timeTextRefId || 0}
              />
            ) : (
              <p className="text-white">{event?.time || 'N/A'}</p>
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
            <p className="text-white">{event?.imageUrl || 'N/A'}</p>
          )}
        </div>
      </div>

      {/* Content sections - Only show when viewing existing event */}
      {id !== 'new' && (
        <>
          {/* Stories Section */}
          <StoriesCard
            stories={stories.map(story => ({
              storyEventId: story.storyEventId,
              nameTextRefId: story.nameTextRefId,
              descriptionTextRefId: story.descriptionTextRefId,
              playCount: story.playCount,
              audioUrlRefId: story.audioUrlRefId,
              eventId: story.eventId,
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
              entityType="events"
              entityId={Number(id)}
              entityName={event?.name || 'Evento'}
              title="Categorias"
            />
          </div>
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento"
        itemName={event?.name || ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default EventDetailsPage;
