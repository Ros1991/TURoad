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
    name: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadCategory();
    } else if (id === 'new') {
      setEditMode(true);
      setLoading(false);
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categoryId = Number(id);
      if (isNaN(categoryId)) {
        toast.error('ID de categoria inválido');
        navigate('/categories');
        return;
      }
      const data = await categoriesService.getCategoryById(categoryId);
      setCategory(data);
      setEditForm({
        name: data.name || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar categoria');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (id === 'new') {
        // Create new category
        await categoriesService.createCategory({
          name: editForm.name
        });
        toast.success('Categoria criada com sucesso');
        navigate('/categories');
      } else {
        // Update existing category
        await categoriesService.updateCategory(Number(id), {
          name: editForm.name
        });
        toast.success('Categoria atualizada com sucesso');
        setEditMode(false);
        loadCategory();
      }
    } catch (error) {
      toast.error(id === 'new' ? 'Erro ao criar categoria' : 'Erro ao atualizar categoria');
    }
  };

  const handleCancelEdit = () => {
    if (id === 'new') {
      navigate('/categories');
    } else {
      setEditMode(false);
      if (category) {
        setEditForm({
          name: category.name || ''
        });
      }
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

  if (!category && id !== 'new') {
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
            <h1 className="text-3xl font-bold text-white mb-2">
              {id === 'new' ? 'Nova Categoria' : 'Detalhes da Categoria'}
            </h1>
            <p className="text-gray-400">
              {id === 'new' ? 'Criar nova categoria' : 'Gerenciar informações da categoria'}
            </p>
          </div>
          <div className="flex gap-3">
            {!editMode && id !== 'new' ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Editar Categoria
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Excluir Categoria
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCheck />
                  {id === 'new' ? 'Criar Categoria' : 'Salvar Alterações'}
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

      {/* Category Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {id === 'new' ? 'Informações da Nova Categoria' : 'Informações da Categoria'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-white text-sm mb-2 block">Nome da Categoria</label>
            {editMode || id === 'new' ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Digite o nome da categoria"
              />
            ) : (
              <p className="text-white">{category?.name}</p>
            )}
          </div>
          {category && (
            <>
              <div>
                <label className="text-gray-400 text-sm">Data de Criação</label>
                <p className="text-white">{new Date(category.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Última Atualização</label>
                <p className="text-white">{new Date(category.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </>
          )}
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
