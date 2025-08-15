import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiShield, FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import usersService, { User } from '../../services/users.service';
import { PaginatedRequest } from '../../services/api';

interface UserFilters extends PaginatedRequest {
  search?: string;
  isAdmin?: boolean;
  enabled?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    search: '',
    isAdmin: undefined,
    enabled: undefined,
    sortBy: 'firstName',
    sortOrder: 'ASC'
  });
  const [sortConfig, setSortConfig] = useState({ field: 'firstName', direction: 'asc' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
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

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers(filters);
      setUsers(response.items);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      setFilters((prev: UserFilters) => ({ ...prev, search: value, page: 1 }));
    }, 500);

    setSearchDebounce(timeout);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await usersService.toggleUserStatus(user.userId);
      toast.success(`User ${user.enabled ? 'disabled' : 'enabled'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to toggle user status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    
    try {
      await usersService.deleteUser(deleteModal.user.userId);
      toast.success('User deleted successfully');
      setDeleteModal({ open: false, user: null });
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const goToPage = (page: number) => {
    setFilters((prev: UserFilters) => ({ ...prev, page }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
          <p className="text-gray-400 mt-1">Gerencie usuários do sistema e suas permissões</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.isAdmin === undefined ? '' : filters.isAdmin.toString()}
              onChange={(e) => setFilters((prev: UserFilters) => ({ 
                ...prev, 
                isAdmin: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1 
              }))}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Apenas Administrador</option>
              <option value="false">Apenas Usuários</option>
            </select>

            <select
              value={filters.enabled === undefined ? '' : filters.enabled.toString()}
              onChange={(e) => setFilters((prev: UserFilters) => ({ 
                ...prev, 
                enabled: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1 
              }))}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          {/* Add New Button */}
          <Link
            to="/users/new"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <FiPlus size={18} />
            <span>Novo Usuário</span>
          </Link>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-6xl text-gray-600 mb-4" />
            <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center gap-2">
                      Usuário
                      {sortConfig.field === 'firstName' && (
                        <span className="text-blue-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      Email
                      {sortConfig.field === 'email' && (
                        <span className="text-blue-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider">Função</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user: User) => (
                  <tr 
                    key={user.userId} 
                    className="hover:bg-gray-700/30 dark:hover:bg-gray-700/30 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/${user.userId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePictureUrl ? (
                            <img className="h-10 w-10 rounded-full" src={user.profilePictureUrl} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <FiUser className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <FiShield size={14} />
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          <FiUser size={14} />
                          Usuário Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(user);
                        }}
                        className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full transition-colors border ${
                          user.enabled
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30'
                        }`}
                        title={user.enabled ? 'Clique para desativar' : 'Clique para ativar'}
                      >
                        {user.enabled ? (
                          <>
                            <FiToggleRight size={14} /> Ativo
                          </>
                        ) : (
                          <>
                            <FiToggleLeft size={14} /> Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${user.userId}`);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar Usuário"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ open: true, user });
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir Usuário"
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
              <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
                  {Math.min((filters.page || 1) * (filters.limit || 10), total)} of {total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage((filters.page || 1) - 1)}
                    disabled={(filters.page || 1) <= 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                  >
                    <FiChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= (filters.page || 1) - 1 && page <= (filters.page || 1) + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded ${
                            page === (filters.page || 1)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-white hover:bg-gray-600'
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
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Tem certeza que deseja excluir o usuário <strong className="text-gray-900 dark:text-white">{deleteModal.user.firstName} {deleteModal.user.lastName}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
