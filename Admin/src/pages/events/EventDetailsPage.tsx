import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiCalendar, FiMusic, FiPlay, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import eventsService, { Event, StoryEvent } from '../../services/events.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [stories, setStories] = useState<StoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyModal, setStoryModal] = useState<{ open: boolean; story: StoryEvent | null }>({
    open: false,
    story: null
  });
  const [storyFormData, setStoryFormData] = useState<Omit<StoryEvent, 'eventId'>>({
    nameTextRefId: 1,
    descriptionTextRefId: 1,
    playCount: 0,
    audioUrlRefId: undefined
  });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    nameTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    eventDate: '',
    eventTime: '',
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
      setLoading(true);
      const data = await eventsService.getEvent(Number(id));
      setEvent(data);
      setEditForm({
        name: '',
        nameTextRefId: data.nameTextRefId || 0,
        description: '',
        descriptionTextRefId: data.descriptionTextRefId || 0,
        eventDate: data.eventDate || '',
        eventTime: data.eventTime || '',
        cityId: data.cityId || 0,
        imageUrl: data.imageUrl || ''
      });
    } catch (error) {
      toast.error('Failed to load event');
      console.error(error);
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

  const handleDeleteEvent = async () => {
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
    try {
      await eventsService.updateEvent(Number(id), {
        nameTextRefId: editForm.nameTextRefId,
        descriptionTextRefId: editForm.descriptionTextRefId || undefined,
        eventDate: editForm.eventDate,
        eventTime: editForm.eventTime,
        cityId: editForm.cityId,
        imageUrl: editForm.imageUrl || undefined
      });
      toast.success('Event updated successfully');
      setEditMode(false);
      loadEvent();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (event) {
      setEditForm({
        name: '',
        nameTextRefId: event.nameTextRefId || 0,
        description: '',
        descriptionTextRefId: event.descriptionTextRefId || 0,
        eventDate: event.eventDate || '',
        eventTime: event.eventTime || '',
        cityId: event.cityId || 0,
        imageUrl: event.imageUrl || ''
      });
    }
  };

  const handleCreateStory = async () => {
    try {
      await eventsService.createEventStory(Number(id), storyFormData);
      toast.success('Story created successfully');
      setStoryModal({ open: false, story: null });
      setStoryFormData({ nameTextRefId: 1, descriptionTextRefId: 1, playCount: 0, audioUrlRefId: undefined });
      loadStories();
    } catch (error) {
      toast.error('Failed to create story');
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (window.confirm('Delete this story?')) {
      try {
        await eventsService.deleteEventStory(Number(id), storyId);
        toast.success('Story deleted successfully');
        loadStories();
      } catch (error) {
        toast.error('Failed to delete story');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) return <div className="text-center py-12">Event not found</div>;

  return (
    <div className="container mx-auto px-4 py-6">
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
            <h1 className="text-3xl font-bold text-white mb-2">Detalhes do Evento</h1>
            <p className="text-gray-400">Gerenciar informações do evento e histórias</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiEdit2 /> Editar
                </button>
                <button onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FiTrash2 /> Excluir
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiCheck /> Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiX /> Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Informações do Evento</h2>
        {/* Nome do Evento - Coluna inteira */}
        <div className="mb-4">
          <label className="text-white text-sm mb-2 block">Nome do Evento</label>
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
              fieldName="Nome do Evento"
              placeholder="Digite o nome do evento"
              referenceId={editForm.nameTextRefId || event?.nameTextRefId || 0}
            />
          ) : (
            <p className="text-white">{event?.nameTextRefId || 'N/A'}</p>
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
              fieldName="Descrição do Evento"
              placeholder="Digite a descrição do evento"
              referenceId={editForm.descriptionTextRefId || event?.descriptionTextRefId || 0}
            />
          ) : (
            <p className="text-white">{event?.descriptionTextRefId || 'N/A'}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-white flex items-center gap-2">
                <FiCalendar className="text-gray-400" />
                {event?.eventDate || 'N/A'}
              </p>
            )}
          </div>
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
              <p className="text-white">{event?.imageUrl || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {id !== 'new' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Histórias do Evento</h2>
            <button onClick={() => setStoryModal({ open: true, story: null })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FiPlus /> Adicionar História
            </button>
          </div>

          {stories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma história adicionada ainda</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map((story) => (
                <div key={story.storyEventId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">ID da História: {story.storyEventId}</h3>
                    <button onClick={() => handleDeleteStory(story.storyEventId!)} className="text-red-600 hover:text-red-700">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <FiPlay className="inline mr-1" size={14} />
                      Reproduções: {story.playCount || 0}
                    </p>
                    {story.audioUrlRefId && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <FiMusic className="inline mr-1" size={14} />
                        Áudio: Ref {story.audioUrlRefId}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {storyModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Adicionar História</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Referência Nome *</label>
                <input type="number" value={storyFormData.nameTextRefId} onChange={(e) => setStoryFormData(prev => ({ ...prev, nameTextRefId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Referência Descrição</label>
                <input type="number" value={storyFormData.descriptionTextRefId || ''} onChange={(e) => setStoryFormData(prev => ({ ...prev, descriptionTextRefId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Referência URL Áudio</label>
                <input type="number" value={storyFormData.audioUrlRefId || ''} onChange={(e) => setStoryFormData(prev => ({ ...prev, audioUrlRefId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setStoryModal({ open: false, story: null })} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Cancelar</button>
              <button onClick={handleCreateStory} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
