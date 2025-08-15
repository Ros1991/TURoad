import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiMapPin, FiGlobe, FiMusic, FiPlay, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import citiesService, { City, StoryCity } from '../../services/cities.service';

const CityDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [stories, setStories] = useState<StoryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [deleteStoryId, setDeleteStoryId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    nameTextRefId: '',
    descriptionTextRefId: '',
    latitude: 0,
    longitude: 0,
    country: '',
    state: '',
    population: 0,
    isActive: true
  });
  const [storyForm, setStoryForm] = useState({
    nameTextRefId: 0,
    descriptionTextRefId: 0,
    playCount: 0,
    audioUrlRefId: 0
  });

  useEffect(() => {
    if (id) {
      loadCity();
      loadStories();
    }
  }, [id]);

  const loadCity = async () => {
    try {
      const data = await citiesService.getCityById(Number(id));
      setCity(data);
      setEditForm({
        nameTextRefId: data.nameTextRefId || '',
        descriptionTextRefId: data.descriptionTextRefId || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        country: data.country || '',
        state: data.state || '',
        population: data.population || 0,
        isActive: data.isActive !== false
      });
    } catch (error) {
      toast.error('Failed to load city');
      navigate('/cities');
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const data = await citiesService.getStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await citiesService.deleteCity(Number(id));
      toast.success('City deleted successfully');
      navigate('/cities');
    } catch (error) {
      toast.error('Failed to delete city');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await citiesService.updateCity(Number(id), {
        ...city!,
        nameTextRefId: editForm.nameTextRefId,
        descriptionTextRefId: editForm.descriptionTextRefId,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        country: editForm.country,
        state: editForm.state,
        population: editForm.population,
        isActive: editForm.isActive
      });
      toast.success('City updated successfully');
      setEditMode(false);
      loadCity();
    } catch (error) {
      toast.error('Failed to update city');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (city) {
      setEditForm({
        nameTextRefId: city.nameTextRefId || '',
        descriptionTextRefId: city.descriptionTextRefId || '',
        latitude: city.latitude || 0,
        longitude: city.longitude || 0,
        country: city.country || '',
        state: city.state || '',
        population: city.population || 0,
        isActive: city.isActive !== false
      });
    }
  };

  const handleAddStory = async () => {
    try {
      await citiesService.addStory(Number(id), storyForm);
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
      await citiesService.deleteStory(Number(id), deleteStoryId);
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

  if (!city) {
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
          Back to Cities
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">City Details</h1>
            <p className="text-gray-400">Manage city information and stories</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Edit City
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete City
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCheck />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FiX />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* City Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">City Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Name Text Ref ID</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.nameTextRefId}
                onChange={(e) => setEditForm({ ...editForm, nameTextRefId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{city.nameTextRefId}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Description Text Ref ID</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.descriptionTextRefId}
                onChange={(e) => setEditForm({ ...editForm, descriptionTextRefId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{city.descriptionTextRefId || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Latitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.latitude}
                onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white flex items-center gap-2">
                <FiMapPin className="text-gray-400" />
                {city.latitude}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Longitude</label>
            {editMode ? (
              <input
                type="number"
                step="0.000001"
                value={editForm.longitude}
                onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{city.longitude}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Country</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white flex items-center gap-2">
                <FiGlobe className="text-gray-400" />
                {city.country}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">State</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{city.state || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Population</label>
            {editMode ? (
              <input
                type="number"
                value={editForm.population}
                onChange={(e) => setEditForm({ ...editForm, population: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{city.population?.toLocaleString() || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Status</label>
            {editMode ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-white">Active</span>
              </label>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs ${city.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {city.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Stories ({stories.length})</h2>
          <button
            onClick={() => setShowStoryModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FiPlus />
            Add Story
          </button>
        </div>

        <div className="space-y-4">
          {stories.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No stories available</p>
          ) : (
            stories.map((story) => (
              <div
                key={story.storyCityId}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">
                      Name Ref: {story.nameTextRefId}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiPlay />
                        {story.playCount} plays
                      </span>
                      {story.audioUrlRefId && (
                        <span className="flex items-center gap-1">
                          <FiMusic />
                          Audio: {story.audioUrlRefId}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteStoryId(story.storyCityId)}
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

      {/* Delete City Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete City</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this city? This action cannot be undone.
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
            <h3 className="text-xl font-semibold text-white mb-4">Add Story</h3>
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
                Add Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Story Confirmation */}
      {deleteStoryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Story</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this story?
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

export default CityDetailsPage;
