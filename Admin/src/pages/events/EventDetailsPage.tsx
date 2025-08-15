import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiCalendar, FiClock, FiMapPin, FiMusic, FiPlay, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import eventsService, { Event, StoryEvent } from '../../services/events.service';

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
    nameTextRefId: 0,
    descriptionTextRefId: 0,
    eventDate: '',
    eventTime: '',
    cityId: 0
  });

  useEffect(() => {
    if (id) {
      loadEvent();
      loadStories();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getEvent(Number(id));
      setEvent(data);
      setEditForm({
        nameTextRefId: data.nameTextRefId || 0,
        descriptionTextRefId: data.descriptionTextRefId || 0,
        eventDate: data.eventDate || '',
        eventTime: data.eventTime || '',
        cityId: data.cityId || 0
      });
    } catch (error) {
      toast.error('Failed to load event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const data = await eventsService.getEventStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsService.deleteEvent(Number(id));
        toast.success('Event deleted successfully');
        navigate('/events');
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await eventsService.updateEvent(Number(id), {
        nameTextRefId: editForm.nameTextRefId,
        descriptionTextRefId: editForm.descriptionTextRefId || undefined,
        eventDate: editForm.eventDate,
        eventTime: editForm.eventTime,
        cityId: editForm.cityId
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
        nameTextRefId: event.nameTextRefId || 0,
        descriptionTextRefId: event.descriptionTextRefId || 0,
        eventDate: event.eventDate || '',
        eventTime: event.eventTime || '',
        cityId: event.cityId || 0
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/events" className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Event Details</h1>
        </div>
        <div className="flex gap-3">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiEdit2 /> Edit
              </button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiCheck /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiX /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Name Text Ref ID</label>
            {editMode ? (
              <input
                type="number"
                value={editForm.nameTextRefId}
                onChange={(e) => setEditForm({ ...editForm, nameTextRefId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{event.nameTextRefId}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Description Text Ref ID</label>
            {editMode ? (
              <input
                type="number"
                value={editForm.descriptionTextRefId}
                onChange={(e) => setEditForm({ ...editForm, descriptionTextRefId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{event.descriptionTextRefId || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">City ID</label>
            {editMode ? (
              <input
                type="number"
                value={editForm.cityId}
                onChange={(e) => setEditForm({ ...editForm, cityId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white flex items-center gap-2">
                <FiMapPin size={16} />
                {event.city?.state || `City ID: ${event.cityId}`}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date</label>
            {editMode ? (
              <input
                type="date"
                value={editForm.eventDate}
                onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white flex items-center gap-2">
                <FiCalendar size={16} />
                {new Date(event.eventDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Time</label>
            {editMode ? (
              <input
                type="time"
                value={editForm.eventTime}
                onChange={(e) => setEditForm({ ...editForm, eventTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white flex items-center gap-2">
                <FiClock size={16} />
                {event.eventTime}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Event Stories</h2>
          <button onClick={() => setStoryModal({ open: true, story: null })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FiPlus /> Add Story
          </button>
        </div>

        {stories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No stories added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <div key={story.storyEventId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Story ID: {story.storyEventId}</h3>
                  <button onClick={() => handleDeleteStory(story.storyEventId!)} className="text-red-600 hover:text-red-700">
                    <FiTrash2 size={16} />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <FiPlay className="inline mr-1" size={14} />
                    Plays: {story.playCount || 0}
                  </p>
                  {story.audioUrlRefId && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <FiMusic className="inline mr-1" size={14} />
                      Audio: Ref {story.audioUrlRefId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {storyModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Story</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name Text Ref ID *</label>
                <input type="number" value={storyFormData.nameTextRefId} onChange={(e) => setStoryFormData(prev => ({ ...prev, nameTextRefId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description Text Ref ID</label>
                <input type="number" value={storyFormData.descriptionTextRefId || ''} onChange={(e) => setStoryFormData(prev => ({ ...prev, descriptionTextRefId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audio URL Ref ID</label>
                <input type="number" value={storyFormData.audioUrlRefId || ''} onChange={(e) => setStoryFormData(prev => ({ ...prev, audioUrlRefId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setStoryModal({ open: false, story: null })} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
              <button onClick={handleCreateStory} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
