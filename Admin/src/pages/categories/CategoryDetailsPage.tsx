import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import categoriesService, { Category } from '../../services/categories.service';

const CategoryDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nameTextRefId: '',
    iconUrl: '',
    color: '',
    isActive: true
  });

  useEffect(() => {
    if (id) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getCategoryById(Number(id));
      setCategory(data);
      setEditForm({
        nameTextRefId: data.nameTextRefId || '',
        iconUrl: data.iconUrl || '',
        color: data.color || '',
        isActive: data.isActive !== false
      });
    } catch (error) {
      toast.error('Failed to load category');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await categoriesService.updateCategory(Number(id), {
        nameTextRefId: editForm.nameTextRefId,
        iconUrl: editForm.iconUrl || undefined,
        color: editForm.color || undefined,
        isActive: editForm.isActive
      });
      toast.success('Category updated successfully');
      setEditMode(false);
      loadCategory();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (category) {
      setEditForm({
        nameTextRefId: category.nameTextRefId || '',
        iconUrl: category.iconUrl || '',
        color: category.color || '',
        isActive: category.isActive !== false
      });
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesService.deleteCategory(Number(id));
      toast.success('Category deleted successfully');
      navigate('/categories');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center text-gray-400">
        Category not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/categories"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Categories
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Category Details</h1>
            <p className="text-gray-400">Manage category information</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Edit Category
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete Category
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

      {/* Category Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Category Information</h2>
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
              <p className="text-white">{category.nameTextRefId}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Icon URL</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.iconUrl}
                onChange={(e) => setEditForm({ ...editForm, iconUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Optional"
              />
            ) : (
              <p className="text-white">{category.iconUrl || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Color</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.color}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="#RRGGBB"
              />
            ) : (
              <div className="flex items-center gap-2">
                {category.color && (
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <p className="text-white">{category.color || 'N/A'}</p>
              </div>
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
                category.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailsPage;
