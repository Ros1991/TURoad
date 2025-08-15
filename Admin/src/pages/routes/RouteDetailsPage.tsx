import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiMap, FiStar, FiClock, FiPlay, FiMusic } from 'react-icons/fi';
import { toast } from 'react-toastify';
import routesService, { Route, StoryRoute } from '../../services/routes.service';

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
    nameTextRefId: '',
    descriptionTextRefId: '',
    difficultyLevel: '' as any,
    distance: 0,
    estimatedDuration: 0,
    isActive: true,
    isFeatured: false
  });
  const [storyForm, setStoryForm] = useState({
    nameTextRefId: 0,
    descriptionTextRefId: 0,
    playCount: 0,
    audioUrlRefId: 0
  });

  useEffect(() => {
    if (id) {
      loadRoute();
      loadStories();
    }
  }, [id]);

  const loadRoute = async () => {
    try {
      const data = await routesService.getRouteById(Number(id));
      setRoute(data);
      setEditForm({
        nameTextRefId: data.nameTextRefId || '',
        descriptionTextRefId: data.descriptionTextRefId || '',
        difficultyLevel: data.difficultyLevel || '',
        distance: data.distance || 0,
        estimatedDuration: data.estimatedDuration || 0,
        isActive: data.isActive !== false,
        isFeatured: data.isFeatured || false
      });
    } catch (error) {
      toast.error('Failed to load route');
      navigate('/routes');
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const data = await routesService.getStories(Number(id));
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
  };

  const handleDelete = async () => {
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
        ...route!,
        nameTextRefId: editForm.nameTextRefId,
        descriptionTextRefId: editForm.descriptionTextRefId || undefined,
        difficultyLevel: editForm.difficultyLevel,
        distance: editForm.distance || undefined,
        estimatedDuration: editForm.estimatedDuration || undefined,
        isActive: editForm.isActive,
        isFeatured: editForm.isFeatured
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
        nameTextRefId: route.nameTextRefId || '',
        descriptionTextRefId: route.descriptionTextRefId || '',
        difficultyLevel: route.difficultyLevel || '',
        distance: route.distance || 0,
        estimatedDuration: route.estimatedDuration || 0,
        isActive: route.isActive !== false,
        isFeatured: route.isFeatured || false
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

  const handleToggleFeatured = async () => {
    try {
      await routesService.toggleFeaturedStatus(Number(id));
      toast.success('Featured status updated');
      loadRoute();
    } catch (error) {
      toast.error('Failed to update featured status');
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
          Back to Routes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Route Details</h1>
            <p className="text-gray-400">Manage route information and stories</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Edit Route
                </button>
                <button
                  onClick={handleToggleFeatured}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    route.isFeatured 
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FiStar />
                  {route.isFeatured ? 'Featured' : 'Not Featured'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete Route
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

      {/* Route Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Route Information</h2>
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
              <p className="text-white">{route.nameTextRefId}</p>
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
              <p className="text-white">{route.descriptionTextRefId || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Difficulty</label>
            {editMode ? (
              <select
                value={editForm.difficultyLevel}
                onChange={(e) => setEditForm({ ...editForm, difficultyLevel: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HARD">Hard</option>
                <option value="EXTREME">Extreme</option>
              </select>
            ) : (
              <p className="text-white">{route.difficultyLevel}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Distance (km)</label>
            {editMode ? (
              <input
                type="number"
                step="0.1"
                value={editForm.distance}
                onChange={(e) => setEditForm({ ...editForm, distance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white flex items-center gap-2">
                <FiMap className="text-gray-400" />
                {route.distance ? `${route.distance} km` : 'N/A'}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Estimated Duration (min)</label>
            {editMode ? (
              <input
                type="number"
                value={editForm.estimatedDuration}
                onChange={(e) => setEditForm({ ...editForm, estimatedDuration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white flex items-center gap-2">
                <FiClock className="text-gray-400" />
                {route.estimatedDuration ? `${route.estimatedDuration} min` : 'N/A'}
              </p>
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
              <span className={`px-2 py-1 rounded-full text-xs ${
                route.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {route.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Featured</label>
            {editMode ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isFeatured}
                  onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                  className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-white">Featured</span>
              </label>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs ${
                route.isFeatured 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {route.isFeatured ? 'Featured' : 'Not Featured'}
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
                key={story.storyRouteId}
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

      {/* Delete Route Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Route</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this route? This action cannot be undone.
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

export default RouteDetailsPage;
