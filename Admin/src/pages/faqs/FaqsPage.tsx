import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiHelpCircle, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import faqsService, { FAQ } from '../../services/faqs.service';
import { PaginatedRequest } from '../../services/api';

interface FAQFilters extends PaginatedRequest {
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const FaqsPage: React.FC = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<FAQFilters>({
    search: '',
    sortBy: 'questionTextRefId',
    sortOrder: 'ASC'
  });
  const [sortConfig, setSortConfig] = useState({ field: 'questionTextRefId', direction: 'asc' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; faq: FAQ | null }>({
    open: false,
    faq: null
  });
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSort = (field: string) => {
    const newDirection = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction: newDirection });
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newDirection.toUpperCase() as 'ASC' | 'DESC',
      page: 1
    }));
  };

  const loadFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await faqsService.getFAQs(filters);
      setFaqs(response.items);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Erro ao carregar FAQs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const handleSearch = (value: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }, 300);
    setSearchDebounce(timeout);
  };

  const handleToggleStatus = async (faq: FAQ) => {
    try {
      await faqsService.toggleFAQStatus(faq.faqId);
      toast.success('Status do FAQ alterado com sucesso');
      loadFaqs();
    } catch (error) {
      toast.error('Falha ao alterar status do FAQ');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.faq) return;
    
    try {
      await faqsService.deleteFAQ(deleteModal.faq.faqId);
      toast.success('FAQ excluído com sucesso');
      setDeleteModal({ open: false, faq: null });
      loadFaqs();
    } catch (error) {
      toast.error('Falha ao excluir FAQ');
      console.error(error);
    }
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getFAQQuestion = (faq: FAQ) => {
    if (faq.questionTranslations && faq.questionTranslations.length > 0) {
      const ptTranslation = faq.questionTranslations.find(t => t.language === 'pt');
      return ptTranslation?.text || faq.questionTranslations[0].text || 'Sem pergunta';
    }
    return faq.question || 'Sem pergunta';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">FAQs</h1>
        <p className="text-gray-400">Gerencie perguntas frequentes</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar FAQs..."
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          </div>
        </div>

        <Link
          to="/faqs/new"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <FiPlus size={18} />
          <span>Adicionar FAQ</span>
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              Carregando FAQs...
            </div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12">
            <FiHelpCircle className="mx-auto text-6xl text-gray-600 mb-4" />
            <p className="text-gray-500 text-center py-8">Nenhum FAQ encontrado</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('questionTextRefId')}
                  >
                    <div className="flex items-center gap-2">
                      Pergunta
                      {sortConfig.field === 'questionTextRefId' && (
                        <span className="text-blue-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider">Data de Criação</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {faqs.map((faq: FAQ) => (
                  <tr 
                    key={faq.faqId} 
                    className="hover:bg-gray-700/30 dark:hover:bg-gray-700/30 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/faqs/${faq.faqId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white max-w-md truncate">
                          {getFAQQuestion(faq)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{new Date(faq.createdAt).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(faq);
                        }}
                        className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full transition-colors border ${
                          !faq.isDeleted
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30'
                        }`}
                        title={!faq.isDeleted ? 'Clique para desativar' : 'Clique para ativar'}
                      >
                        {!faq.isDeleted ? (
                          <FiToggleRight className="w-3 h-3" />
                        ) : (
                          <FiToggleLeft className="w-3 h-3" />
                        )}
                        {!faq.isDeleted ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/faqs/${faq.faqId}`);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar FAQ"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ open: true, faq });
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir FAQ"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Mostrando {((filters.page || 1) - 1) * (filters.limit || 10) + 1} até {Math.min((filters.page || 1) * (filters.limit || 10), total)} de {total} FAQs
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage((filters.page || 1) - 1)}
                      disabled={(filters.page || 1) <= 1}
                      className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                    >
                      <FiChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - (filters.page || 1)) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded transition-colors ${
                              page === (filters.page || 1)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === (filters.page || 1) - 2 ||
                        page === (filters.page || 1) + 2
                      ) {
                        return <span key={page}>...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => goToPage((filters.page || 1) + 1)}
                      disabled={(filters.page || 1) >= totalPages}
                      className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteModal.open}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir o FAQ"
        itemName={deleteModal.faq ? getFAQQuestion(deleteModal.faq) : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, faq: null })}
      />
    </div>
  );
};

export default FaqsPage;
