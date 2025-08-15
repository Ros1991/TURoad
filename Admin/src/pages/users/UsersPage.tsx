import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiCheck, FiX, FiSearch, FiPlus, FiEdit, FiEdit2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import usersService, { User } from '../../services/users.service';
import { PaginatedRequest } from '../../services/api';

interface UserFilters extends PaginatedRequest {
  search?: string;
  isAdmin?: boolean;
  enabled?: boolean;
  emailVerified?: boolean;
}

const UsersPage: React.FC = () => {
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
    emailVerified: undefined
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers(filters);
      setUsers(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load users');
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
            <span>Add User</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user: User) => (
                  <tr key={user.userId} className="hover:bg-gray-700/30 transition-colors">
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
                        {user.emailVerified && (
                          <span className="ml-2 text-green-400">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400">
                          <FiShield />
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                          <FiUser />
                          Usuário Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                          user.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.enabled ? (
                          <>
                            <FiToggleRight className="mr-1" /> Ativo
                          </>
                        ) : (
                          <>
                            <FiToggleLeft className="mr-1" /> Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/users/${user.userId}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, user })}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete User"
                        >
                          <FiTrash2 size={18} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete user <strong>{deleteModal.user.firstName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <FiPlus size={20} />
              Adicionar Usuário
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
