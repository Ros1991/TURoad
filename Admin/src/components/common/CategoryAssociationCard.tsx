import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { CategoryAssociation, categoryAssociationService } from '../../services/categoryAssociation.service';
import { Category } from '../../services/categories.service';
import ConfirmDialog from './ConfirmDialog';

interface CategoryAssociationCardProps {
  entityType: 'cities' | 'routes' | 'locations' | 'events';
  entityId: number;
  entityName: string;
  title?: string;
}

interface CategoryForm {
  categoryId: number;
}

export const CategoryAssociationCard: React.FC<CategoryAssociationCardProps> = ({
  entityType,
  entityId,
  entityName,
  title = 'Categorias'
}) => {
  const [associations, setAssociations] = useState<CategoryAssociation[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ categoryId: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteCategory, setDeleteCategory] = useState<{ id: number; name: string } | null>(null);

  // Load associated categories
  const loadAssociations = async () => {
    try {
      const data = await categoryAssociationService.getAssociatedCategories(entityType, entityId);
      setAssociations(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  // Load available categories for selection
  const loadAvailableCategories = async () => {
    try {
      const data = await categoryAssociationService.getAvailableCategories(entityType, entityId);
      setAvailableCategories(data);
    } catch (error) {
      console.error('Failed to load available categories:', error);
      toast.error('Erro ao carregar categorias disponíveis');
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadAssociations(), loadAvailableCategories()]);
      setLoading(false);
    };
    loadData();
  }, [entityType, entityId]);

  // Add category association
  const handleAddCategory = async () => {
    if (!categoryForm.categoryId) {
      toast.error('Selecione uma categoria');
      return;
    }

    try {
      await categoryAssociationService.addCategory(entityType, entityId, {
        categoryId: categoryForm.categoryId
      });
      
      toast.success('Categoria adicionada com sucesso');
      setCategoryForm({ categoryId: 0 });
      setShowModal(false);
      
      // Reload data
      await Promise.all([loadAssociations(), loadAvailableCategories()]);
    } catch (error: any) {
      console.error('Failed to add category:', error);
      toast.error(error?.response?.data?.message || 'Erro ao adicionar categoria');
    }
  };

  // Remove category association
  const handleRemoveCategory = async () => {
    if (!deleteCategory) return;

    try {
      await categoryAssociationService.removeCategory(entityType, entityId, deleteCategory.id);
      toast.success('Categoria removida com sucesso');
      
      // Reload data
      await Promise.all([loadAssociations(), loadAvailableCategories()]);
      setDeleteCategory(null);
    } catch (error: any) {
      console.error('Failed to remove category:', error);
      toast.error(error?.response?.data?.message || 'Erro ao remover categoria');
      setDeleteCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTag className="text-purple-500" />
            {title}
          </h3>
          <button
            onClick={() => setShowModal(true)}
            disabled={availableCategories.length === 0}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiPlus size={16} />
            Nova Categoria
          </button>
        </div>

        {associations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiTag size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhuma categoria associada</p>
            {availableCategories.length > 0 && (
              <p className="text-sm mt-2">Clique em "Nova Categoria" para adicionar</p>
            )}
            {availableCategories.length === 0 && (
              <p className="text-sm mt-2">Todas as categorias já estão associadas</p>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {associations.map((association) => (
              <div
                key={association.cityCategoryId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {association.category.name || `Category ${association.categoryId}`}
                    </h4>
                    {(association.category as any).description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(association.category as any).description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteCategory({ id: association.categoryId, name: association.category.name || 'Categoria' })}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Categoria
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={categoryForm.categoryId}
                    onChange={(e) => setCategoryForm({ ...categoryForm, categoryId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione uma categoria</option>
                    {availableCategories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name || `Category ${category.categoryId}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCategoryForm({ categoryId: 0 });
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!categoryForm.categoryId}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Adicionar Categoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCategory}
        title="Remover Categoria"
        message={`Deseja remover a categoria "${deleteCategory?.name}" de ${entityName}`}
        confirmText="Remover"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleRemoveCategory}
        onCancel={() => setDeleteCategory(null)}
      />
    </>
  );
};
